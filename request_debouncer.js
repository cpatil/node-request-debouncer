var when = require("promised-io/promise").when,
defer = require("promised-io/promise").defer,
httpProxy = require('http-proxy'),
connect = require('connect');

var proxy = httpProxy.createServer({target: 'http://localhost:9000'});

connect.createServer(
    connect.logger(),
    require('./request-debouncer-middleware')(),  // last middleware
    function(req, res) {
	console.log('starting to proxy at %s', new Date());
	try { proxy.web(req, res) }
	catch (err) { res.statusCode = 500; res.end(); console.log('caught err:', err) }
	console.log('ended proxy at %s', new Date());
    }
).listen(8080);

console.log('request debouncer listening on 127.0.0.1:8080')
