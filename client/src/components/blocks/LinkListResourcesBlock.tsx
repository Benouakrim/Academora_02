// client/src/components/blocks/LinkListResourcesBlock.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import type { LinkListResourcesBlock as LinkListResourcesBlockType } from '@/../../shared/types/microContentBlocks';

interface Props {
  block: LinkListResourcesBlockType;
  isPreview?: boolean;
}

export default function LinkListResourcesBlock({ block }: Props) {
  const { data } = block;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        {data.description && (
          <p className="text-sm text-gray-600 mt-2">{data.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(data.links ?? []).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0 group-hover:text-blue-700" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                  {link.title}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </h4>
                {link.description && (
                  <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
