import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { getStatusText, getStatusColor } from '../../lib/utils/projectStatus';
import type { Project, Site, ProjectStatus } from '../../types';

interface RecentProjectsProps {
  projects: (Project & { site?: Site })[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return <p className="text-gray-500 text-center py-4">Zatím nejsou žádné projekty</p>;
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/projekty/${project.id}`)}
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status as ProjectStatus)}`}>
                {getStatusText(project.status as ProjectStatus)}
              </span>
            </div>
            {project.site && (
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {project.site.siteId}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Aktualizováno {format(new Date(project.updatedAt), 'd. MMMM yyyy', { locale: cs })}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
    </div>
  );
}
