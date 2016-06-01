module.exports = app => {
    let io = require('socket.io')(app);
    io.on('connection', socket => {
        console.log('socket.io: a user connects in');
        socket.on('add', mesh => {
            console.log('socket.io: new mesh: ' + JSON.stringify(mesh));
            io.emit('add', mesh);
        });
        socket.on('disconnect', () => {
            console.log('socket.io: a user disconnects');
        });
    });
}