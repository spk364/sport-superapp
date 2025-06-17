import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Question {
  key: string;
  question: string;
  type: 'single' | 'list' | 'list_optional' | 'number' | 'text';
  options?: string[];
  emoji: string;
}

interface QuestionnaireProps {
  onComplete: (answers: Record<string, any>) => void;
  onClose: () => void;
}

const PROFILE_QUESTIONS: Question[] = [
  {
    key: "goals",
    question: "Какие у вас цели тренировок?",
    type: "list",
    emoji: "🎯",
    options: [
      "Похудение",
      "Набор мышечной массы",
      "Поддержание формы",
      "Увеличение силы",
      "Улучшение выносливости",
      "Реабилитация",
      "Подготовка к соревнованиям"
    ]
  },
  {
    key: "fitness_level",
    question: "Какой у вас уровень физической подготовки?",
    type: "single",
    emoji: "💪",
    options: [
      "Начальный (новичок)",
      "Средний (тренируюсь 6-12 месяцев)",
      "Продвинутый (тренируюсь более года)",
      "Профессиональный"
    ]
  },
  {
    key: "equipment",
    question: "Какое оборудование у вас есть?",
    type: "list",
    emoji: "🏋️",
    options: [
      "Собственный вес",
      "Гантели",
      "Штанга",
      "Турник",
      "Брусья",
      "Эспандеры",
      "Тренажерный зал",
      "Беговая дорожка",
      "Велотренажер"
    ]
  },
  {
    key: "limitations",
    question: "Есть ли у вас ограничения или проблемы со здоровьем?",
    type: "list_optional",
    emoji: "⚠️",
    options: [
      "Проблемы со спиной",
      "Проблемы с коленями",
      "Проблемы с плечами",
      "Сердечно-сосудистые заболевания",
      "Нет ограничений",
      "Другое"
    ]
  },
  {
    key: "height",
    question: "Какой у вас рост в сантиметрах?",
    type: "number",
    emoji: "📏"
  },
  {
    key: "weight",
    question: "Какой у вас вес в килограммах?",
    type: "number",
    emoji: "⚖️"
  },
  {
    key: "age",
    question: "Сколько вам лет?",
    type: "number",
    emoji: "🎂"
  },
  {
    key: "gender",
    question: "Укажите ваш пол:",
    type: "single",
    emoji: "👤",
    options: ["Мужской", "Женский"]
  },
  {
    key: "nutrition_goal",
    question: "Какая у вас цель по питанию?",
    type: "single",
    emoji: "🍎",
    options: [
      "Похудение (дефицит калорий)",
      "Набор массы (профицит калорий)",
      "Поддержание веса",
      "Сушка (строгий дефицит)",
      "Не слежу за питанием"
    ]
  },
  {
    key: "food_preferences",
    question: "Какие у вас пищевые предпочтения?",
    type: "list_optional",
    emoji: "🥗",
    options: [
      "Обычное питание",
      "Вегетарианство",
      "Веганство",
      "Кето-диета",
      "Низкоуглеводное",
      "Средиземноморская диета",
      "Палео",
      "Другое"
    ]
  },
  {
    key: "allergies",
    question: "Есть ли у вас пищевые аллергии или непереносимость?",
    type: "list_optional",
    emoji: "🚫",
    options: [
      "Глютен",
      "Лактоза",
      "Орехи",
      "Морепродукты",
      "Яйца",
      "Соя",
      "Нет аллергий",
      "Другое"
    ]
  }
];

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [numberValue, setNumberValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const question = PROFILE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PROFILE_QUESTIONS.length) * 100;

  useEffect(() => {
    // Reset local state when question changes
    setSelectedOptions([]);
    setNumberValue('');
    setError(null);

    // Load existing answer if any
    const existingAnswer = answers[question.key];
    if (existingAnswer !== undefined) {
      if (question.type === 'number') {
        setNumberValue(existingAnswer.toString());
      } else if (question.type === 'single') {
        setSelectedOptions([existingAnswer]);
      } else if (Array.isArray(existingAnswer)) {
        setSelectedOptions(existingAnswer);
      }
    }
  }, [currentQuestion, question.key, question.type, answers]);

  const handleOptionSelect = (option: string) => {
    if (question.type === 'single') {
      setSelectedOptions([option]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    }
    setError(null);
  };

  const handleNumberChange = (value: string) => {
    setNumberValue(value);
    setError(null);
  };

  const validateAnswer = (): boolean => {
    if (question.type === 'number') {
      const num = parseInt(numberValue);
      if (isNaN(num) || num <= 0) {
        setError('Пожалуйста, введите положительное число');
        return false;
      }
      
      // Add specific validation for each number field
      if (question.key === 'age') {
        if (num < 10 || num > 100) {
          setError('Возраст должен быть от 10 до 100 лет');
          return false;
        }
      } else if (question.key === 'height') {
        if (num < 100 || num > 250) {
          setError('Рост должен быть от 100 до 250 см');
          return false;
        }
      } else if (question.key === 'weight') {
        if (num < 30 || num > 300) {
          setError('Вес должен быть от 30 до 300 кг');
          return false;
        }
      }
    } else if (question.type === 'single' || question.type === 'list') {
      if (selectedOptions.length === 0) {
        setError('Пожалуйста, выберите хотя бы один вариант');
        return false;
      }
    }
    return true;
  };

  const saveCurrentAnswer = () => {
    let answer: number | string | string[];
    if (question.type === 'number') {
      answer = parseInt(numberValue);
    } else if (question.type === 'single') {
      answer = selectedOptions[0];
    } else {
      answer = selectedOptions;
    }

    setAnswers(prev => ({
      ...prev,
      [question.key]: answer
    }));
  };

  const handleNext = () => {
    if (!validateAnswer()) return;
    
    saveCurrentAnswer();

    if (currentQuestion === PROFILE_QUESTIONS.length - 1) {
      // Complete questionnaire
      const finalAnswers = {
        ...answers,
        [question.key]: question.type === 'number' 
          ? parseInt(numberValue)
          : question.type === 'single' 
            ? selectedOptions[0]
            : selectedOptions
      };
      onComplete(finalAnswers);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      saveCurrentAnswer();
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const renderQuestionContent = () => {
    if (question.type === 'number') {
      let placeholder = "Введите число...";
      let inputMode: "numeric" | "text" = "numeric";
      
      if (question.key === 'age') {
        placeholder = "Например: 25";
      } else if (question.key === 'height') {
        placeholder = "Например: 175";
      } else if (question.key === 'weight') {
        placeholder = "Например: 70";
      }
      
      return (
        <div className="space-y-4">
          <input
            type="number"
            inputMode={inputMode}
            value={numberValue}
            onChange={(e) => handleNumberChange(e.target.value)}
            className="w-full px-6 py-4 text-xl text-center bg-white bg-opacity-20 backdrop-blur-md rounded-xl border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-opacity-30"
            placeholder={placeholder}
            min="1"
            autoFocus
          />
          {question.key === 'age' && (
            <p className="text-center text-sm text-blue-200">
              Укажите ваш возраст в годах (от 10 до 100)
            </p>
          )}
          {question.key === 'height' && (
            <p className="text-center text-sm text-blue-200">
              Укажите ваш рост в сантиметрах (от 100 до 250)
            </p>
          )}
          {question.key === 'weight' && (
            <p className="text-center text-sm text-blue-200">
              Укажите ваш вес в килограммах (от 30 до 300)
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
              selectedOptions.includes(option)
                ? 'bg-blue-500 bg-opacity-80 border-blue-400 text-white'
                : 'bg-white bg-opacity-10 backdrop-blur-md border-white border-opacity-30 text-white hover:bg-opacity-20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1">{option}</span>
              {selectedOptions.includes(option) && (
                <CheckIcon className="w-5 h-5 text-white" />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-20">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white bg-opacity-20 backdrop-blur-md"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <div className="text-white text-sm font-medium">
              {currentQuestion + 1} из {PROFILE_QUESTIONS.length}
            </div>
            <div className="w-48 h-2 bg-white bg-opacity-30 rounded-full mt-1">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-lg mx-auto">
            {/* Question */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{question.emoji}</div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {question.question}
              </h2>
              {question.type === 'list_optional' && (
                <p className="text-blue-200 text-sm mt-2">
                  Можно выбрать несколько вариантов или пропустить
                </p>
              )}
              {question.type === 'list' && (
                <p className="text-blue-200 text-sm mt-2">
                  Можно выбрать несколько вариантов
                </p>
              )}
            </div>

            {/* Answer Options */}
            {renderQuestionContent()}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500 bg-opacity-80 rounded-lg">
                <p className="text-white text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 bg-black bg-opacity-20">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentQuestion === 0
                  ? 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
                  : 'bg-white bg-opacity-20 backdrop-blur-md text-white hover:bg-opacity-30'
              }`}
            >
              Назад
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
            >
              {currentQuestion === PROFILE_QUESTIONS.length - 1 ? 'Завершить' : 'Далее'}
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};