'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');
const pageContent = document.getElementById('page-content');
const cartTotal = document.getElementById('cart-total');
const orderForm = document.querySelector('form');
const now = new Date();
document.getElementById('delivery_date').valueAsDate = now;
document.getElementById('delivery_time').value = now.toLocaleTimeString().substring(0, 5);
const storage = window.localStorage;

if (!storage.getItem('cart')) storage.setItem('cart', '{}');

const serverAddress = 'http://localhost:5000';

const cartTemplate = '<div class="cart-container">\n' +
  '  <div class="cart-product">\n' +
  '\n' +
  '    <div style="display: flex; align-items: center">\n' +
  '      <img src="{{ image }}" alt="prod image">\n' +
  '    </div>\n' +
  '\n' +
  '    <div>\n' +
  '      <div class="product-title"><a href="#product/{{ url }}">{{ productName }}</a></div>\n' +
  '\n' +
  '      <div class="block-prod-count">\n' +
  '        <div class="minus" onclick="handleRemoveProduct(\'{{ url }}\'); handleAddToCart(\'{{ url }}\')">‒</div>\n' +
  '        <input type="text" value="{{ count }}" id="{{ url }}" disabled class="prod-count-cart">\n' +
  '        <div class="plus" onclick="handleAddProduct(\'{{ url }}\'); handleAddToCart(\'{{ url }}\')">+</div>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div style="display: flex; align-items: center">\n' +
  '      <div onclick="handleRemoveFromCart(\'{{ url }}\')" class="price-cart"> <span id="\'{{ url }}/price\'">{{ price }}</span> <span>грн</span>\n' +
  '        <i class="fa fa-times" aria-hidden="true"></i>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '</div>';

class htmlElement {
  constructor(type, className = '', innerHTML = '', id = '') {
    this.element = document.createElement(type);
    this.element.className = className;
    this.element.innerHTML = innerHTML;
    this.element.id = id;
  }

  insertInto(container) {
    container.appendChild(this.element);
  }

  insertChild(child) {
    this.element.appendChild(child.element);
  }
}

class Router {
  constructor(defaultHandler) {
    this.routes = {};
    this.RegEx = {};
    this.defaultHandler = defaultHandler;
    this.preventDefault = false;
  }

  toggleDefault() {
    this.preventDefault = !this.preventDefault;
  }

  addRoute(route, handler) {
    if (route[route.length - 1] === '*') {
      this.RegEx[route.substring(0, route.length - 1)] = handler;
    } else {
      this.routes[route] = handler;
    }
  }

  handle(route) {
    for (const pattern in this.RegEx) {
      if (route.startsWith(pattern)) {
        this.RegEx[pattern]();
        return;
      }
    }

    const handler = this.routes[route];

    if (handler) {
      handler();
    } else {
      if (this.preventDefault) return;
      this.defaultHandler();
    }
  }
}

const updatePage = window.dispatchEvent.bind(null, new Event('popstate'));

const apiRequest = async url => {
  const response = await fetch(`${serverAddress}/${url}`);
  return await response.json();
}

const updateCartTotal = async () => {
  const cart = JSON.parse(storage.getItem('cart'));
  if (!cart) {
    cartTotal.innerText = '0';
    return;
  }

  let total = 0;

  for (const [ prod_url, count ] of Object.entries(cart)) {
    const url = `${serverAddress}/product/${prod_url}`;
    const response = await fetch(url);
    const parsed = await response.json();
    total += parsed.product.price * count;
  }

  cartTotal.innerText = total.toString();
};

const handleAddProduct = productUrl => {
  const productCountInput = document.getElementById(productUrl);
  productCountInput.value++;
};

const handleRemoveProduct = productUrl => {
  const productCountInput = document.getElementById(productUrl);
  if (productCountInput.value > 1) {
    productCountInput.value--;
  }
};

const handleAddToCart = productUrl => {
  const cart = JSON.parse(storage.getItem('cart'));
  cart[productUrl] = document.getElementById(productUrl).value;
  storage.setItem('cart', JSON.stringify(cart));
  updatePage();
};

const handleRemoveFromCart = productUrl => {
  const cart = JSON.parse(storage.getItem('cart'));
  delete cart[productUrl];
  storage.setItem('cart', JSON.stringify(cart));
  updatePage();
};

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

const router = new Router(async () => {
  const parsed = await apiRequest('products');
  emptyDiv(pageContent);
  const productContainer = new htmlElement('div', 'product-container', '', 'product-container');
  productContainer.insertInto(pageContent);
  parsed.products.forEach(productInfo => {
    const product = new htmlElement('div', 'prod-block', Mustache.render(parsed.template, productInfo));
    productContainer.insertChild(product);
  });
});

router.addRoute('#product/*', async () => {
  const parsed = await apiRequest(document.location.hash.slice(1));
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
  console.log(`special${hash.substring(hash.indexOf('/'), hash.length)}`);
  emptyDiv(pageContent);
  pageContent.innerHTML = Mustache.render(parsed.template, parsed.special);
});

router.addRoute('#cart', async () => {
  emptyDiv(pageContent);
  const cart = JSON.parse(storage.getItem('cart'));
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
  window.scroll(0, 0);
  router.handle(hash);
});

orderForm.onsubmit = async e => {
  e.preventDefault();
  let formData = new FormData(orderForm);
  formData.append('cart', storage.getItem('cart'));
  formData = Object.fromEntries(formData);
  storage.setItem('cart', '{}');

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
