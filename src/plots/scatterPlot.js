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
let dots;
let heightScatter = 300;
let widthScatter = 650;
// Crea un elemento di brush per la selezione
var brush = d3.brush()
  .extent([[0,0], [widthScatter, heightScatter]])
  .on("start brush end", brushed)
  .on("end", brushed);

function drawScatterPlot(csvFileNameScatterPlot) {

  d3.csv(csvFileNameScatterPlot , function (data) {

    // Definisci i limiti del tuo scatterplot
    var xMin = -10;
    var xMax = 10;
    var yMin = -20;
    var yMax = 20;

// Definisci la scala per l'asse x
    var xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, 650]);

// Definisci la scala per l'asse y
    var yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([300, 0]);

// Crea gli elementi circolari per il tuo scatterplot
    scatterPlotpSvg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("id", "dot")
      .attr("cx", function (d) {return xScale(d.PC1);})
      .attr("cy", function (d) {return yScale(d.PC2);})
      .attr("r", 5) // Raggio del cerchio
      .style("stroke", "#f7f3eb")
      .style("stroke-width", "0.1")
      .style("fill", function(d) { return setPointColor(d.Deceduto); })
      .on("click",  function(d) {
        tooltipScatter = d3.select("#popupScatterPlot");
        tooltipScatter.style("opacity", 0.9);

        tooltipScatter.html(setPointText(d.TipoVeicolo))
          .style("color", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          //.style("font-weight", "bold"
          .style("left", (d3.event.pageX + 9 + "px"))
          .style("top", (d3.event.pageY - 9 + "px"));

        // Converti le coordinate in formato decimale
        let pointCoordinates = [d.Longitude, d.Latitude];

        // Aggiungi un punto rosso alla mappa
        choroplethMapSvg.append("circle")
          .attr("cx", projection(pointCoordinates)[0])
          .attr("cy", projection(pointCoordinates)[1])
          .attr("r", 5) // Imposta il raggio del cerchio
          .style("fill", setPointColor(d.Deceduto))
      })
      .on("mouseout", function(d) { tooltipScatter.style("opacity", 0); })
      .attr("class", function(d) {
        // Determina il quadrante e assegna una classe
        var quadrant = getQuadrant(d.PC1, d.PC2);
        return "quadrant-" + quadrant;
      });


// Aggiungi gli assi x e y
    scatterPlotpSvg.append("g")
      .attr("transform", "translate(0," + (yScale(0)) + ")")
      .call(d3.axisBottom(xScale))
      .attr("class", "xAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")
      //.style("opacity", 1)
      .style("opacity", function(d) { return d === 0 ? 0 : 1; })  // Imposta l'opacità per i numeri dell'asse x a 1, tranne per 0;  // Imposta l'opacità per i numeri dell'asse y a 1
      /*.attr("transform", function(d) {
        if (d === 0) {
            return "translate(-10, -1)"
        } else return null;
      })*/

    // Imposta l'opacità per l'asse x
    scatterPlotpSvg.select(".xAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".xAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse x
    scatterPlotpSvg.select(".xAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

    scatterPlotpSvg.append("g")
      .attr("transform", "translate(" + (xScale(0)) + ", 0)")
      .call(d3.axisLeft(yScale))
      .attr("class", "yAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")
      .style("opacity", 1);
      //per spostare la posizione dello 0
      /*.attr("transform", function(d) {
        if (d === 0) {
            return "translate(-10, -1)"
        } else return null;
      })*/

    // Imposta l'opacità per l'asse y
    scatterPlotpSvg.select(".yAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".yAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse y
    scatterPlotpSvg.select(".yAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

// Aggiungi il brush all'elemento g del tuo grafico
    const gBrush = scatterPlotpSvg.append("g")
      .attr("class", "brush")
      .call(brush);

    drawScatterPlotLegend();

  });

}

function brushed() {
  extent = d3.event.selection;
  selectedDots = []; //qui metto tutti i punti selezionati
  allDots = []; //qui metto tutti i punti del grafico

  scatterPlotpSvg.selectAll("#dot").each(function () {

    const mydot = d3.select(this);

    allDots.push(mydot);
    //controllo se il punto si trova all'interno della selezione
    var isBrushed = extent[0][0] <= mydot.attr('cx') && extent[1][0] >= mydot.attr('cx') && // Check X coordinate
      extent[0][1] <= mydot.attr('cy') && extent[1][1] >= mydot.attr('cy')  // And Y coordinate

    if(isBrushed && !selectedDots.includes(mydot)){ //se il punto si trova nella selezione lo aggiungo a selectedDots
      selectedDots.push(mydot);
      //console.log(mydot);
    } else { //se il punto non si trova nella selezione lo rimuovo da selectedDots
      let indexToRemove = selectedDots.indexOf(mydot);
      if (indexToRemove !== -1) selectedDots.splice(indexToRemove);

    }
  })



  allDots.forEach(dot => {
    if (selectedDots.includes(dot)){
      //console.log(dot.attr("city"));
      //console.log(dot);
      dot.style('fill', '#9e9ac8'); //tutti i selezionati si colorano
    } else if(!selectedDots.includes(dot)){
      dot.style('fill', '#a6cee3'); //tutti gli altri tornano grigi
    }

  });

  if (selectedDots.length===0){
    allDots.forEach(dot => {
      //console.log(dot);
      if (allCities.includes(dot.attr('city'))){
        dot.style('fill', '#9e9ac8');
      } else {
        dot.style('fill', '#a6cee3');
      }
    })
  }

  //colora di verde la citta migliore della selezione attuale
}

function brushEnd() {
  console.log("Brush end");
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
  /*
  if (tipoVeicolo === "Autovettura" || tipoVeicolo === "Car")
    return "#cab2d6"
  else if (tipoVeicolo === "Motociclo" || tipoVeicolo === "Motorcycle")
    return "#b2df8a";
  else if (tipoVeicolo === "Autocarro" || tipoVeicolo === "Truck")
    return "#fdbf6f";
  else if (tipoVeicolo === "Ignoto" || tipoVeicolo === "Unknown")
    return "#a6cee3";
   */
  if (tipoVeicolo === 0.0 || tipoVeicolo === '0.0' || tipoVeicolo === "Non-fatal accident")
    return "#c9a18b"
  else return "#8bc8e8"

}


function drawScatterPlotLegend() {

  let keys = ["Fatal accident", "Non-fatal accident"];
  let size = 17;

  scatterPlotpSvg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 600)
    .attr("y", function (d, i) {
      return 250 + i * (size + 5)
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
    .attr("x", 600 + size * 1.2)
    .attr("y", function (d, i) {
      return 250 + i * (size + 5) + (size / 2)
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

// Funzione per determinare il quadrante
function getQuadrant(x, y) {
  if (x >= 0 && y >= 0) {
    return 1; // Primo quadrante
  } else if (x < 0 && y >= 0) {
    return 2; // Secondo quadrante
  } else if (x < 0 && y < 0) {
    return 3; // Terzo quadrante
  } else {
    return 4; // Quarto quadrante
  }
}