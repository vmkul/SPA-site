const cartTemplate =
  '<div class="cart-container">\n' +
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
  '        <div class="minus" id="cart-minus/{{ url }}">‒</div>\n' +
  '        <input type="text" value="{{ count }}" id="cart-count/{{ url }}" disabled class="prod-count-cart">\n' +
  '        <div class="plus" id="cart-plus/{{ url }}"">+</div>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div style="display: flex; align-items: center">\n' +
  '      <div id="remove-cart/{{ url }}" class="price-cart"> ' +
  '         <span style="pointer-events: none" id="{{ url }}/price">{{ price }}' +
  '         </span> ' +
  '       <span style="pointer-events: none">грн</span>\n' +
  '        <i style="pointer-events: none" class="fa fa-times" aria-hidden="true"></i>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '</div>';

export default cartTemplate;
