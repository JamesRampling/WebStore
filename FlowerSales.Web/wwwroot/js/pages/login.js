import Api from '../api.js'
import { bind, boundChildren, computed, onBind, reactive, ref } from '../utilities.js'

const setupHandlers = (prefix, callback) => {
    const validationState = reactive({ email: false, password: false })
    const email = ref('')
    const password = ref('')
    const errors = reactive([])

    const updateEmail = elem => {
        validationState.email = elem.checkValidity()
        email.value = elem.value
    }
    const updatePassword = elem => {
        validationState.password = elem.checkValidity()
        password.value = elem.value
    }

    bind(document, {
        [`${prefix}-email`]: {
            [onBind]: updateEmail,
            oninput: e => updateEmail(e.target),
        },
        [`${prefix}-password`]: {
            [onBind]: updatePassword,
            oninput: e => updatePassword(e.target),
        },
        [`${prefix}-button`]: {
            onclick: () => callback(email.value, password.value, errors),
            disabled: computed(() => !Object.values(validationState).reduce((acc, value) => acc &&= value, true)),
        },
        [`${prefix}-errors`]: {
            [boundChildren]: computed(() => errors.map(e => {
                const elem = document.createElement('p')
                elem.textContent = e
                return elem
            })),
        },
    })
}

const doLogin = async (email, password, errors) => {
    const resp = await Api.login(email, password)
    if (resp.ok) return location.assign('/')
    errors.splice(0, errors.length, 'Invalid username or password.')
}

const doRegister = async (email, password, errors) => {
    const resp = await Api.register(email, password)
    if (resp.ok) return doLogin(email, password, errors)

    const json = await resp.json()
    errors.splice(0, errors.length, ...Object.values(json.errors).map(e => e[0]))
}

setupHandlers('login', doLogin)
setupHandlers('register', doRegister)
