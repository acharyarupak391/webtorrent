var express = require("express");
var app = express();
var path = require("path");
const { getFiles } = require("../utils");

require("dotenv").config();

app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  const files = getFiles(path.join(__dirname, "public", "files"));
  res.render("index", { files });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", undefined, () => {
  console.log(`server running on port ${PORT}\nhttps://0.0.0.0:${PORT}`)
});
