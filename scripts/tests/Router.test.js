'use strict';

import Router from '../Router.js';
import { describe, jest, test } from '@jest/globals';

describe('Tests for Router', () => {
  const defaultHandler = jest.fn();
  const someHandler = jest.fn();
  const regexHandler = jest.fn();
  const router = new Router(defaultHandler);

  router.addRoute('some_route', someHandler);
  router.addRoute('regex_route/*', regexHandler);

  router.handle('some_route');
  router.handle('regex_route/abc');
  router.handle('unknown route');

  router.toggleDefault();
  router.handle('unknown route');

  test('regular route', () => {
    expect(someHandler).toBeCalledTimes(1);
  });

  test('regex route', () => {
    expect(regexHandler).toBeCalledTimes(1);
  });

  test('default handler', () => {
    expect(defaultHandler).toBeCalledTimes(1);
  });
});