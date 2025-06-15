// @ts-check

import Api from './api.js'
import { bind } from './utilities.js'

const AccountDetails = {
    cached: null,

    async userEmail() {
        if (this.cached !== null) return this.cached

        const info = await Api.info()
        this.cached = info.email
        return info.email
    },

    async loggedIn() {
        return this.userEmail() !== null
    },
}

AccountDetails.userEmail().then(email => {
    bind(document, {
        ['account-info']: { textContent: email },
        ['login-anchor']: { className: 'hidden' },
        ['logout-anchor']: {
            className: '',
            onclick: () => Api.logout().then(() => location.reload()),
        },
    })
}).catch(e => { /* this is expected to throw when logged out */ })

export default AccountDetails
