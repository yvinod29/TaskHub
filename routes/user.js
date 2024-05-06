var express = require("express");
var router = express.Router();
const client = require("../app_server/models/db");


router.get("/", renderIndex);

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.post("/register", registerUser);

router.get("/login", function (req, res, next) {
  res.render("login", { message: "" });
});

router.post("/login", loginUser);


router.get("/home", renderHomePage);



async function renderIndex(req, res, next) {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).send("Error rendering index");
  }
}


async function registerUser(req, res, next) {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match");
  }

  try {
    const query =
      "INSERT INTO task_management.users (email, password) VALUES ($1, $2)";
    await client.query(query, [email, password]);

    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
}


async function loginUser(req, res, next) {
  const { email, password } = req.body;

  try {
    const query =
      "SELECT user_id FROM task_management.users WHERE email = $1 AND password = $2";
    const result = await client.query(query, [email, password]);

    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;
      req.session.userId = userId;
      console.log(userId);
      res.redirect("/home");
    } else {
      res.render("login", { message: "invalid password or email" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Error authenticating user");
  }
}



function renderHomePage(req, res, next) {
  const userId = req.session.userId;
  console.log(userId);

  if (userId) {
    // If userId is present in the session, render the "home" page
    res.render("home", { userId: userId });
  } else {
    // If userId is not present in the session, redirect to the "login" page
    res.redirect("/login");
  }
}

module.exports = router;
