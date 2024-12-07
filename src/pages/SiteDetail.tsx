import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Link, Globe, PencilIcon, Trash2, ExternalLink, Radio } from 'lucide-react';
import { SiteMap } from '../components/SiteMap';
import { ConnectionMap } from '../components/ConnectionMap';
import { ProjectDistance } from '../components/ProjectDistance';
import { getSite, deleteSite } from '../lib/api/sites';
import { getProjects } from '../lib/api/projects';
import type { Site, Project } from '../types';

export function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadSiteData = async () => {
      if (!id) return;
      
      try {
        const [siteData, projectsData] = await Promise.all([
          getSite(id),
          getProjects()
        ]);
        
        setSite(siteData);
        setProjects(projectsData.filter(p => p.siteId === id));
      } catch (error) {
        console.error('Chyba při načítání dat situ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSiteData();
  }, [id]);

  const handleDeleteSite = async () => {
    if (!site?.id) return;

    if (projects.length > 0) {
      alert('Nelze smazat site s existujícími projekty');
      return;
    }

    try {
      await deleteSite(site.id);
      navigate('/sites');
    } catch (error) {
      console.error('Chyba při mazání situ:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Site nebyl nalezen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{site.siteId}</h1>
              <p className="mt-1 text-sm text-gray-500">{site.location}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/sites/${id}/edit`)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Upravit
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                disabled={projects.length > 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Smazat
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lokalita</h3>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {site.location}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Typ konektivity</h3>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    site.connectivity === 'radio' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {site.connectivity === 'radio' ? 'Rádio' : 'Optika'}
                  </span>
                </div>
              </div>

              {site.acctUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ACCT Odkaz</h3>
                  <a
                    href={site.acctUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Otevřít v ACCT
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}

              {site.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Poznámky</h3>
                  <p className="mt-1 text-sm text-gray-900">{site.notes}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Aktivní projekty</h3>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500">Žádné aktivní projekty</p>
              ) : (
                <div className="space-y-2">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projekty/${project.id}`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{getStatusText(project.status)}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {site.gpsCoordinates && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <Globe className="h-5 w-5 mr-2 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lokalita</h2>
                <p className="text-sm text-gray-500">GPS: {site.gpsCoordinates}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Seznam propojených projektů */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Propojené projekty</h3>
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Žádné propojené projekty
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projects.filter(p => p.gpsCoordinates).map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                        className={`w-full text-left px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          project.id === selectedProject?.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Radio className={`h-4 w-4 flex-shrink-0 ${
                              project.id === selectedProject?.id ? 'text-indigo-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{project.name}</span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {project.gpsCoordinates && (
                                  <>
                                    <ProjectDistance
                                      siteCoordinates={site.gpsCoordinates || ''}
                                      projectCoordinates={project.gpsCoordinates}
                                    />
                                    {project.microwaveBand && (
                                      <>
                                        {' | Pásmo: '}
                                        {project.microwaveBand}
                                      </>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projekty/${project.id}`);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            Zobrazit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mapa */}
              <div className="lg:col-span-2">
                {selectedProject?.gpsCoordinates ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Propojení se sitem {site.siteId} a projektem {selectedProject.name}
                    </h3>
                    <ConnectionMap
                      point1={site.gpsCoordinates}
                      point2={selectedProject.gpsCoordinates}
                      label1={site.siteId}
                      label2={selectedProject.name}
                      microwaveBand={selectedProject.microwaveBand}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Lokalita situ {site.siteId}
                    </h3>
                    <SiteMap coordinates={site.gpsCoordinates} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Smazat site</h2>
            <p className="text-sm text-gray-600 mb-4">
              Opravdu chcete smazat site {site.siteId}? Tuto akci nelze vrátit zpět.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Zrušit
              </button>
              <button
                onClick={handleDeleteSite}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  const colors = {
    preparation: 'bg-blue-100 text-blue-800',
    approval: 'bg-yellow-100 text-yellow-800',
    implementation: 'bg-purple-100 text-purple-800',
    documentation: 'bg-orange-100 text-orange-800',
    administration: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const texts = {
    preparation: 'Příprava',
    approval: 'Schvalování',
    implementation: 'Realizace',
    documentation: 'Dokumentace',
    administration: 'Administrativa',
    completed: 'Dokončeno'
  };
  return texts[status as keyof typeof texts] || status;
};