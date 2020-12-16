import HTMLElement from './HTMLElement';
import * as Mustache from 'mustache';
const serverAddress = `http://${window.location.host}`;
const pageContent = document.getElementById('page-content');

const apiRequest = async url => {
  const response = await fetch(`${serverAddress}/${url}`);
  return response.json();
};

const emptyDiv = element => {
  while (element.firstChild) {
    pageContent.removeChild(element.firstChild);
  }
};

const listProducts = async (container, url, title) => {
  const parsed = await apiRequest(url);

  if ('errorCode' in parsed || parsed.products.length === 0) {
    window.location.hash = '';
    return;
  }

  emptyDiv(container);
  if (title) {
    container.innerHTML = `<h1 style="text-align: center; padding: 20px">${title}</h1>`;
  }
  const productContainer = new HTMLElement(
    'div',
    'product-container',
    '',
    'product-container'
  );
  productContainer.insertInto(container);
  parsed.products.forEach(productInfo => {
    const product = new HTMLElement(
      'div',
      'prod-block',
      Mustache.render(parsed.template, productInfo)
    );
    productContainer.insertChild(product);
  });
};

export default listProducts;
