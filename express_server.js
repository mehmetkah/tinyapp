const express = require("express");
const cookieParser = require("cookie-parser");
const res = require("express/lib/response");
const { set } = require("express/lib/response");
const { cookie } = require("request");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const users = {};
// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const getUserByEmail = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
  return null;
};

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.random() * characters.length);
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.redirect("/register");
  }
  const user = users[userId];
  console.log(user, "++++++");
  const userEmail = user.email || null;
  const userUrlDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: userUrlDatabase, email: userEmail, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.redirect("/register");
  }
  const user = users[userId];
  const userEmail = user.email;
  const templateVars = {
    email: userEmail,
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    res.send("User not logged in !");
  }
  const user = users[userId];
  const shortUrl = req.params.id;
  const userEmail = user.email;
  if (urlDatabase[shortUrl].userID !== userId) {
    res.send("Permission denied !");
  }
  const templateVars = {
    id: shortUrl,
    longURL: urlDatabase[shortUrl].longURL,
    user,
    email: userEmail,
  };

  res.render("urls_show", templateVars);
});
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.user_id;
  if (urlDatabase[id].userID !== userId) {
    res.send("Permission denied !");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: req.cookies.user_id,
  };
  // urlDatabase[id].longURL = longURL;

  res.redirect("/urls");
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.user_id;
  if (urlDatabase[id].userID !== userId) {
    res.send("Permission denied !");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.user_id;
  if (urlDatabase[id].userID !== userId) {
    res.send("Permission denied !");
  }
  const value = req.body.url;
  urlDatabase[id] = { longURL: value };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  const user = getUserByEmail(email, users);
  console.log("asd", user);
  if (!user) return res.status(403).send("User not found");
  if (!email || !password)
    return res.status(400).send("Email or password cannot be empty");
  if (user.password !== password) return res.status(403).send("Wrong password");

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});
// const userId = req.cookies.user_id;
//   if (!userId) {
//     return res.redirect("/register");
//   }
//   const user = users[userId];
//   const userEmail = user.email || null;
//   const templateVars = { urls: urlDatabase, email: userEmail, user };
//   res.render("urls_index", templateVars);
// });

app.post("/register", (req, res) => {
  const email = req.body.email;
  const pasw = req.body.password;
  const getUser = getUserByEmail(email, users);
  if (!email || !pasw) {
    return res.status(400).send("Cannt be empty");
  }

  if (getUser)
    return res
      .status(400)
      .send("An account already exists for this email address");

  if (getUser === null) {
    const randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: email,
      password: pasw,
    };

    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;

  if (userId) {
    return res.redirect("/urls");
  }
  const user = userId;
  const email = null;
  const templateVars = {
    user,
    email,
  };
  res.render("urls_login", templateVars);
});
