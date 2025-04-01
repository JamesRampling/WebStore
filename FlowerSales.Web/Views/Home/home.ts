const req = fetch("https://localhost:7294/weatherforecast");

type Product = {
    date: string,
    summary: string,
    temperatureC: number,
    temperatureF: number,
};

const list = document.querySelector("#forecast-list");
if (list === null) throw TypeError("list did not exist");

req.then(a => a.json()).then((forecast: Product[]) => {
    for (const item of forecast) {
        const elem = document.createElement("li");
        elem.textContent = `${item.date}: ${item.summary} (${item.temperatureC}C) (${item.temperatureF}F)`;
        list.append(elem);
    }
});

export { };
