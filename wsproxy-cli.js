var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');
var timelog = common.timelog;

remote_host = process.argv[2]; // remote host IP
timelog('Remote host: ' + remote_host);

var long_socket = new net.Socket();
var short_socket = new net.Socket();

short_socket.connect(8989, '127.0.0.1', function() {
	common.setupSocket(short_socket);
	timelog('short socket connected');

}).on('close', function() {
	timelog('short socket closed !!!!!');
	setTimeout(function () {
		short_socket.connect(8989, '127.0.0.1', function() {
			timelog('short socket connected again');
		});
	}, 2000);
}).on('error', function (err) {
	timelog('short socket ERR: ' + err.message);
}).on('data', function(chunk) {
	timelog('short socket on data...');
	long_socket.write(chunk);
});

long_socket.connect(8986, remote_host, function() {
	common.setupSocket(long_socket);
	timelog('long socket connected');

}).on('close', function() {
	timelog('long socket closed !!!!!');
	setTimeout(function () {
		long_socket.connect(8986, remote_host, function() {
			timelog('long socket connected again');
		});
	}, 2000);
}).on('error', function (err) {
	timelog('long socket ERR: ' + err.message);
}).on('data', function(chunk) {
	timelog('long socket on data...');
	short_socket.write(chunk);
});
