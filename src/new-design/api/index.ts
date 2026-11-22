import { createHttpApi } from './http';

const base = (import.meta.env.VITE_API_URL?.trim() || '/api').replace(/\/$/, '');
export const api = createHttpApi(base);

export { ApiError } from './contract';
export type { Api } from './contract';
export * from './types';
export { studentPriceOf } from './pricing';
