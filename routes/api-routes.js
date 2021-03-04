// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      userName: req.user.userName,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      userName: req.body.userName,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        console.log(err);
        res.status(401).json(err);
      });
  });
  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for creating the swipe
  app.post("/api/createswipe", isAuthenticated, (req, res) => {
    console.log(req.user);
    db.Swipe.create({
      answer: req.body.answer,
      imageURL: req.body.imageURL,
      userName: req.user.userName
    })
      .then(data => {
        // res.redirect(307, "/api/login");
        res.json(data);
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });
  app.get("/api/loadMatches", isAuthenticated, (req, res) => {
    db.Swipe.findAll({
      where: { answer: true, userName: req.user.userName }
    }).then(data => {
      res.json(data);
    });
  });
};
