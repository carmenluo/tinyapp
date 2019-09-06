const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const { getUserByEmail, emailLookup, checkCookies, generateRandomString } = require('./helpers');
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'userId',
  keys: ['id']
}));
app.use(methodOverride('_method'));
const PORT = 8080;
app.set('view engine', 'ejs');
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aa" }
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@ee.com",
    password: bcrypt.hashSync("12345", 10)
  },
  "aa": {
    id: "aa",
    email: "user2@ee.com",
    password: "aa"
  },
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

app.get("/urls", (req, res) => {
  let templateVars = checkCookies(req, urlDatabase, users);
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { "longURL": req.body.longURL, userID: req.session.userId };
  res.redirect(`/urls/${shortURL}`);
});
//Register
app.get("/register", (req, res) => {
  const templateVars = { users: users };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !req.body.password) {
    res.statusCode = 400;
    let error = { "statusCode": res.statusCode, "message": `Email address or password can't be empty` };
    const templateVars = { users: users, error };
    res.render("register", templateVars);
  }
  if (getUserByEmail(req.body.email, users)) {
    res.statusCode = 400;
    let error = { "statusCode": res.statusCode, "message": `Email has been registered` };
    const templateVars = { users: users, error };
    res.render("register", templateVars);
  }
  let user = { id, email, password };
  users[id] = user;
  //res.cookie('userId', id);
  req.session.userId = id;
  res.redirect('/urls');
});

//Login
app.get("/login", (req, res) => {
  const templateVars = { users: users };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.userId = user;
      res.redirect("/urls");
    } else {
      res.statusCode = 403;
      let error = { "statusCode": res.statusCode, "message": `Password not matching. Please double check` };
      const templateVars = { users: users, error };
      res.render("login", templateVars);
    }
  }
  res.statusCode = 403;
  let error = { "statusCode": res.statusCode, "message": `User record not found. Please double check` };
  const templateVars = { users: users, error };
  res.render("login", templateVars);
});
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = checkCookies(req, urlDatabase, users);
  if (!templateVars["useremail"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.put("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, useremail: emailLookup(req.session.userId, users)};
  res.render("urls_show", templateVars);
});

app.delete("/urls/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// app.post
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Expample app listening on port ${PORT}!`);
});

