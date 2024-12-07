import React from 'react';
import { StatusIcon } from '../StatusIcon';
import type { ProjectStatusSettings } from '../../types';

interface StatusSectionProps {
  title: string;
  status: ProjectStatusSettings;
  onEdit?: () => void;
  onEditSteps?: () => void;
  disabled?: boolean;
}

export function StatusSection({ title, status, onEdit, onEditSteps, disabled = false }: StatusSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className={`${disabled ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <StatusIcon icon={status.icon} color={status.color} />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{status.name}</h3>
              {status.description && (
                <p className="text-sm text-gray-500">{status.description}</p>
              )}
            </div>
          </div>
          
          {!disabled && (
            <div className="flex space-x-4">
              {onEditSteps && (
                <button
                  onClick={onEditSteps}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Upravit kroky
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Upravit stav
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}