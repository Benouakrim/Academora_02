import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Zap, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMatchingProfileStore } from '@/store/useMatchingProfileStore'
import { useUserStore } from '@/store/useUserStore'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import FaderSlider from '@/components/matching/FaderSlider'
import DialKnob from '@/components/matching/DialKnob'
import { useAdvancedMatching, UniversityMatchResult } from '@/hooks/useAdvancedMatching'
import { Skeleton } from '@/components/ui/skeleton'
import type { ImportanceFactors } from '@/store/useMatchingProfileStore'

// Define a simple component for match result visualization
function MatchResultCard({ result }: { result: UniversityMatchResult }) {
    const u = result.university
    const scoreColor = result.matchScore > 80 ? 'text-green-600 dark:text-green-400' : result.matchScore > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'

    return (
        <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {u.logoUrl ? (
                    <img src={u.logoUrl} alt={u.name} className="h-full w-full object-contain p-1" />
                ) : (
                    <Zap className="h-6 w-6 text-primary/50" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <Link to={`/university/${u.slug}`} className="font-semibold text-lg hover:text-primary truncate block">
                    {u.name}
                </Link>
                <div className="text-sm text-muted-foreground truncate">{u.country} - {u.tuitionOutState ? `$${u.tuitionOutState.toLocaleString()}` : 'N/A'}</div>
            </div>
            <div className="flex flex-col items-end">
                <div className="text-2xl font-bold">
                    <span className={scoreColor}>
                        {result.matchScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                    <Link to={`/university/${u.slug}`}>View</Link>
                </Button>
            </div>
        </Card>
    )
}

const scoreSections: Array<{ key: keyof ImportanceFactors, label: string }> = [
    { key: 'academics', label: 'Academics' },
    { key: 'cost', label: 'Financial Cost' },
    { key: 'social', label: 'Social Fit' },
    { key: 'location', label: 'Location' },
    { key: 'future', label: 'Future Outcomes' },
]

export default function MatchingEnginePage() {
    const { profile, isLoading: isLoadingProfile } = useUserStore()
    const matchStore = useMatchingProfileStore()
    const { mutate, data: matchResults, isPending, isError } = useAdvancedMatching()
    
    // 1. Sync Base Profile Data on Load
    useEffect(() => {
        if (profile) {
            matchStore.setProfileBase(
                profile.gpa || 0,
                profile.financialProfile?.maxBudget || 50000,
                profile.preferredMajor || 'Undeclared'
            )
        }
    }, [profile, matchStore])

    // 2. Prepare Payload
    const canRunMatch = useMemo(() => 
        !!profile?.gpa && !!profile?.financialProfile?.maxBudget && profile?.preferredMajor && !isLoadingProfile
    , [profile, isLoadingProfile])
    
    const payload = useMemo(() => ({
        gpa: matchStore.gpa,
        maxBudget: matchStore.maxBudget,
        preferredMajor: matchStore.preferredMajor,
        importanceFactors: matchStore.importanceFactors,
        strictMatch: matchStore.strictMatch,
        minSafetyRating: matchStore.minSafetyRating,
        minVisaMonths: matchStore.minVisaMonths,
        needsVisaSupport: matchStore.needsVisaSupport
    }), [matchStore])

    const handleRunMatch = () => {
        if (canRunMatch) {
            mutate(payload)
        } else {
            toast.error("Please ensure your profile has GPA, Max Budget, and Preferred Major set.");
        }
    }

    if (isLoadingProfile) {
        return <Skeleton className="h-full w-full min-h-[500px]" />
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Advanced Matching Engine</h1>
                    <p className="text-muted-foreground text-sm mt-1">Adjust your priorities and find your highest-ranked universities.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: The Mixer (Importance Factors) */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Priority Mixer</CardTitle>
                        <CardDescription>Drag the sliders to weight your preferences (1 = Low Priority, 10 = High Priority).</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap justify-around gap-y-6 py-6 border-b">
                        {scoreSections.map(section => (
                            <FaderSlider
                                key={section.key}
                                label={section.label}
                                value={matchStore.importanceFactors[section.key]}
                                onChange={(v) => matchStore.setFactor(section.key, v)}
                                min={1} max={10} step={1}
                            />
                        ))}
                    </CardContent>
                    <div className="p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Constraints & Filters</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DialKnob 
                                value={matchStore.minSafetyRating || 0} 
                                min={0}
                                max={5}
                                onChange={(v) => matchStore.setConstraint('minSafetyRating', v)}
                                label="Min Safety Rating"
                                unit="/5"
                            />
                            <Card className="p-4 flex flex-col justify-center items-center">
                                <span className="text-muted-foreground text-sm">Strict Budget Filter</span>
                                <Button
                                    variant={matchStore.strictMatch ? 'destructive' : 'outline'}
                                    onClick={() => matchStore.setConstraint('strictMatch', !matchStore.strictMatch)}
                                    className="mt-2"
                                >
                                    {matchStore.strictMatch ? 'ON' : 'OFF'}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1 text-center">Hard filter schools over your budget.</p>
                            </Card>
                        </div>
                        <Button onClick={handleRunMatch} disabled={!canRunMatch || isPending} size="lg" className="w-full bg-gradient-brand shadow-lg">
                            {isPending ? 'Calculating...' : <><Send className="w-5 h-5 mr-2" /> Run Match Algorithm</>}
                        </Button>
                    </div>
                </Card>

                {/* Right Column: Results */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-purple-600" /> Top Matches</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isPending ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : matchResults && matchResults.length > 0 ? (
                                <div className="space-y-3">
                                    {matchResults.map((result) => (
                                        <MatchResultCard key={result.university.id} result={result} />
                                    ))}
                                </div>
                            ) : isError ? (
                                <div className="text-red-500 text-sm">Error loading results. See console for details.</div>
                            ) : (
                                <div className="text-muted-foreground text-sm text-center py-6">
                                    Adjust the mixer and click 'Run Match Algorithm' to find your schools.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
