import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UniversityDetail } from '@/hooks/useUniversityDetail';

interface ComparisonTableProps {
  universities: UniversityDetail[];
}

// Extended type for universities that may have additional fields
type ExtendedUniversity = UniversityDetail & {
  globalRanking?: number;
  nationalRanking?: number;
  satEbrw25?: number;
  satEbrw75?: number;
  shortName?: string;
  undergradEnrollment?: number;
  gradEnrollment?: number;
  genderRatioMale?: number;
  genderRatioFemale?: number;
  percentMinority?: number;
  graduationRate4Year?: number;
  graduationRate6Year?: number;
  avgStartingSalary?: number;
  diversityRating?: number;
  housingDescription?: string;
  greekLife?: string;
};

interface Section {
  title: string;
  rows: Array<{
    label: string;
    render: (uni: ExtendedUniversity) => React.ReactNode;
    getValue?: (uni: ExtendedUniversity) => number | null;
    higherIsBetter?: boolean; // true = higher value is better (default), false = lower is better
  }>;
}

// Helper function to determine if a value is the best among universities
const getBestValueIndex = (
  universities: ExtendedUniversity[],
  getValue: (uni: ExtendedUniversity) => number | null,
  higherIsBetter: boolean = true
): number => {
  const values = universities.map((u, index) => ({
    value: getValue(u),
    index,
  }));

  const validValues = values.filter((v) => v.value !== null);
  if (validValues.length === 0) return -1;

  const best = higherIsBetter
    ? validValues.reduce((max, current) =>
        current.value! > max.value! ? current : max
      )
    : validValues.reduce((min, current) =>
        current.value! < min.value! ? current : min
      );

  return best.index;
};

