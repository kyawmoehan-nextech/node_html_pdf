const express = require("express");
const morgan = require("morgan");

const templateRoutes = require("./api/routes/template");
const pdfRoutes = require("./api/routes/pdf");

const app = express();
const PORT = process.env.PORT || 3000;

// set view engine
app.set("view engine", "ejs");

// static file
app.use("/public", express.static("public"));

// logging req
app.use(morgan("dev"));

// handle form psot
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/", pdfRoutes);
app.use("/template", templateRoutes);

// port
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);
});
