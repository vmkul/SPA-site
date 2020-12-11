'use strict';

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

export default cartTemplate;
