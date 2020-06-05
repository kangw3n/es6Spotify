const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const app = express();

const client_id = "e11f3f56e75e45089d59eaa9826054a7"; // Your client id
const client_secret = "67001baab9334d50bb774cf0aae9e45c"; // Your secret

app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/token", async (req, res) => {
  let token = await getToken();
  return res.json({
    token: token.access_token || "",
  });
});

app.get("*", async (req, res) => {
  let token = await getToken();
  return res.render("index", {
    token: token.access_token || "",
  });
});

app.listen(process.env.PORT || 8080);

async function getToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  let spotifyToken = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
  }).then((res) => res.json());

  return spotifyToken;
}
