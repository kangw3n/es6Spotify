var express = require('express');
var path = require('path');
var app = express()


app.use(express.static(path.join(__dirname, 'public')));


app.get('*', function(req, res) {
	res.sendfile('index.html'); // load our public/index.html file
});

app.listen(8181, function () {
	console.log('Example app listening on port 8181!')
});