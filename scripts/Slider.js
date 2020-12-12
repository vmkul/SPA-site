let currentSlide = 0;
const slides = [];
const sliderContainer = document.getElementById('slider-container');

for (const slide of document.getElementsByClassName('showSlide')) {
  slides.push(slide);
}

const goLeft = () => {
  let nextSlide;
  if (currentSlide === 0) {
    nextSlide = slides.length - 1;
  } else {
    nextSlide = currentSlide - 1;
  }
  slides[currentSlide].classList.add('fade');
  setTimeout(() => {
    slides[nextSlide].classList.remove('fade');
  }, 100);
  currentSlide = nextSlide;
};

const goRight = () => {
  let nextSlide;
  if (currentSlide === slides.length - 1) {
    nextSlide = 0;
  } else {
    nextSlide = currentSlide + 1;
  }
  slides[currentSlide].classList.add('fade');
  slides[currentSlide].classList.add('fade');
  setTimeout(() => {
    slides[nextSlide].classList.remove('fade');
  }, 100);
  currentSlide = nextSlide;
};

let slideTimer = setInterval(goRight, 3000);

sliderContainer.onmouseenter = () => {
  clearInterval(slideTimer);
};

sliderContainer.onmouseleave = () => {
  slideTimer = setInterval(goRight, 3000);
};

sliderContainer.onclick = event => {
  const target = event.target;
  if (target.id === 'right' || target.id === 'left') {
    return;
  }
  window.location.hash = '#specials';
};

export { goRight, goLeft, sliderContainer };
