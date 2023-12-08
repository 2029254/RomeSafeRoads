// append the svg object to the body of the page
var scatterPlotpSvg = d3.select("#scatterPlot")
  .append("div")
  .classed("svg-container-largo", true)  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 850 370")
  .classed("svg-content-responsive", true)
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .append("g").attr("transform", "translate(100, 23)");


var dataset = [
  { x: 30, y: 50 },
  { x: 80, y: 100 },
  { x: 110, y: 80 },
  { x: 140, y: 150 },
  { x: 170, y: 120 }
];


function drawScatterPlot(csvFileNameScatterPlot) {


// Definisci la scala per l'asse x
  var xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) {
      return d.x;
    })])
    .range([0, 500]);

// Definisci la scala per l'asse y
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function (d) {
      return d.y;
    })])
    .range([300, 0]);

// Crea gli elementi circolari per il tuo scatterplot
  scatterPlotpSvg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.x);
    })
    .attr("cy", function (d) {
      return yScale(d.y);
    })
    .attr("r", 5); // Raggio del cerchio

// Aggiungi gli assi x e y
  scatterPlotpSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  scatterPlotpSvg.append("g")
    .call(d3.axisLeft(yScale));

}