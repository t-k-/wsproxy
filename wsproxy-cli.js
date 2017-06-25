remote_host = '211.159.189.25';
//remote_host = '127.0.0.1';

var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var long_socket = new net.Socket();
var short_socket = new net.Socket();

short_socket.connect(8989, '127.0.0.1', function() {
	common.setupSocket(short_socket);
	console.log('short socket connected');

}).on('close', function() {
	console.log('short socket closed !!!!!');
}).on('error', function (err) {
	console.log('short socket ERR: ' + err.message);
}).on('data', function(chunk) {
	console.log('short socket on data...');
	long_socket.write(chunk);
});

function conn_long() {
long_socket.connect(8986, remote_host, function() {
	common.setupSocket(long_socket);
	console.log('long socket connected');

}).on('close', function() {
	console.log('long socket closed !!!!!');
	setTimeout(conn_long, 2000);
}).on('error', function (err) {
	console.log('long socket ERR: ' + err.message);
}).on('data', function(chunk) {
	console.log('long socket on data...');
	short_socket.write(chunk);
});
}

conn_long();
