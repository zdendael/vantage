import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { StatusIcon } from '../StatusIcon'; 
import type { ProjectStatusSettings } from '../../types';

interface StatusCardProps {
  status: ProjectStatusSettings;
  count: number;
  isEditing: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function StatusCard({ 
  status, 
  count, 
  isEditing,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast 
}: StatusCardProps) {
  return (
    <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3">
        <StatusIcon icon={status.icon} color={status.color} className="h-6 w-6 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{status.name}</p>
          <p className="text-2xl font-semibold text-gray-900">{count}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing && (
            <div className="flex space-x-1">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className={`p-1 rounded hover:bg-gray-100 ${
                  isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'
                }`}
                title="Posunout doleva"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className={`p-1 rounded hover:bg-gray-100 ${
                  isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'
                }`}
                title="Posunout doprava"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
