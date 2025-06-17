import { Hono } from "hono";
import hata, { MemoryStorageAdapter } from "./hata";
import configMiddleware, { AppConfig } from "./appConfig";

declare module "hono" {
	interface ContextVariableMap {
		config: AppConfig;
	}
}
const app = new Hono();
app.use(configMiddleware);

const hataInstance = hata(app, {
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
	panel: {
		enabled: true,
		canAccess: (c) => {
			return true;
		},
	},
});

app.use(hataInstance);

app.get("/", async (c) => {
	const isEnabled = await c.flag("hata:enabled");
	if (isEnabled) {
		return c.text("Hata is enabled!");
	}
	return c.text("Hello Hono!");
});

export default app;
