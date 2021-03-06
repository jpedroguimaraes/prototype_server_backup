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

    var connection = mysql.createConnection({
        host: process.env.OPENSHIFT_MYSQL_DB_HOST, 
        port: process.env.OPENSHIFT_MYSQL_DB_PORT,
        user: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
        password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
        database: 'revision',
        waitForConnection: true,
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

        self.app.get('/getchallengeranking', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/getteamranking', function(req, res, next) {
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from User, Attempt_Multi where team = id_team and classification > 0 group by id_team order by classification desc";
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.get('/getdefecttypes', function(req, res, next) {
            res.setHeader('Content-Type', 'text/html');
            res.send("ok");
            next();
        });

        self.app.get('/test', function(req, res, next) {
            res.setHeader('Content-Type', 'application/json');
            connection.query('select * from Utilizador',function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err:    err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
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
            var name = req.body.username;
            var pw = req.body.pw;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from User where username = '" + name + "' and password = '" + pw + "'";
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: req.body.username + req.body.pw + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/checkteamready', function(req, res, next) {
            var userid = req.body.id;
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from Individual_Attempt where ready = 0 and id_attempt = " + attempt + " and id_user <> " + userid;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/checkteamdone', function(req, res, next) {
            var userid = req.body.id;
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from Individual_Attempt where done = 0 and id_attempt = " + attempt + " and id_user <> " + userid;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/ready', function(req, res, next) {
            var userid = req.body.id;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Indivdual_Attempt SET ready = 1 WHERE id_user = " + userid;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/done', function(req, res, next) {
            var userid = req.body.id;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Indivdual_Attempt SET done = 1 WHERE id_user = " + userid;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/adddefect', function(req, res, next) {
            var iddefect = req.body.iddefect;
            var attempt = req.body.attempt;
            var defecttype = req.body.defecttype;
            var description = req.body.description;
            var dbegin = req.body.dbegin;
            var dend = req.body.dend;
            var iduser = req.body.iduser;
            res.setHeader('Content-Type', 'application/json');
            var q = "INSERT INTO Defect_Multi (id_defect, id_attempt, defecttype, description, dbegin, dend, user) VALUES ('" + iddefect + "', " + attempt + ", " + defecttype + ", '" + description + "', " + dbegin + ", " + dend + ", " + iduser + ")";
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/removedefects', function(req, res, next) {
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "DELETE FROM Defect_Multi WHERE id_attempt =" + attempt;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/getdefectsmulti', function(req, res, next) {
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from Defect_Multi where id_attempt = " + attempt;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/getdefectssingle', function(req, res, next) {
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from Defect_Single where id_attempt = " + attempt;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/voteupdefect', function(req, res, next) {
            var defect = req.body.defect;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Defect_Multi SET votesup=1,votesdown=0 WHERE id_defect = " + defect;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/votedowndefect', function(req, res, next) {
            var defect = req.body.defect;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Defect_Multi SET votesup=0,votesdown=1 WHERE id_defect = " + defect;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/enabledefect', function(req, res, next) {
            var defect = req.body.defect;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Defect_Multi SET active = false WHERE id_defect = " + defect;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/disabledefect', function(req, res, next) {
            var defect = req.body.defect;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Defect_Multi SET active = false WHERE id_defect = " + defect;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/submitresults', function(req, res, next) {
            var team = req.body.team;
            var classification = req.body.classification;
            var seconds = req.body.seconds;
            var hits = req.body.hits;
            var missed = req.body.missed;
            var incomplete = req.body.incomplete;
            var wrong = req.body.wrong;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Attempt_Multi SET classification = " + classification + ", seconds = " + seconds + ", hits = " + hits + ", misses = " + missed + ", incomplete = " + incomplete + " WHERE id_team = " + team;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
        });

        self.app.post('/getteamresult', function(req, res, next) {
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select * from Attempt_Multi where id_team = " + attempt;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/getteamtime', function(req, res, next) {
            var attempt = req.body.attempt;
            res.setHeader('Content-Type', 'application/json');
            var q = "select max(seconds) as totaltime from Individual_Attempt where id_attempt = " + attempt;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send(rows);
                connection.release();
            });
        });

        self.app.post('/updateteamtime', function(req, res, next) {
            var iduser = req.body.iduser;
            var seconds = req.body.seconds;
            res.setHeader('Content-Type', 'application/json');
            var q = "UPDATE Individual_Attempt SET seconds = " + seconds + " WHERE id_user = " + iduser;
            connection.query(q, function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        err: q + err.code
                    });
                }
                res.send();
                connection.release();
            });
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