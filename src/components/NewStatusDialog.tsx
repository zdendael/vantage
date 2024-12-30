import React from 'react';
import { StatusSettingsForm } from './StatusSettingsForm';
import type { ProjectStatusSettings } from '../types';

interface NewStatusDialogProps {
  onSubmit: (data: Partial<ProjectStatusSettings>) => Promise<void>;
  onClose: () => void;
}

export function NewStatusDialog({ onSubmit, onClose }: NewStatusDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nový stav projektu</h2>
        
        <StatusSettingsForm
          status={{
            id: '',
            code: '',
            name: '',
            icon: 'Circle',
            color: '#4B5563',
            showOnDashboard: true,
            type: 'regular',
            position: 0,
            steps: []
          }}
          onSave={onSubmit}
          onCancel={onClose}
          isNew={true}
        />
      </div>
    </div>
  );
}
