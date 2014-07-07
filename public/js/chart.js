var stockSymbol = ['YHOO', 'AAPL', 'GOOG', 'MSFT', 'FB', 'T', 'TSLA', 'PEP', 'JCP', 'CMG', 'WMT'];
//var url = "https://query.yahooapis.com/v1/public/yql?q=select%20symbol%2C%20PercentChange%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22%2C%22FB%22%2C%22T%22%2C%22TSLA%22%2C%22PEP%22%2C%22JCP%22%2C%22CMG%22%2C%22WMT%22)&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=";
var urlBegin    = 'https://query.yahooapis.com/v1/public/yql?q=select%20symbol%2C%20PercentChange%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(';
var urlEnd      = ')&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=';

var jsonLive;
var margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
var x = d3.scale.ordinal().rangeRoundBands([0, width],.1);

var y = d3.scale.linear()
    .range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        var fontColor = parseFloat(stripOffPercentageSign(d.PercentChange)) > 0 ? "lightgreen" : "red";
        return "<strong>" + d.symbol + "</strong> : <span style='color:" + fontColor +"'>" + d.PercentChange + "</span>";
    })

d3.json(createUrl(urlBegin, urlEnd, stockSymbol), function(err, data){
        if(!err){
            jsonLive = data.query.results.quote;
        }
        var chart = d3.select(".chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
        chart.call(tip);
        var absMin = Math.abs(d3.min(jsonLive, function(d) { return parseFloat(stripOffPercentageSign(d.PercentChange)); }));
        var absMax = Math.abs(d3.max(jsonLive, function(d) { return parseFloat(stripOffPercentageSign(d.PercentChange)); }));
        var absoluteMax =  absMax > absMin ? absMax : absMin;
        y.domain([-absoluteMax, absoluteMax]);
        x.domain(jsonLive.map(function(d) { return d.symbol; }));
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + y(0) + ")")
            .attr("writing-mode", "tb")
            .attr("y", "0")
            .attr("glyph-orientation-vertical", "360")
            .attr("direction", "ltr")
            .call(xAxis);
        chart.selectAll(".bar")
            .data(jsonLive)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.symbol); })
            .attr("y", function(d) { return y(parseFloat(stripOffPercentageSign(d.PercentChange)) > 0 ? parseFloat(stripOffPercentageSign(d.PercentChange)) : 0); })
            .attr("height", function(d) { return Math.abs(y(0) - Math.abs(y(parseFloat(stripOffPercentageSign(d.PercentChange))))); })
            .attr("width", x.rangeBand())
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
            .on("click", function(d) { drawSingleChart(d.symbol)});

        drawSingleChart(jsonLive[0].symbol);
    }
);

/**
 * This function removes % sign from end of the string.
 * @param value
 * @return {String}
 */
function stripOffPercentageSign(value){
    return value.substr(0,value.length-1);
}

/**
 * This function dynamically Generates URL for stock symbols selected.
 * @param begin
 * @param end
 * @param symbol
 * @return {*}
 */
function createUrl(begin, end, symbol){
    if(symbol.length > 0){
        var url = begin;
        for(var i=0; i<symbol.length; i++){
            if(i != 0){
                url = url + '%2C';
            }
            url = url + '%22' + symbol[i] + '%22';
        }
        return url + end;
    }
    return begin + end;
}

function drawSingleChart(symbol){
    var urlFirstPart = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22';
    var urlLastPart = '%22%20and%20startDate%20%3D%20%222014-05-01%22%20and%20endDate%20%3D%20%222014-07-07%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
    d3.select(".symbolDiv").html("");
    d3.select(".individualDiv").html("");
    var margin = {top: 20, right: 30, bottom: 10, left: 40},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var x = d3.time.scale()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height - margin.bottom, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });



    d3.json(createUrlForGivenSymbol(urlFirstPart, urlLastPart, symbol), function(err, data1){
        var data = data1.query.results.quote;
        var parseDate = d3.time.format("%Y-%m-%d").parse;

        data.forEach(function(d) {
            d.date = parseDate(d.Date);
            d.close = +d.Adj_Close;
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.close; }) + 10]);

        d3.select(".individualDiv")
            .append("svg")
            .attr("class", "detailChart");

        var svg = d3.select(".detailChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        d3.select(".symbolDiv")
            .text(symbol)
            .style("text-align", "center");
    });

}

/**
 * This function returns the Url for getting History for a given symbol
 * @param begin
 * @param end
 * @param symbol
 * @return {*}
 */
function createUrlForGivenSymbol(begin, end, symbol){
    if(symbol.length > 0){
        return begin + symbol + end;
    }
    return ;
}