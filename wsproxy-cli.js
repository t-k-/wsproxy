var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');
var timelog = common.timelog;

remote_host = process.argv[2]; // remote host IP
timelog('Remote host: ' + remote_host);

var long_socket = new net.Socket();
var short_socket = new net.Socket();

var close_both_sockets = function () {
	long_socket.destroy();
	short_socket.destroy();
};

short_socket.connect(8989, '127.0.0.1', function() {
	common.setupSocket(short_socket);
	timelog('short socket connected');

}).on('close', function() {
	timelog('short socket closed !!!!!');
	close_both_sockets();
}).on('error', function (err) {
	timelog('short socket ERR: ' + err.message);
	close_both_sockets();
}).on('data', function(chunk) {
	timelog('short socket on data...');
	long_socket.write(chunk);
});

long_socket.connect(8986, remote_host, function() {
	common.setupSocket(long_socket);
	timelog('long socket connected');

}).on('close', function() {
	timelog('long socket closed !!!!!');
	close_both_sockets();
}).on('error', function (err) {
	timelog('long socket ERR: ' + err.message);
	close_both_sockets();
}).on('data', function(chunk) {
	timelog('long socket on data...');
	short_socket.write(chunk);
});
