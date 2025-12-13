// shared/types/microContentBlocks.ts
// Type definitions for all micro-content block types

// NEW TYPE: Role-based access restriction for blocks
export type BlockAccessRole = 'ADMIN_ONLY' | 'UNIVERSITY_ADMIN_PLUS';

export type BlockType = 
  | 'deadline_card'
  | 'announcement_banner'
  | 'checklist'
  | 'key_stat_card'
  | 'rich_text_block'
  | 'call_to_action'
  | 'timeline_roadmap'
  | 'testimonial_quote'
  | 'image_showcase'
  | 'video_embed'
  | 'faq_accordion'
  | 'comparison_metric'
  | 'contact_box'
  | 'link_list_resources'
  | 'quick_poll_survey'
  | 'cost_breakdown_chart'
  | 'admissions_range_meter'
  | 'campus_map_poi'
  | 'badge_requirement'
  | 'scholarship_spotlight'
  | 'user_fit_meter'
  | 'geographic_physical'
  | 'outcome_metrics'
  | 'historical_trends'; // NEW (Prompt 30) - Historical Trends Visualization

// Base block interface
export interface BaseBlock {
  id?: string;
  type: BlockType;
  title: string;
  priority?: number;
  templateId?: string; // NEW (Prompt 14): ID of the GlobalBlockTemplate used to create this block
  accessRole?: BlockAccessRole; // NEW (P27): Role restriction for visibility/editing access. ADMIN_ONLY = Super Admins only. UNIVERSITY_ADMIN_PLUS = visible to all editors.
}

// 1. Deadline Card
export interface DeadlineCardBlock extends BaseBlock {
  type: 'deadline_card';
  data: {
    label: string;
    deadline: string; // ISO date string
    description?: string;
    showCountdown: boolean;
    icon?: string;
  };
}

// 2. Announcement Banner
export interface AnnouncementBannerBlock extends BaseBlock {
  type: 'announcement_banner';
  data: {
    message: string;
    severity: 'info' | 'warning' | 'success' | 'error';
    dismissible: boolean;
    expiresAt?: string; // ISO date string
    actionText?: string;
    actionUrl?: string;
  };
}

// 3. Checklist
export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  data: {
    description?: string;
    items: Array<{
      id: string;
      text: string;
      completed?: boolean;
    }>;
    allowUserCompletion: boolean;
  };
}

// 4. Key Stat Card
export interface KeyStatCardBlock extends BaseBlock {
  type: 'key_stat_card';
  data: {
    value: number | string;
    unit?: string;
    label: string;
    description?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  };
}

// 5. Rich Text Block
export interface RichTextBlock extends BaseBlock {
  type: 'rich_text_block';
  data: {
    content: string; // HTML or Markdown
    format: 'html' | 'markdown';
  };
}

// 6. Call to Action (CTA)
export interface CallToActionBlock extends BaseBlock {
  type: 'call_to_action';
  data: {
    buttonText: string;
    url: string;
    description?: string;
    style: 'primary' | 'secondary' | 'ghost' | 'outline';
    openInNewTab: boolean;
    icon?: string;
  };
}

// 7. Timeline/Roadmap
export interface TimelineRoadmapBlock extends BaseBlock {
  type: 'timeline_roadmap';
  data: {
    description?: string;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      date?: string; // Optional date for each step
      completed?: boolean;
    }>;
  };
}

// 8. Testimonial/Quote
export interface TestimonialQuoteBlock extends BaseBlock {
  type: 'testimonial_quote';
  data: {
    quote: string;
    author: string;
    authorTitle?: string; // e.g., "Class of 2024" or "Computer Science Major"
    avatarUrl?: string;
    rating?: number; // Optional 1-5 star rating
  };
}

// 9. Image Showcase
export interface ImageShowcaseBlock extends BaseBlock {
  type: 'image_showcase';
  data: {
    mediaId: string; // Canonical reference to Media Library (REQUIRED)
    imageUrl?: string; // Resolved URL from Media Library (auto-populated by server)
    altText: string;
    caption?: string;
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
    clickable: boolean;
    linkUrl?: string;
  };
}

// 10. Video Embed
export interface VideoEmbedBlock extends BaseBlock {
  type: 'video_embed';
  data: {
    mediaId: string; // Canonical reference to Media Library (REQUIRED)
    videoUrl?: string; // Resolved URL from Media Library (auto-populated by server)
    thumbnail?: string; // Optional: custom thumbnail ID or URL
    caption?: string;
    autoplay: boolean;
  };
}

