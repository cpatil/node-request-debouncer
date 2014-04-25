node-request-debouncer
======================

Debounce service api requests

Test (open three terminal windows and type the following in each):
- node slow_api_server.js
- node request_debouncer.js
- ab -vr -n 200000 -c 5 'http://127.0.0.1:8080/'
