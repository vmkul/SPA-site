import { jest } from '@jest/globals';

Object.defineProperty(document, 'querySelector', {
  value: jest.fn(() => {
    return {};
  }),
});
