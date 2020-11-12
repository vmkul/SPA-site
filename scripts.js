'use strict';

const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu-layer');
const pageContent = document.getElementById('page-content');

menuButton.onclick = () => {
  if (mobileMenu.style.display === 'block') {
    mobileMenu.style.display = 'none';
  } else {
    mobileMenu.style.display = 'block';
  }
};

const productTemplate =
  '  <div class="prod-img" onclick="window.location.hash = \'#product/{{ url }}\'">\n' +
  '    <div class="btn-favorite " data-auth="0">\n' +
  '      <i class="fa  fa-heart-o " aria-hidden="true"></i>\n' +
  '    </div>\n' +
  '    <img src="{{ image }}" alt="fish">\n' +
  '\n' +
  '    <div class="bg-buy">\n' +
  '      <div class="btn-delete-buy"></div>\n' +
  '      <div class="delete-name">Remove from cart</div>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '\n' +
  '  <div class="name-prod">\n' +
  '    <a href="#product/{{ url }}">\n' +
  '      {{ productName }}\n' +
  '    </a>\n' +
  '    <meta content="">\n' +
  '  </div>\n' +
  '  <div class="description" style="position: relative">\n' +
  '  </div>\n' +
  '  <div class="main-block-attr-price">\n' +
  '\n' +
  '    <div class="block-table">\n' +
  '      <table class="table">\n' +
  '        <tbody>\n' +
  '        <tr class="attr-img">\n' +
  '\n' +
  '          <th><span class="weight"></span></th>\n' +
  '\n' +
  '          <th><span class="quantity"></span></th>\n' +
  '\n' +
  '          <th><span class="Kcal"></span></th>\n' +
  '\n' +
  '        </tr>\n' +
  '        <tr class="attr-number">\n' +
  '\n' +
  '          <th>{{ weight }}</th>\n' +
  '\n' +
  '          <th>{{ quantity }}</th>\n' +
  '\n' +
  '          <th>{{ KCal }}</th>\n' +
  '\n' +
  '        </tr>\n' +
  '        </tbody>\n' +
  '      </table>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="block-price-buy">\n' +
  '      <div class="block-price">\n' +
  '        <div class="price"><span>{{ price }}</span> <span>грн</span></div>\n' +
  '\n' +
  '      </div>\n' +
  '      <div class="category-count">\n' +
  '        <div class="count-inner">\n' +
  '          <span class="cat-minus">‒</span>\n' +
  '          <input type="text" class="prod-count" value="1">\n' +
  '          <span class="cat-plus">+</span>\n' +
  '        </div>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '  <div class="btn-buy">\n' +
  '    To order\n' +
  '  </div>\n';

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
  console.log(hash);
  if (hash === '') {
    const response = await fetch('http://localhost:4000/products');
    const parsed = await response.json();
    emptyDiv(pageContent);
    const productContainer = document.createElement('div');
    productContainer.className = 'product-container';
    productContainer.id = 'product-container';
    pageContent.appendChild(productContainer);
    parsed.forEach(productInfo => {
      const product = document.createElement('div');
      product.className = 'prod-block';
      productContainer.appendChild(product);
      product.innerHTML = Mustache.render(productTemplate, productInfo);
    });
  } else if (hash.startsWith('#product')) {
    pageContent.innerHTML = `<h1>${hash}</h1>`;

  } else {
    pageContent.innerHTML = '<h1>Not found</h1>'
  }
});

window.dispatchEvent(new Event('popstate'));

const pushUrl = href => {
  history.pushState({}, '', href);
  window.dispatchEvent(new Event('popstate'));
};
