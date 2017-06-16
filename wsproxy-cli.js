var net = require('net');
var common = require('./wsproxy-common.js');

var long_socket = new net.Socket();

long_socket.connect(8986, '127.0.0.1', function() {
	console.log('Connected');
	common.setupSocket(long_socket);

	long_socket.write('Hello, server! Love, Client.');
	long_socket.destroy();

}).on('data', function(data) {
	console.log('Received: ' + data);
}).on('close', function() {
	console.log('Connection closed');
});
