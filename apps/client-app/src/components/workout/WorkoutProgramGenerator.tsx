import React, { useState } from 'react';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import { useAppStore } from '../../store';

interface WorkoutProgramGeneratorProps {
  onProgramGenerated?: (program: any) => void;
}

export const WorkoutProgramGenerator: React.FC<WorkoutProgramGeneratorProps> = ({
  onProgramGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    level: '',
    equipment: [] as string[],
    sessions_per_week: 3,
    limitations: [] as string[]
  });
  const user = useAppStore((state) => state.user);

  const goals = [
    'Снижение веса',
    'Набор мышечной массы',
    'Увеличение силы',
    'Улучшение выносливости',
    'Общая физическая подготовка',
    'Подготовка к соревнованиям'
  ];

  const levels = [
    'Начинающий',
    'Средний',
    'Продвинутый'
  ];

  const equipmentOptions = [
    'Собственный вес',
    'Гантели',
    'Штанга',
    'Турник',
    'Резиновые петли',
    'Гири',
    'Тренажеры',
    'Кардио оборудование'
  ];

  const limitationOptions = [
    'Проблемы со спиной',
    'Проблемы с коленями',
    'Проблемы с плечами',
    'Гипертония',
    'Ограниченное время',
    'Нет ограничений'
  ];

  const handleEquipmentChange = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleLimitationChange = (limitation: string) => {
    setFormData(prev => ({
      ...prev,
      limitations: prev.limitations.includes(limitation)
        ? prev.limitations.filter(l => l !== limitation)
        : [...prev.limitations, limitation]
    }));
  };

  const handleGenerate = async () => {
    if (!user || !formData.goal || !formData.level) return;

    setIsGenerating(true);
    try {
      const program = await aiService.createWorkoutProgram({
        user_id: user.id,
        goal: formData.goal,
        level: formData.level,
        equipment: formData.equipment,
        sessions_per_week: formData.sessions_per_week,
        limitations: formData.limitations
      });

      onProgramGenerated?.(program);
    } catch (error) {
      console.error('Ошибка генерации программы:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = formData.goal && formData.level;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">ИИ Генератор программ</h2>
          <p className="text-sm text-gray-500">Создайте персональную программу тренировок</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Цель */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Цель тренировок *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((goal) => (
              <button
                key={goal}
                onClick={() => setFormData(prev => ({ ...prev, goal }))}
                className={`p-3 text-sm border rounded-lg transition-colors ${
                  formData.goal === goal
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Уровень */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Уровень подготовки *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setFormData(prev => ({ ...prev, level }))}
                className={`p-3 text-sm border rounded-lg transition-colors ${
                  formData.level === level
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Количество тренировок в неделю */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Тренировок в неделю: {formData.sessions_per_week}
          </label>
          <input
            type="range"
            min="1"
            max="7"
            value={formData.sessions_per_week}
            onChange={(e) => setFormData(prev => ({ ...prev, sessions_per_week: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>4</span>
            <span>7</span>
          </div>
        </div>

        {/* Оборудование */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Доступное оборудование
          </label>
          <div className="grid grid-cols-2 gap-2">
            {equipmentOptions.map((equipment) => (
              <button
                key={equipment}
                onClick={() => handleEquipmentChange(equipment)}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  formData.equipment.includes(equipment)
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {equipment}
              </button>
            ))}
          </div>
        </div>

        {/* Ограничения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ограничения и особенности
          </label>
          <div className="grid grid-cols-2 gap-2">
            {limitationOptions.map((limitation) => (
              <button
                key={limitation}
                onClick={() => handleLimitationChange(limitation)}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  formData.limitations.includes(limitation)
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {limitation}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка генерации */}
        <button
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Генерируем программу...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Создать программу с ИИ</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 