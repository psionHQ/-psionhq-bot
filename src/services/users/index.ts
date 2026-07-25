import { prisma } from '../../database/prisma';
import { PrismaUserRepository } from './prismaUserRepository';
import { UserService } from './userService';

const userRepository = new PrismaUserRepository(prisma);

export const userService = new UserService(userRepository);

export * from './interfaces';
export * from './userService';
