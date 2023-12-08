// append the svg object to the body of the page
var scatterPlotpSvg = d3.select("#scatterPlot")
  .append("div")
  .classed("svg-container-largo", true)  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 850 370")
  .classed("svg-content-responsive", true)
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .append("g").attr("transform", "translate(100, 30)");

let tooltipScatter;

function drawScatterPlot(csvFileNameScatterPlot) {

  d3.csv(csvFileNameScatterPlot , function (data) {

// Definisci la scala per l'asse x
  var xScale = d3.scaleLinear()
    .domain([-6, 8])
    .range([0, 650]);

// Definisci la scala per l'asse y
  var yScale = d3.scaleLinear()
    .domain([-6, 8])
    .range([300, 0]);

// Crea gli elementi circolari per il tuo scatterplot
  scatterPlotpSvg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.PC1);
    })
    .attr("cy", function (d) {
      return yScale(d.PC2);
    })
    .attr("r", 4) // Raggio del cerchio
    .style("stroke", "#f7f3eb")
    .style("stroke-width", "0.1")
    .style("fill", function(d){ return setPointColor(d.TipoVeicolo)})
    .on("mousemove",  function(d) {
      tooltipScatter = d3.select("#popupScatterPlot");
      tooltipScatter.style("opacity", 0.9);

      tooltipScatter.html(setPointText(d.TipoVeicolo))
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", "10px")
        //.style("font-weight", "bold")
        .style("left", (d3.event.pageX + 9 + "px"))
        .style("top", (d3.event.pageY - 9 + "px"));
    })
   .on("mouseout", function(d) {tooltipScatter.style("opacity", 0)})


// Aggiungi gli assi x e y
  scatterPlotpSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  scatterPlotpSvg.append("g")
    .call(d3.axisLeft(yScale));

    drawScatterPlotLegend();

  });

}

function setPointText(tipoVeicolo) {
  if (tipoVeicolo === "Autovettura")
    return "Car"
  else if (tipoVeicolo === "Motociclo")
    return "Motorcycle";
  else if (tipoVeicolo === "Autocarro")
    return "Truck";
  else if (tipoVeicolo === "Ignoto")
    return "Unknown";
}

function setPointColor(tipoVeicolo) {
  if (tipoVeicolo === "Autovettura" || tipoVeicolo === "Car")
    return "#cab2d6"
  else if (tipoVeicolo === "Motociclo" || tipoVeicolo === "Motorcycle")
    return "#b2df8a";
  else if (tipoVeicolo === "Autocarro" || tipoVeicolo === "Truck")
    return "#fdbf6f";
  else if (tipoVeicolo === "Ignoto" || tipoVeicolo === "Unknown")
    return "#a6cee3";
}


function drawScatterPlotLegend() {

  let keys = ["Car", "Motorcycle", "Truck", "Unknown"];
  let size = 17;

  scatterPlotpSvg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 650)
    .attr("y", function (d, i) {
      return 30 + i * (size + 5)
    }) // 30 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d, i) {
      return setPointColor(keys[i])
    })
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);


  scatterPlotpSvg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 650 + size * 1.2)
    .attr("y", function (d, i) {
      return 30 + i * (size + 5) + (size / 2)
    }) // 30 is where the first dot appears. 25 is the distance between dots
    .text(function (d) {
      return d
    })
    .style("fill", "#524a32")
    .style("font-family", "Lora")
    .style("font-size", "12px")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

}