var express = require('express');
var qs = require('querystring');
var bodyParser = require('body-parser');
var favicon = require('express-favicon');
var favicon = require('serve-favicon');
var fs = require('fs');
//Need if we want to check req.file; 
var multer  = require('multer')
var cookieParser = require('cookie-parser');
// var cors = require('cors');
var request = require('request');
// var jwt = require('jwt-simple');
// var moment = require('moment');
var path = require('path');
var config = require('./config.js');
var mongoose = require('mongoose');
var app = express();
var http = require('http');
var server = http.Server(app);
var passport = require('passport');
var flash    = require('connect-flash');
var GitHubStrategy = require('passport-github').Strategy;
var session = require('express-session');
var morgan = require('morgan');
var logger = require('morgan');
var uuid = require('node-uuid');
var rooms = {};
var userIds = {};
// var router = express.Router();

//I believe we need if we want to check req.file
var upload = multer({ dest: 'uploads/' });

//I believe we need if we want to check req.file
//The docs are not clear on the next two lines. Both lines are necessary for sockets.
var socketio = require('socket.io');
var io = socketio(server);

//do not remove. Works for localhost AND deployment/production.
var port = process.env.PORT || '8080'; 
server.listen(port);
console.log("App listening on port");

var db = require('./database/UserModel');
var User = db.user
var userDocument = db.userDocument;
var Messages = db.messages;
// var Skills = db.skills;


app.set('port', process.env.PORT || 8080);
app.use(upload.single('string'));
app.use(favicon(__dirname + "/favicon.ico"));
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client'));

//serve up static files. For webRtc

// expressApp.use(express.static(__dirname + '/../public/dist'));   

//serves up static files, otherwise we would not be able to load angular (and all the other bower components) in the index.html file
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ 
  name: "UserFromPearedUp",
  secret: "keyboard cat", 
  // cookie: {maxAge: 3600000},
  resave: true, 
  saveUninitialized: true, 
  cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
   }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

//to allow cross origin (need to add more to this comment.)
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

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

app.get('/', function(req, res){
  console.log("Hello");
  // res.send("hello world");
  // res.render('index.html', { user: req.user });
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
var globalProfile;
// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
//Step 1
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    console.log("hello I am in authenticated");
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//Step 2
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  //This is the request handler that will be called when they click the log in to get hub. 
  function(req, res) {
    console.log("This is the request handler that will be called when they click the log in to github");
    //res.redirect('/');
    var currentURLRoot = window.location.href.split('/')[2]; //this grabs the current URL
    // The resulting string = "paired-up.herokuapp.com" for Heroku and "localhost:8080" for LocalHost.
    res.redirect('https://'+currentURLRoot+'/#/profile');
  });

//Necessary for sockets.
var http = require('http');


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



// This will be the route to call when my page gets redirected to the profile. So my profile page should do a http.get to this route automatically once the user is logged in. 
//Step 3
app.get('/account', ensureAuthenticated, function(req, res){
  console.log('this is the req.user in the account route');
  res.json(req.user);
});

app.get('/login', function(req, res){
    // console.log('this is the req.user in the login route', req);

  res.json({profile: globalProfile, sessions: req.session});
});

app.get('/userprofile', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }

    res.json(users);
  });
});

app.get('/oneuserskill', function(req, res, next){
  console.log('this is the oneuserskill', req.body)
  User.find(function(err, user){
    if(err){next(err);}
    console.log('this is the user within', user)
    res.json(user);
  })
})


app.post('/skills', function(req, res, next) {
  // console.log('this is from skills', req.body)
  User.findOne({github: req.body.github}, function(err, user) {
  // console.log('this is from skills', user)
    if(err){return next(err)}
      for(var key in req.body){
        if (req.body[key] !== req.body.github)
        user.skills[key] = req.body[key]
      }
    user.save(function(err, user){
      if (err){return next(err)}
    // console.log('this after saving first skills', user)   
    })
  })
});

app.post('/futureskills', function(req, res, next){
  // console.log('this is from futureskills', req.body)
  User.findOne({github: req.body.github}, function(err, user) {
    if(err){return next(err)}
      for(var key in req.body){
        if (req.body[key] !== req.body.github)
        user.futureskills[key] = req.body[key]
      }
    user.save(function(err, user){
      if (err){return next(err)}
    // console.log('this after saving skills', user)   
    })
  })
})

