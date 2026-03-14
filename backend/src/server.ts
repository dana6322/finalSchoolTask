import initApp from "./index";

const port = process.env.PORT || 3000;

initApp().then((app) => {
  console.log("after initApp");

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
});
