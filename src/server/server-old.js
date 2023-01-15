import express from "express";
const app = express();
const port = 3000;

app.use(express.static("dist"));
app.use(express.static("node_modules/@salesforce-ux/design-system/assets"));

app.use((_, res) => {
  res.sendStatus(404);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
