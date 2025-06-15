const subscriptions = new WeakMap()
const effectStack = []

const getSubscribersFor = (target, key) => {
    if (!subscriptions.has(target)) subscriptions.set(target, new Map())
    const props = subscriptions.get(target)

    if (!props.has(key)) props.set(key, new Set())
    return props.get(key)
}

const trigger = (target, key) => {
    const effects = getSubscribersFor(target, key)
    effects.forEach(effect => effect())
}

const track = (target, key) => {
    const activeEffect = effectStack[effectStack.length - 1]
    if (typeof activeEffect !== 'function') return
    const effects = getSubscribersFor(target, key)
    effects.add(activeEffect)
}

export function watch(source, effect) {
    effectStack.push(effect)
    source()
    effectStack.pop()
}

export function watchEffect(update) {
    const effect = () => {
        effectStack.push(effect)
        update()
        effectStack.pop()
    }
    effect()
}

const reactiveCellMarker = Symbol('reactive cell marker')
const extendReactiveCell = cell => Object.assign(cell, {
    [reactiveCellMarker]: true,
    watch: effect => watch(() => cell.value, () => effect(cell.value)),
    watchEffect: effect => watchEffect(() => effect(cell.value)),
})

export function isReactiveCell(obj) { return obj != null && (typeof obj === 'object') && obj[reactiveCellMarker] }

export function ref(value) {
    const self = {
        get value() {
            track(self, 'value')
            return value
        },

        set value(newValue) {
            value = newValue
            trigger(self, 'value')
        },

        update(fn) {
            value = fn(value)
            trigger(self, 'value')
        }
    }

    return extendReactiveCell(self)
}

const cacheSymbol = Symbol('computed property cache')
const invalidatedSymbol = Symbol('computed property invalidation state')

export function computed(fn) {
    const self = {
        [invalidatedSymbol]: true,

        get value() {
            track(self, 'value')
            if (self[invalidatedSymbol]) {
                const val = fn()
                self[invalidatedSymbol] = self[cacheSymbol] !== val
                self[cacheSymbol] = val
            }
            return self[cacheSymbol]
        },
    }

    watch(() => self._cache = fn(), () => {
        self[invalidatedSymbol] = true
        trigger(self, 'value')
    })

    return extendReactiveCell(self)
}

const reactiveProxyHandler = {
    get(target, key) {
        track(target, key)
        const val = target[key]
        if (val != null && typeof val === 'object') return new Proxy(val, reactiveProxyHandler)
        else return val
    },
    set(target, key, val) {
        target[key] = val
        trigger(target, key)
        return true
    },
}

export function reactive(obj) { return new Proxy(obj, reactiveProxyHandler) }

export const boundChildren = Symbol('bound children elements')
export const afterBind = Symbol('after bind lifecycle event')
export const afterBindChildren = Symbol('after bind children lifecycle event')

export function bind(parent, elements) {
    return Object.fromEntries(Object.entries(elements).flatMap(([name, obj]) => {
        const node = parent.getElementById(name)

        if (node == null) throw new Error(`failed to get element with id ${name}`)
        if (typeof obj === 'string') return [[obj, node]]
        if (typeof obj !== 'object') throw new Error(`unsure how to handle bound value for ${name}`)

        Reflect.ownKeys(obj).forEach(prop => {
            const fn = obj[prop]

            if (prop === boundChildren) {
                watchEffect(() => {
                    const children = isReactiveCell(fn) ? fn.value : fn
                    node.replaceChildren(...children)
                    node[afterBindChildren]?.(node)
                })
            } else if (prop === afterBind) {
                fn(node)
            } else if (isReactiveCell(fn)) {
                fn.watchEffect(res => node[prop] = res)
            } else node[prop] = fn
        })

        return []
    }))
}

/** @returns {never} */
export function unreachable() { throw Error('unreachable') }

export function clamp(min, val, max) { return Math.max(min, Math.min(val, max)) }
