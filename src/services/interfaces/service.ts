import type { AsyncOrSync } from '../../types';

export interface Service {
  readonly name: string;
  initialize?(): AsyncOrSync<void>;
  shutdown?(): AsyncOrSync<void>;
}
