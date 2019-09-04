const express = require('express');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = 8080;
app.set('view engine', 'ejs');
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send('Hello');
});
app.get("/urls", (req, res) => {
  let templateVars = {};
  console.log(req.cookies["username"]);
  if (req.cookies["username"]) {
    templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"]
    }
  } else {
    templateVars = {
      urls: urlDatabase
    }
  }
  res.render("urls_index", templateVars);
});
app.post("/login", (req, res) => {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})
app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  // res.render("urls_index", templateVars);

})
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// app.post
app.get('/urls.json', (req, res) => {
  res.json(urlDatabse);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
})

app.listen(PORT, () => {
  console.log(`Expample app listening on port ${PORT}!`);
});