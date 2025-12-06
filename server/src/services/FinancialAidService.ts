import { create, all } from 'mathjs';
import { AppError } from '../utils/AppError';
import { PredictRequest } from '../validation/financialAidSchemas';
import prisma from '../lib/prisma';

const math = create(all, { number: 'BigNumber', precision: 64 });

export class FinancialAidService {
  static async predict(data: PredictRequest, clerkId?: string) {
    const { universityId, residency } = data;

    // --- Fetch User Financial Profile if authenticated ---
    let userProfile = null;
    let user = null;
    if (clerkId) {
      user = await prisma.user.findUnique({
        where: { clerkId },
        include: { financialProfile: true }
      });
      userProfile = user?.financialProfile || null;
    }

    // --- Merge Data: Request > DB Profile/User > Defaults ---
    const familyIncome = data.familyIncome ?? userProfile?.householdIncome ?? 0;
    const gpa = data.gpa ?? user?.gpa ?? 0;
    const satScore = data.satScore ?? user?.satScore ?? undefined;
    const savings = data.savings ?? userProfile?.savings ?? 0;
    const investments = data.investments ?? userProfile?.investments ?? 0;

    const uni = await prisma.university.findUnique({ where: { id: universityId } });
    if (!uni) throw new AppError(404, 'University not found');

    // --- 1. Determine Costs based on Residency ---
    let tuition = uni.tuitionOutState || 50000;
    
    if (residency === 'in-state') {
      tuition = uni.tuitionInState || tuition;
    } else if (residency === 'international') {
      // Use specific international tuition if available, otherwise fallback to out-of-state
      tuition = uni.tuitionInternational || uni.tuitionOutState || 50000;
    }

    const housing = (uni.roomAndBoard || 0) + (uni.costOfLiving || 0);
    const books = uni.booksAndSupplies || 1200;
    const grossCost = tuition + housing + books;

    // --- 2. Check Eligibility (The "Legacy" Logic) ---
    // If international and school doesn't give aid to them, stop calculation early (mostly)
    const isEligibleForAid = residency !== 'international' || uni.scholarshipsIntl;
    
    if (!isEligibleForAid) {
      return {
        tuition,
        housing,
        grossCost,
        efc: grossCost, // You pay full price
        needAid: 0,
        meritAid: 0,
        totalAid: 0,
        netPrice: grossCost,
        breakdown: "This university does not typically offer financial aid to international students.",
        eligibilityWarning: true
      };
    }

    // --- 3. Calculate EFC (Estimated Family Contribution) with Assets ---
    // Income-based EFC (Simplified Federal Methodology)
    let incomeContribution = 0;
    if (familyIncome > 120000) {
      incomeContribution = 25000 + (familyIncome - 120000) * 0.40;
    } else if (familyIncome > 70000) {
      incomeContribution = 8000 + (familyIncome - 70000) * 0.30;
    } else if (familyIncome > 30000) {
      incomeContribution = (familyIncome - 30000) * 0.20;
    }

    // Asset-based EFC (Standard 5% assessment rate)
    const assetContribution = (savings + investments) * 0.05;

    // Total EFC = Income + Assets (capped at gross cost)
    let efc = incomeContribution + assetContribution;
    efc = Math.min(efc, grossCost);

    // --- 4. Calculate Need-Based Aid ---
    // Financial Need = Gross Cost - EFC
    // Grant Amount = Need * (Percent of Need Met by Uni)
    const financialNeed = Math.max(0, grossCost - efc);
    const percentMet = uni.percentReceivingAid || 0.7; // Default to 70% if data missing
    const needAid = Math.round(financialNeed * percentMet);

    // --- 5. Calculate Merit-Based Aid ---
    // Bonus for high stats relative to school average
    let meritAid = 0;
    const uniAvgGpa = uni.avgGpa || 3.5;
    const uniAvgSat = uni.avgSatScore || 1200;

    // Merit Multiplier
    let multiplier = 0;
    if (gpa >= uniAvgGpa + 0.3) multiplier += 0.5; // Strong GPA
    if (satScore && satScore >= uniAvgSat + 100) multiplier += 0.5; // Strong SAT

    if (multiplier > 0) {
      // Base merit grant approx 20% of tuition, scaled by multiplier
      const baseMerit = (uni.averageGrantAid || 15000) * 0.5; 
      meritAid = Math.round(baseMerit * multiplier);
    }

    // --- 6. Final Totals ---
    // Total aid cannot exceed Gross Cost
    const totalAid = Math.min(needAid + meritAid, grossCost);
    const netPrice = grossCost - totalAid;

    // Generate descriptive text
    let breakdown = `Based on an income of $${familyIncome.toLocaleString()}, your estimated EFC is $${Math.round(efc).toLocaleString()}.`;
    
    // Mention asset inclusion if assets were considered
    if (assetContribution > 0) {
      breakdown += ` This includes an asset assessment of $${Math.round(assetContribution).toLocaleString()} based on savings and investments.`;
    }
    
    if (uni.needBlindAdmission && residency !== 'international') {
      breakdown += " This school has Need-Blind admission policies.";
    }

    // Indicate if profile data was used
    if (userProfile) {
      breakdown += " Calculation based on your saved financial profile.";
    }

    return {
      tuition,
      housing,
      grossCost,
      efc: Math.round(efc),
      needAid,
      meritAid,
      totalAid,
      netPrice,
      breakdown,
      eligibilityWarning: false
    };
  }
}
