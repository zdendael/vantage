import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { StatusIcon } from './StatusIcon';
import { Search } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter icon names and ensure they are actual components
  const iconList = Object.keys(LucideIcons)
    .filter(name => 
      typeof LucideIcons[name as keyof typeof LucideIcons] === 'function' &&
      name !== 'createLucideIcon' && // Exclude utility function
      (search === '' || name.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full"
      >
        <StatusIcon icon={value} color="#000000" className="h-4 w-4 mr-2" />
        {value}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-96 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat ikonu..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto p-2 grid grid-cols-6 gap-2">
            {iconList.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center ${
                  value === iconName ? 'bg-indigo-100' : ''
                }`}
                title={iconName}
              >
                <StatusIcon icon={iconName} color="#000000" className="h-4 w-4" />
              </button>
            ))}
            {iconList.length === 0 && (
              <div className="col-span-6 py-8 text-center text-sm text-gray-500">
                Žádné ikony nebyly nalezeny
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
