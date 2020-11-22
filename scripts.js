'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');
const pageContent = document.getElementById('page-content');
const cartTotal = document.getElementById('cart-total');
const orderForm = document.querySelector('form');
const now = new Date();
document.getElementById('delivery_date').valueAsDate = now;
document.getElementById('delivery_time').value = now.toLocaleTimeString().substring(0, 5);

const serverAddress = 'http://localhost:5000';

const cartTemplate = '<div class="cart-container">\n' +
  '  <div class="cart-product" id="cart/{{ url }}">\n' +
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
  '      <div onclick="handleRemoveFromCart(\'{{ url }}\')" class="price-cart"> <span id="{{ url }}/price">{{ price }}</span> <span>грн</span>\n' +
  '        <i class="fa fa-times" aria-hidden="true"></i>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '</div>';

const categoryIDs = {
  sets: 0,
  rolls: 1,
  sushi: 2,
  maki: 3,
};

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

class Cart {
  constructor(id) {
    this.storage = window.localStorage;
    this.id = id;
    if (!this.storage.getItem(id)) this.storage.setItem(id, '{}');
  }

  get items() {
    return JSON.parse(this.storage.getItem(this.id));
  }

  set items(obj) {
    this.storage.setItem(this.id, JSON.stringify(obj));
  }
}

const updatePage = window.dispatchEvent.bind(null, new Event('popstate'));

const apiRequest = async url => {
  const response = await fetch(`${serverAddress}/${url}`);
  return await response.json();
}

const updateCartTotal = async () => {
  const cart = prodCart.items;

  if (!cart) {
    cartTotal.innerText = '0';
    return;
  }

  let total = 0;

  for (const [ prod_url, count ] of Object.entries(cart)) {
    const url = `product/${prod_url}`;
    const parsed = await apiRequest(url);
    const price = parsed.product.price * count;
    const prodPrice = document.getElementById(`${prod_url}/price`);
    if (prodPrice) {
      prodPrice.innerText = price.toString();
    }
    total += price;
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

const handleAddToCart = async productUrl => {
  const background = document.getElementById(`${productUrl}/bg`);
  if (background) {
    background.style.display = 'block';
    setTimeout(() => {
      document.getElementById(`${productUrl}/img`).style.transform = 'scale(1)';
    }, 200);
    document.getElementById(`${productUrl}/main`).onclick = () => {
      console.log('click')
    };
  }
  const cart = prodCart.items;
  cart[productUrl] = document.getElementById(productUrl).value;
  prodCart.items = cart;
  await updateCartTotal();
};

const handleRemoveFromCart = async productUrl => {
  const background = document.getElementById(`${productUrl}/bg`);
  if (background) {
    background.style.display = 'none';
    document.getElementById(`${productUrl}/img`).style.transform = 'scale(0)';
  }
  const cart = prodCart.items;
  delete cart[productUrl];
  prodCart.items = cart;
  await updateCartTotal();
  if (!Object.keys(cart).length) return updatePage();
  const cartElement = document.getElementById(`cart/${productUrl}`);
  if (cart) {
    cartElement.remove();
  }
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

const listProducts = async (container, url, title) => {
  const parsed = await apiRequest(url);
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

const prodCart = new Cart('cart');

const router = new Router(async () => {
  await listProducts(pageContent, 'popular');
});

router.addRoute('#catalog/*', async () => {
  const categoryName = window.location.hash.split('/')[1];
  await listProducts(pageContent, `catalog/${categoryIDs[categoryName]}`,
    window.location.hash.split('/')[1].toLocaleUpperCase());
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
  window.scroll(0, 0);
  router.handle(hash);
});

orderForm.onsubmit = async e => {
  e.preventDefault();
  let formData = new FormData(orderForm);
  formData.append('cart', prodCart.items);
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
