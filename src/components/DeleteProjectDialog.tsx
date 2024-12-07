import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectDialogProps {
  projectName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteProjectDialog({ projectName, onConfirm, onClose }: DeleteProjectDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Smazat projekt</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Opravdu chcete smazat projekt <span className="font-semibold">{projectName}</span>? 
          Tato akce je nevratná a všechna data projektu budou ztracena.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Smazat projekt
          </button>
        </div>
      </div>
    </div>
  );
}