// server/src/services/UniversityBlockService.ts
import prisma from '../lib/prisma';
import { MicroContent } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CANONICAL_FIELD_MAP, DRAFT_COLUMNS, HARD_BLOCK_TYPES } from '../lib/constants/blockMappings';
import { SCALAR_FIELD_TO_CACHE_TAG } from '../lib/constants/cacheTags';
import { validateBlockPayload } from '../validation/microContentSchemas';
import { ClaimService } from './ClaimService';
import { UniversityProfileService } from './UniversityProfileService';
import MediaService from './MediaService';

// Simplified payload type based on what the frontend MicroContentManager sends
interface MicroContentUpdatePayload {
  blockType: string;
  universityId: string;
  title: string;
  data: Record<string, any>;
  priority: number;
  id?: string;
  userId?: string; // NEW: For claim creation in approval workflow (Scenario 4)
  templateId?: string; // NEW (Prompt 14): ID of GlobalBlockTemplate for instantiation
}

export class UniversityBlockService {

  /**
   * Main entry point for all block updates (create or update).
   * Determines if the block is a Hard/Canonical writer or a Soft/JSONB writer.
   * Enforces permissions and canonical mapping rules.
   * 
   * MODIFIED: Uses granular cache invalidation based on updated fields.
   */
  public static async updateBlock(
    payload: MicroContentUpdatePayload,
    userRole: 'ADMIN' | 'UNIVERSITY_ADMIN' | 'USER',
    userId?: string
  ): Promise<MicroContent> {
    // STEP 0: SECURITY & INTEGRITY - Dynamic Schema Validation (P19)
    try {
      // This validates the structure and the content of 'data' field
      payload = validateBlockPayload(payload) as MicroContentUpdatePayload;
    } catch (error) {
      if (error instanceof AppError) {
        // AppError is thrown by the validation utility for 400 errors
        throw error;
      }
      // Catch unexpected Zod or parsing errors
      throw new AppError(500, 'Internal validation failed during block processing.');
    }

    const isCanonicalWriter = !!CANONICAL_FIELD_MAP[payload.blockType];
    const isSuperAdmin = userRole === 'ADMIN';

    let block: MicroContent;
    let updatedFields: string[] = [];

    const university = await prisma.university.findUnique({
      where: { id: payload.universityId },
      select: { slug: true }
    });
    
    const universitySlug = university?.slug;
    if (!universitySlug) {
      throw new AppError(404, 'University not found.');
    }

    if (isCanonicalWriter) {
      // 1. Hard Block Logic (Updates University Scalar Columns)
      // This is where the calculation and double-write to Draft columns happens.
      // For approval workflow, pass userId to enable claim creation
      const result = await this.updateCanonicalBlock(payload, isSuperAdmin, userId);
      block = result.block;
      updatedFields = result.updatedFields;
      
      // NEW: If writing to the canonical live column, use GRANULAR invalidation
      if (updatedFields.length > 0) {
        await UniversityProfileService.invalidateProfileCache(universitySlug, updatedFields);
      }
    } else {
      // 2. Soft Block Logic (Updates MicroContent JSONB)
      block = await this.updateSoftBlock(payload);
      // Soft blocks always invalidate the general 'microcontent' tag and 'canonical' tag
      await UniversityProfileService.invalidateProfileCache(universitySlug, []);
    }

    return block;
  }
  
  /**
   * Handles the creation and updates for soft (JSONB) content blocks.
   * This is mostly standard CRUD on the MicroContent table.
   * 
   * NEW (Prompt 12): Resolves media IDs to URLs for blocks that reference media.
   * NEW (Prompt 14): Handles template instantiation - if templateId provided on creation,
   * fetches the template and uses its data/blockType as foundation for new block.
   */
  private static async updateSoftBlock(payload: MicroContentUpdatePayload): Promise<MicroContent> {
    let { id, universityId, blockType, title, data, priority, templateId } = payload;
    
    // Integrity Check: Cannot use a Hard Block type as a Soft Block
    if (HARD_BLOCK_TYPES.includes(blockType)) {
      throw new AppError(400, `Block type ${blockType} must be managed as a Canonical Block.`);
    }

    let blockData = data;
    let blockTypeToUse = blockType;
    let templateIdToUse = templateId;

    // STEP 1 (Prompt 14): Handle Template Instantiation
    // If creating a new block from a template, fetch template and use its data/blockType
    if (!id && templateId) {
      const template = await (prisma as any).globalBlockTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new AppError(404, 'Template not found for instantiation.');
      }

      // Use the template's properties as the foundation for the new MicroContent record
      blockData = template.data;
      blockTypeToUse = template.blockType;
      templateIdToUse = templateId;

      // Use template's name only if user didn't provide a custom title
      if (!title || title === '') {
        title = template.name;
      }
    }

