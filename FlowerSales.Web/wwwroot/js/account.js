// @ts-check

import Api from './api.js';

const AccountDetails = {
    cached: null,

    async userEmail() {
        if (this.cached !== null) return this.cached;

        const info = await Api.info();
        this.cached = info.email;
        return info.email;
    },

    async loggedIn() {
        return this.userEmail() !== null;
    },
};

export default AccountDetails;
