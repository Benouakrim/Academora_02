import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { analyzeTitles, type TitleAnalysis } from '@/lib/titleSimulatorService'
import { Plus, Trash2, Award, TrendingUp } from 'lucide-react'

interface TitleSimulatorPanelProps {
  currentTitle: string
  focusKeyword?: string
}

export function TitleSimulatorPanel({ currentTitle, focusKeyword }: TitleSimulatorPanelProps) {
  const [titles, setTitles] = useState<string[]>([currentTitle])
  const [newTitle, setNewTitle] = useState('')
  const [analyses, setAnalyses] = useState<TitleAnalysis[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleAddTitle = () => {
    if (newTitle.trim() && newTitle !== currentTitle) {
      const updated = [...titles, newTitle]
      setTitles(updated)
      setNewTitle('')
      // Auto-analyze on add
      const results = analyzeTitles(updated, focusKeyword)
      setAnalyses(results)
      setShowAnalysis(true)
    }
  }

  const handleRemoveTitle = (index: number) => {
    const updated = titles.filter((_, i) => i !== index)
    setTitles(updated)
    if (updated.length > 0) {
      const results = analyzeTitles(updated, focusKeyword)
      setAnalyses(results)
    }
  }

  const handleAnalyze = () => {
    const results = analyzeTitles(titles, focusKeyword)
    setAnalyses(results)
    setShowAnalysis(true)
  }

  const bestTitle = analyses.length > 0 ? analyses.reduce((best, current) => 
    current.totalScore > best.totalScore ? current : best
  ) : null

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950'
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950'
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-950'
    return 'bg-red-50 dark:bg-red-950'
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          A/B Title Simulator
        </h3>

        {/* Title Input */}
        <div className="flex gap-2 mb-3">
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add alternative title variation..."
            className="flex-1 h-9 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTitle()}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddTitle}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Titles */}
        <div className="space-y-2 mb-4">
          {titles.map((title, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded text-sm">
              <span className="flex-1 truncate">{title}</span>
              {idx !== 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveTitle(idx)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Analyze Button */}
        <Button
          type="button"
          size="sm"
          className="w-full mb-4"
          onClick={handleAnalyze}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analyze Titles
        </Button>

        {/* Analysis Results */}
        {showAnalysis && analyses.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            {/* Best Title Banner */}
            {bestTitle && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 p-3 rounded">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">🏆 Recommended Title</div>
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{bestTitle.title}</div>
                <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Overall Score: <span className={`font-bold ${getScoreColor(bestTitle.totalScore)}`}>{bestTitle.totalScore}/100</span>
                </div>
              </div>
            )}

            {/* Detailed Analysis */}
            <div className="text-xs space-y-2">
              {analyses.map((analysis, idx) => (
                <div key={idx} className={`${getScoreBgColor(analysis.totalScore)} border rounded p-3 space-y-2`}>
                  <div className="font-semibold truncate">{analysis.title}</div>

                  {/* Score Bars */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SEO:</span>
                      <span className={getScoreColor(analysis.seoScore)}>{analysis.seoScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/50 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${analysis.seoScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement:</span>
                      <span className={getScoreColor(analysis.engagementScore)}>{analysis.engagementScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/50 rounded overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${analysis.engagementScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Readability:</span>
                      <span className={getScoreColor(analysis.readabilityScore)}>{analysis.readabilityScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/50 rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${analysis.readabilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Power Words and Triggers */}
                  {(analysis.powerWords.length > 0 || analysis.keywordTriggers.length > 0) && (
                    <div className="text-xs space-y-1 mt-2 pt-2 border-t">
                      {analysis.powerWords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.powerWords.map(word => (
                            <span key={word} className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 px-2 py-0.5 rounded">
                              {word}
                            </span>
                          ))}
                        </div>
                      )}
                      {analysis.keywordTriggers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.keywordTriggers.map(trigger => (
                            <span key={trigger} className="bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 px-2 py-0.5 rounded">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="text-xs space-y-1 mt-2 pt-2 border-t">
                      {analysis.recommendations.map((rec, recIdx) => (
                        <div key={recIdx} className="text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overall Score */}
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Overall Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(analysis.totalScore)}`}>
                        {analysis.totalScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TitleSimulatorPanel