app.get('/checkIfLoggedIn', function(req, res, next) {
  if(req.user) {
    console.log(req.user)
    next();
  } else {
    res.redirect('/login');
  }
})

//if the person is signed in and goes back to the profile page
app.post('/getFromDatabaseBecausePersonSignedIn', function(req, res) {
  // console.log("req.body in checkIfLoggedIn", req.body);
  var currentUser;

  //find the user with the display name
  User.findOne({displayName: req.body.displayName}, function (err, user) {
        if (user) {
          // console.log("User in database", user)
          //send that user to the clientSide.
          res.json({user:user});
        }else if (err) {
          return "This is error message: " + err; 
        }

      });
    // console.log("This is currentUser", currentUser);
  // res.send({response: currentUser});
});



// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
//Step 4:
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    console.log('this is ensureAuthenticated', isAuthenticated )
    return next(); }
  res.redirect('/login')
}



passport.use(new GitHubStrategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_SECRET,
    callbackURL: 'https://paired-up.herokuapp.com/auth/github/callback',
    userAgent: 'PairedUp'
  },
  //Step 5
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // console.log("accessToken", accessToken);
      // console.log("refreshToken",refreshToken );
      // console.log("profile", profile);
      // console.log("This is the avatar_url:::::::", profile._json.avatar_url)
      // User.findOrCreate
      // var user;
      User.findOne({github: profile.id}, function (err, user) {
        if (user) {
          console.log('this is the user', user);
        globalProfile = user;
        }else {
          var user = new User();
          user.github = profile.id;
          user.picture = profile._json.avatar_url;
          user.displayName = profile.displayName;
          user.save(function() {
            console.log(user + ' was saved');
          });
          globalProfile = user;
        }
      });
      //TODO: This is where I will have to do actuall login stuff. Like saving user to database;
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      // globalProfile = profile;
      return done(null, profile);
    });
  }
));


var usersRoom;


//The first event we will use is the connection event. It is fired when a client tries to connect to the server; Socket.io creates a new socket that we will use to receive or send messages to the client  
  var people = {};  
  var rooms = {}; 
io.on('connection', function(socket) {
  console.log('new connection');

  socket.join('room1');
  io.to('room1').emit('joinedroom')







  //this corresponds to the socket.emit('new message') on the client
    socket.on('new message', function(message) {
    

      //message - data from the cliet side 
      console.log('this is the incoming message', message)
      var messages = new Messages(message);
      //messages.create etc were all defined in the messages model
      messages.created = message.date 
      messages.text = message.text
      messages.displayName = message.username
      messages.save(function(err, results){
        if(err){
          console.log('you have an error', err)
        }
        console.log('you save the chat. check mongo.', results)
      })

   
        ///Collect all the messages now in database 

        var foundMessages;
        Messages.find(function(err, msg){
          if(err){return console.log('you have an err get chats from the DB', err)}
          // console.log('MESSAGES from get request', req)
          foundMessages = msg
          //this will post all the messages from the database
          io.emit('publish message', foundMessages);
        })
      });

socket.on('/createroom', function(data){
  rooms['chatroom'] = data.roomname
  people['creator'] = data.creator
  socket.join(data.roomname)
  socket.on(data.roomname, function(data){
    socket.broadcast.emit('/roomcreated', 'created a room here')
  })
  console.log('this is what we got back from the emit', rooms, people)
})

//general code
  socket.on('/create', function(data) {
    usersRoom = data.title
    //Have the socket join a rooom that is named after the title of their document
    socket.join(data.title);
    //Listen for a emit from client that's message is the title of the document
    socket.on(data.title, function(data) {
      //send a signal to frontEnd called notification
      socket.broadcast.emit('notification', data);
      });
    });
          //some room will be a variable. 
        // io.to(usersRoom).emit(usersRoom);
        //listen for a signal called add-customer. General code
        // socket.on('add-customer', function(textFromEditor) {
        //   console.log("Just heard a add-customer from Joseph");
        //   //send a signal to frontEnd called notification
        //   io.emit('notification', textFromEditor);

        // });
  
      //Sending a signal to the front end, along with the message from chat. This is so we can test the chat feature. Will build off of it later. 

    /* 

    Stuff for WebRtc

    */
        var currentRoom, id;
    //The init event is used for initialization of given room. 

        socket.on('init', function (data, fn) {
          //If the room is not created we create the room and add the current client to it. 
        //We generate room randomly using node-uuid module
          currentRoom = (data || {}).room || uuid.v4();
          var room = rooms[currentRoom];
          if (!data) {
            rooms[currentRoom] = [socket];
            id = userIds[currentRoom] = 0;
            fn(currentRoom, id);
            console.log('Room created, with #', currentRoom);
          } else {
            if (!room) {
              return;
            }
    //If the room is already created we join the current client to the room by adding its socket to the collection of sockets associated to the given room (rooms[room_id] is an array of sockets).
            userIds[currentRoom] += 1;
            id = userIds[currentRoom];

      //when a client connects to given room we notify all other peers associated to the room about the newly connected peer.

    //We also have a callback (fn), which we invoke with the client's ID and the room's id, once the client has successfully connected.
            fn(currentRoom, id);
            room.forEach(function (s) {
              s.emit('peer.connected', { id: id });
            });
            room[id] = socket;
            console.log('Peer connected to room', currentRoom, 'with #', id);
          }
        });

    //The msg event is an SDP message or ICE candidate, which should be redirected from specific peer to another peer:
        socket.on('msg', function (data) {
    //The id of given peer is always an integer so that's why we parse it as first line of the event handler. 
          var to = parseInt(data.to, 10);
          if (rooms[currentRoom] && rooms[currentRoom][to]) {
            console.log('Redirecting message to', to, 'by', data.by);
    //After that we emit the message to the specified peer in the _to property of the event data object.
            rooms[currentRoom][to].emit('msg', data);
          } else {
            console.warn('Invalid user');
          }
        });
        
        //the disconnect handler
        socket.on('disconnect', function () {
          if (!currentRoom || !rooms[currentRoom]) {
            return;
          }
          //Once given peer disconnects from the server (for example the user close his or her browser or refresh the page), we remove its socket from the collection of sockets associated with the given room (the delete operator usage).
          delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
          rooms[currentRoom].forEach(function (socket) {
            if (socket) {
              // After that we emit peer.disconnected event to all other peers in the room, with the id of the disconnected peer. This way all peers connected to the disconnected peer will be able to remove the video element associated with the disconnected client.
              socket.emit('peer.disconnected', { id: id });
            }
          });
        });


});


