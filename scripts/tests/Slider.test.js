import './mocks/getElementById.mock';
import './mocks/getElementsByClassName.mock';
import * as Slider from '../Slider';
import { describe, jest, test } from '@jest/globals';
import { sliderContainer } from '../Slider';

global.clearInterval = jest.fn();
global.setInterval = jest.fn();

describe('Tests for Slider', () => {
  test('goLeft/goRight functions', () => {
    Slider.goLeft();
    expect(Slider.currentSlide).toBe(9);
    Slider.goRight();
    expect(Slider.currentSlide).toBe(0);
    Slider.goRight();
    expect(Slider.currentSlide).toBe(1);
    Slider.goLeft();
    expect(Slider.currentSlide).toBe(0);
  });

  test('container onclick', () => {
    sliderContainer.onclick({
      target: {
        id: 'id',
      },
    });
    expect(window.location.hash).toBe('#specials');
  });

  test('Mouse enter and leave', () => {
    sliderContainer.onmouseenter();
    expect(global.clearInterval).toBeCalledTimes(1);

    sliderContainer.onmouseleave();
    expect(global.setInterval).toBeCalledWith(Slider.goRight, 3000);
  });
});
