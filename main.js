"use strict";
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
    if (qp.has(input.name)) {
        input.value = qp.get(input.name);
    }
});
console.log("Done with post-load processing.");
//
configForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Get the values from the inputs
    const ip = ipInput.value;
    const port = portInput.value;
    const instance = instanceInput.value;
    // Set query parameters and update URL
    qp.set("ip", ip);
    qp.set("port", port);
    qp.set("instance", instance);
    history.pushState(null, "", url);
    try {
        content.textContent = "Fetching...";
        const data = await fetchData(ip, port, instance, 2000);
        content.textContent = data;
    }
    catch (error) {
        content.textContent = error;
    }
});
//
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
