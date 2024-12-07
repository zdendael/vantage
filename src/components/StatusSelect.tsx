import React from 'react';
import { ProjectStatus } from '../types';

interface StatusSelectProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

export function StatusSelect({ currentStatus, onStatusChange }: StatusSelectProps) {
  const statuses = [
    { value: ProjectStatus.NEW, label: 'Nový' },
    { value: ProjectStatus.PREPARATION, label: 'Příprava' },
    { value: ProjectStatus.APPROVAL, label: 'Schvalování' },
    { value: ProjectStatus.IMPLEMENTATION, label: 'Realizace' },
    { value: ProjectStatus.DOCUMENTATION, label: 'Dokumentace' },
    { value: ProjectStatus.COMPLETED, label: 'Dokončeno' }
  ];

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
        className="appearance-none cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {statuses.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}