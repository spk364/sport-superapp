import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Filter,
  ChevronDown,
  Plus,
  X,
  Send,
  Camera
} from 'lucide-react';
import { GymReview } from '../../types';
import { gymService } from '../../services/gymService';

interface ReviewsSectionProps {
  gymId: string;
  initialRating: number;
  initialReviewCount: number;
  initialReviews?: GymReview[];
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  photos: File[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  gymId,
  initialRating,
  initialReviewCount,
  initialReviews = []
}) => {
  const [reviews, setReviews] = useState<GymReview[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: '',
    photos: []
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [filterRating, sortBy]);

  const loadReviews = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const result = await gymService.getGymReviews(gymId, pageNum, 10);
      
      if (append) {
        setReviews(prev => [...prev, ...result.reviews]);
      } else {
        setReviews(result.reviews);
      }
      
      setHasMore(pageNum < result.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreReviews = () => {
    loadReviews(page + 1, true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewForm.rating === 0 || !reviewForm.comment.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Mock user data - в реальном приложении это должно браться из контекста пользователя
      const newReview = await gymService.addReview(gymId, {
        userId: 'current_user_id',
        userName: 'Текущий пользователь',
        rating: reviewForm.rating,
        title: reviewForm.title || undefined,
        comment: reviewForm.comment,
        verified: false
      });

      setReviews(prev => [newReview, ...prev]);
      setShowAddReview(false);
      setReviewForm({
        rating: 0,
        title: '',
        comment: '',
        photos: []
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReviewForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 5) // Maximum 5 photos
      }));
    }
  };

  const removePhoto = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;

    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
  };

  const filteredReviews = getFilteredAndSortedReviews();

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {initialRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= initialRating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {initialReviewCount} отзывов
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Filter by Rating */}
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все оценки</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>
                {rating} звезд
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="rating_high">Высокие оценки</option>
            <option value="rating_low">Низкие оценки</option>
            <option value="helpful">Полезные</option>
          </select>
        </div>

        {/* Add Review Button */}
        <button
          onClick={() => setShowAddReview(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить отзыв</span>
        </button>
      </div>

      {/* Add Review Modal */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Добавить отзыв
                </h3>
                <button
                  onClick={() => setShowAddReview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваша оценка *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoveredRating || reviewForm.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок (необязательно)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Краткое описание вашего опыта"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отзыв *
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Поделитесь своим опытом посещения этого спортзала..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фотографии (до 5 шт.)
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Нажмите для добавления фото
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={reviewForm.photos.length >= 5}
                        />
                      </label>
                    </div>

                    {/* Preview uploaded photos */}
                    {reviewForm.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {reviewForm.photos.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddReview(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={reviewForm.rating === 0 || !reviewForm.comment.trim() || isLoading}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Опубликовать</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Отзывов пока нет
            </h3>
            <p className="text-gray-600">
              Станьте первым, кто оставит отзыв об этом спортзале
            </p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.userName}
                        {review.verified && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                            Проверено
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-2">
                      {review.title}
                    </h5>
                  )}

                  {/* Comment */}
                  <p className="text-gray-700 mb-4">
                    {review.comment}
                  </p>

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">
                        Полезно ({review.helpful})
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && filteredReviews.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMoreReviews}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : 'Показать еще'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;