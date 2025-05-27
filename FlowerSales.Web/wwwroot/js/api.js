// @ts-check

// TODO: get this from appsettings somehow
const apiHost = "https://localhost:7294";

const request = (endpoint, options) => fetch(apiHost + endpoint, options);

export default {
    login: (email, password) => request("/api/account/login", {
        method: "POST", body: JSON.stringify({
            email, password
        })
    }),
    logout: () => request("/api/account/logout", "POST"),
}
