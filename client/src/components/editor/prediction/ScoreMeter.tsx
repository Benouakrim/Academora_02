import { Card } from '@/components/ui/card'

export function ScoreMeter({ score }: { score: number }) {
  const percent = Math.max(0, Math.min(100, score))
  let color = 'bg-gray-300'
  if (percent >= 80) color = 'bg-green-500'
  else if (percent >= 60) color = 'bg-yellow-400'
  else if (percent >= 40) color = 'bg-orange-400'
  else color = 'bg-red-500'

  return (
    <Card className="p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-[var(--primary)]">SEO Score</span>
        <span className="text-xs font-bold text-[var(--primary)]">{percent}</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Card>
  )
}

export default ScoreMeter
