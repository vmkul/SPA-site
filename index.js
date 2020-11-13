'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const data = require('./db.json');

const loadFile = (client, cb) => {
  const { pathname } = url.parse('.' + client.req.url);
  fs.promises.readFile(pathname)
    .then(data => cb(data))
    .catch(() => cb('404 Not Found'));
};

const routes = {
  '/products': (client, cb) => {
    cb(JSON.stringify(data.products));
  },
  '/product/*': (client, cb) => {
    const { url } = client.req;
    const product = data.products.find(prod => {
      return prod.url === url.substring(9, url.length);
    });
    cb(JSON.stringify(product));
  },
  '/index.html': loadFile,
  '/contactus.html': loadFile,
  '/contactus.html*': (client, cb) => {
    const chunks = [];
    client.req.on('data', chunk => chunks.push(chunk));
    client.req.on('end', () => {
      cb(JSON.stringify(qs.parse(chunks.join().toString())));
    });
  },
  '/aboutus.html': loadFile,
  '/node_modules/*': loadFile,
  '/css/*': loadFile,
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
      if (data === '404 Not Found')
        client.res.statusCode = 404;
      else
        client.res.statusCode = 200;
      client.res.setHeader('content-type', 'application/json');
      client.res.setHeader('Access-Control-Allow-Origin', '*');
      setTimeout(() => {
        client.res.end(data, 'UTF-8');
      }, 500);
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
}).listen(4000);
