import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type UniversityDetail = {
  id: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  heroImageUrl: string | null
  websiteUrl: string | null
  established: number | null
  
  // Location & Environment
  city: string | null
  state: string | null
  country: string
  address: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  climateZone: string | null
  nearestAirport: string | null
  region: string | null
  
  // Classification
  ranking: number | null
  type: string | null
  setting: string | null
  classification: string | null
  religiousAffiliation: string | null
  campusSizeAcres: number | null
  
  // Admissions
  acceptanceRate: number | null
  applicationDeadline: string | null // ISO Date
  earlyDecisionDeadline: string | null
  commonAppAccepted: boolean
  applicationFee: number | null
  testPolicy: string | null
  minGpa: number | null
  avgGpa: number | null
  satMath25: number | null
  satMath75: number | null
  satVerbal25: number | null
  satVerbal75: number | null
  actComposite25: number | null
  actComposite75: number | null
  avgSatScore: number | null
  avgActScore: number | null
  internationalEngReqs: any | null
  
  // Costs & Financial Aid
  tuitionInState: number | null
  tuitionOutState: number | null
  tuitionInternational: number | null
  roomAndBoard: number | null
  booksAndSupplies: number | null
  costOfLiving: number | null
  averageNetPrice: number | null
  percentReceivingAid: number | null
  averageGrantAid: number | null
  scholarshipsIntl: boolean
  needBlindAdmission: boolean
  
  // Student Body
  studentPopulation: number | null
  undergraduatePopulation: number | null
  graduatePopulation: number | null
  studentFacultyRatio: number | null
  percentMale: number | null
  percentFemale: number | null
  percentInternational: number | null
  diversityScore: number | null
  
  // Outcomes
  graduationRate: number | null
  retentionRate: number | null
  employmentRate: number | null
  averageStartingSalary: number | null
  internshipSupport: number | null // 1-5 scale
  alumniNetwork: number | null // 1-5 scale
  visaDurationMonths: number | null
  
  // Campus Life & Academics
  academicCalendar: string | null
  sportsDivision: string | null
  hasHousing: boolean
  studentLifeScore: number | null
  safetyRating: number | null
  partySceneRating: number | null
  
  // Arrays & Metadata
  popularMajors: string[]
  degreeLevels: string[]
  languages: string[]
  studentLifeTags: string[]
  rankings: any | null
}

export function useUniversityDetail(slug: string) {
  return useQuery({
    queryKey: ['university', slug],
    queryFn: async () => {
      const { data } = await api.get<UniversityDetail>(`/universities/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}
