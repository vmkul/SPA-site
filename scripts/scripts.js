'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');
const pageContent = document.getElementById('page-content');
const orderForm = document.querySelector('form');
const now = new Date();
document.getElementById('delivery_date').valueAsDate = now;
document.getElementById('delivery_time').value = now.toLocaleTimeString().substring(0, 5);

import '../styles/style.sass';
import htmlElement from './htmlElement.js';
import Router from './Router.js';
import { handleAddProduct, handleRemoveProduct,
  handleAddToCart, updateCartTotal, handleRemoveFromCart, prodCart } from './Cart.js';
import cartTemplate from './cartTemplate.js';
import { goLeft, goRight, sliderContainer } from './Slider.js';

document.addEventListener('click', async event => {
  const url = event.target.id.split('/')[1];

  if (event.target.className === 'product-image') {
    openProduct(event, event.target.id);
  } else if (event.target.className === 'remove-from-cart') {
    await handleRemoveFromCart(url);
  } else if (event.target.className === 'cat-minus') {
    handleRemoveProduct(url);
  } else if (event.target.className === 'cat-plus') {
    handleAddProduct(url);
  } else if (event.target.className === 'btn-buy' && url) {
   await handleAddToCart(url);
  } else if (event.target.id.startsWith('#special')) {
    window.location.hash = event.target.id;
  } else if (event.target.className === 'minus') {
    handleRemoveProduct('cart-count/' + url);
    await handleAddToCart(url);
  } else if (event.target.className === 'plus') {
    handleAddProduct('cart-count/' + url);
    await handleAddToCart(url);
  } else if (event.target.className === 'price-cart') {
    await handleRemoveFromCart(url);
  } else if (event.target.id === 'left') {
    goLeft();
  } else if (event.target.id === 'right') {
    goRight();
  }
});

const serverAddress = `http://${window.location.host}`;

const openProduct = (e, url) => {
  if (e.target.localName === 'img') {
    window.location.hash = url;
  }
};

window.openProduct = openProduct;

const categoryIDs = {
  sets: 0,
  rolls: 1,
  sushi: 2,
  maki: 3,
};

const updatePage = window.dispatchEvent.bind(null, new Event('popstate'));

const apiRequest = async url => {
  const response = await fetch(`${serverAddress}/${url}`);
  return await response.json();
}

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

const listProducts = async (container, url, title) => {
  const parsed = await apiRequest(url);

  if ('errorCode' in parsed || parsed.products.length === 0) {
    return router.handle('');
  }

  emptyDiv(container);
  if (title) {
    container.innerHTML = `<h1 style="text-align: center; padding: 20px">${title}</h1>`;
  }
  const productContainer = new htmlElement('div', 'product-container', '', 'product-container');
  productContainer.insertInto(container);
  parsed.products.forEach(productInfo => {
    const product = new htmlElement('div', 'prod-block', Mustache.render(parsed.template, productInfo));
    productContainer.insertChild(product);
  });
};

const router = new Router(async () => {
  sliderContainer.style.display = 'block';
  await listProducts(pageContent, 'popular');
});

router.addRoute('#catalog', async () => {
  await listProducts(pageContent, 'products', 'POPULAR');
});

router.addRoute('#catalog/*', async () => {
  const categoryName = window.location.hash.split('/')[1];
  await listProducts(pageContent, `catalog/${categoryIDs[categoryName]}`,
    window.location.hash.split('/')[1].toLocaleUpperCase());
});

router.addRoute('#product/*', async () => {
  const parsed = await apiRequest(document.location.hash.slice(1));

  if ('errorCode' in parsed) {
    return router.handle('');
  }

  emptyDiv(pageContent);
  const product = new htmlElement('div', '', Mustache.render(parsed.productInfoTemplate, parsed.product));
  product.insertInto(pageContent);
  const relatedContainer = new htmlElement('div', 'related-container');
  relatedContainer.insertInto(pageContent);

  parsed.related.forEach(productInfo => {
    const product = new htmlElement('div', 'prod-block', Mustache.render(parsed.productCardTemplate, productInfo));
    relatedContainer.insertChild(product);
  });
});

router.addRoute('#specials', async () => {
  const parsed = await apiRequest(document.location.hash.slice(1));

  emptyDiv(pageContent);
  pageContent.innerHTML = '<h1 style="text-align: center; padding: 20px">SPECIALS</h1>';

  parsed.specials.forEach(spec => {
    const date = new Date(spec.datePosted);
    spec.day = date.getDate() - 1;
    spec.monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
    const element = new htmlElement('div', '', Mustache.render(parsed.template, spec));
    element.insertInto(pageContent);
  });
});

router.addRoute('#special/*', async () => {
  const hash = document.location.hash;
  const parsed = await apiRequest(`special${hash.substring(hash.indexOf('/'), hash.length)}`);

  if ('errorCode' in parsed) {
    return router.handle('');
  }

  emptyDiv(pageContent);
  pageContent.innerHTML = Mustache.render(parsed.template, parsed.special);
});

router.addRoute('#cart', async () => {
  emptyDiv(pageContent);
  const cart = prodCart.items;
  pageContent.innerHTML = '<h1 style="text-align: center; padding: 20px">Order</h1>';

  if (!cart || Object.entries(cart).length === 0) {
    pageContent.innerHTML = '<h1 style="text-align: center; padding: 20px">Your cart is empty!</h1>';
    return;
  }

  for (const [ prod_url, count ] of Object.entries(cart)) {
    const parsed = await apiRequest(`product/${prod_url}`);
    parsed.product.count = count;
    parsed.product.price *= count;
    const cartProduct = new htmlElement('div', '', Mustache.render(cartTemplate, parsed.product));
    cartProduct.insertInto(pageContent);
  }

  const checkoutButton = new htmlElement('div', 'loader');
  checkoutButton.element.onclick = () => {
    emptyDiv(pageContent);
    router.toggleDefault();
    window.location.hash = '#order';
    pageContent.innerHTML = '<h1 style="text-align: center; padding: 20px">Please fill in the form</h1>';
    orderForm.style.display = 'block';
  }

  checkoutButton.insertInto(pageContent);
  checkoutButton.insertChild(new htmlElement('div', 'btn-cart', 'Checkout'));
});

window.addEventListener('popstate', async () => {
  updateCartTotal().then();
  emptyDiv(pageContent);
  if (router.preventDefault) return;
  const loader = new htmlElement('div', 'loader', '<img src="images/spinner.gif" alt="loader">');
  loader.insertInto(pageContent);
  const hash = document.location.hash;
  if (hash.length) sliderContainer.style.display = 'none';
  window.scroll(0, 0);
  router.handle(hash);
});

orderForm.onsubmit = async e => {
  e.preventDefault();
  let formData = new FormData(orderForm);
  formData.append('cart', JSON.stringify(prodCart.items));
  formData = Object.fromEntries(formData);
  prodCart.items = {};

  const response = await fetch(`${serverAddress}/submitorder`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  const result = await response.json();
  formData.id = result.id;

  document.location.hash = `#order/${result.id}`;
  const orderInfo = new htmlElement('div', '', Mustache.render(result.template, formData));

  orderInfo.insertInto(pageContent);
  orderForm.style.display = 'none';
  router.toggleDefault();
};

updatePage();
