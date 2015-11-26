#!/bin/env node
// You'll see the client-side's output on the console when you run it.

var restify = require('restify');

// State
var next_user_id = 0;
var users = {};

// Server
var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get("/", function (req, res, next) {
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(users));
  return next();
});

server.get('/user/:id', function (req, res, next) {
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(users[parseInt(req.params.id)]));
  return next();
});

server.post('/user', function (req, res, next) {
  var user = req.params;
  user.id = next_user_id++;
  users[user.id] = user;
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(user));
  return next();
});

server.put('/user/:id', function (req, res, next) {
  var user = users[parseInt(req.params.id)];
  var changes = req.params;
  delete changes.id;
  for(var x in changes) {
    user[x] = changes[x];
  }
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(user));
  return next();
});

server.del('/user/:id', function (req, res, next) {
  delete users[parseInt(req.params.id)];
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(true));
  return next();
});

server.listen(80, function () {
  console.log('%s listening at %s', server.name, server.url);
});

// Client
var client = restify.createJsonClient({
  url: 'http://localhost:80',
  version: '~1.0'
});

client.post('/user', { name: "John Doe" }, function (err, req, res, obj) {
  if(err) console.log("An error ocurred:", err);
  else console.log('POST    /user   returned: %j', obj);
  
  client.get('/user/0', function (err, req, res, obj) {
    if(err) console.log("An error ocurred:", err);
    else console.log('GET     /user/0 returned: %j', obj);
    
    client.put('/user/0', { country: "USA" }, function (err, req, res, obj) {
      if(err) console.log("An error ocurred:", err);
      else console.log('PUT     /user/0 returned: %j', obj);
      
      client.del('/user/0', function (err, req, res, obj) {
        if(err) console.log("An error ocurred:", err);
        else console.log('DELETE  /user/0 returned: %j', obj);
        
        client.get('/', function (err, req, res, obj) {
          if(err) console.log("An error ocurred:", err);
          else console.log('GET     /       returned: %j', obj);
        });
      });
    });
  });
});
