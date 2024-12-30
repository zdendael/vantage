import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ProjectStatusSettings } from '../types';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface StatusSettingsFormProps {
  status: ProjectStatusSettings;
  onSave: (data: Partial<ProjectStatusSettings>) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

export function StatusSettingsForm({ status, onSave, onCancel, isNew = false }: StatusSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: status.name,
    description: status.description || '',
    icon: status.icon,
    color: status.color,
    showOnDashboard: status.showOnDashboard,
    code: status.code
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Název stavu
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {isNew && (
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Kód stavu
          </label>
          <input
            type="text"
            id="code"
            required
            pattern="[a-z_]+"
            title="Pouze malá písmena a podtržítka"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Pouze malá písmena a podtržítka, např. "technical_review"
          </p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Popis
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ikona
        </label>
        <IconPicker
          value={formData.icon}
          onChange={(icon) => setFormData({ ...formData, icon })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barva
        </label>
        <ColorPicker
          value={formData.color}
          onChange={(color) => setFormData({ ...formData, color })}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="showOnDashboard"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={formData.showOnDashboard}
          onChange={(e) => setFormData({ ...formData, showOnDashboard: e.target.checked })}
        />
        <label htmlFor="showOnDashboard" className="ml-2 block text-sm text-gray-700">
          Zobrazit na dashboardu
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-1" />
          Zrušit
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Check className="h-4 w-4 mr-1" />
          {isNew ? 'Vytvořit' : 'Uložit'}
        </button>
      </div>
    </form>
  );
}
