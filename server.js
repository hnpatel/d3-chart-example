/* 	server.js File
	This File Configures and starts the node.js Server.
*/


// Set up server
var express 	= require('express');
var mongoose 	= require('mongoose');
var schedule = require('node-schedule');
var request = require('request');
var port 		= 8080;
var database 	= require('./config/database');
var app 		= express();

/* 	configuration	*/
mongoose.connect(database.url);
var db = mongoose.connection;

app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

var j = schedule.scheduleJob('* * * * *', function(){
    console.log('Jay Swaminarayan !');
    request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22YHOO%22%20and%20startDate%20%3D%20%222014-01-01%22%20and%20endDate%20%3D%20%222014-06-30%22&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=',function(err, response, body){
        if(!err && response.statusCode == 200){
            var output = JSON.parse(body);
//            console.log(output.query.results.quote);
//            mongoose.Collection("stocks", db, '').save(output.query.results.quote);
        }
        else{
            console.log("Status Code : " + response.statusCode);
        }
    });
});

/* Define Routes */
// require('./app/routes.js')(app);

/* Configure the port App will listen to.	*/
app.listen(port);

