// client/src/components/blocks/AnnouncementBannerBlock.tsx
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import type { AnnouncementBannerBlock as AnnouncementBannerBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: AnnouncementBannerBlockType;
  isPreview?: boolean;
}

export default function AnnouncementBannerBlock({ block, isPreview = false }: Props) {
  const { data } = block;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && !isPreview) return null;

  // Check if expired
  if (data.expiresAt && !isPreview) {
    const now = new Date();
    const expires = new Date(data.expiresAt);
    if (now > expires) return null;
  }

  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: XCircle
  };

  const Icon = icons[data.severity];

  const variants: Record<string, string> = {
    info: 'border-blue-500 bg-blue-50 text-blue-900',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    success: 'border-green-500 bg-green-50 text-green-900',
    error: 'border-red-500 bg-red-50 text-red-900'
  };

  return (
    <Alert className={`relative ${variants[data.severity]}`}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="mb-2 font-semibold">{block.title}</AlertTitle>
      <AlertDescription className="text-sm">
        {data.message}
        {data.actionUrl && data.actionText && (
          <Button
            variant="link"
            className="p-0 h-auto ml-2 underline"
            onClick={() => window.open(data.actionUrl, '_blank')}
          >
            {data.actionText}
          </Button>
        )}
      </AlertDescription>
      {data.dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
