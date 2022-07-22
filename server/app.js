var express = require("express");
var app = express();
var path = require("path");

app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug")

app.get("/", function (req, res) {
    // res.sendFile(path.join(__dirname, "index.html"));
//   res.render("index", {a: 12});
    res.send("Heyyyy")
});

app.listen(3000, "0.0.0.0");
