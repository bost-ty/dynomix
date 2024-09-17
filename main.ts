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
		// content.textContent = "Fetching...";
		const data = await fetchData(ip, port, instance, 2000);
		renderData(content, data);
	} catch (error: any) {
		content.textContent = error;
	}
});

//

function renderData(content: HTMLElement, data: { title: string; key: string }[]): void {
	content.innerHTML = "";
	const ol = document.createElement("ol");
	ol.id = "inputList";
	content.appendChild(ol);
	content.classList.add("populated");
	data.forEach((input) => {
		// const div = document.createElement("div");
		// div.classList.add("listItem");
		const title = input.title;
		const key = input.key;
		const li = document.createElement("li");
		const dirty = `<button id="${key}-btn">Copy</button><label for="${key}" style="font-family: monospace;">
				${
					title.length > 45
						? title
						: // .slice(0, 39)
						  // .concat("...")
						  // .concat(title.slice(title.length - 3, title.length))
						  title
				}</label><input name="${key}" id="${key}" value="${key}" type="text" />
			`;
		//@ts-ignore
		const clean = DOMPurify.sanitize(dirty);
		li.innerHTML = clean;
		ol.append(li);
		if (document.getElementById(`${key}-btn`)) {
			//@ts-ignore
			document.getElementById(`${key}-btn`).onclick = async () => {
				//@ts-ignore
				await copyKey(key);
			};
		}
	});
}

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

async function copyKey(key: string) {
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
	} catch (error) {
		console.error("Couldn't copy key!");
	}
}
