// import { resolve } from "path";
// import cgi from "cgi";

export default function peopleApiPlugin() {
  return {
    name: "handle-people-api",
    /**
     * @param {import("vite").ViteDevServer} server
     */
    configureServer(server) {
      server.middlewares.use("/cgi-bin/people.py", () => {
        return { year: "1" };
        // TODO: Make CGI stuff work :(
        // cgi({
        //   path: resolve(__dirname, "..", "cgi-bin", "people.py"),
        // });
      });
    },
  };
}
