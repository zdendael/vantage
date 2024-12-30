import React from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Radio, Calendar, Clock, MapPin } from 'lucide-react';
import { getStatusText, getStatusColor } from '../lib/utils/projectStatus';
import type { Project, Site, ProjectStatus } from '../types';

interface ProjectListProps {
  projects: (Project & { site?: Site })[];
  onProjectClick: (projectId: string) => void;
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProjectClick(project.id)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status as ProjectStatus)}`}>
                {getStatusText(project.status as ProjectStatus)}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              {project.site && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{project.site.siteId} - {project.site.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Zahájení: {format(new Date(project.startDate), 'd. MMMM yyyy', { locale: cs })}</span>
              </div>
              {project.endDate && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Dokončení: {format(new Date(project.endDate), 'd. MMMM yyyy', { locale: cs })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
