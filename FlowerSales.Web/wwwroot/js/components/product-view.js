// @ts-check

import { template, BaseComponent } from "./base.js";

export default class ProductView extends BaseComponent {
    static observedAttributes = [
        'id', 'name',
        'category_id', 'category_name',
        'store_location', 'post_code',
        'price', 'is_available'
    ];

    static htmlTemplate = /*html*/ template`<div class="card">
        <div class="title"><h2>${"name"}</h2><h3>${"category_name"}</h3></div>
        <div><b>Store Location:</b> ${"store_location"}</div>
        <div><b>Post Code:</b> ${"post_code"}</div>
        <div><b>Price:</b> $${"price"}</div>
        <div><b>Is available?</b> ${attrs => attrs.is_available === 'true' ? "Yes" : "No"}</div>
    </div>`;

    static cssTemplate = /*css*/ template`
        .card {
            background: var(--light-background);
            box-shadow: 0.3rem 0.3rem 0.75rem rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 0.5rem;
            min-height: 12rem;
            min-width: 28rem;
        }

        .title {
            display: flex;
            align-items: baseline;
            flex-direction: row;
            gap: 1rem;
        }

        h2 {
            margin-block: 0;
            font-size: 28pt;
        }

        h3 {
            margin-block: 0;
            color: var(--light-text)
        }
    `;
}
