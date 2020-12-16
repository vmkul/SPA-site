import { jest } from '@jest/globals';

Object.defineProperty(document, 'getElementsByClassName', {
  value: jest.fn(() => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      result.push({
        classList: {
          add: jest.fn(),
        },
      });
    }
    return result;
  }),
});
