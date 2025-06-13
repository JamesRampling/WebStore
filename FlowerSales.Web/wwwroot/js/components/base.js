// @ts-check

export const template = (strings, ...keys) => (values) => {
    const result = [strings[0]]

    keys.forEach((key, i) => {
        const value = typeof key === typeof Function ? key(values) : values[key]
        result.push(value, strings[i + 1])
    })

    return result.join('')
}

export class BaseComponent extends HTMLElement {
    /** @type {(...values: any[]) => string} */
    static htmlTemplate = () => ''

    /** @type {string} */
    static cssSource = ''

    /** @type {string[]} */
    static observedAttributes = []

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback() {
        this.render()
    }

    render() {
        const dom = this.shadowRoot ?? this.attachShadow({ mode: 'open' })

        const constructor = Object.getPrototypeOf(this).constructor
        const observed = constructor.observedAttributes
        const attrs = Object.fromEntries(observed.map(name => [name, this.getAttribute(name)]))

        const mkHtml = constructor.htmlTemplate

        const sheet = new CSSStyleSheet()
        sheet.replaceSync(constructor.cssSource)

        dom.adoptedStyleSheets = [sheet]
        dom.innerHTML = mkHtml(attrs)
    }
}
