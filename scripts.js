'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');
const pageContent = document.getElementById('page-content');

const serverAddress = 'http://localhost:4000';

menuButton.onclick = () => {
  if (mobileMenu.style.display === 'block') {
    mobileMenu.style.display = 'none';
  } else {
    mobileMenu.style.display = 'block';
  }
};

const emptyDiv = element => {
  while (element.firstChild) {
    pageContent.removeChild(element.firstChild);
  }
};

window.addEventListener('popstate', async () => {
  emptyDiv(pageContent);
  const loader = document.createElement('img');
  loader.src = 'images/spinner.gif';
  loader.alt = 'loader';
  pageContent.appendChild(loader);
  const hash = document.location.hash;
  window.scroll(0, 0);
  if (hash === '') {
    const response = await fetch(`${serverAddress}/products`);
    const parsed = await response.json();
    emptyDiv(pageContent);
    const productContainer = document.createElement('div');
    productContainer.className = 'product-container';
    productContainer.id = 'product-container';
    pageContent.appendChild(productContainer);
    parsed.products.forEach(productInfo => {
      const product = document.createElement('div');
      product.className = 'prod-block';
      productContainer.appendChild(product);
      product.innerHTML = Mustache.render(parsed.template, productInfo);
    });
  } else if (hash.startsWith('#product')) {
    const url = `${serverAddress}/product${hash.substring(hash.indexOf('/'), hash.length)}`;
    const response = await fetch(url);
    const parsed = await response.json();
    emptyDiv(pageContent);
    const product = document.createElement('div');
    product.className = 'prod-info-block';
    pageContent.appendChild(product);
    product.innerHTML = Mustache.render(parsed.template, parsed.product);
  } else {
    pageContent.innerHTML = '<h1>Not found</h1>';
  }
});

window.dispatchEvent(new Event('popstate'));

const pushUrl = href => {
  history.pushState({}, '', href);
  window.dispatchEvent(new Event('popstate'));
};
