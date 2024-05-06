var express = require("express");
const jwt = require('jsonwebtoken');

var router = express.Router();
const client = require("../app_server/models/db");
const { hashPassword, comparePasswords, generateToken } = require("../app_server/helpers/userAuth");
const logout = require("../app_server/controllers/user");



router.get("/", renderIndex);

router.get('/logout', logout);


// Route for rendering the registration page
router.get("/register", function (req, res, next) {
  // Check if token cookie is present
  const token = req.cookies.token;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, "asdfghjkl123453");
      
      // If token is valid, redirect to home page
      return res.redirect("/home");
    } catch (error) {
      // If token is invalid, clear the cookie and proceed to render registration page
      console.error('Invalid token:', error);
      res.clearCookie('token');
    }
  }

  // If token is not present or invalid, render the registration page
  res.render("register");
});


router.post("/register", registerUser);

router.get("/login", function (req, res, next) {
  // Check if token cookie is present
  const token = req.cookies.token;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, "asdfghjkl123453");
      // If token is valid, redirect to home page
      return res.redirect("/home");
    } catch (error) {
      // If token is invalid, clear the cookie and proceed to render login page
      console.error('Invalid token:', error);
      res.clearCookie('token');
    }
  }
  // If token is not present or invalid, render the login page
  res.render("login", { message: "" });
});


router.post("/login", loginUser);


router.get("/home",  renderHomePage);



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
    // Check if email already exists
    const emailExistsQuery = "SELECT COUNT(*) FROM task_management.users WHERE email = $1";
    const emailExistsResult = await client.query(emailExistsQuery, [email]);

    if (emailExistsResult.rows[0].count > 0) {
      return res.send("Email already exists");
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const query =
      "INSERT INTO task_management.users (email, password) VALUES ($1, $2)";
    await client.query(query, [email, hashedPassword]);

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
      "SELECT user_id, password FROM task_management.users WHERE email = $1";
    const result = await client.query(query, [email]);

    if (result.rows.length > 0) {
      const hashedPassword = result.rows[0].password;
      const userId = result.rows[0].user_id;

      // Compare the provided password with the hashed password
      const passwordMatch = await comparePasswords(password, hashedPassword);

      if (passwordMatch) {
        const token = generateToken(userId);

        req.session.userId = userId;
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        console.log(userId);
        res.redirect("home");
      } else {
        res.render("login", { message: "Invalid password or email" });
      }
    } else {
      res.render("login", { message: "Invalid password or email" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Error authenticating user");
  }
}




function renderHomePage(req, res, next) {
  // Check if token cookie is present
  const token = req.cookies.token;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, "asdfghjkl123453");
      

      // If token is valid, render the "home" page
      res.render("home", { userId: decoded.userId });
    } catch (error) {
      // If token is invalid, redirect to the "login" page
      console.error('Invalid token:', error);
      res.redirect("/login");
    }
  } else {
    // If token cookie is not present, redirect to the "login" page
    res.redirect("/login");
  }
}
 

module.exports = router;
