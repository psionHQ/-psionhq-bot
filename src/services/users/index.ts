import { prisma } from '../../database/prisma';
import { PrismaUserRepository } from './prismaUserRepository';
import { UserService } from './userService';
import { walletService } from '../wallets';
import { referralService } from '../referral';

export const userRepository = new PrismaUserRepository(prisma);

export const userService = new UserService(userRepository, walletService, referralService);

export * from './interfaces';
export * from './userService';
