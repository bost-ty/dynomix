import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

String.prototype.toNumber = (s) => Number(s);

const dataLength = 50;
const data = [];

for (let i = 1; i < dataLength; i++) {
	let r = randomUUID();
	data.push({
		title: r,
		key: r,
		number: i,
	});
}

const server = createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	if (req.url === "/instance/VMIX_B/inputs" && req.method === "GET") {
		res.setHeader("Content-Type", "application/json");
		res.statusCode = 200;
		res.end(JSON.stringify(data));
	} else {
		res.statusCode = 404;
		res.end("Not found");
	}
});

const port = 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
