import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Globe,
  DollarSign,
  Briefcase,
  Trophy,
  Microscope,
  Heart,
  Lock,
  Unlock,
} from 'lucide-react';
import type { UniversityGroupDetail } from '@shared/types';

interface GroupMetricsProps {
  group: UniversityGroupDetail & {
    _computed?: {
      metricModes?: Record<string, 'static' | 'dynamic'>;
      dynamicMetrics?: Record<string, unknown>;
    };
  };
}

const MetricBadge = ({ metricKey, modes }: { metricKey: string; modes?: Record<string, string> }) => {
  const mode = modes?.[metricKey] || 'dynamic';
  const isStatic = mode === 'static';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">
          {isStatic ? (
            <Lock className="h-3 w-3 text-orange-500 ml-2" />
          ) : (
            <Unlock className="h-3 w-3 text-green-500 ml-2" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {isStatic ? 'Admin-provided static value' : 'Calculated from universities'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

const StatRow = ({ 
  label, 
  value,
  metricKey,
  modes 
}: { 
  label: string; 
  value: React.ReactNode;
  metricKey?: string;
  modes?: Record<string, string>;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground text-sm flex items-center gap-1">
      {label}
      {metricKey && <MetricBadge metricKey={metricKey} modes={modes} />}
    </span>
    <span className="font-medium text-foreground">{value || 'N/A'}</span>
  </div>
);

const fmtNumber = (val: number | null | undefined) => val ? val.toLocaleString() : 'N/A';
const fmtMoney = (val: number | null | undefined) => val ? `$${val.toLocaleString()}` : 'N/A';
const fmtPct = (val: number | null | undefined) => val ? `${(val * 100).toFixed(1)}%` : 'N/A';

export default function GroupMetrics({ group }: GroupMetricsProps) {
  const modes = group._computed?.metricModes;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* A. Identity & Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Identity & Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatRow label="Type" value={group.groupType} />
          <StatRow label="Location" value={group.city && group.region ? `${group.city}, ${group.region}` : group.city || group.region} />
          <StatRow label="Year Founded" value={group.yearFounded} />
          <StatRow label="Governance" value={group.governanceStructure} />
          <StatRow label="Member Institutions" value={group.memberCount} />
          <StatRow label="Number of Campuses" value={fmtNumber(group.numberOfCampuses)} metricKey="numberOfCampuses" modes={modes} />
          <StatRow label="Total Students" value={fmtNumber(group.totalStudentPopulation)} metricKey="totalStudentPopulation" modes={modes} />
          <StatRow label="Total Staff/Professors" value={fmtNumber(group.totalStaffCount)} metricKey="totalStaffCount" modes={modes} />
        </CardContent>
      </Card>

      {/* B. Academics & Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Academics & Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {group.fieldsOfStudy && group.fieldsOfStudy.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Fields of Study</p>
              <div className="flex flex-wrap gap-2">
                {group.fieldsOfStudy.map((field, i) => (
                  <Badge key={i} variant="secondary">{field}</Badge>
                ))}
              </div>
            </div>
          )}
          {group.levelCoverage && group.levelCoverage.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Level Coverage</p>
              <div className="flex flex-wrap gap-2">
                {group.levelCoverage.map((level, i) => (
                  <Badge key={i} variant="outline">{level}</Badge>
                ))}
              </div>
            </div>
          )}
          {group.signaturePrograms && group.signaturePrograms.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Signature Programs</p>
              <div className="flex flex-wrap gap-2">
                {group.signaturePrograms.map((prog, i) => (
                  <Badge key={i} variant="default">{prog}</Badge>
                ))}
              </div>
            </div>
          )}
          <StatRow label="Program Quality Score" value={group.programQualityScore ? `${group.programQualityScore}/100` : undefined} />
          <StatRow label="Graduation Rate" value={fmtPct(group.graduationRate)} />
          {group.accreditations && group.accreditations.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Accreditations</p>
              <div className="flex flex-wrap gap-2">
                {group.accreditations.map((acc, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{acc}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* C. Admissions & Selectivity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Admissions & Selectivity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatRow label="Selectivity Level" value={group.selectivityLevel} />
          <StatRow label="Entry Requirements" value={group.averageEntryRequirements} />
          <StatRow label="Admission Procedure" value={group.admissionProcedure} />
          <StatRow label="International Admissions" value={group.internationalAdmission ? 'Available' : 'Not Available'} />
          {(group.tuitionRangeMin || group.tuitionRangeMax) && (
            <StatRow 
              label="Tuition Range" 
              value={`${fmtMoney(group.tuitionRangeMin)} - ${fmtMoney(group.tuitionRangeMax)}`} 
            />
          )}
        </CardContent>
      </Card>

      {/* D. Rankings & Reputation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Rankings & Reputation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatRow label="National Ranking" value={group.nationalRanking ? `#${group.nationalRanking}` : undefined} />
          <StatRow label="International Ranking" value={group.internationalRanking ? `#${group.internationalRanking}` : undefined} />
          <StatRow label="Employer Reputation" value={group.employerReputationScore ? `${group.employerReputationScore}/100` : undefined} />
          <StatRow label="Research Reputation" value={group.researchReputationScore ? `${group.researchReputationScore}/100` : undefined} />
          {group.specialtyRankings && Object.keys(group.specialtyRankings).length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Specialty Rankings</p>
              <div className="space-y-1">
                {Object.entries(group.specialtyRankings).map(([field, rank]) => (
                  <div key={field} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{field}</span>
                    <span className="font-medium">#{rank}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E. Research & Innovation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            Research & Innovation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatRow label="Research Centers" value={fmtNumber(group.researchCentersCount)} />
          <StatRow label="Doctoral Schools" value={fmtNumber(group.doctoralSchoolsCount)} />
          <StatRow label="Annual Publications" value={fmtNumber(group.annualPublications)} />
          <StatRow label="Patents Filed" value={fmtNumber(group.patentsFiled)} />
          <StatRow label="Research Budget" value={fmtMoney(group.researchBudget)} />
          <StatRow label="Industry Partnerships" value={fmtNumber(group.industryPartnershipsCount)} />
        </CardContent>
      </Card>

      {/* F. Student Life & Facilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Student Life & Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StatRow label="Campus Infrastructure" value={group.campusInfrastructureRating ? `${group.campusInfrastructureRating}/5 ⭐` : undefined} />
          <StatRow label="Libraries" value={fmtNumber(group.librariesCount)} />
          <StatRow label="Student Associations" value={fmtNumber(group.studentAssociationsCount)} />
          <StatRow label="Annual Events" value={fmtNumber(group.annualEventsCount)} />
          <StatRow label="Sports Ranking" value={group.sportsRanking ? `#${group.sportsRanking}` : undefined} />
          <StatRow label="Housing Availability" value={group.housingAvailability} />
          <StatRow label="Dining Facilities" value={fmtNumber(group.diningFacilitiesCount)} />
        </CardContent>
      </Card>

      {/* G. International Outlook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            International Outlook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatRow label="International Students" value={fmtPct(group.internationalStudentsPct)} />
          <StatRow label="Partner Universities" value={fmtNumber(group.partnerUniversitiesCount)} />
          <StatRow label="English Courses" value={group.englishCoursesAvailable ? 'Available' : 'Not Available'} />
          <StatRow label="Double-Degree Options" value={group.doubleDegreeOpportunities ? 'Available' : 'Not Available'} />
          {group.exchangePrograms && group.exchangePrograms.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Exchange Programs</p>
              <div className="flex flex-wrap gap-2">
                {group.exchangePrograms.map((prog, i) => (
                  <Badge key={i} variant="secondary">{prog}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* H. Financial & Economic Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial & Economic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatRow label="Operational Budget" value={fmtMoney(group.operationalBudget)} />
          {group.scholarshipOptions && group.scholarshipOptions.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Scholarship Options</p>
              <div className="flex flex-wrap gap-2">
                {group.scholarshipOptions.map((option, i) => (
                  <Badge key={i} variant="outline">{option}</Badge>
                ))}
              </div>
            </div>
          )}
          {group.fundingSources && Object.keys(group.fundingSources).length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">Funding Sources</p>
              <div className="space-y-3">
                {Object.entries(group.fundingSources).map(([source, percentage]) => (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{source}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* I. Outcomes & Employability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Outcomes & Employability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatRow label="Employment Rate" value={fmtPct(group.employmentRate)} />
          <StatRow label="Median Salary (6-12mo)" value={fmtMoney(group.medianSalary)} />
          {group.topEmployers && group.topEmployers.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Top Employers</p>
              <div className="space-y-1">
                {group.topEmployers.map((employer, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {i + 1}
                    </div>
                    <span>{employer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
