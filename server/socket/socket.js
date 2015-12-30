var Messages = require('../database/MessageModel').messages;
var rooms = {};
var userIds = {};
var uuid = require('node-uuid');
var socketio = require('socket.io');

function initiation(server) {

  var io = socketio(server);
  //The first event we will use is the connection event. It is fired when a client tries to connect to the server; Socket.io creates a new socket that we will use to receive or send messages to the client.
  io.on('connection', function(socket) {
    //this corresponds to the socket.emit('new message') on the client
    socket.on('new message', /*socketUtils.newMessage*/ function(message) {
      //message - data from the cliet side 
      console.log('this is the incoming message', message);
      var messages = new Messages(message);
      //messages.create etc were all defined in the messages model
      messages.created = message.date ;
      messages.text = message.text;
      messages.displayName = message.username;
      messages.save(function(err, results){
        if(err){
          console.log('you have an error', err);
        }
        console.log('you save the chat. check mongo.', results);
      });
        ///Collect all the messages now in database 
        var foundMessages;
        Messages.find(function(err, msg){
          if(err){
            return console.log('you have an err get chats from the DB', err);
          }
          // console.log('MESSAGES from get request', req)
          foundMessages = msg;
          //this will post all the messages from the database
          io.emit('publish message', foundMessages);
        });
      });
  //general code
    //PROBLEM: As it stands I cannot use the socketUtils file here because Socket will be undefined in that file.
    socket.on('/create', function(data) {
      // usersRoom = data.title; Unnecessary piece of code. 
      //Have the socket join a rooom that is named after the title of their document
      socket.join(data.title);
      //Listen for a emit from client that's message is the title of the document
      socket.on(data.title, function(data) {
        //send a signal to frontEnd called notification
        socket.broadcast.emit('notification', data);
        });
      });
    
        //Sending a signal to the front end, along with the message from chat. This is so we can test the chat feature. Will build off of it later. 

      /* 

      Stuff for WebRtc

      */
    var currentRoom, id;
      //The init event is used for initialization of given room. 

    socket.on('init', /*socketUtils.init*/ function (data, fn) {
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
    socket.on('msg', /*socketUtils.msg*/function (data) {
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
    //PROBLEM: As it stands I cannot use the socketUtils file here because Socket will be undefined in that file.
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
  return io;
}

module.exports = initiation; 
