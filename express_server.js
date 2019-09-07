const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const { getUserByEmail, emailLookup, checkCookies, generateRandomString, urlsForUser } = require('./helpers');
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
  b6UTxQ: { longURL: "https://www.tsn.ca", visited: "0", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", visited: "0", userID: "aa" }
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
  if (longURLExist(req.body.longURL, urlsForUser(req.session.userId, urlDatabase))) {
    res.statusCode = 403;
    let error = { "statusCode": res.statusCode, "message": `This long URL exists already` };
    let templateVars = { useremail: emailLookup(req.session.userId, users), error }
    res.render("urls_new", templateVars);
  } else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { "longURL": req.body.longURL, userID: req.session.userId, "visited": 0 };
    res.redirect(`/urls/${shortURL}`);
  }
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
//when update long URL that is existed already, let user know it and don't update it
app.put("/urls/:shortURL", (req, res) => {
  if (longURLExist(req.body.longURL, urlsForUser(req.session.userId, urlDatabase))) {
    res.statusCode = 403;
    let error = { "statusCode": res.statusCode, "message": `This long URL exists already` };
    let shortURL = req.params.shortURL;
    let templateVars = {
      shortURL: shortURL, longURL: urlDatabase[shortURL].longURL,
      visited: urlDatabase[shortURL].visited, useremail: emailLookup(req.session.userId, users), error
    }
    res.render("urls_show", templateVars);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});
//check longURL exist or not in urlDatabase
const longURLExist = function (longURL, urlDatabase) {
  for (let url in urlDatabase) {
    if (longURL === urlDatabase[url].longURL) {
      return true;
    }
  }
  return false;
};
/*
1.If user not login, ask user to log in first
2.If short url not exist, 404
3.Check if the shortURL belong to this user first, otherwise show error message page
4.show edit page
*/
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!req.session.userId) {
    res.redirect("/urls");
  };
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    res.statusCode = 404;
    let error = { "statusCode": res.statusCode, "message": `This short URL ${shortURL} does not exists. Please go back` };
    const templateVars = { useremail: emailLookup(req.session.userId, users), error };
    res.render("error", templateVars);
  }
  if (req.session.userId !== urlDatabase[shortURL].userID) {
    res.statusCode = 403;
    let error = { "statusCode": res.statusCode, "message": `You are not allowed to access this shortURL. Please go back` };
    const templateVars = { useremail: emailLookup(req.session.userId, users), error };
    res.render("error", templateVars);
  } else {
    let templateVars = {
      shortURL: shortURL, longURL: urlDatabase[shortURL].longURL,
      visited: urlDatabase[shortURL].visited, useremail: emailLookup(req.session.userId, users)
    };
    res.render("urls_show", templateVars);
  }
});

app.delete("/urls/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  urlDatabase[req.params.shortURL].visited = parseInt(urlDatabase[req.params.shortURL].visited) + 1;
  res.redirect(longURL);
});
app.listen(PORT, () => {
  console.log(`Expample app listening on port ${PORT}!`);
});