// 11. FAQ Accordion
export interface FAQAccordionBlock extends BaseBlock {
  type: 'faq_accordion';
  data: {
    question: string;
    answer: string;
    defaultOpen: boolean;
  };
}

// 12. Comparison Metric
export interface ComparisonMetricBlock extends BaseBlock {
  type: 'comparison_metric';
  data: {
    metric: string;
    ourValue: number | string;
    comparisonValue: number | string;
    comparisonLabel: string; // e.g., "National Average"
    unit?: string;
    isBetter: boolean; // Whether our value is better
    description?: string;
  };
}

// 13. Contact Box
export interface ContactBoxBlock extends BaseBlock {
  type: 'contact_box';
  data: {
    department: string;
    email?: string;
    phone?: string;
    officeHours?: string;
    location?: string;
    additionalInfo?: string;
  };
}

// 14. Link List/Resources
export interface LinkListResourcesBlock extends BaseBlock {
  type: 'link_list_resources';
  data: {
    description?: string;
    links: Array<{
      id: string;
      title: string;
      url: string;
      description?: string;
      icon?: string;
    }>;
  };
}

// 15. Quick Poll/Survey
export interface QuickPollSurveyBlock extends BaseBlock {
  type: 'quick_poll_survey';
  data: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes?: number;
    }>;
    allowMultiple: boolean;
    showResults: boolean;
  };
}

// 16. Cost Breakdown Chart
export interface CostBreakdownChartBlock extends BaseBlock {
  type: 'cost_breakdown_chart';
  data: {
    // NEW PRIMITIVE INPUTS for Calculation (Data Wizard)
    inStateTuition?: number;          // Base input for in-state tuition
    outStateTuitionPremium?: number;  // Additional cost for out-of-state/international
    feesAndInsurance?: number;        // Mandatory fees
    
    onCampusHousing?: number;         // Cost for housing (on-campus)
    mealPlanCost?: number;            // Cost for food
    
    booksAndSuppliesEstimate?: number; // Books/Supplies for booksAndSupplies scalar
    miscPersonalEstimate?: number;    // Miscellaneous personal expenses
    
    // Display/Utility
    currency: string;
    description?: string;
  };
}

// 17. Admissions Range Meter
export interface AdmissionsRangeMeterBlock extends BaseBlock {
  type: 'admissions_range_meter';
  data: {
    // UI Configuration & Display
    metric: 'gpa' | 'sat' | 'act' | 'acceptance'; // Added 'acceptance' as a display metric
    description?: string;

    // RAW INPUTS (for Acceptance Rate Calculation)
    totalApplications?: number; // New field for calculation input
    totalAccepted?: number;     // New field for calculation input
    
    // SCALAR DATA INPUTS (Directly map to University columns)
    // GPA
    minGpa?: number;
    avgGpa?: number;

    // SAT (25th and 75th percentiles are the canonical inputs)
    satMath25?: number;
    satMath75?: number;
    satVerbal25?: number;
    satVerbal75?: number;
    
    // ACT
    actComposite25?: number;
    actComposite75?: number;
    
    // The calculated/saved acceptanceRate is NOT an input field here, but a result.
  };
}

// 18. Campus Map POI
export interface CampusMapPOIBlock extends BaseBlock {
  type: 'campus_map_poi';
  data: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    zoom?: number;
    markerIcon?: string;
  };
}

// 19. Badge Requirement
export interface BadgeRequirementBlock extends BaseBlock {
  type: 'badge_requirement';
  data: {
    badgeSlug: string;
    badgeName: string;
    description: string;
    icon?: string;
    requirements: string;
    earnedByCount?: number;
  };
}

// 20. Scholarship Spotlight
export interface ScholarshipSpotlightBlock extends BaseBlock {
  type: 'scholarship_spotlight';
  data: {
    scholarshipName: string;
    amount: string;
    description: string;
    eligibility?: string;
    deadline?: string;
    applicationUrl?: string;
    isRenewable: boolean;
    sponsored?: boolean;
  };
}

