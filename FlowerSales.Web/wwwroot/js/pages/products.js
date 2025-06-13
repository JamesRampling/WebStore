// @ts-check

import Api from "../api.js";
import { computed, ref, unreachable, watchEffect } from "../utilities.js";

const list = document.querySelector("#products-list") ?? unreachable();
const page_elem = document.querySelector("#page-list") ?? unreachable();

const page = ref(0);

const pages = await Api.getProducts({ page: page.value, items: 5 });
const products = pages.items;
const pages_count = pages.total_pages;

const category_ids = [...new Set(products.map(product => product.category_id))];
const categories = Object.fromEntries((await Api.getSpecificCategories(category_ids)).map(category => [category.id, category.name]));

products.forEach(async product => {
    const elem = document.createElement('product-view');

    Object.entries(product).forEach(([key, value]) => elem.setAttribute(key, value));
    elem.setAttribute('category_name', categories[product.category_id] ?? "")

    list?.appendChild(elem)
});

const page_text = computed(() => `${page.value + 1}/${pages_count}`);
watchEffect(() => {
    page_elem.textContent = page_text.value
});

const prev_button = document.querySelector("#prev-page") ?? unreachable();
prev_button.addEventListener('click', () => page.value = page.value - 1);

const next_button = document.querySelector("#next-page") ?? unreachable();
next_button.addEventListener('click', () => page.value = page.value + 1);
