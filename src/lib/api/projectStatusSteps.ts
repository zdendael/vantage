import { supabase } from '../supabase';
import type { ProjectStatusStep } from '../../types';

const mapStepFromDb = (step: any): ProjectStatusStep => ({
  id: step.id,
  statusId: step.status_id,
  name: step.name,
  description: step.description || undefined,
  position: step.position
});

export const createProjectStatusStep = async (
  statusId: string,
  data: Omit<ProjectStatusStep, 'id' | 'statusId'>
): Promise<ProjectStatusStep> => {
  const { data: step, error } = await supabase
    .from('project_status_steps')
    .insert([{
      status_id: statusId,
      name: data.name,
      description: data.description,
      position: data.position
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při vytváření kroku realizace');
  }

  return mapStepFromDb(step);
};

export const updateProjectStatusStep = async (
  id: string,
  data: Partial<Omit<ProjectStatusStep, 'id' | 'statusId'>>
): Promise<ProjectStatusStep> => {
  const { data: step, error } = await supabase
    .from('project_status_steps')
    .update({
      name: data.name,
      description: data.description,
      position: data.position
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při aktualizaci kroku realizace');
  }

  return mapStepFromDb(step);
};

export const deleteProjectStatusStep = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('project_status_steps')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Chyba při mazání kroku realizace');
  }
};