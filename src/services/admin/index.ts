import { prisma } from '../../database/prisma';
import { userRepository } from '../users';
import { IdentityService } from './identityService';
import { PrismaAdminRepository } from './prismaAdminRepository';

const adminRepository = new PrismaAdminRepository(prisma);

export const identityService = new IdentityService(userRepository, adminRepository);

export * from './interfaces';
export * from './identityService';
export * from './prismaAdminRepository';
export * from './inMemoryAdminRepository';
