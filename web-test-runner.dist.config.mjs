import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  files: "test/**/*.test.js",
  browsers: [playwrightLauncher({ product: "chromium" })],
  plugins: [
    {
      name: "use-dist",
      transform(context) {
        if (context.url.endsWith(".test.js")) {
          return {
            body: context.body.replace(
              "import '../wc-month-year-date.js'",
              "import '../dist/wc-month-year-date.min.js'",
            ),
          };
        }
      },
    },
  ],
  nodeResolve: true,
};