export function ComparisonTable({ universities }: ComparisonTableProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'academic', 'costs'])
  );

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const sections: Array<{ key: string; section: Section }> = [
    {
      key: 'overview',
      section: {
        title: '📍 Overview',
        rows: [
          { label: 'Country', render: (u) => u.country || '—' },
          { label: 'City', render: (u) => u.city || '—' },
          { label: 'Campus Setting', render: (u) => u.setting || '—' },
          { label: 'Type', render: (u) => u.type || '—' },
          { label: 'Established', render: (u) => u.established || '—' },
          { label: 'Climate Zone', render: (u) => u.climateZone || '—' },
        ],
      },
    },
    {
      key: 'academic',
      section: {
        title: '🎓 Academic Profile',
        rows: [
          {
            label: 'Global Ranking',
            render: (u) =>
              u.globalRanking ? (
                <Badge variant="outline" className="font-semibold">
                  #{u.globalRanking}
                </Badge>
              ) : u.ranking ? (
                <Badge variant="outline" className="font-semibold">
                  #{u.ranking}
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => {
              const ranking = u.globalRanking || u.ranking;
              return ranking ? -ranking : null; // Negative because lower ranking is better
            },
            higherIsBetter: true, // We inverted the value, so higher (less negative) is better
          },
          {
            label: 'National Ranking',
            render: (u) =>
              u.nationalRanking ? (
                <Badge variant="secondary">#{u.nationalRanking}</Badge>
              ) : (
                '—'
              ),
            getValue: (u) => (u.nationalRanking ? -u.nationalRanking : null),
            higherIsBetter: true,
          },
          {
            label: 'Acceptance Rate',
            render: (u) =>
              u.acceptanceRate ? (
                <Badge
                  variant={u.acceptanceRate < 0.2 ? 'destructive' : 'secondary'}
                >
                  {(u.acceptanceRate * 100).toFixed(1)}%
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.acceptanceRate,
            higherIsBetter: false, // Lower acceptance rate is more selective/prestigious
          },
          { 
            label: 'Average GPA', 
            render: (u) => u.avgGpa?.toFixed(2) || '—',
            getValue: (u) => u.avgGpa || null,
            higherIsBetter: false, // Lower required GPA is easier to get in
          },
          {
            label: 'SAT Range (Math)',
            render: (u) =>
              u.satMath25 && u.satMath75
                ? `${u.satMath25}-${u.satMath75}`
                : '—',
            getValue: (u) => u.satMath75 || null,
            higherIsBetter: false,
          },
          {
            label: 'SAT Range (EBRW)',
            render: (u) =>
              u.satEbrw25 && u.satEbrw75
                ? `${u.satEbrw25}-${u.satEbrw75}`
                : u.satVerbal25 && u.satVerbal75
                ? `${u.satVerbal25}-${u.satVerbal75}`
                : '—',
            getValue: (u) => u.satEbrw75 || u.satVerbal75 || null,
            higherIsBetter: false,
          },
          {
            label: 'ACT Composite Range',
            render: (u) =>
              u.actComposite25 && u.actComposite75
                ? `${u.actComposite25}-${u.actComposite75}`
                : '—',
            getValue: (u) => u.actComposite75 || null,
            higherIsBetter: false,
          },
          {
            label: 'Student:Faculty Ratio',
            render: (u) =>
              u.studentFacultyRatio ? `${u.studentFacultyRatio}:1` : '—',
            getValue: (u) => u.studentFacultyRatio ? -u.studentFacultyRatio : null,
            higherIsBetter: true, // Lower ratio is better, so we invert
          },
        ],
      },
    },
    {
      key: 'costs',
      section: {
        title: '💵 Cost & Financial Aid',
        rows: [
          {
            label: 'Tuition (In-State)',
            render: (u) =>
              u.tuitionInState
                ? `$${u.tuitionInState.toLocaleString()}`
                : '—',
            getValue: (u) => u.tuitionInState || null,
            higherIsBetter: false,
          },
          {
            label: 'Tuition (Out-of-State)',
            render: (u) =>
              u.tuitionOutState
                ? `$${u.tuitionOutState.toLocaleString()}`
                : '—',
            getValue: (u) => u.tuitionOutState || null,
            higherIsBetter: false,
          },
          {
            label: 'Tuition (International)',
            render: (u) =>
              u.tuitionInternational
                ? `$${u.tuitionInternational.toLocaleString()}`
                : '—',
            getValue: (u) => u.tuitionInternational || null,
            higherIsBetter: false,
          },
          {
            label: 'Room & Board',
            render: (u) =>
              u.roomAndBoard ? `$${u.roomAndBoard.toLocaleString()}` : '—',
            getValue: (u) => u.roomAndBoard || null,
            higherIsBetter: false,
          },
          {
            label: 'Books & Supplies',
            render: (u) =>
              u.booksAndSupplies
                ? `$${u.booksAndSupplies.toLocaleString()}`
                : '—',
            getValue: (u) => u.booksAndSupplies || null,
            higherIsBetter: false,
          },
          {
            label: 'Cost of Living',
            render: (u) =>
              u.costOfLiving ? `$${u.costOfLiving.toLocaleString()}` : '—',
            getValue: (u) => u.costOfLiving || null,
            higherIsBetter: false,
          },
          {
            label: 'Average Grant Aid',
            render: (u) =>
              u.averageGrantAid
                ? `$${u.averageGrantAid.toLocaleString()}`
                : '—',
            getValue: (u) => u.averageGrantAid || null,
            higherIsBetter: true, // Higher grant aid is better
          },
          {
            label: '% Receiving Aid',
            render: (u) =>
              u.percentReceivingAid
                ? `${(u.percentReceivingAid * 100).toFixed(0)}%`
                : '—',
            getValue: (u) => u.percentReceivingAid || null,
            higherIsBetter: true,
          },
          {
            label: 'Need-Blind Admission',
            render: (u) => (u.needBlindAdmission ? '✅ Yes' : '❌ No'),
          },
          {
            label: 'International Scholarships',
            render: (u) => (u.scholarshipsIntl ? '✅ Available' : '—'),
          },
        ],
      },
    },
    {
      key: 'student-body',
      section: {
        title: '👥 Student Body',
        rows: [
          {
            label: 'Total Enrollment',
            render: (u) =>
              u.studentPopulation
                ? u.studentPopulation.toLocaleString()
                : '—',
            getValue: (u) => u.studentPopulation || null,
            higherIsBetter: true, // Larger student body can be considered better (more resources)
          },
          {
            label: 'Undergraduate Enrollment',
            render: (u) =>
              u.undergradEnrollment
                ? u.undergradEnrollment.toLocaleString()
                : u.undergraduatePopulation
                ? u.undergraduatePopulation.toLocaleString()
                : '—',
            getValue: (u) => u.undergradEnrollment || u.undergraduatePopulation || null,
            higherIsBetter: true,
          },
          {
            label: 'Graduate Enrollment',
            render: (u) =>
              u.gradEnrollment 
                ? u.gradEnrollment.toLocaleString() 
                : u.graduatePopulation
                ? u.graduatePopulation.toLocaleString()
                : '—',
            getValue: (u) => u.gradEnrollment || u.graduatePopulation || null,
            higherIsBetter: true,
          },
          {
            label: '% International Students',
            render: (u) =>
              u.percentInternational
                ? `${(u.percentInternational * 100).toFixed(1)}%`
                : '—',
            getValue: (u) => u.percentInternational || null,
            higherIsBetter: true, // Higher diversity
          },
          {
            label: 'Gender Ratio (M:F)',
            render: (u) =>
              u.genderRatioMale && u.genderRatioFemale
                ? `${(u.genderRatioMale * 100).toFixed(0)}:${(
                    u.genderRatioFemale * 100
                  ).toFixed(0)}`
                : u.percentMale && u.percentFemale
                ? `${(u.percentMale * 100).toFixed(0)}:${(u.percentFemale * 100).toFixed(0)}`
                : '—',
          },
          {
            label: '% Students of Color',
            render: (u) =>
              u.percentMinority
                ? `${(u.percentMinority * 100).toFixed(0)}%`
                : '—',
            getValue: (u) => u.percentMinority || null,
            higherIsBetter: true, // Higher diversity
          },
        ],
      },
    },
    {
      key: 'outcomes',
      section: {
        title: '🚀 Outcomes & Career',
        rows: [
          {
            label: '4-Year Graduation Rate',
            render: (u) =>
              u.graduationRate4Year
                ? `${(u.graduationRate4Year * 100).toFixed(0)}%`
                : u.graduationRate
                ? `${(u.graduationRate * 100).toFixed(0)}%`
                : '—',
            getValue: (u) => u.graduationRate4Year || u.graduationRate || null,
            higherIsBetter: true,
          },
          {
            label: '6-Year Graduation Rate',
            render: (u) =>
              u.graduationRate6Year
                ? `${(u.graduationRate6Year * 100).toFixed(0)}%`
                : '—',
            getValue: (u) => u.graduationRate6Year || null,
            higherIsBetter: true,
          },
          {
            label: 'Employment Rate',
            render: (u) =>
              u.employmentRate
                ? `${(u.employmentRate * 100).toFixed(0)}%`
                : '—',
            getValue: (u) => u.employmentRate || null,
            higherIsBetter: true,
          },
          {
            label: 'Average Starting Salary',
            render: (u) =>
              u.avgStartingSalary
                ? `$${u.avgStartingSalary.toLocaleString()}`
                : u.averageStartingSalary
                ? `$${u.averageStartingSalary.toLocaleString()}`
                : '—',
            getValue: (u) => u.avgStartingSalary || u.averageStartingSalary || null,
            higherIsBetter: true,
          },
          {
            label: 'Post-Grad Visa Duration',
            render: (u) =>
              u.visaDurationMonths ? (
                <Badge variant="default" className="flex items-center gap-1 w-fit">
                  {u.visaDurationMonths} Months
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.visaDurationMonths || null,
            higherIsBetter: true,
          },
          {
            label: 'Alumni Network Rating',
            render: (u) =>
              u.alumniNetwork ? (
                <Badge variant="outline">{u.alumniNetwork}/5 ⭐</Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.alumniNetwork || null,
            higherIsBetter: true,
          },
          {
            label: 'Internship Support',
            render: (u) =>
              u.internshipSupport ? (
                <Badge variant="outline">{u.internshipSupport}/5 ⭐</Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.internshipSupport || null,
            higherIsBetter: true,
          },
        ],
      },
    },
    {
      key: 'campus-life',
      section: {
        title: '🏛️ Campus Life',
        rows: [
          {
            label: 'Student Life Score',
            render: (u) =>
              u.studentLifeScore ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {u.studentLifeScore}/5 ⭐
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.studentLifeScore || null,
            higherIsBetter: true,
          },
          {
            label: 'Safety Rating',
            render: (u) =>
              u.safetyRating ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {u.safetyRating}/5 ⭐
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.safetyRating || null,
            higherIsBetter: true,
          },
          {
            label: 'Party Scene',
            render: (u) =>
              u.partySceneRating ? (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {u.partySceneRating}/5 🎉
                </Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.partySceneRating || null,
            higherIsBetter: true,
          },
          {
            label: 'Diversity Score',
            render: (u) =>
              u.diversityRating ? (
                <Badge variant="outline">{u.diversityRating}/5 ⭐</Badge>
              ) : u.diversityScore ? (
                <Badge variant="outline">{u.diversityScore}/5 ⭐</Badge>
              ) : (
                '—'
              ),
            getValue: (u) => u.diversityRating || u.diversityScore || null,
            higherIsBetter: true,
          },
          { label: 'Housing Options', render: (u) => u.housingDescription || (u.hasHousing ? 'Available' : 'Not available') },
          { label: 'Greek Life', render: (u) => u.greekLife || '—' },
        ],
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📊 Detailed Comparison Table</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExpandedSections(new Set(sections.map((s) => s.key)))
              }
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedSections(new Set())}
            >
              Collapse All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left font-medium w-1/5 border-b">Metric</th>
                {universities.map((uni) => (
                  <th
                    key={uni.id}
                    className="p-4 text-left font-medium border-b border-l"
                  >
                    <div className="flex items-center gap-2">
                      {uni.logoUrl && (
                        <img
                          src={uni.logoUrl}
                          alt={uni.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{(uni as ExtendedUniversity).shortName || uni.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {uni.city}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Padding columns */}
                {Array.from({ length: 5 - universities.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-4 border-b border-l w-1/5"></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map(({ key, section }) => {
                const isExpanded = expandedSections.has(key);

                return (
                  <React.Fragment key={key}>
                    {/* Section Header */}
                    <tr
                      className="bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleSection(key)}
                    >
                      <td
                        colSpan={6}
                        className="p-3 font-semibold border-b border-t"
                      >
                        <div className="flex items-center justify-between">
                          <span>{section.title}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Section Rows */}
                    {isExpanded &&
                      section.rows.map((row, idx) => {
                        // Calculate best value index for this row
                        const bestIndex = row.getValue && row.higherIsBetter !== undefined
                          ? getBestValueIndex(universities, row.getValue, row.higherIsBetter)
                          : null;

                        return (
                          <tr
                            key={`${key}-${idx}`}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4 font-medium text-muted-foreground border-b">
                              {row.label}
                            </td>
                            {universities.map((uni, uniIdx) => {
                              const isBest = bestIndex === uniIdx;
                              
                              return (
                                <td
                                  key={uni.id}
                                  className={`p-4 border-b border-l align-top transition-colors ${
                                    isBest
                                      ? 'bg-green-50 border-green-200 border-2 relative'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isBest && (
                                      <span className="text-green-600 font-bold" title="Best value">
                                        ★
                                      </span>
                                    )}
                                    <div className={isBest ? 'font-semibold' : ''}>
                                      {row.render(uni)}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                            {/* Padding columns */}
                            {Array.from({ length: 5 - universities.length }).map(
                              (_, i) => (
                                <td
                                  key={`empty-${i}`}
                                  className="p-4 border-b border-l"
                                ></td>
                              )
                            )}
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// React import for Fragment
import React from 'react';
