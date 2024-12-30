import React, { useState, useMemo } from 'react';
import type { Project, Site } from '../types';

interface EditProjectDialogProps {
  project: Project;
  sites: Site[];
  onSubmit: (data: Partial<Project>) => void;
  onClose: () => void;
}

export function EditProjectDialog({ project, sites, onSubmit, onClose }: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    siteId: project.siteId,
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
    description: project.description || '',
    address: project.address || '',
    gpsCoordinates: project.gpsCoordinates || ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(() => {
    const sortedSites = [...sites].sort((a, b) => a.siteId.localeCompare(b.siteId));
    if (!searchQuery) return sortedSites;
    return sortedSites.filter(site => 
      site.siteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sites, searchQuery]);

  const selectedSite = sites.find(site => site.id === formData.siteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      endDate: formData.endDate || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Upravit projekt</h2>
        
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
                size={6}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.siteId}
                onChange={(e) => {
                  const newSiteId = e.target.value || '';
                  const newSite = sites.find(s => s.id === newSiteId);
                  setFormData({
                    ...formData,
                    siteId: newSiteId,
                    gpsCoordinates: newSite?.gpsCoordinates || formData.gpsCoordinates
                  });
                }}
              >
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
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Datum dokončení
            </label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Adresa
            </label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="gpsCoordinates" className="block text-sm font-medium text-gray-700">
              GPS Souřadnice
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="gpsCoordinates"
                placeholder="50°41'14.388&quot;N 13°58'40.115&quot;E"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.gpsCoordinates}
                onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
              />
              {selectedSite?.gpsCoordinates && (
                <button
                  type="button"
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    gpsCoordinates: selectedSite.gpsCoordinates || ''
                  }))}
                >
                  Použít GPS souřadnice ze situ
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Formát: 50°41'14.388"N 13°58'40.115"E
            </p>
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
              Uložit změny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
