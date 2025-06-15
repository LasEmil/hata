import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { env } from "hono/adapter";

export const Config = z.object({
	env: z.enum(["development", "production", "staging"]),
});

export type AppConfig = z.infer<typeof Config>;

const configMiddleware = createMiddleware(async (c, next) => {
	try {
		const enviroment = env<{ NODE_ENV: AppConfig["env"] }>(c);
		const result = Config.parse({ env: enviroment.NODE_ENV });
		c.set("config", result);
	} catch (error) {
		if (error instanceof z.ZodError) {
			c.status(500);
			return c.json({
				error: "Invalid configuration",
				details: error.errors,
			});
		} else {
			throw error;
		}
	}
	await next();
});

export default configMiddleware;
