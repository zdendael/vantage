export enum ProjectStatus {
  NEW = 'new',
  PREPARATION = 'preparation',
  APPROVAL = 'approval',
  IMPLEMENTATION = 'implementation',
  DOCUMENTATION = 'documentation',
  COMPLETED = 'completed'
}

export type ProjectStatusType = 'initial' | 'regular' | 'final';

export interface ProjectStatusSettings {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  showOnDashboard: boolean;
  type: ProjectStatusType;
  position: number;
  steps: ProjectStatusStep[];
}

export interface ProjectStatusStep {
  id: string;
  statusId: string;
  name: string;
  description?: string;
  position: number;
}

export interface Project {
  id: string;
  name: string;
  siteId: string;
  status: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  address?: string;
  gpsCoordinates?: string;
  microwaveBand?: string;
  progress?: number;
}

export type MicrowaveBand = 
  | '2.4 GHz (bezlicenční)'
  | '5 GHz (bezlicenční)'
  | '10.5 GHz (bezlicenční)'
  | '17 GHz (bezlicenční)'
  | '24 GHz (bezlicenční)'
  | '57-66 GHz (bezlicenční)'
  | '11 GHz (licencované)'
  | '13 GHz (licencované)'
  | '18 GHz (licencované)'
  | '23 GHz (licencované)'
  | '26 GHz (licencované)'
  | '32 GHz (licencované)'
  | '38 GHz (licencované)'
  | '42 GHz (licencované)'
  | '71-76 / 81-86 GHz (E-Band)';

export interface Site {
  id: string;
  siteId: string;
  location: string;
  gpsCoordinates?: string;
  acctUrl?: string;
  notes?: string;
  connectivity: 'radio' | 'optical';
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  url: string;
  version: number;
  createdAt: string;
}

export enum DocumentType {
  TECHNICAL_APPROVAL = 'technical_approval',
  INSTALLATION_PROTOCOL = 'installation_protocol',
  LEASE_AGREEMENT = 'lease_agreement',
  OTHER = 'other'
}