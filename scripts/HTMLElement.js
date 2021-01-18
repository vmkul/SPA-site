class HTMLElement {
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

export default HTMLElement;
