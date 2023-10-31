const timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("width", 680)
  .attr("height", 245);

let xScaleTimeSeries, yScaleTimeSeries, xAxisTimeSeries, yAxisTimeSeries, pointsGroup;
let townHallClicked = false;
let widthTimeSeries = 500;
let heightTimeSeries = 200;
let parseTime = d3.timeParse("%Y-%m-%d");
let line;
let timeSeriesData;
let arrayOfData = [];
let idPoints;

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
    .domain([0, d3.max(data, d => d.NumeroIncidenti) + 9])
    .range([heightTimeSeries, 0]);
}

function drawLineWithValue(data){
  line = d3.line()
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

  data.forEach(data => {
    timeSeriesSvg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5)
      .attr("d", line)
      .attr("transform", `translate(149, 13)`);
  });
}

function drawAxes(data){
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
      if (day === "01") {
        return d3.timeFormat("%b")(date);
      }
      return "";
    });

  yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries);
  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, ${heightTimeSeries + 13})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, 13)`)
    .call(yAxisTimeSeries);

}

function drawGrid(){
  // Aggiungi linee tratteggiate verticali
  timeSeriesSvg.selectAll("line.vgrid")
    .data(xScaleTimeSeries.ticks().slice(1))
    .enter()
    .append("line")
    .attr("class", "vgrid")
    .attr("x1", d => xScaleTimeSeries(d))
    .attr("x2", d => xScaleTimeSeries(d))
    .attr("y1", heightTimeSeries)
    .attr("y2", 0)
    .attr("transform", `translate(148.5,  13)`)
    .style("stroke", "gray")
    .style("stroke-dasharray", "5, 5")
    .style("stroke-width", 0.3)

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
    .attr("transform", `translate(150.5, 13.5)`)
    .style("stroke", "gray")
    .style("stroke-dasharray", "5, 5")
    .style("stroke-width", 0.3);
}

function addPoints(){
  // Aggiungi un gruppo per i punti interattivi
  pointsGroup = timeSeriesSvg.append("g")
    .attr("id", idPoints++)
    .attr("transform", `translate(149, 13)`);
}
function drawPoints(data) {
  // Filtra i dati in modo da includere solo quelli con NumeroIncidenti diverso da zero
  var filteredData = data.filter(function(d) {
    return d.NumeroIncidenti !== 0;
  });

  // Aggiungi cerchi per i punti di cambio di inclinazione solo con dati filtrati
  pointsGroup.selectAll(".point")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", d => xScaleTimeSeries(d.DataOraIncidente))
    .attr("cy", d => yScaleTimeSeries(d.NumeroIncidenti))
    .attr("r", 3)
    .style("fill", "steelblue")
    .style("stroke", "white")
    .style("stroke-width", 0.2)
    .on("mouseover", showIncidentCount)
    .on("mouseout", hideIncidentCount);
}

function drawTimeSeriesChart(csvFileName, callback){

  d3.csv(csvFileName, function (data) {
    timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });

    convertData(timeSeriesData);
    setAxesScale(timeSeriesData);
    drawAxes(timeSeriesData);
    drawLineWithValue(arrayOfData);
    drawGrid();
    addPoints()
    drawPoints(timeSeriesData);
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
    .style("fill", "gray");

  pointsGroup.append("text")
    .attr("class", "incident-count")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .text(incidentCount)
    .style("font-size", "10px")
    .style("fill", "white");
}

// Funzione per nascondere il numero di incidenti
function hideIncidentCount() {
  pointsGroup.selectAll(".incident-count").remove();
  d3.selectAll("#num").remove();
}