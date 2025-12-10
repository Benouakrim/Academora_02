// client/src/components/blocks/CallToActionBlock.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';
import type { CallToActionBlock as CallToActionBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: CallToActionBlockType;
  isPreview?: boolean;
}

export default function CallToActionBlock({ block, isPreview = false }: Props) {
  const { data } = block;

  const handleClick = () => {
    if (isPreview) return;
    if (data.openInNewTab) {
      window.open(data.url, '_blank');
    } else {
      window.location.href = data.url;
    }
  };

  const variants: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">{block.title}</h3>
        {data.description && (
          <p className="text-gray-600 mb-6">{data.description}</p>
        )}
        <Button
          size="lg"
          className={`${variants[data.style]} font-semibold px-8 py-6 text-lg`}
          onClick={handleClick}
          disabled={isPreview}
        >
          {data.buttonText}
          {data.openInNewTab ? (
            <ExternalLink className="ml-2 h-5 w-5" />
          ) : (
            <ArrowRight className="ml-2 h-5 w-5" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
