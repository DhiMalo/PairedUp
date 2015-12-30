var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
 displayName: String,
 picture: String,
 github: String,
 //this needs to be refactored. it stores a new object of skills everytime you enter a 
 //a new skills
 skills:[{type: mongoose.Schema.Types.ObjectId, ref: 'Skills'}],
 messages:[{type: mongoose.Schema.Types.ObjectId, ref: 'Messages'}]
});

var User = mongoose.model("User", userSchema);

module.exports = {
  user: User
};
