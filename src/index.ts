import { Hono } from "hono";
import hata, { StorageType } from "./hata";
import configMiddleware, { AppConfig } from "./appConfig";

declare module "hono" {
	interface ContextVariableMap {
		config: AppConfig;
	}
}
const app = new Hono();
app.use(configMiddleware);

app.use(
	hata(app, {
		storage: {
			type: StorageType.Memory,
			flags: {
				"hata:enabled": {
					type: "boolean",
					default: false,
					description: "Enable or disable Hata",
					value: {
						development: true,
						staging: true,
					},
				},
			},
		},
		panel: {
			enabled: true,
			canAccess: (c) => {
				return true;
			},
		},
	}),
);

app.get("/", (c) => {
	const isEnabled = c.flag("hata:enabled");
	if (isEnabled) {
		return c.text("Hata is enabled!");
	}
	return c.text("Hello Hono!");
});

export default app;
