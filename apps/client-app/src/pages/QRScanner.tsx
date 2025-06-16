import React from 'react';
import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../store';

export const QRScanner: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 space-y-6 text-center max-w-sm w-full relative">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <QrCodeIcon className="h-24 w-24 text-primary-500 mx-auto" />

        <h2 className="text-2xl font-bold text-gray-900">
          Сканер QR-кода
        </h2>

        <p className="text-gray-600">
          Наведите камеру на QR-код, чтобы отметиться на тренировке.
        </p>
        
        <div className="w-64 h-64 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
          <p className="text-gray-500">[Область для камеры]</p>
        </div>

        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}; 