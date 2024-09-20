/**
 * main.ts
 **/
console.log("Welcome to Dynomix!");

const content = document.getElementById("content") as HTMLElement;
const configForm = document.getElementById("inputs") as HTMLFormElement;

const url = new URL(location.href);
const qp = url.searchParams;

const ipInput = document.getElementById("ip") as HTMLInputElement;
const portInput = document.getElementById("port") as HTMLInputElement;
const instanceInput = document.getElementById("instance") as HTMLInputElement;

configForm.addEventListener("load", () => {
	configForm.focus();
});

const inputs = [ipInput, portInput, instanceInput];

inputs.forEach((input: any) => {
	qp.has(input.name) ? (input.value = qp.get(input.name)) : null;
});

//

let renderedData: CompanionData = [];

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
		const content = document.getElementById("content") as HTMLElement;
		renderedData = renderData(content, data);
	} catch (error: any) {
		console.error(error);
		content.textContent = error;
	}
});

//

type InputData = {
	title: string;
	key: string;
};
type CompanionData = Array<InputData>;

function renderData(content: HTMLElement, data: CompanionData): CompanionData {
	const ol = document.createElement("ol");
	ol.id = "inputList";
	content.innerHTML = "";
	content.appendChild(ol);
	if (data.length > 0) {
		content.classList.add("populated");
		data.forEach(
			({ title, key } /* Destructure the actual args you need */) => {
				const li = document.createElement("li");
				li.id = key;
				const dirty = `<button id="${key}-btn">Copy</button><label for="${key}-text">
				${title}</label><input name="${key}-text" id="${key}-text" value="${key}" type="text" />`;
				// @ts-ignore
				li.innerHTML = DOMPurify.sanitize(dirty);
				ol.append(li);
				const button = document.getElementById(`${key}-btn`);
				if (!button) throw new Error(`No key-btn found for key ${key}`);
				button.onclick = async function () {
					await copyKey(key)
						.then((t) => console.log(`Copied ${t}`))
						.catch((err) => console.error(err));
				};
			}
		);
	} else {
		content.innerHTML =
			"No inputs found! Is vMix open and connected to Companion?";
	}
	return data;
}

async function fetchInputs(
	ip: string,
	port: string,
	instance: string,
	timeoutMs: number = 5000
) {
	if (!ip || !port || !instance) throw new Error(`Missing data`);
	const response = await fetch(
		`http://${ip}:${port}/instance/${instance}/inputs`, // TODO: Allow for endpoint selection
		{
			signal: AbortSignal.timeout(timeoutMs),
		}
	);
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
	const button = document.getElementById(`${key}-btn`);
	if (!button) throw new Error("Could not locate my button!");
	//@ts-ignore
	const t = document.getElementById(`${key}-text`).value;
	navigator.clipboard.writeText(t).catch((err) => console.error(err));
	button.classList.add("recently-copied");
	button.classList.add("copied");
	setTimeout(() => {
		button.classList.remove("recently-copied");
	}, 5000);
	return t;
}
