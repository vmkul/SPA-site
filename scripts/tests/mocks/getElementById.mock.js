import { jest } from '@jest/globals';

const element = {
  value: 3,
  style: {},
  remove: jest.fn(),
  appendChild: jest.fn(),
};

Object.defineProperty(document, 'getElementById', {
  value: jest.fn(() => element),
});

export default element;
