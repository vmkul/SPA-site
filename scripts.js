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
  const loader = document.createElement('div');
  loader.innerHTML = '<img src="images/spinner.gif" alt="loader">'
  loader.className = 'loader';
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
  } else if (hash.startsWith('#product/')) {
    const url = `${serverAddress}/${hash.slice(1)}`;
    const response = await fetch(url);
    const parsed = await response.json();
    emptyDiv(pageContent);
    const product = document.createElement('div');
    pageContent.appendChild(product);
    product.innerHTML = Mustache.render(parsed.productInfoTemplate, parsed.product);
    const relatedContainer = document.createElement('div');
    relatedContainer.className = 'related-container';
    pageContent.appendChild(relatedContainer);

    parsed.related.forEach(productInfo => {
      const product = document.createElement('div');
      product.className = 'prod-block';
      relatedContainer.appendChild(product);
      product.innerHTML = Mustache.render(parsed.productCardTemplate, productInfo);
    });
  } else if (hash === '#specials') {
    const response = await fetch(`${serverAddress}/${hash.slice(1)}`);
    const parsed = await response.json();
    emptyDiv(pageContent);
    pageContent.innerHTML = '<h1 style="text-align: center; padding: 20px">SPECIALS</h1>';

    parsed.specials.forEach(spec => {
      const date = new Date(spec.datePosted);
      spec.day = date.getDate() - 1;
      spec.monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      const element = document.createElement('div');
      pageContent.appendChild(element);
      element.innerHTML = Mustache.render(parsed.template, spec);
    });
  } else if (hash.startsWith('#special/')) {
    const response = await fetch(`${serverAddress}/special${hash.substring(hash.indexOf('/'), hash.length)}`);
    const parsed = await response.json();
    emptyDiv(pageContent);

    pageContent.innerHTML = Mustache.render(parsed.template, parsed.special);
  } else {
    pageContent.innerHTML = '<h1>Not found</h1>';
  }
});

window.dispatchEvent(new Event('popstate'));

const pushUrl = href => {
  history.pushState({}, '', href);
  window.dispatchEvent(new Event('popstate'));
};
