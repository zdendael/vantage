import { supabase } from '../supabase';
import { getProjectStatuses } from './projectStatuses';
import { updateProject } from './projects';
import { handleApiError } from '../utils/errors';

export const completeProjectStep = async (projectId: string, stepId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_completed_steps')
    .insert([{
      project_id: projectId,
      step_id: stepId
    }]);

  if (error) {
    handleApiError(error);
  }

  await checkAndUpdateProjectStatus(projectId);
};

export const uncompleteProjectStep = async (projectId: string, stepId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_completed_steps')
    .delete()
    .match({ project_id: projectId, step_id: stepId });

  if (error) {
    handleApiError(error);
  }

  await checkAndUpdateProjectStatus(projectId);
};

export const getCompletedSteps = async (projectId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('project_completed_steps')
    .select('step_id')
    .eq('project_id', projectId);

  if (error) {
    console.error('Chyba při načítání dokončených kroků:', error);
    return []; // Vrátíme prázdné pole místo vyhození chyby
  }

  return (data || []).map(row => row.step_id);
};

const checkAndUpdateProjectStatus = async (projectId: string): Promise<void> => {
  try {
    const [projectResult, statuses, completedSteps] = await Promise.all([
      supabase.from('projects').select().eq('id', projectId).single(),
      getProjectStatuses(),
      getCompletedSteps(projectId)
    ]);

    if (projectResult.error || !projectResult.data) {
      throw new Error('Projekt nebyl nalezen');
    }

    const project = projectResult.data;
    const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
    const regularStatuses = sortedStatuses.filter(s => s.type === 'regular');
    
    // Počítáme pouze kroky z regulérních stavů
    const allRegularSteps = regularStatuses.flatMap(status => status.steps);
    const completedRegularSteps = allRegularSteps.filter(step => 
      completedSteps.includes(step.id)
    );

    // Pokud jsou všechny kroky dokončeny, přejdeme do stavu "completed"
    if (completedRegularSteps.length === allRegularSteps.length && completedRegularSteps.length > 0) {
      await updateProject(projectId, {
        status: 'completed',
        endDate: new Date().toISOString()
      });
      return;
    }

    // Najdeme první stav, který má alespoň jeden nedokončený krok
    let newStatus = 'new';
    
    // Pokud je aspoň jeden krok splněný, projekt už není nový
    if (completedRegularSteps.length > 0) {
      for (const status of regularStatuses) {
        const statusSteps = status.steps;
        const completedStatusSteps = statusSteps.filter(step => 
          completedSteps.includes(step.id)
        );

        // Pokud má stav nějaké nesplněné kroky, je to aktuální stav
        if (completedStatusSteps.length < statusSteps.length) {
          newStatus = status.code;
          break;
        }
        // Pokud jsou všechny kroky splněné, pokračujeme na další stav
      }
    }

    // Aktualizujeme stav projektu pouze pokud se změnil
    if (project.status !== newStatus) {
      await updateProject(projectId, { status: newStatus });
    }
  } catch (error) {
    console.error('Chyba při kontrole a aktualizaci stavu projektu:', error); 
    // Don't throw error to prevent UI disruption
  }
};