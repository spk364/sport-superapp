import React, { useState, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn,
  Download,
  Share2
} from 'lucide-react';
import { GymPhoto } from '../../types';

interface PhotoGalleryProps {
  photos: GymPhoto[];
  initialPhotoIndex?: number;
  onClose?: () => void;
  showThumbnails?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  initialPhotoIndex = 0,
  onClose,
  showThumbnails = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
  }, [photos.length]);

  const goToPhoto = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else if (onClose) {
        onClose();
      }
    }
  }, [goToPrevious, goToNext, isFullscreen, onClose]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) return null;

  const getPhotoTypeLabel = (type: GymPhoto['type']) => {
    const labels = {
      main: 'Основное фото',
      interior: 'Интерьер',
      equipment: 'Оборудование',
      exterior: 'Экстерьер',
      class: 'Занятия'
    };
    return labels[type] || 'Фото';
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(currentPhoto.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym-photo-${currentPhoto.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPhoto.alt,
          url: currentPhoto.url
        });
      } catch (error) {
        console.error('Error sharing photo:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentPhoto.url);
        // You might want to show a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Fullscreen Controls */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity disabled:opacity-50"
          >
            <Download className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Photo Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Main Image */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl overflow-hidden">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-xl">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="p-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-70 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-opacity-90 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-70 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-opacity-90 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Photo Info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
          {getPhotoTypeLabel(currentPhoto.type)}
        </div>

        {/* Photo Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && photos.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToPhoto(index)}
              className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex 
                  ? 'border-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;