import { supabase } from '../supabase';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { ProjectStatusSettings } from '../../types';

export interface ProjectStatistics {
  [key: string]: number;
}

export const getProjectStatistics = async (statuses: ProjectStatusSettings[]): Promise<ProjectStatistics> => {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate).toISOString();
  const monthEnd = endOfMonth(currentDate).toISOString();

  const { data: allProjects, error } = await supabase
    .from('projects')
    .select('status');

  if (error) {
    throw new Error('Chyba při načítání statistik');
  }

  const statistics: ProjectStatistics = {};

  statuses.forEach(status => { 
    statistics[status.code] = allProjects.filter(p => p.status === status.code).length;
  });

  return statistics;
};