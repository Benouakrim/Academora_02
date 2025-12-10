// client/src/components/blocks/BlockRenderer.tsx
import React from 'react';
import { MicroContentBlock } from '@/../../shared/types/microContentBlocks';
import * as Blocks from './index';

interface BlockRendererProps {
  block: MicroContentBlock;
  isPreview?: boolean;
}

export default function BlockRenderer({ block, isPreview = false }: BlockRendererProps) {
  switch (block.type) {
    case 'deadline_card':
      return <Blocks.DeadlineCardBlock block={block} isPreview={isPreview} />;
    case 'announcement_banner':
      return <Blocks.AnnouncementBannerBlock block={block} isPreview={isPreview} />;
    case 'checklist':
      return <Blocks.ChecklistBlock block={block} isPreview={isPreview} />;
    case 'key_stat_card':
      return <Blocks.KeyStatCardBlock block={block} isPreview={isPreview} />;
    case 'rich_text_block':
      return <Blocks.RichTextBlock block={block} isPreview={isPreview} />;
    case 'call_to_action':
      return <Blocks.CallToActionBlock block={block} isPreview={isPreview} />;
    case 'timeline_roadmap':
      return <Blocks.TimelineRoadmapBlock block={block} isPreview={isPreview} />;
    case 'testimonial_quote':
      return <Blocks.TestimonialQuoteBlock block={block} isPreview={isPreview} />;
    case 'image_showcase':
      return <Blocks.ImageShowcaseBlock block={block} isPreview={isPreview} />;
    case 'video_embed':
      return <Blocks.VideoEmbedBlock block={block} isPreview={isPreview} />;
    case 'faq_accordion':
      return <Blocks.FAQAccordionBlock block={block} isPreview={isPreview} />;
    case 'comparison_metric':
      return <Blocks.ComparisonMetricBlock block={block} isPreview={isPreview} />;
    case 'contact_box':
      return <Blocks.ContactBoxBlock block={block} isPreview={isPreview} />;
    case 'link_list_resources':
      return <Blocks.LinkListResourcesBlock block={block} isPreview={isPreview} />;
    case 'quick_poll_survey':
      return <Blocks.QuickPollSurveyBlock block={block} isPreview={isPreview} />;
    case 'cost_breakdown_chart':
      return <Blocks.CostBreakdownChartBlock block={block} isPreview={isPreview} />;
    case 'admissions_range_meter':
      return <Blocks.AdmissionsRangeMeterBlock block={block} isPreview={isPreview} />;
    case 'campus_map_poi':
      return <Blocks.CampusMapPOIBlock block={block} isPreview={isPreview} />;
    case 'badge_requirement':
      return <Blocks.BadgeRequirementBlock block={block} isPreview={isPreview} />;
    case 'scholarship_spotlight':
      return <Blocks.ScholarshipSpotlightBlock block={block} isPreview={isPreview} />;
    default: {
      const unknownBlock = block as { type: string };
      return (
        <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">
            Unknown block type: {unknownBlock.type}
          </p>
        </div>
      );
    }
  }
}
