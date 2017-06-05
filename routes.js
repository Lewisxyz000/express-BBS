var express = require("express");
var passport = require("passport");

var User = require("./models/user");
var Contents = require("./models/contents");

var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get('/', function(req,res){
    Contents.find({}).sort({date:-1}).exec(function(err, rawContents){
        if(err) throw err;
        res.render('index', {title: "Board", contents: rawContents}); 
    });
});

router.get("/new-entry", function(request, response) {
    response.render("new-entry")
})

router.post("/new-entry", function(request, response) {
    if (!request.body.title || !request.body.body) {
        response.status(400).send("Entries must have a title and a body");
        return;
}
  if(request.user) {
    console.log(request.user);
    var currentUser = request.user.username; 
  }
  else{
    console.log(1);
    var currentUser = "Anonymous";
  }
var newPost = new Contents({
    title: request.body.title,
    contents: request.body.body,
    date: new Date(),
    deleted: false,
    writer: currentUser
});
newPost.save("next");
response.redirect("/");
});

router.get("/users", function(req, res, next) {
  User.find()
  .sort({ createdAt: "descending" })
  .exec(function(err, users) {
    if (err) { return next(err); }
    res.render("users", { users: users });
  });
});

router.get("/login", function(req, res) {
  res.render("login");
});

router.post("/login", passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {

    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }

    var newUser = new User({
      username: username,
      password: password
    });
    newUser.save(next);

  });
}, passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });
  });
});

router.get("/edit", ensureAuthenticated, function(req, res) {
  res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});

module.exports = router;