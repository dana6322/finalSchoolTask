import http from "http";
import initApp from "./index";

const port = parseInt(process.env.PORT || "3000", 10);

initApp().then((app) => {
  console.log("after initApp");

  const server = http.createServer(app);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Example app listening at http://0.0.0.0:${port}`);
  });
});
