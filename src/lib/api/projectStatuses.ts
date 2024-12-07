import { supabase } from '../supabase';
import type { ProjectStatusSettings, ProjectStatusStep } from '../../types';

const mapStatusFromDb = (status: any, steps: any[] = []): ProjectStatusSettings => ({
  id: status.id,
  code: status.code,
  name: status.name,
  description: status.description || undefined,
  icon: status.icon,
  color: status.color,
  showOnDashboard: status.show_on_dashboard,
  type: status.type,
  position: status.position,
  steps: steps.map(mapStepFromDb).sort((a, b) => a.position - b.position)
});

const mapStepFromDb = (step: any): ProjectStatusStep => ({
  id: step.id,
  statusId: step.status_id,
  name: step.name,
  description: step.description || undefined,
  position: step.position
});

export const getProjectStatuses = async (): Promise<ProjectStatusSettings[]> => {
  const { data: statuses, error: statusError } = await supabase
    .from('project_statuses')
    .select('*')
    .order('position');

  if (statusError) {
    throw new Error('Chyba při načítání stavů projektů');
  }

  const { data: steps, error: stepsError } = await supabase
    .from('project_status_steps')
    .select('*')
    .order('position');

  if (stepsError) {
    throw new Error('Chyba při načítání kroků realizace');
  }

  return (statuses || [])
    .map(status => mapStatusFromDb(status, (steps || []).filter(step => step.status_id === status.id)))
    .sort((a, b) => a.position - b.position);
};

export const createProjectStatus = async (data: {
  code: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  showOnDashboard: boolean;
}): Promise<ProjectStatusSettings> => {
  const { data: currentStatuses } = await supabase
    .from('project_statuses')
    .select('position')
    .eq('type', 'regular')
    .order('position', { ascending: false })
    .limit(1);

  const lastPosition = currentStatuses?.[0]?.position || 1;
  const newPosition = lastPosition + 1;

  const { data: status, error } = await supabase
    .from('project_statuses')
    .insert([{
      code: data.code,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      show_on_dashboard: data.showOnDashboard,
      type: 'regular',
      position: newPosition
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při vytváření stavu projektu');
  }

  return mapStatusFromDb(status);
};

export const updateProjectStatus = async (
  id: string, 
  data: Partial<ProjectStatusSettings>
): Promise<ProjectStatusSettings> => {
  const { data: status, error } = await supabase
    .from('project_statuses')
    .update({
      code: data.code,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      show_on_dashboard: data.showOnDashboard,
      position: data.position
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při aktualizaci stavu projektu');
  }

  const { data: steps } = await supabase
    .from('project_status_steps')
    .select('*')
    .eq('status_id', id)
    .order('position');

  return mapStatusFromDb(status, steps || []);
};

export const deleteProjectStatus = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('project_statuses')
    .delete()
    .eq('id', id)
    .eq('type', 'regular');

  if (error) {
    throw new Error('Chyba při mazání stavu projektu');
  }
};

export const reorderProjectStatuses = async (statuses: ProjectStatusSettings[]): Promise<void> => {
  try {
    const updates = statuses.map((status, index) => ({
      id: status.id,
      position: index + 1,
      name: status.name,
      code: status.code,
      description: status.description,
      icon: status.icon,
      color: status.color,
      show_on_dashboard: status.showOnDashboard,
      type: status.type
    }));

    const { error } = await supabase
      .from('project_statuses')
      .upsert(updates, { 
        onConflict: 'id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Reorder error:', error);
    throw new Error('Chyba při změně pořadí stavů');
  }
};