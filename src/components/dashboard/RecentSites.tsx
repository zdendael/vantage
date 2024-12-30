import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import type { Site } from '../../types';

interface RecentSitesProps {
  sites: Site[];
}

export function RecentSites({ sites }: RecentSitesProps) {
  const navigate = useNavigate();

  if (sites.length === 0) {
    return <p className="text-gray-500 text-center py-4">Zatím nejsou žádné sites</p>;
  }

  return (
    <div className="space-y-4">
      {sites.map((site) => (
        <div
          key={site.id}
          onClick={() => navigate(`/sites/${site.id}`)}
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-900">{site.siteId}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {site.location}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
    </div>
  );
}
