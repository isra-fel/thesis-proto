module.exports = app => {
    let io = require('socket.io')(app),
        offers = [];
    io.on('connection', socket => {
        console.log('socket.io: a user connects in');
        socket.on('add', mesh => {
            console.log('socket.io: new mesh: ' + JSON.stringify(mesh));
            io.emit('add', mesh);
        });
        socket.on('modify', modify => {
            console.log('socket.io: modify mesh: ' + JSON.stringify(modify));
            io.emit('modify', modify);
        })
        socket.on('disconnect', () => {
            console.log('socket.io: a user disconnects');
        });

        socket.on('joinMeeting', uuid => {
            console.log('socket.io: a user wants to join');
            offers.push(uuid);
            io.emit('answer', offers);
        });
        socket.on('answer', answer => {
            console.log('socket.io: a user gives the answer');
            io.emit('anotherMember', answer);
        });
        socket.on('queryOffer', () => {
            console.log('socket.io: a user needs to know the offer');
            socket.emit('answerOffer', offers);
        });
    });
}