var when = require("promised-io/promise").when,
defer = require("promised-io/promise").defer;

module.exports = function request_debouncer(cache_time){

    var outstanding = {};
    cache_time =  cache_time || 20 * 1000
    
    var nullify_promise_after_delay = function(key, delay) { setTimeout(function() { console.log('expiring cache at %s', new Date()); outstanding[key] = null; }, delay); }

    return function debouncer(req, res, next) {
	if (req.method != 'GET') { next() }
	else {
	    // TODO - consider protocol and stringified query parameters in the key as well
	    var key = req.method + req.url;
	    var outstanding_promise = outstanding[key];
	    if (outstanding_promise) {
		console.log("going to wait on promise");
		when(outstanding_promise, function(proxied_res_api_calls, code, headersSent) {
		    console.log('resolving promise for key %s', key)
		    // call all the methods that were called on the debounced res
		    // TODO set other headers as well
		    res.statusCode  = code
		    for (var i=0;i < proxied_res_api_calls.length;i++) {
			var api_call = proxied_res_api_calls[i];
			res[api_call[0]].apply(res, api_call[1])
		    }
		}, function(err) {
		    res.statusCode = 502
		    res.end('Bad Gateway')
		})
	    } else {
		// create a promise
		var outstanding_promise = outstanding[key] = defer();
		
		var api_calls = new Array();
	        
		// all calls that mutate the response are trapped so we can make the same changes to the waiting responses
		var _end = res.end, _write = res.write, _writeHead = res.writeHead, _sendHeader = res.sendHeader;
		res.end = function() { api_calls.push(['end', arguments]); return _end.apply(res, arguments)}
		res.write = function() { api_calls.push(['write', arguments]); return _write.apply(res, arguments)}
		res.writeHead = function() { api_calls.push(['writeHead', arguments]); return _writeHead.apply(res, arguments)}
		res.sendHeader = function() { api_calls.push(['sendHeader', arguments]); return _sendHeader.apply(res, arguments)}
		
		// resolve the promise when this req is finished
		res.on('finish', function() { outstanding_promise.resolve(api_calls, res.statusCode, res.headersSent); nullify_promise_after_delay(key, cache_time) })
		res.on('close', function() {  outstanding_promise.reject('socket closed before response was sent'); nullify_promise_after_delay(key, 0.1) } )
		
		// go ahead and proxy the request
		next()
	    }
	}
    }

}


