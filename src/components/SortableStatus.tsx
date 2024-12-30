import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grip, PencilIcon, ListTodo, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ProjectStatusSettings } from '../types';

interface SortableStatusProps {
  status: ProjectStatusSettings;
  onEdit: () => void;
  onDelete: () => void;
  onEditSteps: () => void;
}

export function SortableStatus({ status, onEdit, onDelete, onEditSteps }: SortableStatusProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const Icon = (Icons as any)[status.icon];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <button className="cursor-move" {...attributes} {...listeners}>
          <Grip className="h-5 w-5 text-gray-400" />
        </button>
        
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5" style={{ color: status.color }} />}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{status.name}</h3>
            {status.description && (
              <p className="text-sm text-gray-500">{status.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onEditSteps}
          className="p-1 text-gray-400 hover:text-gray-500"
          title="Upravit kroky"
        >
          <ListTodo className="h-5 w-5" />
        </button>
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-500"
          title="Upravit stav"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500"
          title="Smazat stav"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
