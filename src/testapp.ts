import { Hono } from "hono";
import hata, { MemoryStorageAdapter } from "./";
import { hataPanel } from "./panel";

const app = new Hono();

const hataInstance = hata({
	adapter: new MemoryStorageAdapter({
		"hata:enabled": {
			type: "boolean",
			default: false,
			description: "Enable or disable Hata",
			value: {
				development: true,
				staging: true,
			},
		},
	}),
});

app.use(hataInstance.middleware);

app.route("/hata", hataPanel({ storage: hataInstance.storage }));

app.get("/", async (c) => {
	const isEnabled = await c.flag("hata:enabled");
	if (isEnabled) {
		return c.text("Hata is enabled!");
	}
	return c.text("Hello Hono!");
});

export default app;
