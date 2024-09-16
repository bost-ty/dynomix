console.log("Welcome to Dynomix!");

const content = document.getElementById("content") as HTMLElement;
const configForm = document.getElementById("inputs") as HTMLFormElement;

const url = new URL(location.href);
const qp = url.searchParams;

const ipInput = document.getElementById("ip") as HTMLInputElement;
const portInput = document.getElementById("port") as HTMLInputElement;
const instanceInput = document.getElementById("instance") as HTMLInputElement;

const inputs = [ipInput, portInput, instanceInput];

inputs.forEach((input: any) => {
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
	} catch (error: any) {
		content.textContent = error;
	}
});

//

async function fetchData(ip: string, port: string, instance: string, timeoutMs: number) {
	if (!ip || !port || !instance) throw new Error(`Missing data`);
	const response = await fetch(`http://${ip}:${port}/instance/${instance}/data`, {
		signal: AbortSignal.timeout(timeoutMs),
	});
	const data = await handleHttpResponse(response);
	return data;
}

async function handleHttpResponse(response: Response): Promise<any> {
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
	} catch (error) {
		console.error(error);
		throw error;
	}
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
