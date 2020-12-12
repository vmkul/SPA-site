'use strict';

import htmlElement from '../htmlElement';
import { describe, jest, test } from '@jest/globals';

describe('Tests for htmlElement', () => {
  const element = new htmlElement('div', 'class', 'html', '1');
  const second = new htmlElement('span');

  const container = {
    appendChild: jest.fn(),
  };

  test('Inner structure', () => {
    expect(element.element.localName).toBe('div');
    expect(element.element.className).toBe('class');
    expect(element.element.innerHTML).toBe('html');
    expect(element.element.id).toBe('1');

    expect(second.element.localName).toBe('span');
    expect(second.element.className).toBe('');
    expect(second.element.innerHTML).toBe('');
    expect(second.element.id).toBe('');
  });

  test('Insert into', () => {
    element.insertInto(container);
    expect(container.appendChild).toHaveBeenCalledWith(element.element);
  });

  test('Insert child', () => {
    element.element = {
      appendChild: jest.fn(),
    };
    element.insertChild({});
    expect(element.element.appendChild).toHaveBeenCalled();
  });
});