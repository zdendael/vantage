import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, MapPin, Clock, PencilIcon, Trash2, Globe, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { getProject, updateProject, deleteProject } from '../lib/api/projects'; 
import { getSite } from '../lib/api/sites';
import { getProjectDocuments } from '../lib/api/documents';
import { getProjectStatuses } from '../lib/api/projectStatuses';
import { getCompletedSteps } from '../lib/api/projectSteps';
import { DocumentList } from '../components/DocumentList';
import { ProjectChecklist } from '../components/ProjectChecklist';
import { ProjectEditTabs } from '../components/projects/ProjectEditTabs';
import { DeleteProjectDialog } from '../components/DeleteProjectDialog';
import { ConnectionMap } from '../components/ConnectionMap';
import { getStatusText, getStatusColor } from '../lib/utils/projectStatus';
import { subscribeToProjectUpdates, unsubscribeFromProjectUpdates } from '../lib/api/realtime';
import type { Project, Site, Document, ProjectStatus, ProjectStatusSettings } from '../types';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [site, setSite] = useState<Site | null>(null); 
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statuses, setStatuses] = useState<ProjectStatusSettings[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadProjectData = useCallback(async () => {
    if (!id) return;
    
    try {
      const [projectData, statusesData, completedStepsData] = await Promise.all([
        getProject(id),
        getProjectStatuses(),
        getCompletedSteps(id)
      ]);
      
      if (!projectData) {
        throw new Error('Projekt nebyl nalezen');
      }

      const siteData = await getSite(projectData.siteId);
      const documentsData = await getProjectDocuments(id);
      
      setProject(projectData);
      setSite(siteData);
      setDocuments(documentsData);
      setStatuses(statusesData);
      setCompletedSteps(completedStepsData);
    } catch (error) {
      console.error('Chyba při načítání dat projektu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectData();

    if (id) {
      const channel = subscribeToProjectUpdates(id, () => {
        loadProjectData();
      });

      return () => {
        unsubscribeFromProjectUpdates(channel);
      };
    }
  }, [id, loadProjectData]);

  const handleUpdateProject = async (data: Partial<Project>) => {
    if (!project?.id) return;

    try {
      const updatedProject = await updateProject(project.id, data);
      setProject(updatedProject);
      await loadProjectData(); // Refresh all data
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Chyba při aktualizaci projektu:', error);
      alert('Nepodařilo se aktualizovat projekt. Zkuste to prosím znovu.');
    }
  };

  const handleDeleteProject = async () => {
    if (!project?.id) return;

    try {
      await deleteProject(project.id);
      navigate('/projekty');
    } catch (error) {
      console.error('Chyba při mazání projektu:', error);
    }
  };

  const handleStepsChange = (steps: string[]) => {
    setCompletedSteps(steps);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project || !site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Projekt nebyl nalezen.</p>
      </div>
    );
  }

  // Počítáme celkový progress pouze z regulérních stavů
  const regularStatuses = statuses.filter(s => s.type === 'regular');
  const allRegularSteps = regularStatuses.flatMap(s => s.steps);
  const completedRegularSteps = completedSteps.filter(stepId => 
    allRegularSteps.some(step => step.id === stepId)
  );
  const totalProgress = allRegularSteps.length > 0 
    ? Math.round((completedRegularSteps.length / allRegularSteps.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(project.status as ProjectStatus)
                }`}>
                  {getStatusText(project.status as ProjectStatus)}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditDialogOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Upravit
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Smazat
              </button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <button
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="hover:text-indigo-600 hover:underline"
                >
                  {site.siteId} - {site.location}
                </button>
              </div>
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
              {project.address && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{project.address}</span>
                </div>
              )}
              {project.microwaveBand && (
                <div className="flex items-center text-sm text-gray-500">
                  <Radio className="h-4 w-4 mr-2" />
                  <span>Frekvenční pásmo: {project.microwaveBand}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Fáze projektu</h2>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {totalProgress}%
                </span>
              </div>
            </div>
            <ProjectChecklist
              projectId={project.id}
              status={project.status}
              onStepsChange={handleStepsChange}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dokumenty</h2>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700">
                <FileText className="h-4 w-4 mr-1" />
                Přidat dokument
              </button>
            </div>
            <DocumentList documents={documents} />
          </div>
        </div>
      </div>
      
      {project.gpsCoordinates && site.gpsCoordinates && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 h-auto">
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <Globe className="h-5 w-5 mr-2 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                GPS Lokace a propojení
              </h2>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p>Projekt: {project.gpsCoordinates}</p>
              <p>Site: {site.gpsCoordinates}</p>
            </div>
            <div className="h-[40rem]">
              <ConnectionMap
                point1={project.gpsCoordinates}
                point2={site.gpsCoordinates}
                label1={project.name}
                label2={site.siteId}
                microwaveBand={project.microwaveBand}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}

      {isEditDialogOpen && (
        <ProjectEditTabs
          project={project}
          onSubmit={handleUpdateProject}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}

      {isDeleteDialogOpen && (
        <DeleteProjectDialog
          projectName={project.name}
          onConfirm={handleDeleteProject}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
