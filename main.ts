/**
 * main.ts
 **/
console.log("Welcome to Dynomix!");

const content = <HTMLElement>document.getElementById("content");
const configForm = <HTMLFormElement>document.getElementById("inputs");
const fetchDataButton = <HTMLButtonElement>document.getElementById("submit");

const toast = <HTMLButtonElement>document.getElementById("toast");
const toastContent = <HTMLDivElement>document.getElementById("toast-content");

const url = new URL(location.href);
const qp = url.searchParams;

const ipInput = <HTMLInputElement>document.getElementById("ip");
const portInput = <HTMLInputElement>document.getElementById("port");
const instanceInput = <HTMLInputElement>document.getElementById("instance");
const formInputs = [ipInput, portInput, instanceInput];

for (const input of formInputs) {
  if (input.name && qp.has(input.name)) {
    input.value = qp.get(input.name) ?? "";
  }
}

let renderedData: CompanionData = [];

toast.addEventListener("click", () => {
  toast.classList.remove("on");
});

configForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Save the current values of the inputs to query parameters
  const [ip, port, instance] = formInputs.map((input) => {
    qp.set(input.name, input.value);
    return input.value;
  });
  history.pushState(null, "", url);

  try {
    const data = await fetchInputs(ip, port, instance, 2000);
    renderedData = renderData(content, data);
  } catch (error) {
    if (error instanceof TypeError) {
      content.textContent =
        "Couldn't retrieve inputs. Please double-check the Companion and vMix information, and make sure that vMix is connected to Companion.";
    }
    if (error) content.textContent = String(error);
    console.error(error);
    throw error;
  }
});

type InputData = {
  title: string;
  key: string;
  number: number;
};
type CompanionData = Array<InputData>;

function renderData(content: HTMLElement, data: CompanionData): CompanionData {
  const ol = document.createElement("ol");
  ol.id = "inputList";
  content.innerHTML = "";
  content.appendChild(ol);
  if (!(data.length > 0)) {
    content.textContent =
      "No inputs found. Is vMix open and connected to Companion?";
    return data;
  }
  content.classList.add("data-updated");
  setTimeout(() => {
    content.classList.remove("data-updated");
  }, 200);
  const filter = <HTMLInputElement>document.getElementById("filter");
  let matches = false;
  for (const { title, key, number } of data) {
    if (
      filter.value.length === 0 ||
      filter.value === "" ||
      title.includes(filter.value)
    ) {
      matches = true;
      const numberDisplay = number.toString().padStart(3, "0");
      const li = document.createElement("li");
      const dirtyHTML = `<span id="${key}-number">${numberDisplay}</span><button id="${key}-btn">Copy</button><label for="${key}-text">${title}</label><input name="${key}-text" id="${key}-text" value="${key}" type="text" disabled />`;
      // @ts-ignore
      li.innerHTML = DOMPurify.sanitize(dirtyHTML); // Because .setHTML still isn't supported everywhere, or in a very standard way!
      li.id = key;
      li.style.setProperty("--input-number", String(number));
      ol.append(li);
      const button = <HTMLButtonElement>document.getElementById(`${key}-btn`);
      if (button) {
        button.onclick = async function () {
          await copyKey(key, number)
            .then((t) => console.log(`Copied ${t}`))
            .catch((err) => console.error(err));
        };
      } else {
        throw new Error(`No button found with id \`${key}-btn\`.`);
      }
    }
  }
  content.classList.add("populated");

  if (!matches) {
    content.classList.remove("populated");
    content.innerHTML = `No input matches for <code>${filter.value}</code>.<br />Please try a different term.`;
  }
  return data;
}

async function fetchInputs(
  ip: string,
  port: string,
  instance: string,
  timeoutMs: number = 5000,
) {
  if (!ip || !port || !instance) throw new Error(`Missing data`);
  const response = await fetch(
    `http://${ip}:${port}/instance/${instance}/inputs`,
    {
      signal: AbortSignal.timeout(timeoutMs),
    },
  );
  const data = await handleHttpResponse(response);
  return data;
}

async function handleHttpResponse(response: Response): Promise<any> {
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

let toastTimeout: number | undefined = 0;
function playToast(message: string) {
  const duration = 3000; // ms
  toastContent.innerHTML = message;
  toast.classList.add("on");
  return setTimeout(() => toast.classList.remove("on"), duration);
}

async function copyKey(key: string, input: number) {
  const button = document.getElementById(`${key}-btn`);
  if (!button) throw new Error("Could not locate my button!");
  //@ts-ignore
  const t = document.getElementById(`${key}-text`).value;
  navigator.clipboard.writeText(t).catch((err) => console.error(err));
  button.classList.add("recently-copied");
  button.classList.add("copied");
  button.innerText = "Copied";
  setTimeout(() => {
    button.classList.remove("recently-copied");
    button.innerText = "Copy";
  }, 3000);

  clearTimeout(toastTimeout);
  toastTimeout = playToast(
    `<div>Copied unique ID of input #${input}</div><div>${key}</div>`,
  );

  return t;
}
