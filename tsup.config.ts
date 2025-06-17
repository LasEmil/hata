import { defineConfig } from "tsup";
export default defineConfig({
	entry: {
		index: "src/index.ts",
		panel: "src/panel.tsx",
	},
	format: ["esm", "cjs"],
	experimentalDts: true,
	bundle: true,
	splitting: true,
	sourcemap: true,
	clean: true,
});
