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

  d3.csv(csvFileName, function(data) {
    let dataAboutYear = data.filter(function (row) {
      return row['NaturaIncidente'];
    });
    console.log(dataAboutYear)
    let dataAboutYearSorted = dataAboutYear.sort(function (a, b) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });
    console.log(dataAboutYearSorted)

    xScale.domain(data.map(function (d) {
      return d.NaturaIncidente;
    }));
    yScale.domain([0, 12000]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", height - 250)
      .attr("x", width - 100)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Year");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Stock Price");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.NaturaIncidente); })
      .attr("y", function(d) { return yScale(d.NumeroIncidenti); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height - yScale(d.NumeroIncidenti); });


    svg.append("text")
      .attr("transform", "translate(100,0)")
      .attr("x", 50)
      .attr("y", 50)
      .attr("font-size", "24px")
      .text("Vertical Bar Chart")

  });


}
