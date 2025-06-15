// @ts-check

import Api, { toQuery } from '../api.js'
import { makeComponent } from '../components.js'
import { afterBindChildren, bind, boundChildren, clamp, computed, reactive, ref, watchEffect } from '../utilities.js'

const makeProductView = product => makeComponent('product-view', product)
const nonNan = (value, other) => isNaN(value) ? other : value

const query = Object.fromEntries((new URLSearchParams(location.search)).entries())

const page_index = ref(nonNan(Number.parseInt(query.page, 10), 0))

const is_loading = ref(true)
const page_max = ref()
const product_items = reactive([])
const product_categories = reactive([])

const last_products_height = { value: 0 }
const safe_page_max = computed(() => (page_max.value ?? 1) - 1)

bind(document, {
    ['next-button']: {
        onclick: () => page_index.update(i => clamp(0, i + 1, safe_page_max.value)),
        disabled: computed(() => is_loading.value || page_index.value >= safe_page_max.value),
    },
    ['prev-button']: {
        onclick: () => page_index.update(i => clamp(0, i - 1, safe_page_max.value)),
        disabled: computed(() => is_loading.value || page_index.value <= 0),
    },

    ['page-display']: { textContent: computed(() => {
        const total = page_max.value
        return (typeof total === 'number')
            ? `${page_index.value + 1}/${total}`
            : '...'
    }) },

    ['product-list']: {
        [boundChildren]: computed(() => {
            return is_loading.value
                ? [makeComponent(
                    'div',
                    { class: 'loading' },
                    { textContent: 'Loading...' },
                    { minHeight: `${last_products_height.value}px` })]
                : product_items.map(makeProductView)
        }),
        [afterBindChildren]: elem => last_products_height.value = elem.clientHeight ?? 0,
    },
})

const updateProducts = async () => {
    is_loading.value = true

    const products = await Api.getProducts({ page: page_index.value, items: 6 })
    const categories = await Api.getCategories()

    const category_map = Object.fromEntries(categories.map(({id, name}) => [id, name]))

    products.items.forEach(p => p.category_name = category_map[p.category_id])

    page_max.value = products.total_pages
    product_items.splice(0, product_items.length, ...products.items)
    product_categories.splice(0, product_categories.length, ...categories)

    is_loading.value = false
}

const updateUrl = () => {
    const params = {
        page: page_index.value === 0 ? undefined : page_index.value,
    }

    history.replaceState(history.state, '', `?${toQuery(params)}`)
}

watchEffect(updateProducts)
watchEffect(updateUrl)
