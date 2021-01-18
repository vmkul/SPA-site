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

  async handle(route) {
    for (const pattern in this.RegEx) {
      if (route.startsWith(pattern)) {
        await this.RegEx[pattern]();
        return;
      }
    }

    const handler = this.routes[route];

    if (handler) {
      await handler();
    } else {
      if (this.preventDefault) return;
      await this.defaultHandler();
    }
  }
}

export default Router;
