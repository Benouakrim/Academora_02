/**
 * University Group Metrics Types
 * Comprehensive metrics for university groups/collections
 */

export interface UniversityGroupMetrics {
  // A. Identity & Overview
  groupType?: string; // Public, Private, Semi-public
  city?: string;
  region?: string;
  yearFounded?: number;
  governanceStructure?: string;
  numberOfCampuses?: number;
  totalStudentPopulation?: number;
  totalStaffCount?: number;

  // B. Academics & Programs Offered
  fieldsOfStudy?: string[]; // Sciences, Business, Law, etc.
  levelCoverage?: string[]; // Licence/Bachelor, Master, Doctorat
  signaturePrograms?: string[];
  accreditations?: string[]; // HCÉRES, CTI, CEFDG, EPAS, EQUIS
  programQualityScore?: number; // 0-100
  graduationRate?: number; // 0-1 (percentage)

  // C. Admissions & Selectivity
  selectivityLevel?: string; // High, Medium, Low
  averageEntryRequirements?: string;
  admissionProcedure?: string;
  internationalAdmission?: boolean;
  tuitionRangeMin?: number;
  tuitionRangeMax?: number;

  // D. Rankings & Reputation
  nationalRanking?: number;
  internationalRanking?: number;
  specialtyRankings?: Record<string, number>; // { "Law": 5, "Engineering": 10 }
  employerReputationScore?: number; // 0-100
  researchReputationScore?: number; // 0-100

  // E. Research & Innovation
  researchCentersCount?: number;
  doctoralSchoolsCount?: number;
  annualPublications?: number;
  patentsFiled?: number;
  researchBudget?: number;
  industryPartnershipsCount?: number;

  // F. Student Life & Facilities
  campusInfrastructureRating?: number; // 0-5
  librariesCount?: number;
  studentAssociationsCount?: number;
  annualEventsCount?: number;
  sportsRanking?: number;
  housingAvailability?: string; // Excellent, Good, Limited
  diningFacilitiesCount?: number;

  // G. International Outlook
  internationalStudentsPct?: number; // 0-1 (percentage)
  partnerUniversitiesCount?: number;
  exchangePrograms?: string[]; // Erasmus, bilateral, etc.
  englishCoursesAvailable?: boolean;
  doubleDegreeOpportunities?: boolean;

  // H. Financial & Economic Metrics
  scholarshipOptions?: string[];
  operationalBudget?: number;
  fundingSources?: Record<string, number>; // { "state": 60, "private": 30, "research": 10 }

  // I. Outcomes & Employability
  employmentRate?: number; // 0-1 (percentage)
  medianSalary?: number; // 6-12 months after graduation
  topEmployers?: string[];
}

export interface UniversityGroupDetail extends UniversityGroupMetrics {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  universities: Array<{
    id: string;
    name: string;
    slug: string;
    city?: string;
    state?: string;
    country?: string;
    logoUrl?: string;
    acceptanceRate?: number;
    tuitionOutState?: number;
    studentPopulation?: number;
  }>;
}

export interface GroupMetricsSection {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number | string[] | boolean | null;
    icon?: string;
    formatter?: (value: any) => string;
  }>;
}
