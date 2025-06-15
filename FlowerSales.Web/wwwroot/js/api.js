// @ts-check

// TODO: get this from appsettings somehow
const apiHost = 'https://localhost:7294'

const request = (endpoint, method, body, version) => fetch(apiHost + endpoint, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Version': version ?? '1',
    },
    credentials: 'include',
    method,
    body: JSON.stringify(body),
})

export const toQuery = (...objects) =>
    Object.entries(Object.assign({}, ...objects))
        .filter(([_, value]) => value != undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')

const Api = {
    login: (email, password) => request('/api/account/login?useCookies=true', 'POST', {email, password}),
    register: (email, password) => request('/api/account/register', 'POST', {email, password}),
    info: () => request('/api/account/manage/info').then(r => r.json()),
    logout: () => request('/api/account/logout', 'POST'),

    getCategory: (id) => request(`/api/store/category/${id}`).then(r => r.json()),
    getCategories: (name) => request(`/api/store/categories?${toQuery({name})}`).then(r => r.json()),

    createCategory: (name) => request('/api/store/category', 'POST', {name}).then(r => r.json()),
    updateCategory: (id, name) => request(`/api/store/category/${id}`, 'PUT', {name}),
    deleteCategory: (id) => request(`/api/store/category/${id}`, 'DELETE'),

    getProducts: (pagination, filters) => request(`/api/store/products?${toQuery(pagination, filters)}`).then(r => r.json()),
    createProduct: (name, category_id, store_location, post_code, price, is_available) => request('/api/store/product', 'POST', {
        name, category_id, store_location, post_code, price, is_available,
    }).then(r => r.json()),
    updateProduct: (id, name, category_id, store_location, post_code, price, is_available) => request(`/api/store/product/${id}`, 'PUT', {
        name, category_id, store_location, post_code, price, is_available,
    }),
    deleteProduct: (id) => request(`/api/store/product/${id}`, 'DELETE'),
}

export const ApiV2 = Object.assign({}, Api, {
    getProducts: (pagination, filters) => request(`/api/store/products?${toQuery(pagination, filters)}`, 'GET', undefined, '2').then(r => r.json()),
    createProduct: (name, category_id, store_location, post_code, price, is_available) => request('/api/store/product', 'POST', {
        name, category_id, store_location, post_code, price, is_available,
    }, '2').then(r => r.json()),
    updateProduct: (id, name, category_id, store_location, post_code, price, is_available) => request(`/api/store/product/${id}`, 'PUT', {
        name, category_id, store_location, post_code, price, is_available,
    }, '2'),
    deleteProduct: (id) => request(`/api/store/product/${id}`, 'DELETE', undefined, '2'),
})

export default Api

export const deleteAll = async () => {
    const products = await Api.getProducts({ items: 100 })
    products.forEach(product => Api.deleteProduct(product.id))

    const categories = await Api.getCategories()
    categories.forEach(category => Api.deleteCategory(category.id))
}

export const seedData = () => {
    const addCategory = async (name, products) => {
        const category = await Api.createCategory(name).then(r => r.id)
        products.forEach(product => {
            Api.createProduct(product[0], category, product[1], product[2], product[3], product[4])
        })
    }

    addCategory('Bouquetes', [
        ['Flowers in the city', 'Canning Vale', '6155', 68, true],
        ['Gerberas', 'Willeton', '6155', 35, true],
        ['Aziatic Lilies', 'Palmyra', '6123', 33, true],
        ['European Lilies', 'Melville', '6145', 125, true],
        ['Chrisantemum', 'Cannington', '6112', 60, true],
        ['Alstroemeria', 'Waikiki', '6112', 95, true],
        ['Snapdragon small', 'Tuart Hill', '6112', 65, true],
        ['V-Crocus', 'Willeton', '6113', 65, true],
        ['Crocus', 'Armadale', '6114', 17, true],
    ])

    addCategory('Box Flowers', [
        ['Calla Lily', 'Aubin Grove', '6115', 99, true],
        ['Geranium small', 'Darch', '6116', 0, false],
        ['Geranium Large', 'Joondalup', '6112', 125, true],
        ['Alstroemeria', 'Piara Waters', '6121', 22, false],
        ['Gerberas', 'Byford', '6132', 95, true],
        ['Marigold', 'Dianella', '6342', 17, true],
    ])

    addCategory('Wraps', [
        ['Azalea', 'Leong', '6123', 2.8, true],
        ['Lemon-Lazalea', 'Fremantle', '6124', 2.8, true],
        ['Zinnia', 'Beaconsfield', '6125', 2.8, false],
        ['Peach Zinnia', 'North Freo', '6126', 2.8, true],
        ['Raspberry Zinnia', 'Munster', '6127', 2.8, true],
        ['Snapdragon big', 'Coogee', '6128', 2.8, true],
    ])

    addCategory('Single Flower', [
        ['Petunia', 'South Freo', '6129', 24.99, true],
    ])

    addCategory('Additional', [
        ['Dahlia (long lasting)', 'City', '6112', 9.99, true],
        ['Dahlia', 'West Perth', '6130', 12.49, true],
        ['Orchid domestic', 'East Perth', '6131', 13.99, true],
        ['Orchid Expensive', 'Bentley' , '6132', 12.49, true],
        ['Marigold', 'Carslie', '6133', 9.99, true],
        ['Gardenia type-C', 'Lathlain', '6134', 11.99, true],
        ['Gardenia type-B', 'Booragoon', '6135', 12.99, true],
        ['Gardenia', 'Applecross', '6136', 9.99, true],
        ['Calla Lily', 'Rockingham', '6001', 12.49, true],
    ])
}
