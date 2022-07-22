var express = require("express");
var app = express();
var path = require("path");
const { getFiles } = require("../utils");

app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  const files = getFiles(path.join(__dirname, "public", "files"));
  res.render("index", { files });
});

app.listen(8080, "0.0.0.0");
