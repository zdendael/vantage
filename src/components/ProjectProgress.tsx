import React from 'react';
import type { ProjectStatusSettings, ProjectStatus } from '../types';

interface ProjectProgressProps {
  statuses: ProjectStatusSettings[];
  currentStatus: string;
  completedSteps: string[];
}

export function ProjectProgress({ statuses, currentStatus, completedSteps }: ProjectProgressProps) {
  const calculateProgress = () => {
    // Počítáme pouze kroky z regulérních stavů
    const regularSteps = statuses
      .filter(status => status.type === 'regular')
      .flatMap(status => status.steps);
    
    if (regularSteps.length === 0) return 0;

    const completedCount = completedSteps.filter(stepId =>
      regularSteps.some(step => step.id === stepId)
    ).length;

    return Math.round((completedCount / regularSteps.length) * 100);
  };

  const calculateStatusProgress = (status: ProjectStatusSettings) => {
    if (status.steps.length === 0) return 0;

    const completedStatusSteps = status.steps.filter(step =>
      completedSteps.includes(step.id)
    );

    return Math.round((completedStatusSteps.length / status.steps.length) * 100);
  };

  const totalProgress = calculateProgress();
  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
  const regularStatuses = sortedStatuses.filter(s => s.type === 'regular');

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium text-gray-700">Celkový průběh</h3>
          <span className="text-sm font-medium text-gray-900">{totalProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {regularStatuses.map((status) => {
          const progress = calculateStatusProgress(status);
          const isActive = status.code === currentStatus;
          const isPast = sortedStatuses.findIndex(s => s.code === currentStatus) >
                        sortedStatuses.findIndex(s => s.code === status.code);

          return (
            <div key={status.id}>
              <div className="flex justify-between items-center mb-1">
                <h4 className={`text-sm font-medium ${
                  isActive ? 'text-indigo-700' :
                  isPast ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {status.name}
                </h4>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-indigo-700' :
                  isPast ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-indigo-600' :
                    isPast ? 'bg-green-600' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}