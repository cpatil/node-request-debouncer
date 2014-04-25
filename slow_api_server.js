// create a target api server for demo
require('http').createServer(function(req, res) {
    console.log("Recevied req %s at %s", req.url, new Date());
    setTimeout(function() {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('Hello, Time is now ' + (new Date()));
	console.log("returning req %s at %s", req.url, new Date());
    }, 60 * 1000);
}).listen(9000);

console.log('slow api server listening on 127.0.0.1:9000')


