import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const COLORS = [
  { name: 'Šedá', value: '#4B5563' },
  { name: 'Modrá', value: '#3B82F6' },
  { name: 'Žlutá', value: '#EAB308' },
  { name: 'Fialová', value: '#9333EA' },
  { name: 'Oranžová', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Zelená', value: '#22C55E' }
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`w-8 h-8 rounded-full border-2 ${
            value === color.value ? 'border-gray-900' : 'border-transparent'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
}