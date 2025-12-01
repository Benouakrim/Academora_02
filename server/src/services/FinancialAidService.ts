import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export interface FinancialAidInput {
  universityId: string;
  familyIncome: number;
  gpa: number;
  satScore?: number;
  inState: boolean;
}

export interface FinancialAidResult {
  grossTuition: number;
  efc: number;
  needAid: number;
  meritAid: number;
  totalAid: number;
  netCost: number;
}

export class FinancialAidService {
  static async predict(data: FinancialAidInput): Promise<FinancialAidResult> {
    const { universityId, familyIncome, gpa, satScore, inState } = data;

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) throw new AppError(404, 'University not found');

    const grossTuition = (inState ? university.tuitionInState : university.tuitionOutState) || 50000;

    // --- EFC Calculation ---
    let efc: number;
    if (familyIncome <= 30000) {
      efc = 0;
    } else if (familyIncome <= 50000) {
      efc = (familyIncome - 30000) * 0.2 + 1500; // 20% of amount over 30k + base 1500
    } else if (familyIncome <= 100000) {
      efc = (familyIncome - 50000) * 0.3 + 5500; // 30% over 50k + base 5500
    } else {
      efc = (familyIncome - 100000) * 0.4 + 20500; // 40% over 100k + base 20500
    }

    // --- Need-Based Aid ---
    const demonstratedNeed = Math.max(0, grossTuition - efc);
    const needAid = demonstratedNeed * 0.6; // Assume schools meet 60% of need

    // --- Merit-Based Aid ---
    const gpaScore = (gpa / 4) * 50; // Max 50 pts
    const satComponent = satScore ? (satScore / 1600) * 50 : 25; // Max 50 pts, default 25 if missing
    const meritScore = gpaScore + satComponent; // 0 - 100
    let meritAid = grossTuition * (meritScore / 200); // Divide by 200 so 100 score => 50% tuition
    const meritCap = grossTuition * 0.5;
    if (meritAid > meritCap) meritAid = meritCap;

    // --- Total Aid & Net Cost ---
    let totalAid = needAid + meritAid;
    if (totalAid > grossTuition) totalAid = grossTuition; // Cap at tuition
    const netCost = grossTuition - totalAid;

    return { grossTuition, efc, needAid, meritAid, totalAid, netCost };
  }
}
