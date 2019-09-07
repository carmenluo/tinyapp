const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};
const emailLookup = function(userId, users) {
  for (let user in users) {
    if (users[user].id === userId) {
      return users[user].email;
    }
  }
};
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return;
};
//based on cookies to determine what values to be returned
const checkCookies = function(req, urlDatabase, users) {
  let templateVars = {};
  if (req.session.userId) {
    templateVars = {
      urls: urlsForUser(req.session.userId, urlDatabase),
      useremail: emailLookup(req.session.userId, users)
    };
  } else {
    templateVars = {
      urls: urlsForUser(req.session.userId, urlDatabase)
    };
  }
  return templateVars;
};
//Return user's own urls based on id
const urlsForUser = function(id, urlDatabase) {
  let userURl = {};
  for (let URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      userURl[URL] = urlDatabase[URL];
    }
  }
  return userURl;
};
//check longURL exist or not in urlDatabase
const longURLExist = function (longURL, urlDatabase) {
  for (let url in urlDatabase) {
    if (longURL === urlDatabase[url].longURL) {
      return true;
    }
  }
  return false;
};
module.exports = { emailLookup, 
                  getUserByEmail, 
                  checkCookies, 
                  generateRandomString, 
                  urlsForUser, 
                  longURLExist};