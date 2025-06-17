import { createMiddleware } from "hono/factory";
import { AppConfig } from "./appConfig";
import { Context, Hono } from "hono";

type Env = AppConfig["env"];
type FlagValue = boolean | string;
type FlagValueOptional = FlagValue | undefined;
type Flag = {
	type: "boolean" | "string";
	default: boolean | string;
	description: string;
	value: Partial<Record<Env, FlagValue>>;
};
type Flags = Record<string, Flag>;

export interface StorageProvider {
	flags: Flags;
	getValue(flag: string, enviroment: Env): Promise<FlagValueOptional>;
}

export class MemoryStorageAdapter implements StorageProvider {
	flags: Flags = {};
	constructor(flags: Record<string, Flag>) {
		this.flags = flags;
	}

	async getValue(flag: string, enviroment: Env): Promise<FlagValueOptional> {
		const flagData = this.flags[flag];
		if (!flagData) return Promise.reject(new Error(`Flag ${flag} not found`));

		return Promise.resolve(flagData.value[enviroment] ?? flagData.default);
	}
}

export type HataConfig = {
	adapter: StorageProvider;
	panel: {
		enabled: boolean;
		canAccess: (c: Context) => boolean;
	};
};

declare module "hono" {
	interface Context {
		flag: (flag: string) => Promise<FlagValueOptional>;
	}
}

const hata = (app: Hono, config: HataConfig) => {
	if (config.panel.enabled) {
		app.get("/hata", (c) => {
			if (!config.panel.canAccess(c)) {
				return c.text("Access denied", 403);
			}
			return c.json({
				message: "Hata panel is enabled",
			});
		});
	}
	return createMiddleware(async (c, next) => {
		const enviroment = c.get("config")?.env;
		c.flag = async (flag: string) => {
			return config.adapter.getValue(flag, enviroment);
		};
		await next();
	});
};

export default hata;
