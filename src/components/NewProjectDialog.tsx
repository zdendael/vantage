import React, { useState, useMemo } from 'react';
import type { Site } from '../types';

interface NewProjectDialogProps {
  sites: Site[];
  onSubmit: (data: {
    name: string;
    siteId: string;
    startDate: string;
    description?: string;
  }) => void;
  onClose: () => void;
}

export function NewProjectDialog({ sites, onSubmit, onClose }: NewProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sites.filter(site => 
      site.siteId.toLowerCase().includes(query)
    ).sort((a, b) => a.siteId.localeCompare(b.siteId));
  }, [sites, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Nový projekt</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Název projektu
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

          <div>
            <label htmlFor="site-search" className="block text-sm font-medium text-gray-700">
              Site
            </label>
            <div className="mt-1 space-y-2">
              <input
                type="text"
                id="site-search"
                placeholder="Vyhledat site podle ID..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                id="site"
                required
                size={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              >
                <option value="">Vyberte site</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.siteId} - {site.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Datum zahájení
            </label>
            <input
              type="date"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

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

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Vytvořit projekt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}