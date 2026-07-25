import { prisma } from '../../database/prisma';
import { PrismaReferralRepository } from './prismaReferralRepository';
import { ReferralService } from './referralService';

export const referralRepository = new PrismaReferralRepository(prisma);

export const referralService = new ReferralService(referralRepository, prisma);

export * from './interfaces';
export * from './referralService';
