// @ts-check

import Api from "../api.js";

const list = document.querySelector("#products-list");
const pages = await Api.getProducts({ items: 100 });
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
