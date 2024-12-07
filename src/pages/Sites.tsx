import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, ExternalLink } from 'lucide-react';
import { getSites } from '../lib/api/sites';
import type { Site } from '../types';

export function Sites() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const data = await getSites();
        setSites(data);
      } catch (error) {
        console.error('Chyba při načítání sites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
        <button
          onClick={() => navigate('/sites/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nový site
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <div
            key={site.id}
            onClick={() => navigate(`/sites/${site.id}`)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">{site.siteId}</h3>
              {site.acctUrl && (
                <a
                  href={site.acctUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{site.location}</span>
            </div>

            {site.gpsCoordinates && (
              <div className="mt-2 text-xs text-gray-400">
                GPS: {site.gpsCoordinates}
              </div>
            )}

            <div className="mt-2 text-xs font-medium">
              <span className={`px-2 py-1 rounded-full ${
                site.connectivity === 'radio' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {site.connectivity === 'radio' ? 'Rádio' : 'Optika'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}