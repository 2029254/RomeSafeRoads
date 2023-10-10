//global variable
var colorArray = ['#d73027','#d9ef8b', '#1a9850']; //da rosso a verde
var levelArray = ['>0 and <=400', '>400 and <=700', '>700 and <=1000'];

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left:200},
  width = 610 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#barChart")
  .append("div")
  .classed("svg-container", true)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 400")
  .classed("svg-content-responsive", true)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
drawVerticalBarChart("dataset/processed/verticalBarChartData2022.csv")
function drawVerticalBarChart(csvFileName){
  console.log(csvFileName)
  // Parse the Data
  d3.csv(csvFileName, function(data) {
    let dataAboutYear = data.filter(function (row) {
      return row['NaturaIncidente'];
    });
    console.log(dataAboutYear)
    let dataAboutYearSorted = dataAboutYear.sort(function (a, b) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });
    console.log(dataAboutYearSorted)

    // X axis
    var y = d3.scaleBand()
      .range([ 0, height ])
      .domain(dataAboutYear.map(function(d) { return d.NaturaIncidenti; }))
      .padding(.1);
      svg.append("g")
      .call(d3.axisLeft(y))

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    var x = d3.scaleLinear()
      .domain([0, 1000])
      .range([ 0, 100]);

    //Bars
    //d3.csv("data/processed/AQI_color.csv", function(colorData) {
      svg.selectAll("myRect")
        .data(dataAboutYearSorted)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.NaturaIncidenti); })
        .attr("width", function(d) {return x(d['NumeroIncidenti']); })
        .attr("height", y.bandwidth() )
        .attr("fill", colorArray[1])
    });
 //  });
}