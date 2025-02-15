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
    qp.has(input.name) ? (input.value = qp.get(input.name)) : null;
});
function playToast(toast, message) {
    const duration = 3000; // ms
    toast.textContent = message;
    toast.classList.add("on");
    return setTimeout(() => toast.classList.remove("on"), duration);
}
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
        const data = await fetchInputs(ip, port, instance, 2000);
        const content = document.getElementById("content");
        renderedData = renderData(content, data);
    }
    catch (error) {
        console.error(error);
        content.textContent = error;
    }
});
function renderData(content, data) {
    const ol = document.createElement("ol");
    ol.id = "inputList";
    content.innerHTML = "";
    content.appendChild(ol);
    if (!(data.length > 0)) {
        content.textContent = "No inputs found. Is vMix open and connected to Companion?";
        return data;
    }
    content.classList.add("data-updated");
    setTimeout(() => {
        content.classList.remove("data-updated");
    }, 200);
    const filter = document.getElementById("filter");
    content.classList.add("populated");
    let matches = false;
    data.forEach(({ title, key, number }) => {
        if (filter.value.length === 0 ||
            filter.value === "" ||
            title.includes(filter.value)) {
            matches = true;
            const numberDisplay = number.toString().padStart(3, "0");
            const li = document.createElement("li");
            const dirtyHTML = `<span id="${key}-number">${numberDisplay}</span><button id="${key}-btn">Copy</button><label for="${key}-text">
								${title}</label><input name="${key}-text" id="${key}-text" value="${key}" type="text" disabled />`;
            // @ts-ignore
            li.innerHTML = DOMPurify.sanitize(dirtyHTML);
            li.id = key;
            ol.append(li);
            const button = document.getElementById(`${key}-btn`);
            if (button) {
                button.onclick = async function () {
                    await copyKey(key, number)
                        .then((t) => console.log(`Copied ${t}`))
                        .catch((err) => console.error(err));
                };
            }
            else {
                throw new Error(`No button found with id \`${key}-btn\`.`);
            }
        }
    });
    if (!matches) {
        content.classList.remove("populated");
        content.innerHTML = `No input matches for <code>${filter.value}</code>.<br>Please try a different term.`;
    }
    return data;
}
async function fetchInputs(ip, port, instance, timeoutMs = 5000) {
    if (!ip || !port || !instance)
        throw new Error(`Missing data`);
    const response = await fetch(`http://${ip}:${port}/instance/${instance}/inputs`, {
        signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await handleHttpResponse(response);
    return data;
}
async function handleHttpResponse(response) {
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let toastTimeout = 0;
async function copyKey(key, input) {
    const button = document.getElementById(`${key}-btn`);
    if (!button)
        throw new Error("Could not locate my button!");
    //@ts-ignore
    const t = document.getElementById(`${key}-text`).value;
    navigator.clipboard.writeText(t).catch((err) => console.error(err));
    button.classList.add("recently-copied");
    button.classList.add("copied");
    setTimeout(() => {
        button.classList.remove("recently-copied");
    }, 5000);
    const toast = document.getElementById("toast");
    clearTimeout(toastTimeout);
    toastTimeout = playToast(toast, `${input} ✅ ${key}`);
    return t;
}
