export interface Job {
  id: number;
  title: string;
  clientName: string;
  clientVerified: boolean;
  projectType: string;
  discipline: string;
  workType: string;
  province: string;
  city: string;
  budgetMin?: number;
  budgetMax?: number;
  openToProposals: boolean;
  postedDate: string;
  description: string;
  prcRequired: boolean;
}

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Renovation',
] as const;

export const DISCIPLINES = [
  'Structural',
  'Civil',
  'Geotechnical',
  'Sanitary',
  'Geodetic',
] as const;

export const WORK_TYPES = [
  'Design/Plans',
  'Site Supervision',
  'Inspection',
  'Consulting',
  'Permit Processing',
] as const;

export const PROVINCES = [
  'Metro Manila',
  'Cebu',
  'Davao del Sur',
  'Pampanga',
  'Rizal',
  'Cavite',
  'Laguna',
  'Batangas',
  'Iloilo',
  'Benguet',
] as const;

// Helper to get dates relative to today
const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Structural Design for 5-Story Mixed-Use Building',
    clientName: 'Apex Development Corp.',
    clientVerified: true,
    projectType: 'Commercial',
    discipline: 'Structural',
    workType: 'Design/Plans',
    province: 'Metro Manila',
    city: 'Makati City',
    budgetMin: 80000,
    budgetMax: 150000,
    openToProposals: false,
    postedDate: getRelativeDate(1),
    description: 'Looking for an experienced structural engineer to provide full structural plans and calculations for a 5-story building with basement parking. Must be compliant with the latest NSCP.',
    prcRequired: true,
  },
  {
    id: 2,
    title: 'Geotechnical Soil Investigation for Subdivision',
    clientName: 'Green Meadows Realty',
    clientVerified: true,
    projectType: 'Residential',
    discipline: 'Geotechnical',
    workType: 'Inspection',
    province: 'Cavite',
    city: 'Dasmariñas',
    openToProposals: true,
    postedDate: getRelativeDate(3),
    description: 'Need soil testing and geotechnical report for a 2-hectare raw land development. Site has slightly rolling terrain. Must include slope stability analysis.',
    prcRequired: true,
  },
  {
    id: 3,
    title: 'Site Supervisor for Warehouse Construction',
    clientName: 'Logistics Plus Inc.',
    clientVerified: false,
    projectType: 'Industrial',
    discipline: 'Civil',
    workType: 'Site Supervision',
    province: 'Laguna',
    city: 'Santa Rosa',
    budgetMin: 35000,
    budgetMax: 45000,
    openToProposals: false,
    postedDate: getRelativeDate(0), // Today
    description: 'Full-time site supervisor needed for a 6-month warehouse construction project. Will oversee sub-contractors, ensure quality control, and prepare daily progress reports.',
    prcRequired: false,
  },
  {
    id: 4,
    title: 'Plumbing and Sanitary Design for Resort',
    clientName: 'Blue Water Hospitality',
    clientVerified: true,
    projectType: 'Commercial',
    discipline: 'Sanitary',
    workType: 'Design/Plans',
    province: 'Cebu',
    city: 'Lapu-Lapu City',
    budgetMin: 50000,
    budgetMax: 90000,
    openToProposals: false,
    postedDate: getRelativeDate(7),
    description: 'Require a sanitary engineer to design the water supply, drainage, and sewage treatment system (STP) for a 50-room beachfront resort. High priority on sustainable water management.',
    prcRequired: true,
  },
  {
    id: 5,
    title: 'Relocation Survey for 5 Hectare Agricultural Lot',
    clientName: 'Maria Santos',
    clientVerified: false,
    projectType: 'Infrastructure',
    discipline: 'Geodetic',
    workType: 'Consulting',
    province: 'Batangas',
    city: 'Lipa City',
    openToProposals: true,
    postedDate: getRelativeDate(14),
    description: 'Need a licensed geodetic engineer to conduct a relocation survey and establish monuments for an inherited agricultural property. Old title available.',
    prcRequired: true,
  },
  {
    id: 6,
    title: 'Sign & Seal of As-Built Plans for Resto Renovation',
    clientName: 'Taste Innovations',
    clientVerified: true,
    projectType: 'Renovation',
    discipline: 'Civil',
    workType: 'Permit Processing',
    province: 'Metro Manila',
    city: 'Quezon City',
    budgetMin: 15000,
    budgetMax: 25000,
    openToProposals: false,
    postedDate: getRelativeDate(2),
    description: 'Looking for a civil engineer to review, sign, and seal as-built plans for a newly renovated restaurant space in a mall to comply with local building official requirements.',
    prcRequired: true,
  },
  {
    id: 7,
    title: 'Structural Retrofitting Consultation',
    clientName: 'Heritage Foundation PH',
    clientVerified: true,
    projectType: 'Renovation',
    discipline: 'Structural',
    workType: 'Consulting',
    province: 'Iloilo',
    city: 'Iloilo City',
    openToProposals: true,
    postedDate: getRelativeDate(20),
    description: 'Need expert advice on retrofitting an ancestral house built in the 1920s to withstand modern seismic activity without compromising its historical architecture.',
    prcRequired: true,
  },
  {
    id: 8,
    title: 'Drainage Masterplan for Industrial Park',
    clientName: 'Summit Industrial Estates',
    clientVerified: true,
    projectType: 'Infrastructure',
    discipline: 'Civil',
    workType: 'Design/Plans',
    province: 'Pampanga',
    city: 'Clark',
    budgetMin: 120000,
    budgetMax: 200000,
    openToProposals: false,
    postedDate: getRelativeDate(5),
    description: 'Seeking a civil/hydrological engineer to update the drainage masterplan of an expanding industrial park to prevent localized flooding during heavy monsoon rains.',
    prcRequired: true,
  },
  {
    id: 9,
    title: 'Retaining Wall Design for Sloping Residential Lot',
    clientName: 'Jose Villanueva',
    clientVerified: false,
    projectType: 'Residential',
    discipline: 'Structural',
    workType: 'Design/Plans',
    province: 'Rizal',
    city: 'Antipolo City',
    budgetMin: 20000,
    budgetMax: 40000,
    openToProposals: true,
    postedDate: getRelativeDate(10),
    description: 'Need structural design for a 4-meter high retaining wall on a hillside property. Must work closely with our architect to ensure minimal footprint impact.',
    prcRequired: true,
  },
  {
    id: 10,
    title: 'Building Inspector for Condo Turnover',
    clientName: 'InvestPH Group',
    clientVerified: true,
    projectType: 'Residential',
    discipline: 'Civil',
    workType: 'Inspection',
    province: 'Metro Manila',
    city: 'Taguig City',
    budgetMin: 5000,
    budgetMax: 10000,
    openToProposals: false,
    postedDate: getRelativeDate(1),
    description: 'Looking for a sharp-eyed engineer to accompany us during the punchlisting and turnover of two luxury condo units. Create a detailed defect report for the developer.',
    prcRequired: false,
  },
  {
    id: 11,
    title: 'Topographic Survey for Mountain Resort',
    clientName: 'Eco Tourism Dev',
    clientVerified: true,
    projectType: 'Commercial',
    discipline: 'Geodetic',
    workType: 'Inspection',
    province: 'Benguet',
    city: 'Baguio City',
    openToProposals: true,
    postedDate: getRelativeDate(25),
    description: 'Full topographic survey required for a 3-hectare mountainous terrain planned for an eco-resort. Must deliver accurate contour maps in CAD format.',
    prcRequired: true,
  },
  {
    id: 12,
    title: 'Sanitary Engineer for Building Permit',
    clientName: 'Reyes Family',
    clientVerified: false,
    projectType: 'Residential',
    discipline: 'Sanitary',
    workType: 'Permit Processing',
    province: 'Davao del Sur',
    city: 'Davao City',
    budgetMin: 10000,
    budgetMax: 15000,
    openToProposals: false,
    postedDate: getRelativeDate(4),
    description: 'We have complete architectural plans for a 3-story townhouse. Just need a sanitary engineer to prepare, sign, and seal the plumbing layouts for city hall building permit application.',
    prcRequired: true,
  }
];

export const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 24) {
    if (diffInHours === 0) return 'Just now';
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
