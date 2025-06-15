// @ts-check

import ProductView from './components/product-view.js'

customElements.define('product-view', ProductView)

export function makeComponent(tag, attributes, props, style) {
    const elem = document.createElement(tag)

    Object.entries(attributes).forEach(([key, value]) => elem.setAttribute(key, value))
    Object.assign(elem, props ?? {})
    Object.assign(elem.style, style ?? {})

    return elem
}
