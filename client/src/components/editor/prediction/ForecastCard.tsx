import React from 'react'

export const ForecastCard: React.FC<{ title: string; value: string | number; sub?: string }> = ({ title, value, sub }) => {
  return (
    <div className="p-3 border rounded-md bg-white shadow-sm">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {sub && <div className="text-sm text-muted-foreground mt-1">{sub}</div>}
    </div>
  )
}

export default ForecastCard
