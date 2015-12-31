// var config = require('../../config.js');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var session = require('express-session');
var db = require('./UserModel');
var User = db.user;
var globalProfile; 
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

module.exports = {
    passportAuthenticate: passport.authenticate('github'), 
    directToProfile : function (req, res) {
      res.redirect('https://paired-up.herokuapp.com/#/profile');
    },
    sendingUserToClient: function(req, res){
      res.json({profile: globalProfile, sessions: req.session});
    },
    ensureAuthenticated : function(req, res, next) {
      if (req.isAuthenticated()) { 
        console.log('this is ensureAuthenticated', isAuthenticated);
        return next(); 
      }
      res.redirect('/login');
    },
    setingUserToGlobalProfile:   function(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        User.findOne({github: profile.id}, function (err, user) {
          if (user) {
          globalProfile = user;
          }else {
            var user = new User();
            user.github = profile.id;
            user.picture = profile._json.avatar_url;
            user.displayName = profile.displayName;
            user.save(function() {});
            globalProfile = user;
          }
        });
        return done(null, profile);
      });
    }
};