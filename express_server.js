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
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@ee.com",
    password: "12345"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send('Hello');
});
app.get("/urls", (req, res) => {
  let templateVars = checkCookies(req, res);
  res.render("urls_index", templateVars);
});
app.get("/login", (req, res) => {
  const templateVars = { users: users };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (users[user].password === req.body.password) {
        res.cookie('user_id', user);
        //   req.session.user_id = user;
        res.redirect("/urls");
        break;
      } else {
        res.statusCode = 403;
        res.send(`Error Code: 403. Password not matching. Please double check;`);
      }
    } else {
      res.statusCode = 403;
      res.send(`Error Code: 403. Record not found. Please double check;`);
    }
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  let templateVars = checkCookies(req, res);
  res.render("urls_new", templateVars);
})
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], useremail: emailLookup(req.cookies["user_id"]) };
  res.render("urls_show", templateVars);
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//Rigister
app.get("/register", (req, res) => {
  const templateVars = { users: users };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (!email) {
    res.statusCode = 400;
    res.send(`Error code: 400 Email address can't not be empty`);
  };
  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.statusCode = 400;
      res.send(`Error code: 400 Email Register already!`)
    }
  };
    let user = { id, email, password };
    users[id] = user;
    res.cookie('user_id', id);
    // req.session.user_id = user;
    // break;
    res.redirect('/urls');
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

function checkCookies(req, res) {
  let templateVars = {};
  if (req.cookies["user_id"]) {
    templateVars = {
      urls: urlDatabase,
      useremail: emailLookup(req.cookies["user_id"])
    }
  } else {
    templateVars = {
      urls: urlDatabase
    }
  }
  return templateVars;
}
function emailLookup(user_id) {
  for (let user in users) {
    if (users[user].id === user_id) {
      return users[user].email;
    }
  }
};