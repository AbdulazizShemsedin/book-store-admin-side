import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Browser Worker for development mocking.
 */
export const worker = setupWorker(...handlers);
