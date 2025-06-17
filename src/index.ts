import { createMiddleware } from "hono/factory";

const Envs = ["development", "production", "staging"] as const;
type Env = (typeof Envs)[number];
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
};

declare module "hono" {
	interface Context {
		flag: (flag: string) => Promise<FlagValueOptional>;
	}
}

const hata = (config: HataConfig) => {
	return {
		middleware: createMiddleware(async (c, next) => {
			// TODO: Get the environment from the request or context
			const enviroment = "development";
			c.flag = async (flag: string) => {
				return config.adapter.getValue(flag, enviroment);
			};
			await next();
		}),
		storage: config.adapter,
	};
};

export default hata;
