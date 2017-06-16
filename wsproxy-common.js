var util = require('util');

module.exports = {
	setupSocket: function (socket) {
		socket.setTimeout(0);
		socket.setNoDelay(true);
		socket.setKeepAlive(true, 5000);
		return socket;
	},

	headerLines: function (req) {
		var ret_str = '';
		Object.keys(req.headers).forEach(function(key) {
			var val = req.headers[key];
			ret_str += key + ": " + val + "\r\n";
		});
		return ret_str;
	},

	printIO: function (prefix, req_str, ip, port) {
		console.log("From/to: " + ip + ':' + port);
		var req_arr = req_str.trim().split("\n");
		for(var key in req_arr) {
			console.log(prefix + ' ' + req_arr[key]);
		}
		console.log("\n");
	},
	
	extend: util._extend
};
