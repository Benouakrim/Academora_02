import React from 'react'

export const RecommendationsList: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items || items.length === 0) return <div className="text-sm text-muted-foreground">No recommendations</div>
  return (
    <ul className="list-disc ml-5">
      {items.map((t, i) => (
        <li key={i} className="text-sm mb-1">{t}</li>
      ))}
    </ul>
  )
}

export default RecommendationsList
