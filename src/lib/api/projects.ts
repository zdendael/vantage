import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Project, ProjectStatus } from '../../types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

const mapProjectFromDb = (project: ProjectRow): Project => ({
  id: project.id,
  name: project.name,
  siteId: project.site_id,
  status: project.status as ProjectStatus,
  startDate: project.start_date,
  endDate: project.end_date || undefined,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
  description: project.description || undefined,
  address: project.address || undefined,
  gpsCoordinates: project.gps_coordinates || undefined,
  microwaveBand: project.microwave_band || undefined
});

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Chyba při načítání projektů: ' + error.message);
  }

  return (data || []).map(mapProjectFromDb);
};

export const getProject = async (id: string): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Projekt nebyl nalezen');
  }

  return mapProjectFromDb(data);
};

export const createProject = async (data: {
  name: string;
  siteId: string;
  startDate: string;
  description?: string;
}): Promise<Project> => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([{
      name: data.name,
      site_id: data.siteId,
      status: 'new', // Vždy začínáme se stavem "Nový"
      address: data.address,
      gps_coordinates: data.gpsCoordinates,
      start_date: data.startDate,
      description: data.description,
      microwave_band: data.microwaveBand
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při vytváření projektu: ' + error.message);
  }

  return mapProjectFromDb(project);
};

export const updateProject = async (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      site_id: project.siteId,
      status: project.status,
      start_date: project.startDate,
      end_date: project.endDate,
      address: project.address,
      gps_coordinates: project.gpsCoordinates,
      description: project.description,
      microwave_band: project.microwaveBand || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    if (error.code === '23514' && error.message.includes('microwave_band')) {
      throw new Error('Neplatná hodnota frekvenčního pásma.');
    } else {
      throw new Error('Chyba při aktualizaci projektu. Zkuste to prosím znovu.');
    }
  }

  return mapProjectFromDb(data);
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Chyba při mazání projektu: ' + error.message);
  }
};