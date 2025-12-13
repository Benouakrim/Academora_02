// client/src/components/blocks/CostBreakdownChartBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CostBreakdownChartBlock as CostBreakdownChartBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: CostBreakdownChartBlockType;
  isPreview?: boolean;
}

export default function CostBreakdownChartBlock({ block }: Props) {
  const { data } = block;

  // Calculate cost breakdown from primitive inputs
  const costs = [
    { label: 'In-State Tuition', amount: data.inStateTuition || 0 },
    { label: 'Out-of-State Premium', amount: data.outStateTuitionPremium || 0 },
    { label: 'Fees & Insurance', amount: data.feesAndInsurance || 0 },
    { label: 'On-Campus Housing', amount: data.onCampusHousing || 0 },
    { label: 'Meal Plan', amount: data.mealPlanCost || 0 },
    { label: 'Books & Supplies', amount: data.booksAndSuppliesEstimate || 0 },
    { label: 'Personal Expenses', amount: data.miscPersonalEstimate || 0 },
  ].filter(item => item.amount > 0);

  const total = costs.reduce((sum, item) => sum + item.amount, 0);
  
  // Color palette for different cost categories
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="space-y-3">
            {costs.map((item, index) => {
              const percentage = total > 0 ? (item.amount / total) * 100 : 0;
              const color = colors[index % colors.length];

              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {data.currency}{item.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</p>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">Total Cost</p>
              <p className="text-lg font-bold text-blue-600">
                {data.currency}{total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
