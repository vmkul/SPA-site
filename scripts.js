'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');

menuButton.onclick = () => {
  if (mobileMenu.style.display === 'block') {
    mobileMenu.style.display = 'none';
  } else {
    mobileMenu.style.display = 'block';
  }
};