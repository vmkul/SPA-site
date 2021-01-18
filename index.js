'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const data = require('./db.json');
const sendOrderInfo = require('./bot');
const productCardTemplate = fs.readFileSync('./templates/productCardTemplate.html', 'utf8');
const productInfoTemplate = fs.readFileSync('./templates/productInfoTemplate.html', 'utf8');
const specialBlockTemplate = fs.readFileSync('./templates/specialBlockTemplate.html', 'utf8');
const specialDetailsTemplate = fs.readFileSync('./templates/specialDetailsTemplate.html', 'utf8');
const orderTemplate = fs.readFileSync('./templates/orderTemplate.html', 'utf8');
const prefix = './dist';

const genID = () => Math.random().toString(36).substr(2, 9);

const loadFile = (client, cb) => {
  const { pathname } = url.parse(prefix + client.req.url);
  if (pathname.endsWith('js')) {
    client.res.setHeader('Content-Type', 'text/javascript');
  } else if (pathname.endsWith('css')) {
    client.res.setHeader('Content-Type', 'text/css');
  } else if (pathname.endsWith('html')) {
    client.res.setHeader('Content-Type', 'text/html');
  }

  fs.promises.readFile(pathname)
    .then(data => cb(data))
    .catch(() => cb('404 Not Found'));
};

const routes = {
  '/products': (client, cb) => {
    cb(JSON.stringify( {
      products: data.products,
      template: productCardTemplate,
    }));
  },
  '/product/*': (client, cb) => {
    const { url } = client.req;
    const related = [];

    const product = data.products.find(prod => {
      return prod.url === url.split('/')[2];
    });

    if (!product) {
      return cb(JSON.stringify({
        errorCode: 0,
        msg: 'Product not found!',
      }));
    }

    product.relatedProductIds.forEach(id => {
      related.push(data.products[id]);
    });

    cb(JSON.stringify({
      product,
      productInfoTemplate,
      productCardTemplate,
      related,
    }));
  },
  '/popular': (client, cb) => {
    const products = data.products.filter(prod => prod.recommended);

    cb(JSON.stringify({
      products,
      template: productCardTemplate,
    }))
  },
  '/catalog/*': (client, cb) => {
    const { url } = client.req;
    const products = data.products.filter(prod => {
      return prod.categoryId === parseInt(url.split('/')[2]);
    });

    cb(JSON.stringify({
      products,
      template: productCardTemplate,
    }));
  },
  '/specials': (client, cb) => {
    cb(JSON.stringify({
      template: specialBlockTemplate,
      specials: data.specials,
    }));
  },
  '/special/*': (client, cb) => {
    const { url } = client.req;

    const special = data.specials.find(spec => {
      return spec.url === url.split('/')[2];
    });

    if (!special) {
      return cb(JSON.stringify({
        errorCode: 1,
        msg: 'Special not found!',
      }));
    }

    cb(JSON.stringify({
      special,
      template: specialDetailsTemplate,
    }));
  },
  '/submitorder': (client, cb) => {
    const chunks = [];
    client.req.on('data', chunk => chunks.push(chunk));
    client.req.on('end', () => {
      const id = genID();
      const order = JSON.parse(chunks.join());
      if (typeof order !== 'object') {
        return cb(JSON.stringify({
          errorCode: 2,
          msg: 'Bad order info!',
        }));
      }

      order.id = id;
      let orderMessage = 'Got a new order: \n';

      for (const [key, value] of Object.entries(order)) {
        if (key === 'cart') {
          orderMessage += 'CART:\n';
          for (const [prod, count] of Object.entries(JSON.parse(order.cart))) {
            orderMessage += `  ${prod}: ${count}\n`;
          }
        } else {
          orderMessage += `${key}: ${value}\n`;
        }
      }

      sendOrderInfo(orderMessage);

      cb(JSON.stringify({
        id,
        template: orderTemplate,
      }));
    });
  },
  '/': (client, cb) => {
    fs.promises.readFile('dist/index.html')
      .then(data => cb(data))
      .catch(() => cb('404 Not Found'));
  },
  '/node_modules/*': loadFile,
  '/styles/*': loadFile,
  '/images/*': loadFile,
  '/scripts/*': loadFile,
  '*': loadFile,
};

const RegExp = {};

for (const route in routes) {
  if (route.includes('*')) {
    const sliced = route.slice(0, route.length - 2);
    RegExp[sliced] = routes[route];
    delete routes[route];
  }
}

const types = {
  'string': (client, s) => client.res.end(s),
  'object': (client, obj) => client.res.end(JSON.stringify(obj)),
  'function': (client, handler) => {
    const cb = data => {
      if (data === '404 Not Found') {
        client.res.statusCode = 404;
      } else {
        client.res.statusCode = 200;
      }
      //client.res.setHeader('Access-Control-Allow-Origin', '*');
      client.res.end(data, 'UTF-8');
    };
    handler(client, cb);
  }
};

http.createServer((req, res) => {
  const handler = routes[req.url];
  if (!handler) {
    for (const key in RegExp) {
      if (req.url.startsWith(key)) {
        const serve = RegExp[key];
        const type = typeof serve;
        const serializer = types[type];
        return serializer({ req, res }, serve);
      }
    }
    res.statusCode = 404;
    return res.end('404 Not Found');
  }
  const type = typeof handler;
  const serializer = types[type];
  serializer({ req, res }, handler);
}).listen(process.env.PORT);
