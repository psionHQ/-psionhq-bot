import { InMemoryUserRepository } from './inMemoryUserRepository';
import { UserService } from './userService';

const userRepository = new InMemoryUserRepository();

export const userService = new UserService(userRepository);

export * from './interfaces';
export * from './userService';
