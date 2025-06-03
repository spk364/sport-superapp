import React, { useState } from "react";
import { useAppStore } from "../stores/appStore";
import { TrainingProgram, WorkoutDay, WorkoutExercise } from "../types";
import { 
  DocumentTextIcon, 
  PlusIcon, 
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { mockExercises } from "../data/mockData";

interface ClientProgramProps {
  clientId: string;
}

const ClientProgram: React.FC<ClientProgramProps> = ({ clientId }) => {
  const { programs, addProgram, updateProgram } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [showAddExercise, setShowAddExercise] = useState<{dayId: string} | null>(null);

  const clientPrograms = programs.filter(p => p.clientId === clientId);

  const createNewProgram = () => {
    const newProgram: TrainingProgram = {
      id: Date.now().toString(),
      clientId,
      name: "Новая программа тренировок",
      description: "Индивидуальная программа",
      startDate: new Date(),
      status: "active",
      workoutDays: []
    };
    addProgram(newProgram);
    setSelectedProgram(newProgram);
    setShowCreateForm(true);
  };

  const addWorkoutDay = (program: TrainingProgram) => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: `День ${program.workoutDays.length + 1}`,
      day: program.workoutDays.length + 1,
      exercises: []
    };
    
    const updatedProgram = {
      ...program,
      workoutDays: [...program.workoutDays, newDay]
    };
    
    updateProgram(program.id, updatedProgram);
    setSelectedProgram(updatedProgram);
  };

  const addExerciseToDay = (dayId: string, exerciseId: string) => {
    if (!selectedProgram) return;
    
    const exercise = mockExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newWorkoutExercise: WorkoutExercise = {
      exerciseId,
      exercise,
      sets: [
        { reps: 10, weight: 0, completed: false, rest: 60 }
      ],
      order: 0
    };

    const updatedProgram = {
      ...selectedProgram,
      workoutDays: selectedProgram.workoutDays.map(day => 
        day.id === dayId 
          ? { ...day, exercises: [...day.exercises, newWorkoutExercise] }
          : day
      )
    };

    updateProgram(selectedProgram.id, updatedProgram);
    setSelectedProgram(updatedProgram);
    setShowAddExercise(null);
  };

  const addSetToExercise = (dayId: string, exerciseIndex: number) => {
    if (!selectedProgram) return;

    const updatedProgram = {
      ...selectedProgram,
      workoutDays: selectedProgram.workoutDays.map(day => 
        day.id === dayId 
          ? {
              ...day, 
              exercises: day.exercises.map((ex, idx) => 
                idx === exerciseIndex 
                  ? {
                      ...ex,
                      sets: [...ex.sets, { reps: 10, weight: 0, completed: false, rest: 60 }]
                    }
                  : ex
              )
            }
          : day
      )
    };

    updateProgram(selectedProgram.id, updatedProgram);
    setSelectedProgram(updatedProgram);
  };

  if (showCreateForm && selectedProgram) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={() => {setShowCreateForm(false); setSelectedProgram(null);}}
            className="text-telegram-button"
          >
            ← Назад
          </button>
          <h2 className="text-lg font-semibold text-telegram-text">Редактор программы</h2>
          <button 
            onClick={() => setShowCreateForm(false)}
            className="telegram-button-small"
          >
            Готово
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={selectedProgram.name}
              onChange={(e) => {
                const updated = {...selectedProgram, name: e.target.value};
                setSelectedProgram(updated);
                updateProgram(selectedProgram.id, updated);
              }}
              className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
              placeholder="Название программы"
            />
          </div>

          <div>
            <textarea
              value={selectedProgram.description || ""}
              onChange={(e) => {
                const updated = {...selectedProgram, description: e.target.value};
                setSelectedProgram(updated);
                updateProgram(selectedProgram.id, updated);
              }}
              className="w-full p-3 border rounded-lg text-telegram-text bg-telegram-secondary-bg"
              placeholder="Описание программы"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-telegram-text">Дни тренировок</h3>
              <button 
                onClick={() => addWorkoutDay(selectedProgram)}
                className="telegram-button-small flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>День</span>
              </button>
            </div>

            {selectedProgram.workoutDays.map((day, dayIndex) => (
              <div key={day.id} className="border rounded-lg p-4 bg-telegram-secondary-bg">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => {
                      const updated = {
                        ...selectedProgram,
                        workoutDays: selectedProgram.workoutDays.map((d, i) => 
                          i === dayIndex ? {...d, name: e.target.value} : d
                        )
                      };
                      setSelectedProgram(updated);
                      updateProgram(selectedProgram.id, updated);
                    }}
                    className="font-medium bg-transparent text-telegram-text border-none outline-none"
                  />
                  <button 
                    onClick={() => setShowAddExercise({dayId: day.id})}
                    className="text-telegram-button text-sm flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Упражнение</span>
                  </button>
                </div>

                {day.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="ml-4 mb-3 p-3 border rounded bg-white/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-telegram-text">{exercise.exercise.name}</span>
                      <button 
                        onClick={() => addSetToExercise(day.id, exerciseIndex)}
                        className="text-telegram-button text-sm"
                      >
                        + подход
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center space-x-2 text-sm">
                          <span className="w-8 text-telegram-hint">#{setIndex + 1}</span>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const updated = {
                                ...selectedProgram,
                                workoutDays: selectedProgram.workoutDays.map((d) => 
                                  d.id === day.id 
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((ex, exIdx) => 
                                          exIdx === exerciseIndex
                                            ? {
                                                ...ex,
                                                sets: ex.sets.map((s, sIdx) =>
                                                  sIdx === setIndex ? {...s, reps: parseInt(e.target.value) || 0} : s
                                                )
                                              }
                                            : ex
                                        )
                                      }
                                    : d
                                )
                              };
                              setSelectedProgram(updated);
                              updateProgram(selectedProgram.id, updated);
                            }}
                            className="w-12 px-1 py-0.5 text-center border rounded"
                            placeholder="повт"
                          />
                          <span className="text-telegram-hint">×</span>
                          <input
                            type="number"
                            value={set.weight || ""}
                            onChange={(e) => {
                              const updated = {
                                ...selectedProgram,
                                workoutDays: selectedProgram.workoutDays.map((d) => 
                                  d.id === day.id 
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((ex, exIdx) => 
                                          exIdx === exerciseIndex
                                            ? {
                                                ...ex,
                                                sets: ex.sets.map((s, sIdx) =>
                                                  sIdx === setIndex ? {...s, weight: parseFloat(e.target.value) || 0} : s
                                                )
                                              }
                                            : ex
                                        )
                                      }
                                    : d
                                )
                              };
                              setSelectedProgram(updated);
                              updateProgram(selectedProgram.id, updated);
                            }}
                            className="w-12 px-1 py-0.5 text-center border rounded"
                            placeholder="кг"
                          />
                          <span className="text-telegram-hint">кг</span>
                          <span className="text-telegram-hint ml-2">{set.rest}с</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {showAddExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowAddExercise(null)}>
            <div className="bg-telegram-bg w-full rounded-t-xl p-4 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-medium text-telegram-text mb-3">Выберите упражнение</h3>
              <div className="space-y-2">
                {mockExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExerciseToDay(showAddExercise.dayId, exercise.id)}
                    className="w-full text-left p-3 rounded-lg bg-telegram-secondary-bg hover:bg-gray-100"
                  >
                    <div className="font-medium text-telegram-text">{exercise.name}</div>
                    <div className="text-sm text-telegram-hint">{exercise.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (clientPrograms.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-telegram-hint" />
          <h3 className="mt-2 text-sm font-medium text-telegram-text">Программа тренировок</h3>
          <p className="mt-1 text-sm text-telegram-hint">
            У клиента пока нет программы тренировок
          </p>
          <div className="mt-4">
            <button onClick={createNewProgram} className="telegram-button">
              Создать программу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-telegram-text">Программы тренировок</h2>
        <button onClick={createNewProgram} className="telegram-button-small">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {clientPrograms.map(program => (
          <div key={program.id} className="border rounded-lg p-4 bg-telegram-secondary-bg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-telegram-text">{program.name}</h3>
                {program.description && (
                  <p className="text-sm text-telegram-hint mt-1">{program.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  program.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {program.status === "active" ? "Активная" : "Завершена"}
                </span>
                <button 
                  onClick={() => {setSelectedProgram(program); setShowCreateForm(true);}}
                  className="text-telegram-button"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-telegram-hint mb-3">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Начало: {program.startDate.toLocaleDateString('ru')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{program.workoutDays.length} дней</span>
              </div>
            </div>

            <div className="space-y-2">
              {program.workoutDays.slice(0, 3).map(day => (
                <div key={day.id} className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span className="font-medium text-telegram-text">{day.name}</span>
                  <span className="text-sm text-telegram-hint">
                    {day.exercises.length} упражнений
                  </span>
                </div>
              ))}
              {program.workoutDays.length > 3 && (
                <div className="text-sm text-telegram-hint text-center py-1">
                  +{program.workoutDays.length - 3} дней
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientProgram;
