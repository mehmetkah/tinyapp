const express = require("express");
const cookieParser = require("cookie-parser");
const res = require("express/lib/response");
const { set } = require("express/lib/response");
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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const userEmail = user.email || null;
  const templateVars = { urls: urlDatabase, email: userEmail, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = {
    id: req.params.id,
    longURL: "http://www.lighthouselabs.ca",
    user,
  };
  //res.render("urls_show", userObj);
  res.render("urls_show", templateVars);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const value = req.body.url;
  urlDatabase[id] = value;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password)
    return res.status(400).send("Email or password cannot be empty");
  if (user.password !== password) return res.status(403).send("Wrong password");
  if (!user) return res.status(403).send("User not found");

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  res.render("urls_register");
});

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
  const user = req.cookies.user_id;
  const email = null;
  const templateVars = {
    user,
    email,
  };
  res.render("urls_login", templateVars);
});
