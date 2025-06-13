// @ts-check

import { template, BaseComponent } from './base.js'

export default class ProductView extends BaseComponent {
    static observedAttributes = [
        'id', 'name',
        'category_id', 'category_name',
        'store_location', 'post_code',
        'price', 'is_available'
    ]

    static htmlTemplate = /*html*/ template`<a href='/product/${'id'}' class='card'>
        <div><h2>${'name'}</h2></div>
        <div><h3>${'category_name'}</h3></div>
        <div><h4>$${attrs => Number(attrs.price).toFixed(2)}</h4></div>
        <div><b>Location:</b> ${'store_location'}, ${'post_code'}</div>
        <div><i class='${attrs => `available-${attrs.is_available}`}'>
            ${attrs => attrs.is_available === 'true' ? 'Available' : 'Not available'}
        </i></div>
    </div>`

    static cssSource = /*css*/ `
        .card {
            display: block;
            background: var(--light-background);
            box-shadow: 0.3rem 0.3rem 0.75rem rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 0.5rem;
            min-height: 8.6rem;
        }

        h2 {
            margin-block: 0;
            font-size: 20pt;
        }

        h3 {
            margin-block: 0;
            color: var(--light-text);
        }

        h4 {
            margin-block: 0;
            font-weight: normal;
            font-size: 16pt;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .available-true {
            color: green;
        }

        .available-false {
            color: red;
        }
    `
}
