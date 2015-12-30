// var app = require('./server');
var passport = require('passport');

var User = require('./userProfile/UserModel').user;
var Skills = require('./database/SkillsModel').skills;

var utils = require('./utils.js');
var userAuthUtil = require('./userProfile/userOAuthUtils');
var userUtils = require('./userProfile/userUtils');
var documentUtils = require('./documents/documentUtils');

var GitHubStrategy = require('passport-github').Strategy;
var config = require('../config.js');

module.exports = function(app) {

  if (app.get('env') === 'production') {
    app.use(utils.forceHTTPS);
  }

  app.all('/*', utils.allowCrossOrigin);

  app.get('/', function(req, res){});

  app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res){
      // The request will be redirected to GitHub for authentication, so this
      // function will not be called.
    });

  app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    //This is the request handler that will be called when they click the log in to get hub. 
    userAuthUtil.directToProfile);

  //The next four lines do not appear to do anything. I will double check, then delete if proven true.
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/account', userAuthUtil.ensureAuthenticated, function(req, res){
    res.json(req.user);
  });

  app.get('/login', userAuthUtil.sendingUserToClient);

  passport.use(new GitHubStrategy({
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_SECRET,
      callbackURL: "http://127.0.0.1:8080/auth/github/callback"
    }, userAuthUtil.setingUserToGlobalProfile));

  app.get('/skills', function(req, res, next){
    User.find(function(err, user){
      if(err){next(err);}
      res.json(user);
    });
  });

  app.param('user', function(req, res, next, id) {
    var query = User.findById(id);
    query.exec(function (err, user){
      if (err) { return next(err); }
      if (!user) { return next(new Error('can\'t find user')); }

      req.user = user;
      return next();
    });
  });

  app.post('/skills/:user', function(req, res, next) {
    var skills = new Skills(req.body);
    skills.user = req.user;
    // console.log('this is skills/:user post:', req.user)
    console.log('this is skills/:user req.user:', req.user);
      // comment.post = req.post;

    skills.save(function(err, skill){
      if(err){ return next(err); }

      req.user.skills.push(skill);
      req.user.save(function(err, user) {
        if(err){ return next(err); }

        res.json(skill);
      });
    });
  });

  app.post('/getFromDatabaseBecausePersonSignedIn', userUtils.getFromDatabaseBecausePersonSignedIn);

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      console.log('this is ensureAuthenticated', isAuthenticated);
      return next(); }
    res.redirect('/login');
  }

  app.post('/savingDocumentsToDatabase', documentUtils.savingDocumentsToDatabase);

  app.post('/retrievingDocumentsForUser', documentUtils.retrievingDocumentsForUser);

  //delete works but now I need to update every single document's id to --1. 
  app.post('/deleteDocumentsForUser', documentUtils.deleteDocumentsForUser);
};
