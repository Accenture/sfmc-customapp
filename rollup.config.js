import path from "path";
import lwcRollupPlugin from "@lwc/rollup-plugin";
import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import del from "rollup-plugin-delete";
const config = {
	// input,
	input: {
		app: "src/client/app.js",
		salesforceNotification: "src/client/salesforceNotification.js",
		// platformEvent: "src/client/platformEvent.js",
		// dataTools: "src/client/dataTools.js",
		// test: "src/client/test.js"
	},
	output: {
		dir: path.resolve("dist"),
		format: "es",
		sourcemap: process.env.ROLLUP_WATCH ? "inline" : false
	},
	plugins: [
		del({ targets: "dist/*" }),
		nodeResolve(),
		lwcRollupPlugin({
			rootDir: "src/client",
			sourcemap: true,
			modules: [
				{
					dir: "modules"
				},
				{ npm: "@salesforce-ux/design-system" },
				{ npm: "lightning-base-components" },
				{ npm: "@avonni/base-components" }
			]
		}),
		replace({
			preventAssignment: true,
			values: {
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
			}
		})
	].filter(Boolean),
	watch: {
		exclude: ["node_modules/**"]
	}
};
export default config;
