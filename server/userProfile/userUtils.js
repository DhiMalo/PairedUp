var dbUser = require('./UserModel');
var User = dbUser.user;

module.exports = {
  getFromDatabaseBecausePersonSignedIn: function(req, res) {
    //find the user with the display name
    User.findOne({displayName: req.body.displayName}, function (err, user) {
          if (user) {
            res.json({user:user});
          }else if (err) {
            return "This is error message: " + err; 
          }

        });
  },
};