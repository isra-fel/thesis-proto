var express = require('express'),
    app = express(),
    server = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.redirect('/pages/main.html');
});
require('./app/socket')(server);

server.listen(80, () => {
    console.log('App started at 80.');
});