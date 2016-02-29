var socket = function(server) {
    var io = require('socket.io').listen(server);

    var session = require('./session');

    var share = require('express-socket.io-session');

    io.use(share(session));

    io.on('connection', function(socket) {
        if (socket.handshake.session.user)
            console.log(socket.handshake.session);
        socket.handshake.session.save();
    });
};


module.exports = socket;

