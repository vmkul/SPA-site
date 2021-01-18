import { jest } from '@jest/globals';

global.fetch = jest.fn(
  () =>
    new Promise(resolve => {
      resolve({
        json() {
          return {
            product: {
              url: 'prod1',
              price: 100,
            },
            products: [
              {
                url: 'prod1',
                price: 100,
              },
              {
                url: 'prod2',
                price: 200,
              },
            ],
            related: [
              {
                url: 'prod1',
                price: 100,
              },
              {
                url: 'prod2',
                price: 200,
              },
            ],
            specials: [
              {
                url: 'special1',
                description: 'desc1',
              },
              {
                url: 'special2',
                description: 'desc2',
              },
            ],
            template: '{{ url }} {{ price }} {{ description }}',
            productInfoTemplate: '{{ url }} {{ price }}',
            productCardTemplate: '{{ url }} {{ price }}',
          };
        },
      });
    })
);
