// @ts-check

import Api from './api.js'

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
    let accInfo = document.getElementById('account-info')
    let loginButton = document.getElementById('login-anchor')
    let logoutButton = document.getElementById('logout-anchor')
    if (accInfo == null || loginButton == null || logoutButton == null) return

    accInfo.textContent = email
    loginButton.classList.add('hidden')
    logoutButton.classList.remove('hidden')

    logoutButton.onclick = (e) => {
        Api.logout().then(() => location.reload())
    }
})

export default AccountDetails
