var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var long_socket = new net.Socket();
var socket = new net.Socket();

socket.connect(8989, '127.0.0.1', function() {
	console.log('short socket connected.');
});

long_socket.connect(8986, '127.0.0.1', function() {
	common.setupSocket(long_socket);
	common.setupSocket(socket);
	console.log('Connected');

	socket.pipe(long_socket)
	long_socket.pipe(socket);

}).on('close', function() {
	console.log('Connection closed !!!!!');
});
