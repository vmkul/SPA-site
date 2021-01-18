const cartTotal = document.getElementById('cart-total');
const serverAddress = `http://${window.location.host}`;
const updatePage = window.dispatchEvent.bind(null, new Event('popstate'));

const apiRequest = async url => {
  const response = await fetch(`${serverAddress}/${url}`);
  return response.json();
};

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

const prodCart = new Cart('cart');

const updateCartTotal = async () => {
  const cart = prodCart.items;

  if (!cart) {
    cartTotal.innerText = '0';
    return;
  }

  let total = 0;

  for (const [prodUrl, count] of Object.entries(cart)) {
    const url = `product/${prodUrl}`;
    const parsed = await apiRequest(url);
    const price = parsed.product.price * count;
    const prodPrice = document.getElementById(`${prodUrl}/price`);
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
  }
  const cart = prodCart.items;
  if (document.getElementById(productUrl)) {
    cart[productUrl] = document.getElementById(productUrl).value;
  } else {
    cart[productUrl] = document.getElementById(
      'cart-count/' + productUrl
    ).value;
  }
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
  if (!Object.keys(cart).length && window.location.hash === '#cart') {
    return updatePage();
  }
  const cartElement = document.getElementById(`cart/${productUrl}`);
  if (cart) {
    cartElement.remove();
  }
  return true;
};

export {
  Cart,
  handleRemoveFromCart,
  updateCartTotal,
  handleAddToCart,
  handleRemoveProduct,
  handleAddProduct,
  prodCart,
  apiRequest,
};
