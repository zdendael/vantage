import { ProjectStatus } from '../../types';

export const getStatusText = (status: ProjectStatus): string => {
  const texts: Record<ProjectStatus, string> = {
    [ProjectStatus.NEW]: 'Nový',
    [ProjectStatus.PREPARATION]: 'Příprava',
    [ProjectStatus.APPROVAL]: 'Schvalování',
    [ProjectStatus.IMPLEMENTATION]: 'Realizace',
    [ProjectStatus.DOCUMENTATION]: 'Dokumentace',
    [ProjectStatus.COMPLETED]: 'Dokončeno'
  };
  return texts[status];
};

export const getStatusColor = (status: ProjectStatus): string => {
  const colors: Record<ProjectStatus, string> = {
    [ProjectStatus.NEW]: 'bg-gray-100 text-gray-800',
    [ProjectStatus.PREPARATION]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.APPROVAL]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.IMPLEMENTATION]: 'bg-purple-100 text-purple-800',
    [ProjectStatus.DOCUMENTATION]: 'bg-orange-100 text-orange-800',
    [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800'
  };
  return colors[status];
};

export const isStatusEditable = (status: ProjectStatus): boolean => {
  return status !== ProjectStatus.NEW && status !== ProjectStatus.COMPLETED;
};

export const getNextStatus = (currentStatus: ProjectStatus): ProjectStatus | null => {
  const statusOrder = [
    ProjectStatus.NEW,
    ProjectStatus.PREPARATION,
    ProjectStatus.APPROVAL,
    ProjectStatus.IMPLEMENTATION,
    ProjectStatus.DOCUMENTATION,
    ProjectStatus.COMPLETED
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
    return null;
  }

  return statusOrder[currentIndex + 1];
};

export const getPreviousStatus = (currentStatus: ProjectStatus): ProjectStatus | null => {
  const statusOrder = [
    ProjectStatus.NEW,
    ProjectStatus.PREPARATION,
    ProjectStatus.APPROVAL,
    ProjectStatus.IMPLEMENTATION,
    ProjectStatus.DOCUMENTATION,
    ProjectStatus.COMPLETED
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex <= 1) { // Nemůžeme se vrátit před PREPARATION
    return null;
  }

  return statusOrder[currentIndex - 1];
};