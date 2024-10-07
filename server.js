const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/login-app', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Create a route to handle the login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Find the user in the database
    User.findOne({ username }, (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
      } else if (!user) {
        res.status(401).send({ message: 'Invalid username or password' });
      } else {
        // Compare the provided password with the stored password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error(err);
            res.status(500).send({ message: 'Internal Server Error' });
          } else if (!isMatch) {
            res.status(401).send({ message: 'Invalid username or password' });
          } else {
            console.log(`Login successful for user ${username}`);
            res.redirect(`/welcome/${username}`);
          }
        });
      }
    });
  });

// Create a route to handle user registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password using bcrypt
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    } else {
      // Create a new user in the database
      const user = new User({ username, password: hashedPassword });
      user.save((err) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: 'Internal Server Error' });
        } else {
          res.send({ message: 'User created successfully' });
        }
      });
    }
  });
});

// Create a route to handle the welcome page
app.get('/welcome/:username', (req, res) => {
  const username = req.params.username;
  res.send(`Hi, ${username}!`);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
