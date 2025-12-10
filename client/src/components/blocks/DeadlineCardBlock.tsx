// client/src/components/blocks/DeadlineCardBlock.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import type { DeadlineCardBlock as DeadlineCardBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: DeadlineCardBlockType;
  isPreview?: boolean;
}

function calculateTimeRemaining(deadline: string) {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) return { expired: true, text: 'Deadline passed' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { expired: false, text: `${days}d ${hours}h remaining` };
  if (hours > 0) return { expired: false, text: `${hours}h ${minutes}m remaining` };
  return { expired: false, text: `${minutes}m remaining` };
}

export default function DeadlineCardBlock({ block }: Props) {
  const { data } = block;
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(data.deadline));

  useEffect(() => {
    if (!data.showCountdown) return;

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(data.deadline));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [data.deadline, data.showCountdown]);

  const deadlineDate = new Date(data.deadline);

  return (
    <Card className={`${timeRemaining.expired ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {data.label}
          </CardTitle>
          {data.showCountdown && (
            <Badge variant={timeRemaining.expired ? 'secondary' : 'default'}>
              {timeRemaining.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-2xl font-bold mb-2">
          <Clock className="h-6 w-6" />
          {deadlineDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
