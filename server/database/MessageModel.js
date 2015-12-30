var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    created: String,
    text: String,
    displayName: String,
    room: String,
    userid: { type: Number, ref: 'User' }
});

var Message = mongoose.model('Messages', messageSchema);



module.exports = {
    messages: Message
};