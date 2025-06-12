const subscriptions = new WeakMap();
let activeEffect;

const getSubscribersFor = (target, key) => {
    if (!subscriptions.has(target)) subscriptions.set(target, new Map());
    const props = subscriptions.get(target);

    if (!props.has(key)) props.set(key, new Set());
    return props.get(key);
};

const trigger = (target, key) => {
    const effects = getSubscribersFor(target, key);
    effects.forEach(effect => effect());
};

const track = (target, key) => {
    if (typeof activeEffect !== 'function') return;
    const effects = getSubscribersFor(target, key);
    effects.add(activeEffect);
};

export function watch(source, effect) {
    activeEffect = effect;
    source();
    activeEffect = null;
};

export function watchEffect(update) {
    const effect = () => {
        activeEffect = effect;
        update();
        activeEffect = null;
    };
    effect();
};

export function ref(value) {
    const self = {
        get value() {
            track(self, 'value');
            return value;
        },

        set value(newValue) {
            value = newValue;
            trigger(self, 'value');
        },
    };
    return self;
};

export function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            track(target, key);
            const val = target[key];
            if (val != null && typeof val === 'object') return reactive(val);
            else return val;
        },
        set(target, key, val) {
            if (val != null && typeof val === 'object') throw Error("attempted to set object on proxy");
            target[key] = val;
            trigger(target, key);
        },
    });
};

const unsetSentinel = Symbol("unset computed property");
export function computed(fn) {
    const self = {
        /** @type {any} */
        _cache: unsetSentinel,

        get value() {
            track(self, 'value');
            if (self._cache === unsetSentinel) self._cache = fn();
            return self._cache;
        },
    };

    watch(() => self._cache = fn(), () => {
        self._cache = unsetSentinel;
        trigger(self, 'value');
    });

    return self;
};

/** @returns {never} */
export function unreachable() { throw Error("unreachable"); };