// 21. User Fit Meter (INVERSE BLOCK - Personalization)
export interface UserFitMeterBlock extends BaseBlock {
  type: 'user_fit_meter';
  data: {
    // Configuration for the metric to be compared against canonical data
    metricToCompare: 'gpa' | 'sat' | 'act' | 'tuition';
    // Display options
    showComparisonText: boolean;
    showNextStepsCta: boolean;
    // Canonical data will be injected from the merged payload
    canonicalValueField: string; // e.g., 'avgGpa'
    canonicalValueLabel: string; // e.g., 'University Average'
    
    // User data keys (used for logic in the component)
    userValueField: string; // e.g., 'gpa' from the user profile
  };
}

// 22. Geographic / Physical Data - Canonical Writer Block (Prompt 13)
export interface GeographicPhysicalBlock extends BaseBlock {
  type: 'geographic_physical';
  data: {
    // RAW INPUTS (Address is the primitive input for geocoding)
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    
    // INPUTS for Physical Details
    campusSizeAcres?: number;
    nearestAirportCode?: string; // e.g., 'LAX'
    
    // DISPLAY CONFIGURATION
    showMap: boolean;
    mapZoomLevel?: number;
    
    // Calculated fields (latitude, longitude, climateZone, nearestAirport, region) 
    // are results of geocoding/lookups, populated by server in University table
  };
}

// 23. Outcome Metrics - Canonical Writer Block (Prompt 21)
export interface OutcomeMetricsBlock extends BaseBlock {
  type: 'outcome_metrics';
  data: {
    // SCALAR DATA INPUTS (Directly map to University columns)
    graduationRate: number;      // 0.0 to 1.0 (Percentage)
    retentionRate: number;       // 0.0 to 1.0 (Percentage)
    employmentRate: number;      // 0.0 to 1.0 (Percentage)
    averageStartingSalary: number; // Raw integer amount
    
    // Auxiliary data (soft inputs not directly used by the engine, but useful for context)
    postGraduationReportUrl?: string; 
    topEmployers?: string[];
    
    // Display configuration
    chartType: 'bar' | 'gauge';
  };
}

// 24. Historical Trends (NEW - Prompt 30)
// Visualizes aggregated, canonical data over time using UniversityMetricHistory
export interface HistoricalTrendsBlock extends BaseBlock {
  type: 'historical_trends';
  data: {
    // The metric to display over time
    metric: 'acceptanceRate' | 'tuitionCost' | 'ranking' | 'employmentRate' | 'avgSalary';
    
    // Time range configuration
    displayYears: number; // How many years of history to display (e.g., 5, 10)
    
    // Visualization style
    chartStyle: 'line' | 'bar' | 'area';
    
    // Optional user comparison feature
    // If true, overlays the user's target value on the chart (e.g., max budget)
    showUserComparison: boolean;
    
    // Display options
    showLegend: boolean;
    showGridLines: boolean;
  };
}

// Union type of all block types
export type MicroContentBlock =
  | DeadlineCardBlock
  | AnnouncementBannerBlock
  | ChecklistBlock
  | KeyStatCardBlock
  | RichTextBlock
  | CallToActionBlock
  | TimelineRoadmapBlock
  | TestimonialQuoteBlock
  | ImageShowcaseBlock
  | VideoEmbedBlock
  | FAQAccordionBlock
  | ComparisonMetricBlock
  | ContactBoxBlock
  | LinkListResourcesBlock
  | QuickPollSurveyBlock
  | CostBreakdownChartBlock
  | AdmissionsRangeMeterBlock
  | CampusMapPOIBlock
  | BadgeRequirementBlock
  | ScholarshipSpotlightBlock
  | UserFitMeterBlock
  | GeographicPhysicalBlock
  | OutcomeMetricsBlock
  | HistoricalTrendsBlock; // ADDED (Prompt 30)

// Helper type for block data
export type BlockDataByType<T extends BlockType> = Extract<MicroContentBlock, { type: T }>['data'];

// Block metadata for UI
export interface BlockMetadata {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: 'content' | 'interactive' | 'data' | 'media' | 'engagement';
}

