import { Job, mockJobs } from './mock-jobs';
import { Engineer } from './mock-engineers';

export interface EngineerStats {
  profileViews: number;
  applicationsSent: number;
  proposalsAccepted: number;
  activeProjects: number;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  clientName: string;
  jobType: string;
  proposedRate: number;
  dateApplied: string;
  status: 'Pending' | 'Viewed' | 'Shortlisted' | 'Hired' | 'Rejected';
}

export interface MockMessage {
  id: number;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  isClient: boolean;
  content: string;
  date: string;
  read: boolean;
}

export const mockEngineerStats: EngineerStats = {
  profileViews: 124,
  applicationsSent: 12,
  proposalsAccepted: 3,
  activeProjects: 2,
};

export const mockEngineerApplications: Application[] = [
  {
    id: 1,
    jobId: 105,
    jobTitle: 'Structural Design for 3-Story Residence',
    clientName: 'Bautista Family',
    jobType: 'Structural',
    proposedRate: 35000,
    dateApplied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Shortlisted'
  },
  {
    id: 2,
    jobId: 106,
    jobTitle: 'Project Manager for Warehouse Construction',
    clientName: 'Logistics Plus Inc.',
    jobType: 'Project Supervision',
    proposedRate: 80000,
    dateApplied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Viewed'
  },
  {
    id: 3,
    jobId: 107,
    jobTitle: 'Site Inspection Report - Commercial Building',
    clientName: 'Megacorp Properties',
    jobType: 'Inspection',
    proposedRate: 15000,
    dateApplied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending'
  },
  {
    id: 4,
    jobId: 108,
    jobTitle: 'Sign and Seal Plans for Renovation',
    clientName: 'Mr. David Lee',
    jobType: 'Design/Plans',
    proposedRate: 10000,
    dateApplied: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Hired'
  },
  {
    id: 5,
    jobId: 109,
    jobTitle: 'Geotechnical Soil Investigation',
    clientName: 'Apex Development Corp.',
    jobType: 'Geotechnical',
    proposedRate: 45000,
    dateApplied: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Rejected'
  }
];

export const mockEngineerMessages: MockMessage[] = [
  {
    id: 1,
    senderName: 'Apex Development Corp.',
    senderInitials: 'AD',
    senderColor: 'teal',
    isClient: true,
    content: 'Hi Engr., we have reviewed your proposal and would like to schedule a quick call tomorrow. Let me know what time works best for you.',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 2,
    senderName: 'Bautista Family',
    senderInitials: 'BF',
    senderColor: 'rose',
    isClient: true,
    content: 'Thank you for the initial sketches. Are we able to expand the balcony by another 2 meters without needing additional columns?',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 3,
    senderName: 'Logistics Plus Inc.',
    senderInitials: 'LP',
    senderColor: 'blue',
    isClient: true,
    content: 'We received your application. We are currently interviewing other candidates but will get back to you by next week.',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

export interface ClientStats {
  activeJobs: number;
  totalProposals: number;
  savedEngineers: number;
  completedProjects: number;
}

export interface ClientJobPost {
  id: number;
  title: string;
  status: 'Active' | 'Draft' | 'Closed';
  proposalsCount: number;
  postedDate: string;
}

export interface Proposal {
  id: number;
  jobId: number;
  jobTitle: string;
  engineerId: number;
  engineerName: string;
  engineerInitials: string;
  engineerAvatarColor: string;
  proposedRate: number;
  date: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface SavedEngineerSummary {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  specialization: string;
}

export const mockClientDashboardStats: ClientStats = {
  activeJobs: 3,
  totalProposals: 14,
  savedEngineers: 5,
  completedProjects: 12,
};

export const mockClientJobPosts: ClientJobPost[] = [
  {
    id: 101,
    title: 'Structural Design for 5-Story Mixed-Use Building',
    status: 'Active',
    proposalsCount: 8,
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    title: 'Geotechnical Soil Investigation - 2 Hectares',
    status: 'Active',
    proposalsCount: 6,
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 103,
    title: 'Sanitary Plans for Warehouse Expansion',
    status: 'Draft',
    proposalsCount: 0,
    postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 104,
    title: 'Project Manager for Road Concreting',
    status: 'Closed',
    proposalsCount: 24,
    postedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 1,
    jobId: 101,
    jobTitle: 'Structural Design for 5-Story Mixed-Use Building',
    engineerId: 1,
    engineerName: 'Juan Dela Cruz',
    engineerInitials: 'JD',
    engineerAvatarColor: 'blue',
    proposedRate: 60000,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
  },
  {
    id: 2,
    jobId: 101,
    jobTitle: 'Structural Design for 5-Story Mixed-Use Building',
    engineerId: 5,
    engineerName: 'Miguel Santos',
    engineerInitials: 'MS',
    engineerAvatarColor: 'sky',
    proposedRate: 55000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
  },
  {
    id: 3,
    jobId: 102,
    jobTitle: 'Geotechnical Soil Investigation - 2 Hectares',
    engineerId: 3,
    engineerName: 'Carlos Mendoza',
    engineerInitials: 'CM',
    engineerAvatarColor: 'indigo',
    proposedRate: 85000,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
  },
  {
    id: 4,
    jobId: 102,
    jobTitle: 'Geotechnical Soil Investigation - 2 Hectares',
    engineerId: 7,
    engineerName: 'Roberto Garcia',
    engineerInitials: 'RG',
    engineerAvatarColor: 'amber',
    proposedRate: 72000,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
  },
  {
    id: 5,
    jobId: 101,
    jobTitle: 'Structural Design for 5-Story Mixed-Use Building',
    engineerId: 11,
    engineerName: 'Mark Villanueva',
    engineerInitials: 'MV',
    engineerAvatarColor: 'emerald',
    proposedRate: 65000,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
  },
];

export const mockSavedEngineers: SavedEngineerSummary[] = [
  {
    id: 2,
    name: 'Maria Reyes',
    initials: 'MR',
    avatarColor: 'rose',
    specialization: 'Civil Engineering',
  },
  {
    id: 8,
    name: 'Ana Cruz',
    initials: 'AC',
    avatarColor: 'rose',
    specialization: 'Sanitary Engineering',
  },
  {
    id: 15,
    name: 'Isabel Torres',
    initials: 'IT',
    avatarColor: 'violet',
    specialization: 'Structural Engineering',
  },
  {
    id: 20,
    name: 'David Lim',
    initials: 'DL',
    avatarColor: 'indigo',
    specialization: 'Project Management',
  },
];
