#!/bin/env node
//  OpenShift sample Node application
var express     = require('express');
var fs          = require('fs');
var bodyParser  = require('body-parser');
var mysql       = require('mysql');

var util = require("util");
/**
 *  Define the sample application.
 */
var Revision = function() {

    //  Scope.
    var self = this;

    var connectionpool = mysql.createConnection({ //createClient
        host: 'mysql://' + process.env.OPENSHIFT_MYSQL_DB_HOST + ':' + process.env.OPENSHIFT_MYSQL_DB_PORT + '/',
        user: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
        password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
        database: 'revision',
        multipleStatements: true,
        debug : true
    });


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        /*self.routes = { };
        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };
        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };*/
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        //self.createRoutes();
        //self.app = express.createServer();
        self.app = express();

        //  Add handlers for the app (from the routes).
        /*for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }*/

        self.app.use(bodyParser.json());       // to support JSON-encoded bodies
        self.app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
          extended: true
        })); 

        self.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        self.app.get('/', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
            next();
        });

        self.app.get('/getdefectstatus', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getdefectupvotes', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getdefectdownvotes', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getresults', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getchallengeranking', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getteamranking', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getdefecttypes', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/test', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            var stuff = 'abc';

            //connectionpool.getConnection()

            /*.query('SELECT 1', function(err, rows, fields){
                    if (err) {
                        stuff = "ghi";
                    }
                    res.send("all ok");
                    connection.release();
                    next();
            });*/

            //connection.connect();
            stuff = util.inspect(connectionpool, false, null);
            //connection.query('SELECT 1', function(err, rows) {
            //    stuff = 'def';
            //});
            stuff = stuff + "done";
            res.send(JSON.stringify(stuff));
            next();
        });

        self.app.get('/test2', function(req, res, next) {
            var html = "<html><body>Host: " + process.env.OPENSHIFT_MYSQL_DB_HOST + "<br />";
            html += "Port: " + process.env.OPENSHIFT_MYSQL_DB_PORT + "<br />";
            html += "User: " + process.env.OPENSHIFT_MYSQL_DB_USERNAME + "<br />";
            html += "Pass: " + process.env.OPENSHIFT_MYSQL_DB_PASSWORD + "<br />";
            html += "Sock: " + process.env.OPENSHIFT_MYSQL_DB_SOCK + "<br />";
            html += "URL: " + process.env.OPENSHIFT_MYSQL_DB_URL + "<br />";
            html += "</body></html>"
            res.send(html);
            next();
        });

        self.app.post('/login', function(req, res, next) {
            //res.send("Welcome2! " + req.body.username + " - " + req.body.pw);
            var userid;
            if (req.body.username == "teste") {
                if (req.body.pw == "teste") {
                    userid = 1;
                } else {
                    userid = -1;
                }
            } else {
                userid = -2;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });

        self.app.post('/submitdefects', function(req, res, next) {
            var userid = 2;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });

        self.app.post('/updatedefectstatus', function(req, res, next) {
            var userid = 2;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });

        self.app.post('/voteupdefect', function(req, res, next) {
            var userid = 2;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });

        self.app.post('/votedowndefect', function(req, res, next) {
            var userid = 2;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });

        self.app.post('/submitresults', function(req, res, next) {
            var userid = 2;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userid));
            next();
        });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var revision_app = new Revision();
revision_app.initialize();
revision_app.start();