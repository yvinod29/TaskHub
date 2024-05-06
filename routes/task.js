var express = require("express");
var router = express.Router();
const client = require('../app_api/models/db');



router.post("/add", async function (req, res, next) {
    try {
      const { taskName, startDate, endDate} = req.body;
      const userId=req.session.userId
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
  
  
  router.get('/', async function(req, res, next) {
    try {

   
      
      const  userId = req.session.userId;
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