    // NEW (Prompt 12): Resolve media IDs to URLs for media blocks
    let processedData = blockData;
    if (blockTypeToUse === 'image_showcase' && blockData.mediaId) {
      const imageUrl = await MediaService.getMediaUrlById(blockData.mediaId);
      if (imageUrl) {
        processedData = { ...blockData, imageUrl };
      }
    } else if (blockTypeToUse === 'video_embed' && blockData.mediaId) {
      const videoUrl = await MediaService.getMediaUrlById(blockData.mediaId);
      if (videoUrl) {
        processedData = { ...blockData, videoUrl };
      }
    }

    const hardBlockMetadata = {
      isHard: HARD_BLOCK_TYPES.includes(blockTypeToUse),
      canonicalMapping: CANONICAL_FIELD_MAP[blockTypeToUse] ? blockTypeToUse : null,
    };
    
    if (id) {
      // Update existing soft block
      return prisma.microContent.update({
        where: { id },
        data: {
          universityId,
          blockType: blockTypeToUse,
          title,
          data: processedData,
          priority,
          ...(templateIdToUse && { templateId: templateIdToUse }),
          ...hardBlockMetadata,
        },
      });
    } else {
      // Create new soft block (may be from template instantiation)
      return prisma.microContent.create({
        data: {
          universityId,
          blockType: blockTypeToUse,
          title,
          data: processedData,
          priority,
          ...(templateIdToUse && { templateId: templateIdToUse }),
          ...hardBlockMetadata,
        },
      });
    }
  }

  /**
   * Performs data transformations and calculations specific to Admissions Data.
   * Calculates acceptanceRate and derived average scores before saving to University columns.
   */
  private static calculateAdmissionsData(data: Record<string, any>): Record<string, any> {
    const updateData: Record<string, any> = {};

    // 1. Acceptance Rate Calculation (Accepts raw inputs, yields scalar column)
    const applications = data.totalApplications;
    const accepted = data.totalAccepted;
    if (typeof applications === 'number' && typeof accepted === 'number' && applications > 0) {
      updateData.acceptanceRate = accepted / applications;
    }
    
    // 2. SAT Score Derivation (Accepts percentile inputs, yields average)
    const math25 = data.satMath25;
    const math75 = data.satMath75;
    const verbal25 = data.satVerbal25;
    const verbal75 = data.satVerbal75;
    
    if (typeof math25 === 'number' && typeof math75 === 'number' && typeof verbal25 === 'number' && typeof verbal75 === 'number') {
      const avgMath = (math25 + math75) / 2;
      const avgVerbal = (verbal25 + verbal75) / 2;
      updateData.avgSatScore = Math.round(avgMath + avgVerbal); // Update derived column
    }

    // 3. ACT Score Derivation (Accepts percentile inputs, yields average)
    const act25 = data.actComposite25;
    const act75 = data.actComposite75;
    if (typeof act25 === 'number' && typeof act75 === 'number') {
      updateData.avgActScore = Math.round((act25 + act75) / 2); // Update derived column
    }
    
    // 4. Direct mapping for remaining inputs (GPA, Percentiles)
    // These values are taken directly from the block data and are the canonical inputs
    // The `updateCanonicalBlock` function will handle the write to the live or draft column
    for (const key of ['minGpa', 'avgGpa', 'satMath25', 'satMath75', 'satVerbal25', 'satVerbal75', 'actComposite25', 'actComposite75']) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    return updateData;
  }

  /**
   * Performs data transformations and calculations specific to Financial Data.
   * Calculates In-State/Out-State Tuition, Room/Board, and Cost of Living.
   */
  private static calculateFinancialsData(data: Record<string, any>): Record<string, any> {
    const updateData: Record<string, any> = {};

    // 1. Calculate Tuition and Fees
    const inStateTuition = data.inStateTuition || 0;
    const outStatePremium = data.outStateTuitionPremium || 0;
    const fees = data.feesAndInsurance || 0;
    const books = data.booksAndSuppliesEstimate || 0;
    const misc = data.miscPersonalEstimate || 0;

    // Calculate Canonical Values
    const calculatedTuitionInState = Math.round(inStateTuition + fees);
    const calculatedTuitionOutState = Math.round(inStateTuition + outStatePremium + fees);
    
    const housing = data.onCampusHousing || 0; // Use on-campus as canonical for roomAndBoard if present
    const mealPlan = data.mealPlanCost || 0;
    const calculatedRoomAndBoard = Math.round(housing + mealPlan);
    
    const calculatedBooksAndSupplies = Math.round(books);
    
    // Total Cost of Attendance (Cost of Living) = OutState Tuition + Room/Board + Books + Misc
    const calculatedCostOfLiving = Math.round(
      calculatedTuitionOutState + 
      calculatedRoomAndBoard + 
      calculatedBooksAndSupplies + 
      misc
    );
    
    // Map to Canonical Field Names
    updateData.tuitionInState = calculatedTuitionInState;
    updateData.tuitionOutState = calculatedTuitionOutState;
    updateData.tuitionInternational = calculatedTuitionOutState; // Assuming International = OutState base
    updateData.roomAndBoard = calculatedRoomAndBoard;
    updateData.booksAndSupplies = calculatedBooksAndSupplies;
    updateData.costOfLiving = calculatedCostOfLiving;
    
    return updateData;
  }

  /**
   * Performs data transformations and lookups specific to Geographic Data.
   * - Simulates Geocoding (Address -> Lat/Long).
   * - Simulates Climate/Airport/Region lookups based on coordinates and city.
   * 
   * NEW (Prompt 13): Geographic & Physical Data - Third major Canonical Writer block.
   */
  private static async calculateGeographicData(data: Record<string, any>): Promise<Record<string, any>> {
    const updateData: Record<string, any> = { ...data };

    const fullAddress = `${data.address}, ${data.city}, ${data.state}, ${data.country}`;

    // 1. Geocoding Simulation (Async operation)
    // In a real system, GeocodingService.geocode(fullAddress) returns { lat, lng }
    let calculatedLat = 0;
    let calculatedLng = 0;

    // MOCKING EXTERNAL LOOKUP (Replace with real service call in production)
    if (data.city && data.country) {
      // Simple deterministic mock using city name length for reproducible coordinates
      const cityHash = (data.city?.length ?? 0) * 0.01;
      calculatedLat = 34 + cityHash; // Mock Latitude (around 34°N, typical US latitude)
      calculatedLng = -118 + cityHash; // Mock Longitude (around -118°W, typical US longitude)
    }
    // END MOCK

    if (calculatedLat !== 0 && calculatedLng !== 0) {
      updateData.latitude = calculatedLat;
      updateData.longitude = calculatedLng;

      // 2. Climate Zone Lookup (Requires Lat/Long)
      // In a real system, ClimateService.getZone(lat, lng) returns string like 'TEMPERATE', 'SUBTROPICAL', etc.
      // MOCKING EXTERNAL LOOKUP (Use simple deterministic logic based on latitude)
      updateData.climateZone = calculatedLat > 40 ? 'TEMPERATE' : 'SUBTROPICAL';
      // END MOCK
      
      // 3. Nearest Airport Lookup (Requires Lat/Long or City)
      // If the block provided an airport code, use it; otherwise, look up based on city
      updateData.nearestAirport = data.nearestAirportCode || `${(data.city || '').toUpperCase().substring(0, 3)}I`; // Mock IATA code
      
      // 4. Region Lookup (Derived from state, e.g., 'NORTHEAST', 'MIDWEST', 'SOUTH', 'WEST')
      updateData.region = data.state || 'UNSPECIFIED'; // In production, map state to region
    }
    
    // Direct mapping for remaining inputs (campusSizeAcres)
    if (data.campusSizeAcres !== undefined) {
      updateData.campusSizeAcres = data.campusSizeAcres;
    }

    return updateData;
  }

  /**
   * Processes Outcome Metrics data.
   * Ensures percentages are correctly scaled (expected 0.0 - 1.0 from Zod).
   * 
   * NEW (Prompt 21): Outcome Metrics - Final major Canonical Writer block.
   */
  private static calculateOutcomeMetrics(data: Record<string, any>): Record<string, any> {
    const updateData: Record<string, any> = {};

    // 1. Direct mapping for percentage-based outcomes
    if (data.graduationRate !== undefined) {
      updateData.graduationRate = data.graduationRate;
    }
    if (data.retentionRate !== undefined) {
      updateData.retentionRate = data.retentionRate;
    }
    if (data.employmentRate !== undefined) {
      updateData.employmentRate = data.employmentRate;
    }
    
    // 2. Direct mapping for salary (assumed to be a raw integer amount)
    if (data.averageStartingSalary !== undefined) {
      updateData.averageStartingSalary = data.averageStartingSalary;
    }
    
    // NOTE: ROIPercentage is calculated by the daily SyncService (P16), not here.

    return updateData;
  }

  /**
   * Processes Media IDs in block data and resolves them to URLs for database storage.
   * This is essential because the database stores resolved URLs (logoUrl, heroImageUrl),
   * while the block stores Media IDs for easy asset replacement.
   * 
   * NEW (Prompt 12): Handles media ID lookup and URL resolution for canonical blocks.
   */
  private static async processMediaFields(data: Record<string, any>): Promise<Record<string, any>> {
    const updateData: Record<string, any> = { ...data };

    // Resolve Canonical Media IDs to URLs
    if (updateData.logoMediaId) {
      const logoUrl = await MediaService.getMediaUrlById(updateData.logoMediaId);
      if (logoUrl) {
        updateData.logoUrl = logoUrl;
      } else {
        console.warn(`[UniversityBlockService] Logo media ID ${updateData.logoMediaId} could not be resolved`);
      }
    }

    if (updateData.heroImageMediaId) {
      const heroImageUrl = await MediaService.getMediaUrlById(updateData.heroImageMediaId);
      if (heroImageUrl) {
        updateData.heroImageUrl = heroImageUrl;
      } else {
        console.warn(`[UniversityBlockService] Hero image media ID ${updateData.heroImageMediaId} could not be resolved`);
      }
    }

    return updateData;
  }

  /**
   * Processes a block's data, applying transformations (calculations, media resolution, etc.)
   * before persisting to the database.
   * 
   * NEW (Prompt 12): Integrates media processing for blocks that use Media IDs.
   */
  private static async processBlockData(
    blockType: string,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    let processedData = data;

    // Apply type-specific processing
    if (blockType === 'admissions_range_meter') {
      processedData = this.calculateAdmissionsData(processedData);
    } else if (blockType === 'cost_breakdown_chart') {
      processedData = this.calculateFinancialsData(processedData);
    } else if (blockType === 'institutional_profile') {
      // Resolve media IDs to URLs for institutional profile blocks
      processedData = await this.processMediaFields(processedData);
    } else if (blockType === 'geographic_physical') {
      // NEW (Prompt 13): Geocoding and geographic lookups
      processedData = await this.calculateGeographicData(processedData);
    } else if (blockType === 'outcome_metrics') {
      // NEW (Prompt 21): Outcome Metrics processing
      processedData = this.calculateOutcomeMetrics(processedData);
    }

    return processedData;
  }

  /**
   * Duplicates a source block to a list of target universities.
   * Only allows duplication of Soft Blocks (non-canonical).
   * PROMPT 20: Multi-Block Batch Management
   */
  public static async duplicateBlockToUniversities(
    sourceBlockId: string,
    targetUniversityIds: string[]
  ): Promise<MicroContent[]> {
    // 1. Fetch source block
    const sourceBlock = await prisma.microContent.findUnique({
      where: { id: sourceBlockId },
    });

    if (!sourceBlock) {
      throw new AppError(404, 'Source block not found.');
    }

    // 2. Integrity Check: Prevent duplicating Hard/Canonical Blocks
    if (sourceBlock.isHard || HARD_BLOCK_TYPES.includes(sourceBlock.blockType)) {
      throw new AppError(403, 'Cannot bulk duplicate Canonical/Hard Blocks. Please use templates for Hard Block standardization.');
    }

    // 3. Prepare data for insertion
    const dataToCreate = targetUniversityIds.map(uniId => ({
      universityId: uniId,
      blockType: sourceBlock.blockType,
      title: `[COPY] ${sourceBlock.title}`,
      data: sourceBlock.data as any,
      priority: 999, // Place new blocks at the bottom
      isHard: false,
      canonicalMapping: null as any,
      templateId: sourceBlock.templateId || undefined, // Maintain template link if applicable
    }));

    // 4. Perform bulk insertion
    const createdBlocks = await prisma.microContent.createManyAndReturn({
      data: dataToCreate,
    });

    // 5. Invalidate cache for ALL affected universities (Performance P18)
    const affectedSlugs = await prisma.university.findMany({
      where: { id: { in: targetUniversityIds } },
      select: { slug: true },
    });

    const slugList = affectedSlugs.map(u => u.slug);
    for (const slug of slugList) {
      // Soft block change invalidates the MicroContent tag (P18)
      await UniversityProfileService.invalidateProfileCache(slug, []);
    }

    return createdBlocks;
  }

  /**
   * Deletes a list of micro-content blocks in a single transaction.
   * Prevents deletion of Hard Blocks.
   * PROMPT 20: Multi-Block Batch Management
   */
  public static async bulkDeleteBlocks(blockIds: string[]): Promise<number> {
    // 1. Integrity Check: Ensure no Hard Blocks are in the selection
    const hardBlocks = await prisma.microContent.findMany({
      where: { id: { in: blockIds }, isHard: true },
      select: { id: true, university: { select: { slug: true } } },
    });

    if (hardBlocks.length > 0) {
      throw new AppError(403, 'Cannot delete Hard Blocks in bulk. Please deselect required Canonical Blocks.');
    }

    // 2. Identify slugs for cache invalidation BEFORE deletion
    const affectedUniversities = await prisma.university.findMany({
      where: { microContent: { some: { id: { in: blockIds } } } },
      select: { slug: true },
    });
    const slugsToInvalidate = affectedUniversities.map(u => u.slug);

    // 3. Perform bulk deletion
    const result = await prisma.microContent.deleteMany({
      where: { id: { in: blockIds } },
    });

    // 4. Invalidate cache for all affected universities (P18)
    for (const slug of slugsToInvalidate) {
      await UniversityProfileService.invalidateProfileCache(slug, []);
    }

    return result.count;
  }

  /**
   * Handles updates for Canonical Writer blocks.
   * Updates the main table (University) and the MicroContent table.
   * MODIFIED: Captures the list of fields written to the live column
   */
  private static async updateCanonicalBlock(
    payload: MicroContentUpdatePayload,
    isSuperAdmin: boolean,
    userId?: string
  ): Promise<{ block: MicroContent; updatedFields: string[] }> {
    const { id, universityId, blockType, title, data, priority } = payload;
    const mappedFields = CANONICAL_FIELD_MAP[blockType];
    
    if (!mappedFields) {
      throw new AppError(500, `Block type ${blockType} is not configured as a Canonical Writer.`);
    }
    
    const universityUpdateData: Record<string, any> = {};
    const hasDrafts = !isSuperAdmin;
    const fieldsUpdatedLive: string[] = []; // NEW: Track fields updated in LIVE column
    const proposedChanges: Array<{
      field: string;
      oldValue: string | number | null;
      newValue: string | number | null;
    }> = []; // NEW: Track changes for claim creation

    // NEW STEP: Data Calculation and Transformation (Prompt 12: Now includes media processing)
    let finalPayloadData = await this.processBlockData(blockType, data);
    // NOTE: Future Hard Blocks will have their own dedicated calculation functions in processBlockData().

    // NEW: Fetch current University data to compare for changes
    const currentUniversityData = await prisma.university.findUnique({
      where: { id: universityId },
      select: mappedFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    }) as Record<string, any> | null;

    // STEP 1: Process calculated/mapped data and route to Draft or Live columns
    for (const field of Object.keys(finalPayloadData)) { // Iterate over derived fields
      const value = finalPayloadData[field];
      if (value !== undefined) {
        // Only proceed if the field is one of the Canonical targets for this block type
        if (mappedFields.includes(field)) {
          const currentValue = currentUniversityData?.[field] ?? null;

          if (DRAFT_COLUMNS.includes(field) && hasDrafts) {
            // SCENARIO 4: Write to Draft column (Approval Workflow)
            universityUpdateData[`${field}Draft`] = value;
            
            // Track the change if the proposed value differs from current live value
            if (currentValue !== value) {
              proposedChanges.push({
                field,
                oldValue: currentValue,
                newValue: value,
              });
            }
          } else {
            // SUPER-ADMIN OR NON-DRAFT FIELD: Write directly to Live column
            universityUpdateData[field] = value;
            fieldsUpdatedLive.push(field); // TRACK LIVE UPDATE
          }
        }
      }
    }
    
    // STEP 2: Execute the University table update
    await prisma.university.update({
      where: { id: universityId },
      data: universityUpdateData,
    });

    // STEP 3: Create Claim if changes were made by a non-Super Admin (Scenario 4)
    if (proposedChanges.length > 0 && hasDrafts && userId) {
      try {
        await ClaimService.createDataUpdateClaim(
          userId,
          universityId,
          proposedChanges,
          title
        );
      } catch (err) {
        // Log claim creation error but don't fail the update
        console.error('Failed to create data update claim:', err);
      }
    }
    
    // STEP 4: Ensure the MicroContent record exists/is updated (Visual representation of the hard data)
    const microContentData = {
      universityId,
      blockType,
      title,
      data: payload.data, // NOTE: We save the raw inputs (payload.data), not the calculated results.
      priority,
      isHard: true,
      canonicalMapping: blockType,
    };

    let block: MicroContent;
    if (id) {
      block = await prisma.microContent.update({
        where: { id },
        data: microContentData,
      });
    } else {
      block = await prisma.microContent.create({
        data: microContentData,
      });
    }

    // MODIFIED RETURN
    return { block, updatedFields: fieldsUpdatedLive };
  }
}
