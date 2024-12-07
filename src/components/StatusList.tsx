import React from 'react';
import { ArrowUp, ArrowDown, ListTodo, PencilIcon, Trash2 } from 'lucide-react';
import { StatusIcon } from './StatusIcon';
import type { ProjectStatusSettings } from '../types';

interface StatusListProps {
  statuses: ProjectStatusSettings[];
  onEdit: (status: ProjectStatusSettings) => void;
  onDelete: (id: string) => void;
  onReorder: (statuses: ProjectStatusSettings[]) => void;
  onEditSteps: (statusId: string) => void;
}

export function StatusList({ statuses, onEdit, onDelete, onReorder, onEditSteps }: StatusListProps) {
  const moveStatus = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === statuses.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newStatuses = [...statuses];
    const [movedStatus] = newStatuses.splice(index, 1);
    newStatuses.splice(newIndex, 0, movedStatus);

    // Update positions
    const updatedStatuses = newStatuses.map((status, i) => ({
      ...status,
      position: i + 2 // +2 because initial status is at position 1
    }));

    onReorder(updatedStatuses);
  };

  return (
    <div className="space-y-4">
      {statuses.map((status, index) => (
        <div
          key={status.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => moveStatus(index, 'up')}
                disabled={index === 0}
                className={`p-1 rounded hover:bg-gray-100 ${
                  index === 0 ? 'text-gray-300' : 'text-gray-500'
                }`}
                title="Posunout nahoru"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => moveStatus(index, 'down')}
                disabled={index === statuses.length - 1}
                className={`p-1 rounded hover:bg-gray-100 ${
                  index === statuses.length - 1 ? 'text-gray-300' : 'text-gray-500'
                }`}
                title="Posunout dolů"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <StatusIcon icon={status.icon} color={status.color} />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{status.name}</h3>
                {status.description && (
                  <p className="text-sm text-gray-500">{status.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onEditSteps(status.id)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ListTodo className="h-4 w-4 mr-1" />
              Upravit kroky
            </button>
            <button
              onClick={() => onEdit(status)}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Upravit stav
            </button>
            <button
              onClick={() => onDelete(status.id)}
              className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Smazat
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}