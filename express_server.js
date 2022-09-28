const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080;

const {
  generateRandomString,
  cookieHasUser,
  getUserByEmail,
  urlsForUser,
} = require("./helper");

const users = {};

const urlDatabase = {};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    secret: "mfk",
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.redirect("/register");
  }
  const userUrlDatabase = urlsForUser(user, urlDatabase);
  const templateVars = {
    urls: userUrlDatabase,
    email: users[user].email,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
  if (urlDatabase[id].userID !== userId) {
    res.send("Permission denied !");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;

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

app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  console.log("+++", longURL);
  urlDatabase[id] = {
    longURL,
    userID: req.session.user_id,
  };

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  if (urlDatabase[id].userID !== userId) {
    res.send("Permission denied !");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (urlDatabase[id].userID !== userID) {
    return res.send("Permission denied !");
  }

  urlDatabase[id] = {
    longURL,
    userID,
  };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userId = getUserByEmail(email, users);

  if (!userId) return res.status(403).send("User not found");
  if (!email || !password)
    return res.status(400).send("Email or password cannot be empty");

  if (!bcrypt.compareSync(password, userId.password)) {
    return res.status(403).send("Wrong password");
  }
  req.session.user_id = userId.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const pasw = req.body.password;
  const hashedPassword = bcrypt.hashSync(pasw, 10);

  if (!email || !pasw) {
    return res.status(400).send("Cannot be empty");
  }
  const getUser = getUserByEmail(email, users);
  if (getUser)
    return res
      .status(400)
      .send("An account already exists for this email address");

  if (getUser === null) {
    const randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: email,
      password: hashedPassword,
    };

    req.session.user_id = randomID;

    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
