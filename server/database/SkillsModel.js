var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var skillsSchema = new mongoose.Schema({
  node: Number,
  angular: Number,
  html: Number,
  css: Number, 
  jquery: Number,
  userid: { type: Number, ref: 'User' }
});

var Skills = mongoose.model("Skills", skillsSchema);


module.exports = {
  skills: Skills
};