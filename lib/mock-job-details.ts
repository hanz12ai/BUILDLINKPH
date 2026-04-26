import { Job, mockJobs } from './mock-jobs';

export interface JobAttachment {
  name: string;
  type: string;
  size: string;
}

export interface JobDetails extends Job {
  fullDescription: string[];
  requirements: {
    minExperience: number;
    prcRequired: boolean;
    additionalNotes: string[];
  };
  attachments: JobAttachment[];
  deadline: string;
  clientStats: {
    memberSince: string;
    totalJobsPosted: number;
  };
}

export function getJobDetails(id: string | number): JobDetails | null {
  const jobId = typeof id === 'string' ? parseInt(id, 10) : id;
  const baseJob = mockJobs.find((j) => j.id === jobId);

  if (!baseJob) return null;

  // Generate a deadline date (e.g., 30 days from postedDate)
  const deadlineDate = new Date(baseJob.postedDate);
  deadlineDate.setDate(deadlineDate.getDate() + 30);

  return {
    ...baseJob,
    fullDescription: [
      baseJob.description,
      'This project requires a high level of attention to detail and a commitment to completing milestones on schedule. The successful engineer will be expected to collaborate closely with our internal team and provide regular progress updates.',
      'We are looking for someone who is proactive, communicative, and has a strong portfolio of similar projects. Preference will be given to candidates who can start immediately and have experience dealing with local building officials in this jurisdiction.'
    ],
    requirements: {
      minExperience: (jobId % 4) + 2, // e.g. 2 to 5 years
      prcRequired: baseJob.prcRequired,
      additionalNotes: [
        'Must have own software licenses (AutoCAD, ETABS, etc.)',
        'Ability to visit the site at least once a week during critical phases',
        'Familiarity with the latest National Structural Code of the Philippines (NSCP)',
      ]
    },
    attachments: [
      { name: 'Initial_Architectural_Floor_Plan.pdf', type: 'pdf', size: '2.4 MB' },
      { name: 'Site_Photos.zip', type: 'zip', size: '15.8 MB' },
      { name: 'Project_Brief.docx', type: 'doc', size: '1.1 MB' }
    ],
    deadline: deadlineDate.toISOString(),
    clientStats: {
      memberSince: '2023',
      totalJobsPosted: (jobId * 3) % 15 + 1 // 1 to 15
    }
  };
}
