import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostChartProps {
  stickerPrice: number;
  netPrice: number;
  aid: number;
}

const COLORS = {
  sticker: '#A0AEC0', // Gray
  aid: '#38A169',     // Green
  net: '#3182CE',     // Blue
};

export const CostChart: React.FC<CostChartProps> = ({ stickerPrice, netPrice, aid }) => {
  const data = [
    {
      name: 'Sticker Price',
      Sticker: stickerPrice,
      Aid: 0,
      Net: 0,
    },
    {
      name: 'You',
      Sticker: 0,
      Aid: aid,
      Net: netPrice,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="Sticker" stackId="a" fill={COLORS.sticker} name="Sticker Price" />
        <Bar dataKey="Aid" stackId="a" fill={COLORS.aid} name="Financial Aid" />
        <Bar dataKey="Net" stackId="a" fill={COLORS.net} name="Your Net Price" />
      </BarChart>
    </ResponsiveContainer>
  );
};