// this is good for future reference when creating get and post request. 
// app.get('/chat', function(req, res){
//   // console.log('this is from the chat get req.', req)
//   Messages.find(function(err, msg){
//     if(err){return console.log('you have an err get chats from the DB', err)}
//     // console.log('MESSAGES from get request', req)
//     res.json('this is response json', msg)
//   })
// })

// app.post('/chat', function(req, res){
//   console.log('this is the chat req', req.body)
//   var messages = new Messages(req.body)
//   messages.created = req.body.date 
//   messages.text = req.body.text
//   messages.displayName = req.body.username
//   messages.save(function(err, results){
//     if(err){
//       console.log('you have an error', err)
//     }
//     console.log('you save the chat. check mongo.', results)
//   })

//   // res.json(req.body)
// })

app.post('/savingDocumentsToDatabase', function(req,res) {
    var doc = new userDocument({id: req.body.id, title: req.body.title, mode: req.body.mode, displayName: req.body.displayName, code: req.body.code}); 
    doc.save(function() {});
});


app.post('/retrievingDocumentsForUser', function(req,res) {
  userDocument.find({displayName: req.body.displayName}, function(err, results){
    res.json(results);
  });
});

//delete works but now I need to update every single document's id to --1. 
app.post('/deleteDocumentsForUser', function(req,res) {
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
        userDocument.update({id: results[i].id}, {id: newId}, {}, function (err, numAffected) {
        });
      }
    }
    //sending this so we can utilize the promise structure from angular $http.post
    res.send({});
  });

});
//content will hold the data from the uploaded file
var content;
//Need to build this function to get around asynchronous behavior.
var sendFileDataToClient = function(data) {
  //send the data from the file to the client. 
  io.emit('fileData', content);
};

//Initiating the file upload. Immediately happens after someone clickes the upload file button
app.post('/fileUpload', function(req, res, next) {
  //collect the data from the file in a human readable form. 
     fs.readFile(req.file.path, 'ascii', function ( error, data ) {
      if ( error ) {
        console.error( error );
      } else {
        //content is being asynchronously set to the data in the file
        content = data;
        //To get around the synchronous behavior we wrap the next step into the function sendFileDataToClient. Which will just emit the content, but this way we are sure that content is done receiving the data from the file.
        sendFileDataToClient(content);

      }
  });
});
