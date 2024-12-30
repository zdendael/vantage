import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { ProjectList } from '../components/ProjectList';
import { ProjectFormWizard } from '../components/projects/ProjectFormWizard';
import { getProjects, createProject } from '../lib/api/projects';
import { getSites } from '../lib/api/sites';
import type { Project, Site } from '../types';
import { useNavigate } from 'react-router-dom';

export function Projects() {
  const [projects, setProjects] = useState<(Project & { site?: Site })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase();
    return project.name.toLowerCase().includes(query) ||
           project.site?.siteId.toLowerCase().includes(query) ||
           project.site?.location.toLowerCase().includes(query);
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, sitesData] = await Promise.all([
          getProjects(),
          getSites()
        ]);

        // Přidání informací o sitech k projektům
        const projectsWithSites = projectsData.map(project => ({
          ...project,
          site: sitesData.find(site => site.id === project.siteId)
        }));

        setProjects(projectsWithSites);
        setSites(sitesData);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateProject = async (data: Parameters<typeof createProject>[0]) => {
    try {
      const newProject = await createProject(data);
      const site = sites.find(s => s.id === newProject.siteId);
      setProjects([{ ...newProject, site }, ...projects]);
      setIsNewProjectDialogOpen(false);
    } catch (error) {
      console.error('Chyba při vytváření projektu:', error);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projekty/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">Projekty</h1>
          <button
            onClick={() => setIsNewProjectDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nový projekt
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Hledat podle názvu projektu, ID situ nebo lokality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Zatím zde nejsou žádné projekty.</p>
        </div>
      ) : (
        <ProjectList projects={filteredProjects} onProjectClick={handleProjectClick} />
      )}

      {isNewProjectDialogOpen && (
        <ProjectFormWizard
          sites={sites}
          onSubmit={handleCreateProject}
          onClose={() => setIsNewProjectDialogOpen(false)}
          submitLabel="Vytvořit projekt"
        />
      )}
    </div>
  );
}
