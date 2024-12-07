import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getProjectStatuses } from '../lib/api/projectStatuses';
import { getCompletedSteps, completeProjectStep, uncompleteProjectStep } from '../lib/api/projectSteps';
import { subscribeToProjectUpdates, unsubscribeFromProjectUpdates } from '../lib/api/realtime';
import type { ProjectStatusSettings } from '../types';

interface ProjectChecklistProps {
  projectId: string;
  status: string;
  onStepsChange: (steps: string[]) => void;
}

export function ProjectChecklist({ projectId, status, onStepsChange }: ProjectChecklistProps) {
  const [statuses, setStatuses] = useState<ProjectStatusSettings[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompletedSteps = useCallback(async () => {
    try {
      const steps = await getCompletedSteps(projectId);
      setCompletedSteps(steps);
      onStepsChange(steps);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Chyba při načítání dokončených kroků:', error.message);
      }
      // Pokračujeme s prázdným polem místo přerušení UI
      setCompletedSteps([]);
      onStepsChange([]);
    }
  }, [projectId, onStepsChange]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statusesData = await getProjectStatuses();
        setStatuses(statusesData);
        await loadCompletedSteps();
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const channel = subscribeToProjectUpdates(projectId, () => {
      loadCompletedSteps();
    });

    return () => {
      unsubscribeFromProjectUpdates(channel);
    };
  }, [projectId, loadCompletedSteps]);

  const handleStepToggle = async (stepId: string) => {
    try {
      if (completedSteps.includes(stepId)) {
        await uncompleteProjectStep(projectId, stepId);
      } else {
        await completeProjectStep(projectId, stepId);
      }
      await loadCompletedSteps();
    } catch (error) {
      console.error('Chyba při změně stavu kroku:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Seřadíme stavy podle jejich pozice
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
  const regularStatuses = sortedStatuses.filter(s => s.type === 'regular');

  // Počítáme celkový progress
  const allRegularSteps = regularStatuses.flatMap(s => s.steps);
  const completedRegularSteps = completedSteps.filter(stepId => 
    allRegularSteps.some(step => step.id === stepId)
  );
  const totalProgress = allRegularSteps.length > 0 
    ? Math.round((completedRegularSteps.length / allRegularSteps.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {regularStatuses.map((statusItem) => {
        const statusSteps = statusItem.steps;
        const completedStatusSteps = statusSteps.filter(step => 
          completedSteps.includes(step.id)
        );
        const progress = statusSteps.length > 0
          ? Math.round((completedStatusSteps.length / statusSteps.length) * 100)
          : 0;

        const isCurrentStatus = statusItem.code === status;
        const isPastStatus = sortedStatuses.findIndex(s => s.code === status) >
                            sortedStatuses.findIndex(s => s.code === statusItem.code);

        return (
          <div key={statusItem.id} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-medium ${
                  isCurrentStatus ? 'text-indigo-700' :
                  isPastStatus ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {statusItem.name}
                </h3>
                <span className={`text-sm font-medium ${
                  isCurrentStatus ? 'text-indigo-700' :
                  isPastStatus ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrentStatus ? 'bg-indigo-600' :
                    isPastStatus ? 'bg-green-600' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {statusItem.steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isCompleted ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => handleStepToggle(step.id)}
                      className={`mt-0.5 ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${
                        isCompleted ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {step.name}
                      </h4>
                      {step.description && (
                        <p className={`mt-1 text-sm ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}