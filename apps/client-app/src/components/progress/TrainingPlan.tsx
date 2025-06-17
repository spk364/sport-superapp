import React from 'react';
import { LevelNode } from './LevelNode';

const mockPlan = [
  { level: 1, name: 'Вводная неделя', status: 'completed' },
  { level: 2, name: 'Базовая сила', status: 'completed' },
  { level: 3, name: 'Выносливость', status: 'completed' },
  { level: 4, name: 'Набор массы', status: 'current' },
  { level: 5, name: 'Работа на рельеф', status: 'locked' },
  { level: 6, name: 'Пиковая форма', status: 'locked' },
  { level: 7, name: 'Поддержание', status: 'locked' },
];

export const TrainingPlan: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Ваш тренировочный путь</h2>
      <div className="relative flex flex-col items-center">
        {/* The path line */}
        <div className="absolute top-10 bottom-10 w-1 bg-gray-200 rounded-full" />
        
        <div className="space-y-8">
          {mockPlan.map((stage) => (
            <LevelNode
              key={stage.level}
              level={stage.level}
              name={stage.name}
              status={stage.status as 'completed' | 'current' | 'locked'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 