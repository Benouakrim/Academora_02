// client/src/components/blocks/BlockRenderer.tsx
import React from 'react';
import { MicroContentBlock, UserFitMeterBlock, CampusMapPOIBlock, ContactBoxBlock, HistoricalTrendsBlock } from '@/../../shared/types/microContentBlocks';
import * as Blocks from './index';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

// NEW IMPORTS for shared UI components
import ChecklistDisplay from '@/components/smart-blocks/ChecklistDisplay';
import TimelineDisplay from '@/components/smart-blocks/TimelineDisplay';
import KeyStatDisplay from '@/components/smart-blocks/KeyStatDisplay';
import UserFitMeterDisplay from '@/components/smart-blocks/UserFitMeterDisplay';
import HistoryChartDisplay from '@/components/smart-blocks/HistoryChartDisplay'; // NEW (P30): Historical trends component
import MapDisplay from '@/components/smart-blocks/MapDisplay'; // NEW (P23): Map display component
import { Mail, Phone, MapPin, Building } from 'lucide-react'; // NEW (P23): Icons for contact box

interface BlockRendererProps {
  block: MicroContentBlock;
  isPreview?: boolean;
  // Props: Pass the Canonical Profile and User Profile data to the renderer
  universityProfile?: Record<string, string | number | boolean | null | undefined>; // Full University scalar data
  userProfile?: Record<string, string | number | boolean | null | undefined>;       // User profile data
  // NEW PROPS: Context for tracking
  entityId?: string;       // ID of the university/article
  entityType?: 'university' | 'article'; // Type of entity
}

export default function BlockRenderer({ 
  block, 
  isPreview = false, 
  universityProfile = {}, 
  userProfile = {},
  entityId,
  entityType
}: BlockRendererProps) {
  const { trackBlockInteraction } = useAnalyticsTracking();
  
  // Create a context-aware tracking function to pass down to interactive blocks
  const blockTracker = (eventType: string, metadata: Record<string, unknown> = {}) => {
    if (block.id && entityId && entityType) {
      trackBlockInteraction({
        blockId: block.id,
        blockType: block.type,
        eventType,
        metadata,
        entityId,
        entityType,
      });
    }
  };

  switch (block.type) {
    case 'deadline_card':
      return <Blocks.DeadlineCardBlock block={block} isPreview={isPreview} />;
    case 'announcement_banner':
      return <Blocks.AnnouncementBannerBlock block={block} isPreview={isPreview} />;
    case 'checklist':
      // REPLACED by using the shared display component
      return (
        <ChecklistDisplay
          title={block.title}
          description={block.data.description}
          items={(block.data.items ?? []).map(item => ({...item, completed: !!item.completed}))} // Map to shared prop format
          isInteractive={!isPreview && block.data.allowUserCompletion} // Only interactive if not a preview and allowed
          onItemToggle={(itemId: string, completed: boolean) => {
            // Track checklist toggles
            blockTracker('block_checklist_toggle', { itemId, completed });
          }}
        />
      );
    case 'key_stat_card':
      // REPLACED by using the shared display component
      return (
        <KeyStatDisplay
          value={block.data.value}
          unit={block.data.unit}
          label={block.data.label}
          description={block.data.description}
          trend={block.data.trend}
          trendValue={block.data.trendValue}
        />
      );
    case 'rich_text_block':
      return <Blocks.RichTextBlock block={block} isPreview={isPreview} />;
    case 'call_to_action':
      return <Blocks.CallToActionBlock block={block} isPreview={isPreview} />;
    case 'timeline_roadmap':
      // REPLACED by using the shared display component
      return (
        <TimelineDisplay
          title={block.title}
          description={block.data.description}
          steps={block.data.steps ?? []}
        />
      );
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
    case 'contact_box': {
      const contactBlock = block as ContactBoxBlock;
      return (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 shadow-sm">
          <h4 className="font-bold text-lg mb-3 text-gray-900">{block.title || 'Contact Information'}</h4>
          
          <div className="space-y-2 text-sm">
            {contactBlock.data.department && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Department:</strong> {contactBlock.data.department}
                </span>
              </div>
            )}
            
            {contactBlock.data.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <a href={`mailto:${contactBlock.data.email}`} className="text-blue-600 hover:underline">
                  {contactBlock.data.email}
                </a>
              </div>
            )}
            
            {contactBlock.data.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <a href={`tel:${contactBlock.data.phone}`} className="text-blue-600 hover:underline">
                  {contactBlock.data.phone}
                </a>
              </div>
            )}
            
            {contactBlock.data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">{contactBlock.data.location}</span>
              </div>
            )}
            
            {contactBlock.data.officeHours && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <p className="text-gray-700">
                  <strong>Office Hours:</strong> {contactBlock.data.officeHours}
                </p>
              </div>
            )}
            
            {contactBlock.data.additionalInfo && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <p className="text-gray-700">{contactBlock.data.additionalInfo}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'link_list_resources':
      return <Blocks.LinkListResourcesBlock block={block} isPreview={isPreview} />;
    case 'quick_poll_survey':
      return (
        <Blocks.QuickPollSurveyBlock 
          block={block} 
          isPreview={isPreview}
          onInteraction={blockTracker}
        />
      );
    case 'cost_breakdown_chart':
      return <Blocks.CostBreakdownChartBlock block={block} isPreview={isPreview} />;
    case 'admissions_range_meter':
      return <Blocks.AdmissionsRangeMeterBlock block={block} isPreview={isPreview} />;
    case 'campus_map_poi': {
      const mapBlock = block as CampusMapPOIBlock;
      return (
        <MapDisplay
          name={mapBlock.data.name}
          description={mapBlock.data.description}
          latitude={mapBlock.data.latitude}
          longitude={mapBlock.data.longitude}
          zoom={mapBlock.data.zoom}
          isInteractive={isPreview} // Interactive only in editor preview
        />
      );
    }
    case 'badge_requirement':
      return <Blocks.BadgeRequirementBlock block={block} isPreview={isPreview} />;
    case 'scholarship_spotlight':
      return <Blocks.ScholarshipSpotlightBlock block={block} isPreview={isPreview} />;
    case 'user_fit_meter':
      // Case for the INVERSE BLOCK (Engagement/Personalization)
      // Ensure both profiles are available for this block to function
      if (!universityProfile || !userProfile) return null;

      return (
        <UserFitMeterDisplay
          block={block as UserFitMeterBlock}
          universityProfile={universityProfile}
          userProfile={userProfile}
        />
      );
    case 'historical_trends':
      // NEW (P30): Historical Trends Visualization
      // Displays time-series data from UniversityMetricHistory
      // Requires universityId (from entityId) to fetch data
      if (!entityId) return null;

      return (
        <HistoryChartDisplay
          block={block as HistoricalTrendsBlock}
          universityId={entityId}
          userProfile={userProfile}
        />
      );
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
