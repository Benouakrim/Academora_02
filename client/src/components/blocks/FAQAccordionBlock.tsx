// client/src/components/blocks/FAQAccordionBlock.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import type { FAQAccordionBlock as FAQAccordionBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: FAQAccordionBlockType;
  isPreview?: boolean;
}

export default function FAQAccordionBlock({ block }: Props) {
  const { data } = block;
  const [isOpen, setIsOpen] = useState(data.defaultOpen || false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-gray-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="font-semibold text-left">{data.question}</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </Button>
          {isOpen && (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700">{data.answer}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
