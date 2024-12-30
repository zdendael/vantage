import React, { useState, useEffect, useCallback } from 'react';
import { ToggleLeft, ToggleRight, Search, FileText, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStatusText, getStatusColor } from '../lib/utils/projectStatus';
import { getProjectStatistics } from '../lib/api/statistics';
import { getProjects } from '../lib/api/projects';
import { getSites } from '../lib/api/sites';
import { getProjectStatuses, reorderProjectStatuses } from '../lib/api/projectStatuses';
import { StatusCard } from '../components/dashboard/StatusCard';
import { RecentProjects } from '../components/dashboard/RecentProjects';
import { RecentSites } from '../components/dashboard/RecentSites';
import type { Project, Site, ProjectStatusSettings, ProjectStatus } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [recentProjects, setRecentProjects] = useState<(Project & { site?: Site })[]>([]);
  const [recentSites, setRecentSites] = useState<Site[]>([]);
  const [statuses, setStatuses] = useState<ProjectStatusSettings[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movableStatuses, setMovableStatuses] = useState<ProjectStatusSettings[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [allSites, setAllSites] = useState<Site[]>([]);

  type SearchResult = {
    type: 'project' | 'site';
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
  };

  const getSearchResults = (): SearchResult[] => {
    const query = searchQuery.toLowerCase();
    if (!query) return [];

    const projectResults: SearchResult[] = recentProjects
      .filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.site?.siteId.toLowerCase().includes(query) ||
        project.site?.location.toLowerCase().includes(query)
      )
      .map(project => ({
        type: 'project',
        id: project.id,
        title: project.name,
        subtitle: project.site ? `${project.site.siteId} - ${project.site.location}` : undefined,
        status: project.status
      }));

    const siteResults: SearchResult[] = allSites
      .filter(site =>
        site.siteId.toLowerCase().includes(query) ||
        site.location.toLowerCase().includes(query)
      )
      .map(site => ({
        type: 'site',
        id: site.id,
        title: site.siteId,
        subtitle: site.location
      }));

    return [...projectResults, ...siteResults];
  };

  const searchResults = getSearchResults();

  useEffect(() => {
    setMovableStatuses(statuses);
  }, [statuses]);

  const handleMoveStatus = useCallback(async (index: number, direction: 'up' | 'down') => {
    try {
      const updatedStatuses = [...movableStatuses];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= updatedStatuses.length) {
        return; // Invalid move
      }

      // Swap positions
      [updatedStatuses[index], updatedStatuses[newIndex]] = 
      [updatedStatuses[newIndex], updatedStatuses[index]];

      // Update positions for all visible statuses
      const reorderedStatuses = updatedStatuses.map((status, i) => ({
        ...status,
        position: i
      }));

      await reorderProjectStatuses(reorderedStatuses);

      // Refresh data
      const refreshedStatuses = await getProjectStatuses();
      setStatuses(refreshedStatuses);
    } catch (error) {
      console.error('Chyba při změně pořadí stavů:', error);
    }
  }, [movableStatuses]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Nejprve načteme stavy, abychom je mohli použít pro statistiky
        const statusesData = await getProjectStatuses();
        setStatuses(statusesData);

        const [stats, projects, sites] = await Promise.all([
          getProjectStatistics(statusesData),
          getProjects(),
          getSites()
        ]);
        
        setStatistics(stats);

        // Přidání informací o sitech k projektům
        const projectsWithSites = projects.slice(0, 5).map(project => ({
          ...project,
          site: sites.find(site => site.id === project.siteId)
        }));
        
        setRecentProjects(projectsWithSites);
        setRecentSites(sites.slice(0, 5));
        setAllSites(sites);
      } catch (error) {
        console.error('Chyba při načítání dat dashboardu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isEditing ? (
              <ToggleRight className="h-4 w-4 mr-2 text-indigo-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Uložit pořadí' : 'Upravit pořadí'}
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Hledat podle názvu projektu, ID situ nebo lokality..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(!!e.target.value);
          }}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        
        {showSearchResults && searchQuery && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      navigate(result.type === 'project' ? `/projekty/${result.id}` : `/sites/${result.id}`);
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {result.type === 'project' ? (
                          <FileText className="h-4 w-4 text-gray-400" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      {result.status && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status as ProjectStatus)}`}>
                          {getStatusText(result.status as ProjectStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-4 text-sm text-gray-500 text-center">
                Nebyly nalezeny žádné výsledky
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {movableStatuses.map((status, index) => {
          const movableIndex = movableStatuses.findIndex(s => s.id === status.id);
          const canMove = isEditing;
          
          return (
            <StatusCard
              key={status.id}
              status={status}
              count={statistics[status.code] || 0}
              isEditing={isEditing}
              onMoveUp={canMove ? () => handleMoveStatus(movableIndex, 'up') : undefined}
              onMoveDown={canMove ? () => handleMoveStatus(movableIndex, 'down') : undefined}
              isFirst={movableIndex === 0}
              isLast={movableIndex === movableStatuses.length - 1}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Poslední projekty</h2>
            <RecentProjects projects={recentProjects} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Poslední sites</h2>
            <RecentSites sites={recentSites} />
          </div>
        </div>
      </div>
    </div>
  );
}
