export interface PortfolioItem {
  id: number;
  title: string;
  type: string;
  year: number;
  image: string; // placeholder color gradient
  description: string;
}

export interface Review {
  id: number;
  reviewerName: string;
  reviewerInitials: string;
  reviewerColor: string;
  rating: number;
  date: string;
  comment: string;
}

export interface EngineerProfile {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  avatarColor: string;
  specialization: string;
  tags: string[];
  city: string;
  province: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  prcVerified: boolean;
  availability: 'Available' | 'Busy' | 'Away';
  bio: string;
  skills: string[];
  projectTypes: string[];
  portfolio: PortfolioItem[];
  reviews: Review[];
}

const PORTFOLIO_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-sky-400 to-cyan-500',
];

export const engineerProfiles: Record<string, EngineerProfile> = {
  '1': {
    id: 1,
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    initials: 'JD',
    avatarColor: 'blue',
    specialization: 'Structural',
    tags: ['Structural Engineering', 'Project Supervision', 'Seismic Analysis'],
    city: 'Makati City',
    province: 'Metro Manila',
    yearsExperience: 12,
    rating: 5.0,
    reviewCount: 47,
    hourlyRate: 1500,
    prcVerified: true,
    availability: 'Available',
    bio: 'Experienced structural engineer with over 12 years of expertise in designing and supervising the construction of high-rise residential and commercial buildings across Metro Manila. Specializing in reinforced concrete design and seismic-resistant structures, I bring a combination of technical knowledge and hands-on field experience to every project. Committed to delivering safe, efficient, and innovative structural solutions that meet both Philippine building codes and international standards.',
    skills: [
      'Structural Analysis',
      'Reinforced Concrete Design',
      'Steel Design',
      'Seismic Engineering',
      'Foundation Design',
      'AutoCAD',
      'ETABS',
      'STAAD Pro',
      'Project Management',
      'Building Code Compliance',
    ],
    projectTypes: [
      'High-Rise Residential Buildings',
      'Commercial Complexes',
      'Industrial Warehouses',
      'Bridge Retrofitting',
      'Seismic Assessment & Rehabilitation',
    ],
    portfolio: [
      {
        id: 1,
        title: 'One Ayala Tower Structural Design',
        type: 'High-Rise',
        year: 2024,
        image: PORTFOLIO_GRADIENTS[0],
        description:
          'Led the structural design team for a 45-story mixed-use tower in Makati CBD. The project involved advanced seismic analysis using performance-based design methods. Coordinated with architectural and MEP teams to optimize structural layout while maintaining aesthetic intent. Completed ahead of schedule with zero critical design revisions during construction.',
      },
      {
        id: 2,
        title: 'BGC Retail Complex Foundation',
        type: 'Commercial',
        year: 2023,
        image: PORTFOLIO_GRADIENTS[1],
        description:
          'Designed the deep foundation system for a 5-level retail complex in Bonifacio Global City. Implemented innovative pile cap designs that reduced material costs by 15%. Addressed challenging soil conditions through comprehensive geotechnical investigation and advanced foundation analysis.',
      },
      {
        id: 3,
        title: 'Manila Bay Seawall Reinforcement',
        type: 'Infrastructure',
        year: 2023,
        image: PORTFOLIO_GRADIENTS[2],
        description:
          'Provided structural engineering services for the rehabilitation and reinforcement of a 2km section of the Manila Bay seawall. Designed marine-grade concrete structures resistant to saltwater corrosion and wave impact forces. Project received commendation from DPWH for innovative design approach.',
      },
      {
        id: 4,
        title: 'Makati Condo Seismic Retrofit',
        type: 'Retrofit',
        year: 2022,
        image: PORTFOLIO_GRADIENTS[3],
        description:
          'Conducted seismic vulnerability assessment and designed retrofit solutions for a 1990s-era 20-story condominium building. Implemented carbon fiber reinforced polymer (CFRP) wrapping and additional shear walls to bring the structure up to current seismic codes while minimizing disruption to residents.',
      },
      {
        id: 5,
        title: 'Taguig Warehouse Complex',
        type: 'Industrial',
        year: 2021,
        image: PORTFOLIO_GRADIENTS[4],
        description:
          'Designed the structural system for a 15,000 sqm warehouse facility featuring long-span steel trusses and pre-engineered metal building components. Optimized the design for both cost efficiency and rapid construction, enabling the client to begin operations 2 months ahead of the original timeline.',
      },
      {
        id: 6,
        title: 'Pasig River Pedestrian Bridge',
        type: 'Bridge',
        year: 2021,
        image: PORTFOLIO_GRADIENTS[5],
        description:
          'Lead structural designer for a modern pedestrian bridge spanning the Pasig River connecting two barangays. The 120-meter cable-stayed bridge features an elegant curved deck profile and LED-integrated railings. The project won the PICE Outstanding Civil Engineering Project award in 2022.',
      },
    ],
    reviews: [
      {
        id: 1,
        reviewerName: 'Roberto Tan',
        reviewerInitials: 'RT',
        reviewerColor: 'emerald',
        rating: 5,
        date: '2024-12-15',
        comment:
          'Engr. Dela Cruz exceeded all expectations on our commercial building project. His attention to detail in the structural design saved us significant costs during construction. Highly recommend for any structural engineering work.',
      },
      {
        id: 2,
        reviewerName: 'Melissa Santos',
        reviewerInitials: 'MS',
        reviewerColor: 'violet',
        rating: 5,
        date: '2024-11-02',
        comment:
          'Outstanding work on our residential tower. Very thorough in calculations and always available for consultation during the construction phase. His seismic analysis gave us complete confidence in the structural integrity.',
      },
      {
        id: 3,
        reviewerName: 'Andrew Lim',
        reviewerInitials: 'AL',
        reviewerColor: 'amber',
        rating: 5,
        date: '2024-09-20',
        comment:
          'We hired Engr. Juan for a complex retrofit project and he delivered exceptional results. He found creative solutions to strengthen the existing structure while keeping costs reasonable. Professional and trustworthy.',
      },
      {
        id: 4,
        reviewerName: 'Grace Villanueva',
        reviewerInitials: 'GV',
        reviewerColor: 'rose',
        rating: 5,
        date: '2024-07-08',
        comment:
          'Top-notch structural engineer. Very knowledgeable about the latest building codes and design practices. Delivered all documents ahead of schedule and was very responsive to our revision requests.',
      },
      {
        id: 5,
        reviewerName: 'Fernando Cruz',
        reviewerInitials: 'FC',
        reviewerColor: 'sky',
        rating: 5,
        date: '2024-05-14',
        comment:
          'Engr. Dela Cruz has been our go-to structural engineer for three consecutive projects. Consistent quality, reliable timelines, and excellent communication. Truly one of the best in Metro Manila.',
      },
    ],
  },
  '2': {
    id: 2,
    firstName: 'Maria',
    lastName: 'Reyes',
    initials: 'MR',
    avatarColor: 'sky',
    specialization: 'Civil',
    tags: ['Civil Engineering', 'Road Design', 'Water Resources'],
    city: 'Cebu City',
    province: 'Cebu',
    yearsExperience: 8,
    rating: 4.8,
    reviewCount: 32,
    hourlyRate: 1200,
    prcVerified: true,
    availability: 'Available',
    bio: 'Civil engineer based in Cebu City with 8 years of experience in infrastructure development, road design, and water resource management across the Visayas region. Passionate about sustainable infrastructure that serves communities and withstands the Philippine climate. Active member of the Philippine Institute of Civil Engineers (PICE) Cebu Chapter.',
    skills: [
      'Road & Highway Design',
      'Water Resources Engineering',
      'Drainage Systems',
      'Site Development',
      'AutoCAD Civil 3D',
      'HEC-RAS',
      'Cost Estimation',
      'Construction Supervision',
    ],
    projectTypes: [
      'Road & Highway Construction',
      'Drainage & Flood Control',
      'Water Supply Systems',
      'Site Development',
      'Land Development',
    ],
    portfolio: [
      {
        id: 1,
        title: 'Cebu South Coastal Road',
        type: 'Road',
        year: 2024,
        image: PORTFOLIO_GRADIENTS[1],
        description:
          'Designed and supervised a 12km coastal road improvement project connecting rural barangays in southern Cebu. The project included slope protection, drainage channels, and two single-span bridges.',
      },
      {
        id: 2,
        title: 'Mandaue Flood Control System',
        type: 'Drainage',
        year: 2023,
        image: PORTFOLIO_GRADIENTS[0],
        description:
          'Comprehensive flood mitigation design for a 5km stretch of the Butuanon River in Mandaue City. Implemented bio-engineering solutions combined with traditional concrete channels to manage storm water while preserving riparian ecology.',
      },
      {
        id: 3,
        title: 'Lapu-Lapu Water District Expansion',
        type: 'Water Supply',
        year: 2022,
        image: PORTFOLIO_GRADIENTS[3],
        description:
          'Designed the water distribution network expansion serving 3,000 new households in Lapu-Lapu City. Included pump station design, reservoir sizing, and pipe network analysis using EPANET.',
      },
    ],
    reviews: [
      {
        id: 1,
        reviewerName: 'Carlos Mendez',
        reviewerInitials: 'CM',
        reviewerColor: 'blue',
        rating: 5,
        date: '2024-10-22',
        comment:
          'Engr. Reyes delivered excellent road design work for our subdivision project. Her knowledge of local soil conditions in Cebu is unmatched. Very professional and easy to work with.',
      },
      {
        id: 2,
        reviewerName: 'Lena Borromeo',
        reviewerInitials: 'LB',
        reviewerColor: 'teal',
        rating: 5,
        date: '2024-08-15',
        comment:
          'Maria did an outstanding job on our drainage project. She was thorough in her hydrological analysis and the system has performed flawlessly through multiple typhoons.',
      },
      {
        id: 3,
        reviewerName: 'Dante Yap',
        reviewerInitials: 'DY',
        reviewerColor: 'amber',
        rating: 4,
        date: '2024-06-03',
        comment:
          'Good work on our site development project. Responsive to feedback and delivered documentation on time. Would hire again for future projects.',
      },
    ],
  },
  '3': {
    id: 3,
    firstName: 'Paolo',
    lastName: 'Santos',
    initials: 'PS',
    avatarColor: 'indigo',
    specialization: 'Geotechnical',
    tags: ['Geotechnical Engineering', 'Soil Investigation', 'Foundation Design'],
    city: 'Davao City',
    province: 'Davao del Sur',
    yearsExperience: 15,
    rating: 4.9,
    reviewCount: 61,
    hourlyRate: 1800,
    prcVerified: true,
    availability: 'Busy',
    bio: 'Senior geotechnical engineer with 15 years of specialized experience in soil investigation, slope stability analysis, and deep foundation design across Mindanao. Expert in addressing the unique geological challenges of the Philippine archipelago, including volcanic soils, high water tables, and seismically active zones. Published researcher in geotechnical engineering with papers presented at international conferences.',
    skills: [
      'Soil Investigation & Testing',
      'Slope Stability Analysis',
      'Deep Foundation Design',
      'Ground Improvement',
      'GeoStudio',
      'PLAXIS',
      'Rock Mechanics',
      'Geotechnical Instrumentation',
      'Landslide Risk Assessment',
    ],
    projectTypes: [
      'Soil Investigation Campaigns',
      'Slope Stabilization',
      'Deep Foundation Design',
      'Ground Improvement',
      'Landslide Mitigation',
      'Dam & Embankment Design',
    ],
    portfolio: [
      {
        id: 1,
        title: 'Davao Bypass Road Geotech Study',
        type: 'Investigation',
        year: 2024,
        image: PORTFOLIO_GRADIENTS[2],
        description:
          'Led a comprehensive geotechnical investigation for a 25km bypass road project. Supervised 50+ boreholes, laboratory testing program, and slope stability assessments. Delivered foundation recommendations that optimized construction costs by 20%.',
      },
      {
        id: 2,
        title: 'Samal Island Slope Stabilization',
        type: 'Slope Stability',
        year: 2023,
        image: PORTFOLIO_GRADIENTS[4],
        description:
          'Designed slope stabilization measures for a resort development on Samal Island. Implemented a combination of soil nailing, gabion walls, and bioengineering to address a 30-meter high cut slope in weathered rock.',
      },
      {
        id: 3,
        title: 'Tagum City Deep Foundation',
        type: 'Foundation',
        year: 2022,
        image: PORTFOLIO_GRADIENTS[5],
        description:
          'Designed bored pile foundations for a 12-story commercial building in Tagum City. Addressed challenging ground conditions including liquefiable sand layers, recommending ground improvement using stone columns.',
      },
    ],
    reviews: [
      {
        id: 1,
        reviewerName: 'Ricardo Navarro',
        reviewerInitials: 'RN',
        reviewerColor: 'indigo',
        rating: 5,
        date: '2024-11-30',
        comment:
          'Engr. Santos is the best geotechnical engineer in Mindanao. His thorough investigation and clear reports gave us complete confidence in our foundation design. Worth every peso.',
      },
      {
        id: 2,
        reviewerName: 'Teresa Aquino',
        reviewerInitials: 'TA',
        reviewerColor: 'rose',
        rating: 5,
        date: '2024-09-18',
        comment:
          'Paolo provided exceptional geotechnical services for our slope stabilization project. His innovative approach saved us significant costs compared to traditional solutions.',
      },
      {
        id: 3,
        reviewerName: 'Armando Diaz',
        reviewerInitials: 'AD',
        reviewerColor: 'emerald',
        rating: 5,
        date: '2024-07-25',
        comment:
          'Very thorough in his soil investigation work. Reports are comprehensive and well-presented. Always willing to explain technical details to non-engineers. Highly recommended.',
      },
    ],
  },
};

