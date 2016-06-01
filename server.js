var express = require('express'),
    app = express(),
    server = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
require('./app/socket')(server);

server.listen(80, () => {
    console.log('App started at 80.');
});