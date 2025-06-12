import Api from '../api.js';
import { unreachable } from '../utilities.js';

const reactive = (initial, callback) => {
    return new Proxy(initial, {
        get(target, prop, receiver) {
            return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
            const val = Reflect.set(target, prop, value, receiver);
            callback(target);
            return val;
        },
    });
};

const setupHandlers = (prefix, callback) => {
    const email = document.querySelector(`#${prefix}-email`) ?? unreachable();
    const password = document.querySelector(`#${prefix}-password`) ?? unreachable();
    const button = document.querySelector(`#${prefix}-button`) ?? unreachable();
    const errors = document.querySelector(`#${prefix}-errors`) ?? unreachable();

    button.disabled = true;
    let validationState = reactive({
        email: false,
        password: false,
    }, state => {
        button.disabled = !Object.values(state).reduce((acc, value) => acc &&= value, true);
    });

    email.addEventListener('input', e => validationState.email = e.target.checkValidity());
    password.addEventListener('input', e => validationState.password = e.target.checkValidity());

    button.addEventListener('click', async e => callback(email.value, password.value, errors));
};

const doLogin = async (email, password, errors) => {
    const resp = await Api.login(email, password);
    if (resp.ok) return location.assign('/');
    errors.textContent = "Invalid username or password.";
};

const doRegister = async (email, password, errors) => {
    const resp = await Api.register(email, password);
    if (resp.ok) return doLogin(email, password, errors);

    const json = await resp.json();
    errors.replaceChildren(...Object.values(json.errors).map(values => {
        const elem = document.createElement('p');
        elem.textContent = values[0];
        return elem;
    }));
};

setupHandlers('login', doLogin);
setupHandlers('register', doRegister);
