/*
var timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "-50 -300 1300 400")
  .classed("svg-content-responsive", true)
  .append("g").attr("transform", "translate(0, 0)");

 */
var margin = {top: 10, right: 30, bottom: 160, left: 40};

// append the svg object to the body of the page
var timeSeriesSvg = d3.select("#timeSeries")
  .append("div")
  .classed("svg-container-largo", true)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 660 270")
  .classed("svg-content-responsive", true)
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .append("g").attr("transform", "translate(9, -33)");


let xScaleTimeSeries, yScaleTimeSeries, xAxisTimeSeries, yAxisTimeSeries, pointsGroup;
let townHallClicked = false;
let widthTimeSeries = 500;
let heightTimeSeries = 200;
let parseTime = d3.timeParse("%Y-%m-%d");
let line;
let timeSeriesData;
let arrayOfData = [];
let idPoints;
let tickValues;

const dataTest = [
  { DataOraIncidente: "2023-01-01", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-01-10", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-02-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-03-01", NumeroIncidenti: 2 },
  { DataOraIncidente: "2023-04-01", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-05-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-06-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-07-01", NumeroIncidenti: 2 },
  { DataOraIncidente: "2023-08-01", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-09-01", NumeroIncidenti: 2 },
  { DataOraIncidente: "2023-10-01", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-11-01", NumeroIncidenti: 1 }
];

const dataTest2 = [
  { DataOraIncidente: "2023-01-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-01-10", NumeroIncidenti: 10 },
  { DataOraIncidente: "2023-02-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-03-01", NumeroIncidenti: 20 },
  { DataOraIncidente: "2023-04-01", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-05-01", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-06-10", NumeroIncidenti: 0 },
  { DataOraIncidente: "2023-07-10", NumeroIncidenti: 20 },
  { DataOraIncidente: "2023-08-20", NumeroIncidenti: 1 },
  { DataOraIncidente: "2023-09-01", NumeroIncidenti: 2 },
  { DataOraIncidente: "2023-10-01", NumeroIncidenti: 10 },
  { DataOraIncidente: "2023-11-01", NumeroIncidenti: 10 }
];

function convertData(data){
  // Converti le date da stringhe a oggetti Date
  data.forEach(d => {
    d.DataOraIncidente = parseTime(d.DataOraIncidente);
    d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
  });

  arrayOfData.push(data)
}
function setAxesScale(data){

  xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(data, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

  yScaleTimeSeries = d3.scaleLinear()
    .domain([0, 160])
    .range([heightTimeSeries, 0]);
}
function setAxesScalePedestrianDeaths(data){

  xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(data, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

  yScaleTimeSeries = d3.scaleLinear()
    .domain([0, 5])
    .range([heightTimeSeries, 0]);
}


function drawLineWithValue(data, color, id){
  const curve = d3.curveCardinal;

  line = d3.line()
    .curve(curve)
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

    timeSeriesSvg.append("path")
      .datum(data)
      .attr("id", id)
      .attr("class", "line"+ id)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 0.8)
      .attr("d", line)
      .attr("transform", `translate(51, 50)`);

}

function drawAxes(data){
  // Trova la data minima e massima nei tuoi dati
  const minDate = d3.min(data, d => d.DataOraIncidente);
  const maxDate = d3.max(data, d => d.DataOraIncidente);

  var timeOrdered = [];

  let minimaDate = minDate;
  timeOrdered.push(minDate);
  while (minimaDate <= maxDate) {
    minimaDate = d3.timeDay.offset(minimaDate, 10);
    timeOrdered.push(minimaDate);
  }

  // Estrai solo ogni 3 tick
  tickValues = timeOrdered.filter((_, i) => i % 3 === 0);

// Crea l'asse x con i tickValues
  xAxisTimeSeries = d3.axisBottom(xScaleTimeSeries)
    .tickValues(tickValues)
    .tickFormat(date => {
      return d3.timeFormat("%d %b")(date);
    });

  yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, ${heightTimeSeries + 50})`)
    .style("font-family", "Lora")
    .call(xAxisTimeSeries)
    .append("text")
    .attr("y", 37)
    .attr("x", 247)
    .attr("fill", "black")
    .text("Time interval");

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, 50)`)
    .style("font-family", "Lora")
    .call(yAxisTimeSeries.tickFormat(function(d){return d;}))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)  // Imposta il nuovo valore di "y" per il punto di ancoraggio
    .attr("x", -58) // Imposta il nuovo valore di "x" per il punto di ancoraggio
    .attr("fill", "black")
    .text("Accidents' number");

}

function drawAxesPedestrianDeaths(data){
  // Trova la data minima e massima nei tuoi dati
  const minDate = d3.min(data, d => d.DataOraIncidente);
  const maxDate = d3.max(data, d => d.DataOraIncidente);

  let tickValues = [];
  let currentDate = d3.timeMonth.floor(minDate);
  while (currentDate <= maxDate) {
    tickValues.push(currentDate);
    for (let i = 0; i < 3; i++) {
      let nextDateTen = d3.timeDay.offset(currentDate, 10);
      if (nextDateTen <= maxDate)
        tickValues.push(nextDateTen);
    }
    tickValues.push(d3.timeDay.offset(currentDate, 20));
    currentDate = d3.timeMonth.offset(currentDate, 1);
  }
  tickValues.pop(tickValues.length)

  // Crea l'asse x con i tickValues
  xAxisTimeSeries = d3.axisBottom(xScaleTimeSeries)
    .tickValues(tickValues)
    .tickFormat(date => {
      let day = d3.timeFormat("%d")(date);
      let year = d3.timeFormat("%Y")(date);
      let nextYear = parseInt(selectedYear) + 1;
      if(parseInt(year) === nextYear)
        return "";
      else if (day === "01")
        return d3.timeFormat("%b")(date);
      return "";
    });

  yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries)
    .tickValues(d3.range(6))
    .tickFormat(function(d){return d;})

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, ${heightTimeSeries + 50})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, 50)`)
    .call(yAxisTimeSeries);

}


function drawGrid(){
  // Aggiungi linee tratteggiate verticali
  timeSeriesSvg.selectAll("line.vgrid")
    .data(tickValues.slice(1))
    .enter()
    .append("line")
    .attr("class", "vgrid")
    .attr("x1", d => xScaleTimeSeries(d))
    .attr("x2", d => xScaleTimeSeries(d))
    .attr("y1", heightTimeSeries)
    .attr("y2", 0)
    .attr("transform", `translate(50.5, 50)`)
    .style("stroke", "#c7c2b5")
    .style("stroke-dasharray", "3, 3")
    .style("stroke-width", 0.5)

  // Aggiungi linee tratteggiate orizzontali
  timeSeriesSvg.selectAll("line.hgrid")
    .data(yScaleTimeSeries.ticks().slice(1))
    .enter()
    .append("line")
    .attr("class", "hgrid")
    .attr("x1", 0)
    .attr("x2", widthTimeSeries)
    .attr("y1", d => yScaleTimeSeries(d))
    .attr("y2", d => yScaleTimeSeries(d))
    .attr("transform", `translate(52.5, 50.5)`)
    .style("stroke", "#c7c2b5")
    .style("stroke-dasharray", "3, 3")
    .style("stroke-width", 0.5);
}

function drawGridPedestrianDeaths(){
  // Aggiungi linee tratteggiate verticali
  timeSeriesSvg.selectAll("line.vgrid")
    .data(xScaleTimeSeries.ticks())
    .enter()
    .append("line")
    .attr("class", "vgrid")
    .attr("x1", d => xScaleTimeSeries(d))
    .attr("x2", d => xScaleTimeSeries(d))
    .attr("y1", heightTimeSeries)
    .attr("y2", 0)
    .attr("transform", `translate(50.5,  50)`)
    .style("stroke", "gray")
    .style("stroke-dasharray", "5, 5")
    .style("stroke-width", 0.3)

  // Aggiungi linee tratteggiate orizzontali
  timeSeriesSvg.selectAll("line.hgrid")
    .data(yScaleTimeSeries.ticks(5).slice(1))
    .enter()
    .append("line")
    .attr("class", "hgrid")
    .attr("x1", 0)
    .attr("x2", widthTimeSeries)
    .attr("y1", d => yScaleTimeSeries(d))
    .attr("y2", d => yScaleTimeSeries(d))
    .attr("transform", `translate(52.5, 50.5)`)
    .style("stroke", "gray")
    .style("stroke-dasharray", "5, 5")
    .style("stroke-width", 0.3);
}

function addPoints(nature) {
  // Aggiungi un gruppo per i punti interattivi
  pointsGroup = timeSeriesSvg.append("g")
    .attr("id", idPoints++)
    .attr("class", nature)
    .attr("transform", `translate(51, 50)`);
}
function drawPoints(data, color) {
  // Filtra i dati in modo da includere solo quelli con NumeroIncidenti diverso da zero
  var filteredData = data.filter(function(d) {
    return d.NumeroIncidenti !== 0;
  });

  // Trova l'oggetto con il massimo NumeroIncidenti
  const maxIncident = filteredData.reduce((acc, cur) => cur.NumeroIncidenti > acc.NumeroIncidenti ? cur : acc, filteredData[0]);

// Crea cerchi per tutti i punti
  pointsGroup.selectAll(".point")
    .data(filteredData)
    .enter()
    .append("g")  // Gruppo per ogni cerchio
    .attr("class", "point")
    .each(function(d) {
      // Aggiungi cerchio più grande solo per il punto massimo
      if (d === maxIncident) {
        d3.select(this).append("circle")
          .attr("class", "outer-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 8)
          .style("stroke", "red")
          .style("stroke-width", "1")
          .style("fill", "none");

        // Aggiungi cerchio più piccolo per tutti i punti
        d3.select(this).append("circle")
          .attr("class", "inner-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 2)
          .style("fill", color)
          .style("stroke", "white")
          .style("stroke-width", "0.5")
          .on("mouseover", showIncidentCount)
          .on("mouseout", hideIncidentCount);
      }
    });


}

function drawTimeSeriesChart(csvFileName, callback){

  d3.csv(csvFileName, function (data) {
    timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });

    convertData(timeSeriesData);
    setAxesScale(timeSeriesData);
    drawAxes(timeSeriesData);
    drawLineWithValue(timeSeriesData, "#a1987d", "main");
    drawGrid();
    addPoints("noNature");
    drawPoints(timeSeriesData, "#524a32");
  });
}

// Funzione per mostrare il numero di incidenti
function showIncidentCount(d) {
  let incidentCount = d.NumeroIncidenti;
  let xPosition = xScaleTimeSeries(d.DataOraIncidente) - 6;
  let yPosition = yScaleTimeSeries(incidentCount) - 10;
  let marginNumberCircleX;

  if (incidentCount < 10) marginNumberCircleX = 2.5
  else if (incidentCount >= 10 && incidentCount < 100) marginNumberCircleX = 5.5
  else marginNumberCircleX = 8.5

  pointsGroup.append("circle")
    .attr("id", "num")
    .attr("cx", xPosition + marginNumberCircleX)
    .attr("cy", yPosition - 3.5)
    .attr("r", 9) // Imposta il raggio del cerchio
    .style("font-family", "Lora")
    .style("opacity", "0.6")
    .style("stroke", "#524a32") // Colore del bordo
    .style("stroke-width", "0.3px") // Larghezza del bordo
    .style("fill", "white")

  pointsGroup.append("text")
    .attr("class", "incident-count")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .text(incidentCount)
    .style("font-size", "10px")
    //.style("fill", "white");
    .style("color", "#524a32");
}

// Funzione per nascondere il numero di incidenti
function hideIncidentCount() {
  pointsGroup.selectAll(".incident-count").remove();
  d3.selectAll("#num").remove();
}