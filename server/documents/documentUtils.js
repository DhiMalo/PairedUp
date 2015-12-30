var dbUser = require('../userProfile/UserModel');
var dbDocument = require('./DocumentModel');
var User = dbUser.user;
var userDocument = dbDocument.userDocument;

module.exports = {
  retrievingDocumentsForUser:function(req,res) {
    userDocument.find({displayName: req.body.displayName}, function(err, results){
      res.json(results);
    });
  },

  savingDocumentsToDatabase: function(req,res) {
    var doc = new userDocument({id: req.body.id, title: req.body.title, mode: req.body.mode, displayName: req.body.displayName, code: req.body.code}); 
    doc.save(function() {});
  },
  deleteDocumentsForUser: function(req, res) {
    var idOfDeletedDoc = req.body.id;
    userDocument.find({displayName: req.body.displayName, title: req.body.title}, function(err, result){
      return result;
    }).remove(function(result) {});
    //find all the documents the user has made
    userDocument.find({displayName: req.body.displayName}, function(err, results) {
      //iterate through the documents
      for (var i =0; i < results.length; i++) {
        //if the user's document is greater than the id of the document we destroyed.
        if (results[i].id > idOfDeletedDoc) {
          //create a new id which is the id of the document we are currently iterating thorugh - 1.
          var newId = results[i].id - 1;
          //set that document to the  
          userDocument.update({id: results[i].id}, {id: newId}, {}, function (err, numAffected) {});
        }
      }
      //sending this so we can utilize the promise structure from angular $http.post
      res.send({});
    });
  }
};
