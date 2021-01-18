import './mocks/style.sass';
import './mocks/getElementById.mock';
import './mocks/querySelector.mock';
import './mocks/fetch.mock';
import './mocks/scroll.mock';
import { describe, jest, test } from '@jest/globals';
jest.mock('../listProducts');
jest.mock('../Cart');
jest.mock('../Slider');
jest.mock('../HTMLElement', () => {
  const { jest } = require('@jest/globals');
  return {
    __esModule: true,
    default: jest.fn(() => {
      return {
        element: {},
        insertInto: jest.fn(),
        insertChild: jest.fn(),
      };
    }),
  };
});
import * as scripts from '../scripts';
import {
  prodCart,
  handleRemoveFromCart,
  handleRemoveProduct,
  handleAddProduct,
  handleAddToCart,
} from '../Cart';
import { goLeft, goRight } from '../Slider';

describe('Tests for scripts.js', () => {
  test('Route handling', async () => {
    await scripts.router.handle('');
    expect(
      scripts.listProducts.mock.calls[
        scripts.listProducts.mock.calls.length - 1
      ][1]
    ).toBe('popular');

    await scripts.router.handle('#catalog');
    expect(
      scripts.listProducts.mock.calls[
        scripts.listProducts.mock.calls.length - 1
      ][1]
    ).toBe('products');

    await scripts.router.handle('#product/prod');
    expect(scripts.HTMLElement).toHaveBeenCalledWith('div', '', 'prod1 100');

    await scripts.router.handle('#specials');
    expect(scripts.HTMLElement).toHaveBeenCalledWith(
      'div',
      '',
      'special1  desc1'
    );
    expect(scripts.HTMLElement).toHaveBeenCalledWith(
      'div',
      '',
      'special2  desc2'
    );

    prodCart.items = {
      prod1: 1,
      prod2: 2,
    };

    await scripts.router.handle('#cart');
    expect(scripts.HTMLElement).toHaveBeenCalledWith(
      'div',
      'btn-cart',
      'Checkout'
    );
  });

  test('Click event', () => {
    const event = {
      target: {
        className: 'product-image',
        id: 'prod/id',
        localName: 'img',
      },
    };

    scripts.clickEventHandler(event);
    expect(window.location.hash).toBe('#prod/id');

    event.target.className = 'remove-from-cart';
    scripts.clickEventHandler(event);
    expect(handleRemoveFromCart).toHaveBeenCalledWith('id');

    event.target.className = 'cat-minus';
    scripts.clickEventHandler(event);
    expect(handleRemoveProduct).toHaveBeenCalledWith('id');

    event.target.className = 'cat-plus';
    scripts.clickEventHandler(event);
    expect(handleAddProduct).toHaveBeenCalledWith('id');

    event.target.className = 'btn-buy';
    scripts.clickEventHandler(event);
    expect(handleAddToCart).toHaveBeenCalledWith('id');

    event.target.className = '';
    event.target.id = '#special';
    scripts.clickEventHandler(event);
    expect(window.location.hash).toBe('#special');

    event.target.className = 'minus';
    event.target.id = 'prod/id';
    scripts.clickEventHandler(event);
    expect(handleRemoveProduct).toHaveBeenCalledWith('cart-count/id');

    event.target.className = 'plus';
    scripts.clickEventHandler(event);
    expect(handleAddProduct).toHaveBeenCalledWith('cart-count/id');

    event.target.className = 'price-cart';
    scripts.clickEventHandler(event);
    expect(handleRemoveFromCart).toHaveBeenCalledWith('id');

    event.target.className = '';
    event.target.id = 'left';
    scripts.clickEventHandler(event);
    expect(goLeft).toHaveBeenCalled();

    event.target.id = 'right';
    scripts.clickEventHandler(event);
    expect(goRight).toHaveBeenCalled();
  });
});