// Fallback profile generator for IDs not in the detailed profiles
export function getEngineerProfile(id: string): EngineerProfile | null {
  if (engineerProfiles[id]) {
    return engineerProfiles[id];
  }

  // Generate a basic profile for IDs 4–24 from the mock engineer list
  const numId = parseInt(id, 10);
  if (numId < 1 || numId > 24 || isNaN(numId)) return null;

  const names: Record<number, { first: string; last: string; initials: string; spec: string; city: string; province: string; color: string }> = {
    4: { first: 'Angela', last: 'Lim', initials: 'AL', spec: 'Sanitary', city: 'Quezon City', province: 'Metro Manila', color: 'teal' },
    5: { first: 'Ricardo', last: 'Gonzales', initials: 'RG', spec: 'Geodetic', city: 'Baguio City', province: 'Benguet', color: 'violet' },
    6: { first: 'Carmen', last: 'Torres', initials: 'CT', spec: 'Structural', city: 'Taguig City', province: 'Metro Manila', color: 'emerald' },
    7: { first: 'Mark', last: 'Villanueva', initials: 'MV', spec: 'Civil', city: 'Iloilo City', province: 'Iloilo', color: 'amber' },
    8: { first: 'Sofia', last: 'Aquino', initials: 'SA', spec: 'Geotechnical', city: 'Pasig City', province: 'Metro Manila', color: 'rose' },
    9: { first: 'Gabriel', last: 'Mendoza', initials: 'GM', spec: 'Structural', city: 'Cagayan de Oro', province: 'Misamis Oriental', color: 'blue' },
    10: { first: 'Patricia', last: 'Garcia', initials: 'PG', spec: 'Sanitary', city: 'Mandaluyong City', province: 'Metro Manila', color: 'sky' },
    11: { first: 'Andre', last: 'Ramos', initials: 'AR', spec: 'Geodetic', city: 'Zamboanga City', province: 'Zamboanga del Sur', color: 'indigo' },
    12: { first: 'Diana', last: 'Cruz', initials: 'DC', spec: 'Civil', city: 'San Fernando', province: 'Pampanga', color: 'violet' },
    13: { first: 'Leo', last: 'Bautista', initials: 'LB', spec: 'Structural', city: 'Antipolo City', province: 'Rizal', color: 'teal' },
    14: { first: 'Nicole', last: 'Fernandez', initials: 'NF', spec: 'Geotechnical', city: 'Bacolod City', province: 'Negros Occidental', color: 'emerald' },
    15: { first: 'Jericho', last: 'Tan', initials: 'JT', spec: 'Sanitary', city: 'General Santos', province: 'South Cotabato', color: 'amber' },
    16: { first: 'Isabella', last: 'Ong', initials: 'IO', spec: 'Civil', city: 'Las Piñas City', province: 'Metro Manila', color: 'rose' },
    17: { first: 'Rafael', last: 'De Leon', initials: 'RD', spec: 'Geodetic', city: 'Lipa City', province: 'Batangas', color: 'blue' },
    18: { first: 'Camille', last: 'Navarro', initials: 'CN', spec: 'Structural', city: 'Caloocan City', province: 'Metro Manila', color: 'sky' },
    19: { first: 'Dominic', last: 'Sy', initials: 'DS', spec: 'Geotechnical', city: 'Tagaytay City', province: 'Cavite', color: 'indigo' },
    20: { first: 'Katrina', last: 'Pascual', initials: 'KP', spec: 'Sanitary', city: 'Naga City', province: 'Camarines Sur', color: 'violet' },
    21: { first: 'Enrique', last: 'Soriano', initials: 'ES', spec: 'Civil', city: 'Parañaque City', province: 'Metro Manila', color: 'teal' },
    22: { first: 'Bianca', last: 'Legaspi', initials: 'BL', spec: 'Geodetic', city: 'Angeles City', province: 'Pampanga', color: 'emerald' },
    23: { first: 'Miguel', last: 'Aguilar', initials: 'MA', spec: 'Structural', city: 'Muntinlupa City', province: 'Metro Manila', color: 'amber' },
    24: { first: 'Christine', last: 'Dizon', initials: 'CD', spec: 'Civil', city: 'Legazpi City', province: 'Albay', color: 'rose' },
  };

  const info = names[numId];
  if (!info) return null;

  const expYears = [6, 10, 14, 4, 9, 7, 11, 5, 13, 3, 8, 2, 16, 7, 10, 6, 9, 11, 4, 18, 5][numId % 21];
  const rating = [4.6, 4.7, 4.9, 4.3, 4.5, 4.4, 4.8, 4.2, 4.7, 4.1, 4.6, 4.0, 5.0, 4.5, 4.7, 4.3, 4.6, 4.8, 4.2, 5.0, 4.4][numId % 21];
  const reviews = [19, 28, 53, 11, 24, 16, 39, 9, 44, 7, 22, 5, 58, 18, 33, 14, 26, 41, 10, 72, 13][numId % 21];
  const rate = [1100, 1400, 1700, 900, 1300, 1050, 1450, 950, 1600, 800, 1250, 750, 1900, 1150, 1350, 1000, 1200, 1500, 900, 2000, 1000][numId % 21];
  const prc = numId % 3 !== 0 || numId > 15;

  return {
    id: numId,
    firstName: info.first,
    lastName: info.last,
    initials: info.initials,
    avatarColor: info.color,
    specialization: info.spec,
    tags: [`${info.spec} Engineering`, 'Project Management', 'Technical Consultation'],
    city: info.city,
    province: info.province,
    yearsExperience: expYears,
    rating,
    reviewCount: reviews,
    hourlyRate: rate,
    prcVerified: prc,
    availability: numId % 3 === 0 ? 'Busy' : 'Available',
    bio: `Dedicated ${info.spec.toLowerCase()} engineer based in ${info.city}, ${info.province} with ${expYears} years of professional experience. Specializing in delivering high-quality engineering solutions for both residential and commercial projects throughout the Philippines. Committed to safety, innovation, and exceeding client expectations on every engagement.`,
    skills: [
      `${info.spec} Analysis`,
      'AutoCAD',
      'Project Management',
      'Technical Documentation',
      'Site Inspection',
      'Cost Estimation',
      'Quality Control',
      'Building Code Compliance',
    ],
    projectTypes: [
      'Residential Buildings',
      'Commercial Developments',
      'Infrastructure Projects',
      'Renovation & Retrofitting',
    ],
    portfolio: [
      {
        id: 1,
        title: `${info.city} Commercial Building`,
        type: 'Commercial',
        year: 2024,
        image: PORTFOLIO_GRADIENTS[numId % 6],
        description: `Led the ${info.spec.toLowerCase()} engineering work for a mid-rise commercial building in ${info.city}. Delivered comprehensive design documents and provided construction supervision throughout the project duration.`,
      },
      {
        id: 2,
        title: `${info.province} Residential Complex`,
        type: 'Residential',
        year: 2023,
        image: PORTFOLIO_GRADIENTS[(numId + 1) % 6],
        description: `Provided ${info.spec.toLowerCase()} engineering services for a 50-unit residential complex. Ensured compliance with all applicable building codes and engineering standards.`,
      },
      {
        id: 3,
        title: `${info.city} Infrastructure Upgrade`,
        type: 'Infrastructure',
        year: 2022,
        image: PORTFOLIO_GRADIENTS[(numId + 2) % 6],
        description: `Contributed to a major infrastructure upgrade project in the ${info.province} area. Coordinated with government agencies and contractors to deliver the project on time and within budget.`,
      },
    ],
    reviews: [
      {
        id: 1,
        reviewerName: 'Sample Reviewer',
        reviewerInitials: 'SR',
        reviewerColor: 'blue',
        rating: 5,
        date: '2024-10-15',
        comment: `Engr. ${info.last} delivered exceptional work on our project. Very professional and knowledgeable. Would highly recommend for any ${info.spec.toLowerCase()} engineering needs.`,
      },
      {
        id: 2,
        reviewerName: 'Another Client',
        reviewerInitials: 'AC',
        reviewerColor: 'emerald',
        rating: 4,
        date: '2024-08-22',
        comment: `Good experience working with Engr. ${info.last}. Thorough in analysis and responsive to our requests. Project was completed on schedule.`,
      },
    ],
  };
}

export const AVATAR_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200' },
};

export const AVAILABILITY_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  Available: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  Busy: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  Away: { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' },
};
