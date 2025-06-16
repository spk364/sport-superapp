import React, { useState } from 'react';
import { RegistrationFormData, Trainer } from '../../../types';

interface TrainersStepProps {
  data: RegistrationFormData;
  onUpdate: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TrainersStep: React.FC<TrainersStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [newTrainer, setNewTrainer] = useState<Partial<Trainer>>({
    specializations: [],
    experience: 0,
    certifications: [],
    contactInfo: { phone: '', email: '' },
    isActive: true
  });

  const addTrainer = () => {
    if (newTrainer.firstName && newTrainer.lastName && newTrainer.contactInfo?.email) {
      const trainer: Trainer = {
        id: `trainer_${Date.now()}`,
        firstName: newTrainer.firstName,
        lastName: newTrainer.lastName,
        bio: newTrainer.bio,
        specializations: newTrainer.specializations || [],
        experience: newTrainer.experience || 0,
        certifications: newTrainer.certifications || [],
        contactInfo: {
          phone: newTrainer.contactInfo?.phone || '',
          email: newTrainer.contactInfo?.email || '',
          telegram: newTrainer.contactInfo?.telegram
        },
        isActive: true
      };
      
      onUpdate({
        trainers: [...(data.trainers || []), trainer]
      });
      
      setNewTrainer({
        specializations: [],
        experience: 0,
        certifications: [],
        contactInfo: { phone: '', email: '' },
        isActive: true
      });
      setShowTrainerForm(false);
    }
  };

  const removeTrainer = (id: string) => {
    onUpdate({
      trainers: data.trainers?.filter(t => t.id !== id)
    });
  };

  const addSpecialization = (trainerId: string, specialization: string) => {
    if (!specialization.trim()) return;
    
    const updatedTrainers = data.trainers?.map(trainer => {
      if (trainer.id === trainerId) {
        return {
          ...trainer,
          specializations: [...trainer.specializations, specialization]
        };
      }
      return trainer;
    });
    
    onUpdate({ trainers: updatedTrainers });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Команда тренеров</h2>
        <p className="text-gray-600">Добавьте информацию о ваших тренерах</p>
      </div>

      <div className="space-y-8">
        {/* Add Trainer Button */}
        <div className="text-center">
          <button
            onClick={() => setShowTrainerForm(!showTrainerForm)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Добавить тренера</span>
          </button>
        </div>

        {/* Add Trainer Form */}
        {showTrainerForm && (
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Новый тренер</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Имя *"
                value={newTrainer.firstName || ''}
                onChange={(e) => setNewTrainer({...newTrainer, firstName: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Фамилия *"
                value={newTrainer.lastName || ''}
                onChange={(e) => setNewTrainer({...newTrainer, lastName: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email *"
                value={newTrainer.contactInfo?.email || ''}
                onChange={(e) => setNewTrainer({
                  ...newTrainer,
                  contactInfo: { ...newTrainer.contactInfo, email: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={newTrainer.contactInfo?.phone || ''}
                onChange={(e) => setNewTrainer({
                  ...newTrainer,
                  contactInfo: { ...newTrainer.contactInfo, phone: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="Опыт работы (лет)"
                value={newTrainer.experience || ''}
                onChange={(e) => setNewTrainer({...newTrainer, experience: Number(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Telegram (опционально)"
                value={newTrainer.contactInfo?.telegram || ''}
                onChange={(e) => setNewTrainer({
                  ...newTrainer,
                  contactInfo: { ...newTrainer.contactInfo, telegram: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <textarea
              placeholder="Биография и достижения"
              value={newTrainer.bio || ''}
              onChange={(e) => setNewTrainer({...newTrainer, bio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
              rows={3}
            />

            <div className="flex space-x-2">
              <button onClick={addTrainer} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                Добавить тренера
              </button>
              <button onClick={() => setShowTrainerForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Trainers List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Список тренеров ({data.trainers?.length || 0})
          </h3>
          
          {data.trainers && data.trainers.length > 0 ? (
            <div className="space-y-4">
              {data.trainers.map(trainer => (
                <div key={trainer.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">
                        {trainer.firstName} {trainer.lastName}
                      </h4>
                      <p className="text-emerald-600">Опыт: {trainer.experience} лет</p>
                    </div>
                    <button
                      onClick={() => trainer.id && removeTrainer(trainer.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {trainer.contactInfo.email}
                      </p>
                      {trainer.contactInfo.phone && (
                        <p className="text-sm text-gray-600">
                          <strong>Телефон:</strong> {trainer.contactInfo.phone}
                        </p>
                      )}
                      {trainer.contactInfo.telegram && (
                        <p className="text-sm text-gray-600">
                          <strong>Telegram:</strong> {trainer.contactInfo.telegram}
                        </p>
                      )}
                    </div>
                  </div>

                  {trainer.bio && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Биография:</h5>
                      <p className="text-sm text-gray-600">{trainer.bio}</p>
                    </div>
                  )}

                  {trainer.specializations.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Специализации:</h5>
                      <div className="flex flex-wrap gap-2">
                        {trainer.specializations.map((spec, index) => (
                          <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {trainer.certifications.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Сертификаты:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {trainer.certifications.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Команда тренеров пуста</h3>
              <p className="text-gray-500 mb-4">Добавьте информацию о ваших тренерах</p>
              <p className="text-sm text-gray-400">
                Если вы работаете один, можете пропустить этот шаг и добавить тренеров позже
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-8">
        <button
          onClick={onPrev}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Назад
        </button>
        
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default TrainersStep;