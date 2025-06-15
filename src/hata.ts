import { createMiddleware } from "hono/factory";
import { AppConfig } from "./appConfig";
import { Context, Hono } from "hono";

type FlagValue = boolean | string;
type FlagValueOptional = FlagValue | undefined;
type Flag = {
	type: "boolean" | "string";
	default: boolean | string;
	description: string;
	value: Partial<Record<AppConfig["env"], FlagValue>>;
};

interface StorageStrategy {
	getValue: (flag: string, enviroment: AppConfig["env"]) => FlagValueOptional;
}

class MemoryStorage implements StorageStrategy {
	private flags: Record<string, Flag>;

	constructor(flags: Record<string, Flag>) {
		this.flags = flags;
	}

	getValue(flag: string, enviroment: AppConfig["env"]): FlagValueOptional {
		const flagData = this.flags[flag];
		if (!flagData) return undefined;

		return flagData.value[enviroment] ?? flagData.default;
	}
}
class RedisStorage implements StorageStrategy {
	getValue(flag: string, enviroment: AppConfig["env"]): FlagValueOptional {
		// Implement Redis logic here
		// This is a placeholder implementation
		return undefined;
	}
}

export enum StorageType {
	Memory,
	Redis,
}
export type HataConfig = {
	storage:
		| {
				type: StorageType.Memory;
				flags: Record<string, Flag>;
		  }
		| {
				type: StorageType.Redis;
				url: string;
		  };
	panel: {
		enabled: boolean;
		canAccess: (c: Context) => boolean;
	};
};

declare module "hono" {
	interface Context {
		flag: (flag: string) => FlagValueOptional;
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
		// Get the main app instance
		console.log(app);
		let strategy: StorageStrategy;
		switch (config.storage.type) {
			case StorageType.Memory:
				strategy = new MemoryStorage(config.storage.flags);
				break;
			case StorageType.Redis:
				strategy = new RedisStorage();
				break;

			default:
				throw new Error("Unsupported storage type");
		}

		const enviroment = c.get("config")?.env;
		c.flag = (flag: string) => {
			return strategy.getValue(flag, enviroment);
		};
		await next();
	});
};

export default hata;
