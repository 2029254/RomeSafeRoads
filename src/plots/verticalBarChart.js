function drawVerticalBarChart(csvFileName) {

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 30, bottom: 40, left:200},
    width = 610 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


  var svg = d3.select("svg"),
    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;


  var xScale = d3.scaleBand().range([0, width]).padding(0.4),
    yScale = d3.scaleLinear().range([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

  d3.csv("dataset/processed/verticalBarChartData2022.csv", function (error, data) {
    if (error) {
      throw error;
    }

    xScale.domain(data.map(function (d) {
      return d.year;
    }));
    yScale.domain([0, d3.max(data, function (d) {
      return d.value;
    })]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function (d) {
        return "$" + d;
      }).ticks(10))
      .append("text")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("value");
  });
}