export const BLOCK_METADATA: Record<BlockType, BlockMetadata> = {
  deadline_card: {
    type: 'deadline_card',
    label: 'Deadline Card',
    description: 'Display critical dates with countdown timer',
    icon: 'Calendar',
    category: 'data'
  },
  announcement_banner: {
    type: 'announcement_banner',
    label: 'Announcement Banner',
    description: 'High-priority, dismissible alert messages',
    icon: 'AlertCircle',
    category: 'content'
  },
  checklist: {
    type: 'checklist',
    label: 'Checklist',
    description: 'Interactive step-by-step list',
    icon: 'CheckSquare',
    category: 'interactive'
  },
  key_stat_card: {
    type: 'key_stat_card',
    label: 'Key Stat Card',
    description: 'Highlight important metrics',
    icon: 'TrendingUp',
    category: 'data'
  },
  rich_text_block: {
    type: 'rich_text_block',
    label: 'Rich Text Block',
    description: 'Formatted text with headings, lists, and links',
    icon: 'FileText',
    category: 'content'
  },
  call_to_action: {
    type: 'call_to_action',
    label: 'Call to Action',
    description: 'Prominent button with link',
    icon: 'MousePointer',
    category: 'interactive'
  },
  timeline_roadmap: {
    type: 'timeline_roadmap',
    label: 'Timeline/Roadmap',
    description: 'Sequential steps or events',
    icon: 'GitBranch',
    category: 'content'
  },
  testimonial_quote: {
    type: 'testimonial_quote',
    label: 'Testimonial/Quote',
    description: 'Student quotes and success stories',
    icon: 'Quote',
    category: 'content'
  },
  image_showcase: {
    type: 'image_showcase',
    label: 'Image Showcase',
    description: 'Display high-quality images',
    icon: 'Image',
    category: 'media'
  },
  video_embed: {
    type: 'video_embed',
    label: 'Video Embed',
    description: 'Embedded video content',
    icon: 'Video',
    category: 'media'
  },
  faq_accordion: {
    type: 'faq_accordion',
    label: 'FAQ Accordion',
    description: 'Collapsible question and answer',
    icon: 'HelpCircle',
    category: 'content'
  },
  comparison_metric: {
    type: 'comparison_metric',
    label: 'Comparison Metric',
    description: 'Compare metrics against averages',
    icon: 'BarChart2',
    category: 'data'
  },
  contact_box: {
    type: 'contact_box',
    label: 'Contact Box',
    description: 'Department contact information',
    icon: 'Phone',
    category: 'content'
  },
  link_list_resources: {
    type: 'link_list_resources',
    label: 'Link List/Resources',
    description: 'Curated list of helpful links',
    icon: 'Link',
    category: 'content'
  },
  quick_poll_survey: {
    type: 'quick_poll_survey',
    label: 'Quick Poll/Survey',
    description: 'Simple question with options',
    icon: 'PieChart',
    category: 'engagement'
  },
  cost_breakdown_chart: {
    type: 'cost_breakdown_chart',
    label: 'Cost Breakdown Chart',
    description: 'Visualize cost components',
    icon: 'DollarSign',
    category: 'data'
  },
  admissions_range_meter: {
    type: 'admissions_range_meter',
    label: 'Admissions Range Meter',
    description: 'GPA/SAT/ACT percentile ranges',
    icon: 'Gauge',
    category: 'data'
  },
  campus_map_poi: {
    type: 'campus_map_poi',
    label: 'Campus Map POI',
    description: 'Point of interest on campus map',
    icon: 'MapPin',
    category: 'media'
  },
  badge_requirement: {
    type: 'badge_requirement',
    label: 'Badge Requirement',
    description: 'Gamification badge prompt',
    icon: 'Award',
    category: 'engagement'
  },
  scholarship_spotlight: {
    type: 'scholarship_spotlight',
    label: 'Scholarship Spotlight',
    description: 'Highlight specific scholarship',
    icon: 'DollarSign',
    category: 'content'
  },
  user_fit_meter: {
    type: 'user_fit_meter',
    label: 'User Fit Meter (Personalized)',
    description: 'Compares student data (GPA, SAT) to university average',
    icon: 'Target',
    category: 'engagement'
  },
  geographic_physical: {
    type: 'geographic_physical',
    label: 'Geographic & Physical Profile',
    description: 'Manages location, size, and climate data for the matching engine.',
    icon: 'MapPin',
    category: 'data'
  },
  outcome_metrics: {
    type: 'outcome_metrics',
    label: 'Student Outcomes & ROI',
    description: 'Manages graduation, retention, and salary metrics for the matching engine.',
    icon: 'Briefcase',
    category: 'data'
  },
  historical_trends: {
    type: 'historical_trends',
    label: 'Historical Trends',
    description: 'Visualize historical performance metrics over time',
    icon: 'TrendingUp',
    category: 'data'
  }
};


