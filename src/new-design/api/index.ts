import { createHttpApi } from './http';
import { createStaticPreviewApi } from './static-preview';
import type { Api } from './contract';

const base = (import.meta.env.VITE_API_URL?.trim() || '/api').replace(/\/$/, '');
const httpApi = createHttpApi(base);
export const api: Api = import.meta.env.VITE_STATIC_PREVIEW === '1' ? createStaticPreviewApi(httpApi) : httpApi;

export { ApiError } from './contract';
export type { Api } from './contract';
export * from './types';
export { studentPriceOf } from './pricing';
