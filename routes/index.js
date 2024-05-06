var express = require("express");
var router = express.Router();
const client = require("../app_api/models/db");

router.get("/", async function (req, res, next) {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks");
  }
});


router.get("/register", function (req, res, next) {
  res.render("register");
});

router.post("/register", async function (req, res, next) {
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
});

router.get("/login", function (req, res, next) {
  res.render("login", { message: "" });
});

router.post("/login", async function (req, res, next) {
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
      res.render("login", { message: "invaid password or email" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Error authenticating user");
  }
});

router.get("/home", function (req, res, next) {
  const userId = req.session.userId;

  if (userId) {
    // If userId is present in the session, render the "home" page
    req.session.userId=userId
    res.render("home",{userId:userId});
  } else {
    // If userId is not present in the session, redirect to the "login" page
    res.redirect("/login");
  }
});

router.post("/task/add", async function (req, res, next) {
    try {
      const { taskName, startDate, endDate , userId} = req.body;
      req.session.userId=userId
      console.log(taskName, startDate, endDate, userId)
 
      const query = 'INSERT INTO task_management.tasks (user_id, task_name, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await client.query(query, [userId, taskName, startDate, endDate]);
  
      // Send the inserted task data back as the response
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).send('Error adding task');
    }
  });


  router.get('/task/:userId', async function(req, res, next) {
    try {

   
      
      const  userId = req.params.userId;
      console.log(userId)
      
  
      // Query the database to get tasks for the user with the provided userId
      const query = 'SELECT * FROM task_management.tasks WHERE user_id = $1';
      const result = await client.query(query, [userId]);
      const tasks = result.rows;
      console.log(tasks)
      
  
      // Render the Jade template with tasks data
      res.render('task', { tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).send('Error fetching tasks');
    }
  });

module.exports = router;
