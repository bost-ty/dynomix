"use strict";
/**
 * main.ts
 **/
console.log("Welcome to Dynomix!");
const content = document.getElementById("content");
const configForm = document.getElementById("inputs");
const url = new URL(location.href);
const qp = url.searchParams;
const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const instanceInput = document.getElementById("instance");
const inputs = [ipInput, portInput, instanceInput];
inputs.forEach((input) => {
    qp.has(input.name) ? (input.value = qp.get(input.name)) : "";
});
//
let renderedData = [];
configForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Get the current values of the inputs
    const [ip, port, instance] = inputs.map((input) => {
        qp.set(input.name, input.value);
        return input.value;
    });
    history.pushState(null, "", url);
    try {
        const data = await fetchData(ip, port, instance, 2000);
        const content = document.getElementById("content");
        renderedData = renderData(content, data);
    }
    catch (error) {
        content.textContent = error;
    }
});
function renderData(content, data) {
    const ol = document.getElementById("inputList")
        ? document.getElementById("inputList")
        : document.createElement("ol");
    if (!content.contains(document.getElementById("inputList"))) {
        content.innerHTML = "";
        ol.id = "inputList";
        content.appendChild(ol);
        content.classList.add("populated");
    }
    data.forEach(({ title, key } /* Destructure the actual args you need */) => {
        const li = document.createElement("li");
        li.id = key;
        const dirty = `<button id="${key}-btn">Copy</button><label for="${key}-text">
				${title}</label><input name="${key}-text" id="${key}-text" value="${key}" type="text" />`;
        // @ts-ignore
        const clean = DOMPurify.sanitize(dirty);
        li.innerHTML = clean;
        ol?.append(li);
        if (document.getElementById(`${key}-btn`)) {
            //@ts-ignore
            document.getElementById(`${key}-btn`).onclick = async () => {
                //@ts-ignore
                await copyKey(key);
            };
        }
    });
    return data;
}
async function fetchData(ip, port, instance, timeoutMs) {
    if (!ip || !port || !instance)
        throw new Error(`Missing data`);
    const response = await fetch(`http://${ip}:${port}/instance/${instance}/data`, {
        signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await handleHttpResponse(response);
    return data;
}
async function handleHttpResponse(response) {
    try {
        switch (response.status) {
            case 200:
                return await response.json();
            case 400:
                throw new Error("400 Bad Request");
            case 401:
                throw new Error("401 Unauthorized");
            case 404:
                throw new Error("404 Not Found");
            case 500:
                throw new Error("500 Internal Server Error");
            default:
                throw new Error(`Unexpected status code: ${response.status}`);
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function copyKey(key) {
    const self = document.getElementById(`${key}-btn`);
    //@ts-ignore
    const t = document.getElementById(key).value;
    navigator.clipboard.writeText(t);
    try {
        self?.classList.add("recently-copied");
        self?.classList.add("copied");
        setTimeout(() => {
            self?.classList.remove("recently-copied");
        }, 5000);
    }
    catch (error) {
        console.error("Couldn't copy key!");
    }
}
