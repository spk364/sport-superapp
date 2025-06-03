import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import type { ProgramExecution as IProgramExecution, WorkoutSet } from "../types";
import { 
  PlayIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface ProgramExecutionProps {
  clientId: string;
}

const ProgramExecution: React.FC<ProgramExecutionProps> = ({ clientId }) => {
  const { programs, addSession } = useAppStore();
  const [activeExecution, setActiveExecution] = useState<IProgramExecution | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const clientPrograms = programs.filter(p => p.clientId === clientId && p.status === "active");
  const activeProgram = clientPrograms[0];

  const startWorkout = (workoutDayId: string) => {
    if (!activeProgram) return;

    const workoutDay = activeProgram.workoutDays.find(d => d.id === workoutDayId);
    if (!workoutDay) return;

    const execution: IProgramExecution = {
      id: Date.now().toString(),
      programId: activeProgram.id,
      clientId,
      workoutDayId,
      date: new Date(),
      exercises: workoutDay.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.map(set => ({ ...set, completed: false }))
      })),
      duration: 0
    };

    setActiveExecution(execution);
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeExecution) return;

    const updatedExecution = {
      ...activeExecution,
      exercises: activeExecution.exercises.map((ex, exIdx) => 
        exIdx === exerciseIndex 
          ? {
              ...ex,
              sets: ex.sets.map((set, sIdx) => 
                sIdx === setIndex ? { ...set, completed: true } : set
              )
            }
          : ex
      )
    };

    setActiveExecution(updatedExecution);
  };

  const updateSetValue = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    if (!activeExecution) return;

    const updatedExecution = {
      ...activeExecution,
      exercises: activeExecution.exercises.map((ex, exIdx) => 
        exIdx === exerciseIndex 
          ? {
              ...ex,
              sets: ex.sets.map((set, sIdx) => 
                sIdx === setIndex ? { ...set, [field]: value } : set
              )
            }
          : ex
      )
    };

    setActiveExecution(updatedExecution);
  };

  const finishWorkout = () => {
    if (!activeExecution) return;

    // Save as training session
    const session = {
      id: Date.now().toString(),
      clientId,
      date: new Date(),
      trainingType: `Программа: ${activeProgram?.name}`,
      duration: activeExecution.duration || 60,
      attendance: "present" as const,
      notes: `Выполнено упражнений: ${activeExecution.exercises.length}`,
      checkInMethod: "manual" as const,
      checkInTime: new Date()
    };

    addSession(session);
    setActiveExecution(null);
  };

  const cancelWorkout = () => {
    setActiveExecution(null);
  };

  if (!activeProgram) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-telegram-hint" />
          <h3 className="mt-2 text-sm font-medium text-telegram-text">Нет активной программы</h3>
          <p className="mt-1 text-sm text-telegram-hint">
            Сначала создайте программу тренировок для клиента
          </p>
        </div>
      </div>
    );
  }

  if (activeExecution) {
    const workoutDay = activeProgram.workoutDays.find(d => d.id === activeExecution.workoutDayId);
    if (!workoutDay) return null;

    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-telegram-text">Выполнение тренировки</h2>
            <p className="text-sm text-telegram-hint">{workoutDay.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={cancelWorkout}
              className="text-red-500 p-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {workoutDay.exercises.map((workoutExercise, exerciseIndex) => {
            const executionExercise = activeExecution.exercises[exerciseIndex];
            
            return (
              <div key={exerciseIndex} className="telegram-card">
                <h3 className="font-medium text-telegram-text mb-2">
                  {workoutExercise.exercise.name}
                </h3>
                <p className="text-sm text-telegram-hint mb-3">
                  {workoutExercise.exercise.category} • {workoutExercise.exercise.targetMuscles.join(", ")}
                </p>

                <div className="space-y-2">
                  {executionExercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-3 p-2 border rounded">
                      <button
                        onClick={() => completeSet(exerciseIndex, setIndex)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          set.completed 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300"
                        }`}
                      >
                        {set.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </button>

                      <span className="w-8 text-sm text-telegram-hint">#{setIndex + 1}</span>

                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSetValue(exerciseIndex, setIndex, "reps", parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border rounded text-sm"
                          placeholder="повт"
                        />
                        <span className="text-sm text-telegram-hint">×</span>
                        <input
                          type="number"
                          value={set.weight || ""}
                          onChange={(e) => updateSetValue(exerciseIndex, setIndex, "weight", parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center border rounded text-sm"
                          placeholder="кг"
                        />
                        <span className="text-sm text-telegram-hint">кг</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-telegram-hint" />
                        <span className="text-sm text-telegram-hint">{set.rest}с</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={cancelWorkout}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-telegram-text"
          >
            Отменить
          </button>
          <button
            onClick={finishWorkout}
            className="flex-1 telegram-button"
          >
            Завершить тренировку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-telegram-text">Выполнение программы</h2>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="telegram-button-small"
        >
          История
        </button>
      </div>

      <div className="telegram-card mb-4">
        <h3 className="font-medium text-telegram-text mb-2">{activeProgram.name}</h3>
        <p className="text-sm text-telegram-hint mb-3">{activeProgram.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-telegram-hint">
          <span>Дней: {activeProgram.workoutDays.length}</span>
          <span>•</span>
          <span>Начало: {activeProgram.startDate.toLocaleDateString('ru')}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-telegram-text">Тренировочные дни</h3>
        
        {activeProgram.workoutDays.map((day) => (
          <div key={day.id} className="telegram-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-telegram-text">{day.name}</h4>
              <button
                onClick={() => startWorkout(day.id)}
                className="telegram-button-small flex items-center space-x-1"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Начать</span>
              </button>
            </div>

            <div className="space-y-1">
              {day.exercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-telegram-text">{exercise.exercise.name}</span>
                  <span className="text-telegram-hint">{exercise.sets.length} подходов</span>
                </div>
              ))}
              {day.exercises.length > 3 && (
                <div className="text-sm text-telegram-hint text-center">
                  +{day.exercises.length - 3} упражнений
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showHistory && (
        <div className="mt-6">
          <h3 className="font-medium text-telegram-text mb-3">История выполнений</h3>
          <div className="text-center py-8 text-telegram-hint">
            <DocumentTextIcon className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">История выполнений будет отображаться здесь</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramExecution; 