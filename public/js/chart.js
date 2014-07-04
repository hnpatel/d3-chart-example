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
            .on("mouseout", tip.hide);
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