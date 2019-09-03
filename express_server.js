const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;
app.set('view engine','ejs');
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/",(req, res) => {
  res.send('Hello');
});
app.get("/urls", (req, res) => {
  console.log(urlDatabase);
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new",(req, res) => {
  res.render("urls_new");
})
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.redirect("/urls");
 // res.render("urls_index", templateVars);

})
app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);
  // res.send("OK");
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // let templateVars = {urls: urlDatabase};
  // res.render("urls_index", templateVars);
  res.redirect(`/urls/${shortURL}`);
})
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  console.log(req.params);
  let templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// app.post
app.get('/urls.json',(req, res) => {
  res.json(urlDatabse);
});
app.get("/hello",(req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get('/set',(req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
})

app.listen(PORT, () => {
  console.log(`Expample app listening on port ${PORT}!`);
});