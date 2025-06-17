import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Style } from "hono/css";
import { header } from "./styles";
import { StorageProvider } from ".";

type HataPanelConfig = {
	storage: StorageProvider;
};
export const hataPanel = ({ storage }: HataPanelConfig) => {
	const app = new Hono();
	app.get(
		"/*",
		jsxRenderer(({ children }) => {
			return (
				<html>
					<head>
						<Style />
					</head>
					<body>
						<header></header>
						<main>{children}</main>
					</body>
				</html>
			);
		}),
	);

	app.get("/", (c) => {
		return c.render(<div class={header}>Hata Panel</div>);
	});
	return app;
};
