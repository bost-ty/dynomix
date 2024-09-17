import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

String.prototype.toNumber = (s) => Number(s);

const data = [
	{
		title:
			"COUNTING-IN_v2_fast_final_finalfinal_usethisone_20240928_final_usethisone.mov",
		key: randomUUID(),
	},
	{
		title: "Input 2",
		key: randomUUID(),
	},
	{
		title: "Input 3",
		key: randomUUID(),
	},
	{
		title: "Input 4",
		key: randomUUID(),
	},
	{
		title: "Input 5",
		key: randomUUID(),
	},
	{
		title: "Input 6",
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
	{
		title: randomUUID().slice(0, 80),
		key: randomUUID(),
	},
];

const server = createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	if (req.url === "/instance/VMIX_B/data" && req.method === "GET") {
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
