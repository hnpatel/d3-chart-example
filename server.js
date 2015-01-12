/* 	server.js File
	This File Configures and starts the node.js Server.
*/


// Set up server
var express 	= require('express');
var schedule = require('node-schedule');
var request = require('request');
var port 		= 8080;
var app 		= express();

/* 	configuration	*/
app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

var j = schedule.scheduleJob('* * * * *', function(){
    request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22YHOO%22%20and%20startDate%20%3D%20%222014-01-01%22%20and%20endDate%20%3D%20%222014-06-30%22&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=',function(err, response, body){
        if(!err && response.statusCode == 200){
            var output = JSON.parse(body);
        }
        else{
            console.log("Status Code : " + response.statusCode);
        }
    });
});

/* Configure the port App will listen to.	*/
app.listen(port);

