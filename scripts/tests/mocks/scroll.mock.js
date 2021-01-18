import { jest } from '@jest/globals';

Object.defineProperty(window, 'scroll', {
  value: jest.fn(),
});
