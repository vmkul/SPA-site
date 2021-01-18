import element from './mocks/getElementById.mock';
import './mocks/fetch.mock';
import * as Cart from '../Cart';
import { describe, test } from '@jest/globals';
import { handleAddToCart, handleRemoveFromCart } from '../Cart';

describe('Tests for Cart', () => {
  const cart = new Cart.Cart('cart');

  test('Cart class', async () => {
    expect(cart.id).toBe('cart');
    expect(Object.keys(cart.items).length).toBe(0);
    cart.items = { product: 2 };
    expect(cart.items['product']).toBe(2);
  });

  test('updateCartTotal function', async () => {
    await Cart.updateCartTotal();
    expect(element.innerText).toBe('200');
  });

  test('handleAddToCart function', async () => {
    await handleAddToCart('product');
    expect(element.innerText).toBe('300');
  });

  test('handleRemoveFromCart function', async () => {
    await handleRemoveFromCart('product');
    expect(element.innerText).toBe('0');
  });

  test('handleRemoveProduct function', () => {
    for (let i = 0; i < 10; i++) {
      Cart.handleRemoveProduct();
    }
    expect(element.value).toBe(1);
  });
});
