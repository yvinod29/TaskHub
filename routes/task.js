var express = require("express");
const jwt = require('jsonwebtoken');
var router = express.Router();
const client = require('../app_server/models/db');



router.post("/add", async function (req, res, next) {
    try {
      const { taskName, startDate, endDate , userId} = req.body;
      req.session.userId=userId
      console.log("addTask"+userId)
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
  
  

  router.get('/:userId', async function(req, res, next) {
    try {
      // Check if token cookie is present
      const token = req.cookies.token;
  
      if (!token) {
        // If token is not present, redirect to login page
        return res.redirect("/login");
      }
  
      // Verify the token
      jwt.verify(token,"asdfghjkl123453", (err, decoded) => {
        if (err) {
          // If token verification fails, redirect to login page
          console.error('Invalid token:', err);
          return res.redirect("/login");
        }
  
        // If token is valid, proceed to fetch tasks
        const userId = req.params.userId;
        console.log(userId);
  
        // Query the database to get tasks for the user with the provided userId
        const query = 'SELECT * FROM task_management.tasks WHERE user_id = $1';
        client.query(query, [userId], (err, result) => {
          if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Error fetching tasks');
          }
          
          const tasks = result.rows;
          console.log(tasks);
          
          // Render the Jade template with tasks data
          res.render('task', { tasks });
        });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
    }
  });
  
  

module.exports = router;
