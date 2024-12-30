import React, { useState } from 'react';
interface SiteFormProps {
  initialData?: Partial<Site>;
  onSubmit: (data: Omit<Site, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  submitLabel: string;
}

import { validateGpsFormat, normalizeGpsCoordinates } from '../lib/utils/coordinates';

export function SiteForm({ initialData, onSubmit, onCancel, submitLabel }: SiteFormProps) {
  const [formData, setFormData] = useState({
    siteId: initialData?.siteId || '',
    location: initialData?.location || '',
    provider: initialData?.provider || 'Vantage Towers',
    acctUrl: initialData?.acctUrl || '',
    gpsCoordinates: initialData?.gpsCoordinates || '',
    connectivity: initialData?.connectivity || 'radio',
    notes: initialData?.notes || ''
  });

  const [gpsError, setGpsError] = useState('');

  const handleGpsChange = (value: string) => {
    const normalized = normalizeGpsCoordinates(value);
    setFormData({ ...formData, gpsCoordinates: normalized });
    if (!validateGpsFormat(normalized) && normalized) {
      setGpsError('GPS souřadnice musí být ve formátu: 50°41\'14.388"N 13°58\'40.115"E');
    } else {
      setGpsError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.gpsCoordinates && !validateGpsFormat(formData.gpsCoordinates)) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="siteId" className="block text-sm font-medium text-gray-700">
          ID situ *
        </label>
        <input
          type="text"
          id="siteId"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.siteId}
          onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Lokalita *
        </label>
        <input
          type="text"
          id="location"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="connectivity" className="block text-sm font-medium text-gray-700">
          Typ konektivity *
        </label>
        <select
          id="connectivity"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.connectivity}
          onChange={(e) => setFormData({ ...formData, connectivity: e.target.value as 'radio' | 'optical' })}
        >
          <option value="radio">Rádio</option>
          <option value="optical">Optika</option>
        </select>
      </div>

      <div>
        <label htmlFor="acctUrl" className="block text-sm font-medium text-gray-700">
          ACCT URL
        </label>
        <input
          type="url"
          id="acctUrl"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.acctUrl}
          onChange={(e) => setFormData({ ...formData, acctUrl: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="gpsCoordinates" className="block text-sm font-medium text-gray-700">
          GPS Souřadnice
        </label>
        <input
          type="text"
          id="gpsCoordinates"
          placeholder="50°41'14.388&quot;N 13°58'40.115&quot;E"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
            gpsError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
          }`}
          value={formData.gpsCoordinates}
          onChange={(e) => handleGpsChange(e.target.value)}
        />
        {gpsError && (
          <p className="mt-1 text-sm text-red-600">{gpsError}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Poznámky
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          disabled={!!gpsError}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
