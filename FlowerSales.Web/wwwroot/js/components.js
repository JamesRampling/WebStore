// @ts-check

import ProductView from './components/product-view.js'

customElements.define('product-view', ProductView)

export function makeComponent(tag, attributes, props) {
    const elem = document.createElement(tag)

    Object.entries(attributes).forEach(([key, value]) => elem.setAttribute(key, value))
    Object.entries(props || {}).forEach(([key, value]) => elem[key] = value)

    return elem
}
