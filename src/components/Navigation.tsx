import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Radio, FileText, MapPin, Settings, Plus } from 'lucide-react';
import { ProjectFormWizard } from './projects/ProjectFormWizard';
import { getSites } from '../lib/api/sites';
import { createProject } from '../lib/api/projects';
import type { Site } from '../types';

export function Navigation() {
  const location = useLocation();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  const showNewProjectButton = location.pathname === '/';

  useEffect(() => {
    const loadSites = async () => {
      try {
        const sitesData = await getSites();
        setSites(sitesData);
      } catch (error) {
        console.error('Chyba při načítání sites:', error);
      }
    };

    loadSites();
  }, []);

  const handleCreateProject = async (data: Parameters<typeof createProject>[0]) => {
    try {
      const newProject = await createProject(data);
      setIsNewProjectDialogOpen(false);
      navigate(`/projekty/${newProject.id}`);
    } catch (error) {
      console.error('Chyba při vytváření projektu:', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2">
              <Radio className="h-6 w-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">Vantage Towers realizace WIA</span>
            </Link>
            
            <div className="flex items-center space-x-4 ml-8">
              <Link
                to="/projekty"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/projekty')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Projekty</span>
              </Link>
              
              <Link
                to="/sites"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/sites')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Sites</span>
              </Link>
              
              <Link
                to="/nastaveni"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/nastaveni')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Nastavení</span>
              </Link>
            </div>
          </div>
          {showNewProjectButton && (
            <button
              onClick={() => setIsNewProjectDialogOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nový projekt
            </button>
          )}
        </div>
      </div>
      
      {isNewProjectDialogOpen && (
        <ProjectFormWizard
          sites={sites}
          onSubmit={handleCreateProject}
          onClose={() => setIsNewProjectDialogOpen(false)}
          submitLabel="Vytvořit projekt"
        />
      )}
    </nav>
  );
}
