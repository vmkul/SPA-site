import './mocks/fetch.mock';
import { describe, jest, test } from '@jest/globals';
import listProducts from '../listProducts';

describe('Tests for listProducts', () => {
  test('listProducts function', async () => {
    const container = {
      appendChild: jest.fn(),
    };

    await listProducts(container, 'prod', 'title');
    expect(container.appendChild).toHaveBeenCalled();
  });
});
