/*
var timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "-50 -300 1300 400")
  .classed("svg-content-responsive", true)
  .append("g").attr("transform", "translate(0, 0)");

 */
var margin = {top: 10, right: 30, bottom: 160, left: 0};



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
    .domain([0, 1100])
    .range([heightTimeSeries, 0]);
}
function setAxesScalePedestrianDeaths(data) {

  xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(data, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

  yScaleTimeSeries = d3.scaleLinear()
    .domain([0, 5])
    .range([heightTimeSeries, 0]);
}

function drawLineWithValue(data, color, id) {
  const curve = d3.curveCardinal;

  line = d3.line()
    .curve(curve)
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

  const path = timeSeriesSvg.append("path")
    .datum(data)
    .attr("id", id)
    .attr("class", "line" + id)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 0.8)
    .attr("d", line)
    .attr("transform", `translate(51, 50)`);

  const focus = timeSeriesSvg.append('g')
    .attr('class', 'focus')
    .style('display', 'none');

  // Aggiungi la nuova linea che si muove lungo l'asse x
  const xHoverLine = timeSeriesSvg.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('stroke-width', 0.6)
    .style("opacity", "0.7")
    .style("stroke", "#524a32") // Colore del bordo
    .attr('y1', 50)  // Altezza dell'asse Y
    .attr('y2', 250)
    .attr('stroke-dasharray', '3,3')  // Imposta la linea tratteggiata
    .style('display', 'none');  // Nascondi la linea all'inizio

    // Aggiungi il riquadro di informazioni con rect e text
    const infoBox = timeSeriesSvg.append('g')
      .attr('class', 'info-box')
      .style('display', 'none');

    infoBox.append('rect')
      .attr('width', 60)
      .attr('height', 30)
      .attr('rx', 8) // Arrotonda gli angoli orizzontali
      .attr('ry', 8) // Arrotonda gli angoli verticali
      .style("opacity", "0.7")
      .style("stroke", "#524a32") // Colore del bordo
      .style("stroke-width", "0.3px") // Larghezza del bordo
      .style("fill", "white");
      //.style('border-radius', '15px');

    infoBox.append('text')
      .attr('x', 5)
      .attr('y', 13)
      .attr('text-anchor', 'middle') // Imposta l'ancoraggio del testo al centro
      .attr('dominant-baseline', 'middle') // Imposta la linea di base dominante al centro
      .style('translate', '25px')
      .style('font', '12px sans-serif')
      .style('font', '8px Lora')
      .style('fill', '#524a32');

  focus.append('circle')
    .attr('r', 5)
    .attr('fill', color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  timeSeriesSvg.append('rect')
    .attr('width', 500)
    .attr('height', 300)
    .style('fill', 'none')
    .style('translate', '50px')
    .style('pointer-events', 'all')
    .on('mouseover', () => {
      focus.style('display', null);
      xHoverLine.style('display', 'block');  // Mostra la linea quando il mouse entra nell'area
      infoBox.style('display', 'block');
    })
    .on('mouseout', () => {
      focus.style('display', 'none');
      xHoverLine.style('display', 'none');  // Nascondi la linea quando il mouse esce dall'area
      infoBox.style('display', 'none');
    })
    .on('mousemove', mousemove);

  function mousemove() {
    const x0 = xScaleTimeSeries.invert(d3.mouse(this)[0]);
    const bisect = d3.bisector(d => d.DataOraIncidente).left;
    const i = bisect(timeSeriesData, x0, 1);

    // Check if the index is within the bounds of the data array
    if (i > 0 && i < timeSeriesData.length) {
      const d0 = timeSeriesData[i - 1];
      const d1 = timeSeriesData[i];
      const d = x0 - d0.DataOraIncidente > d1.DataOraIncidente - x0 ? d1 : d0;

      // Calcola la posizione desiderata del focus
      const focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
      const focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;

      // Imposta la posizione del focus senza utilizzare una transizione
      focus.transition()
        .duration(50)  // specifica la durata dell'animazione in millisecondi
        .attr('transform', `translate(${focusX},${focusY})`);

      // Aggiorna la posizione della linea lungo l'asse x
      xHoverLine.transition()
        .duration(50)
        .attr('x1', focusX)
        .attr('x2', focusX);

      // Aggiorna la posizione del riquadro di informazioni
      infoBox.transition()
        .duration(50).attr('transform', `translate(${focusX + 3},50)`);

      infoBox.select('text').selectAll('tspan').remove(); // Rimuovi eventuali elementi tspan esistenti
      const date = new Date(d.DataOraIncidente);
      const day = date.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const formattedDate = `${day} ${month}`;
      const accidentsText = `${formattedDate}`;
      const accidentsCountText = `accidents: ${d.NumeroIncidenti}`;

      infoBox.select('text')
        .append('tspan')
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", "8px")
        .text(accidentsText)
        .attr('x', 5)
        .attr('dy', '-1.5px'); // Imposta l'offset verticale per la seconda riga

      infoBox.select('text')
        .append('tspan')
        .text(accidentsCountText)
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", "8px")
        .style('font-weight', 'bold')
        .attr('x', 5)
        .attr('dy', '10.2px'); // Imposta l'offset verticale per la terza riga
    }
  }


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

  /*
  // Crea l'asse x per l'elemento di brush
 // var xAxisBrush = d3.axisBottom(xScaleTimeSeries);

  // Aggiungi l'asse x per l'elemento di brush
  timeSeriesSvg.append("g")
    .attr("class", "brush-axis")
    .attr("transform", "translate(0, " + (heightTimeSeries + 50 + 20) + ")")
    .style("font-family", "Lora")
    //.call(xAxisBrush);
   */
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
    .attr("transform", `translate(52.5, 50.5)`)
    .style("stroke", "#c7c2b5")
    .style("stroke-dasharray", "3, 3")
    .style("stroke-width", 0.3);
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

    drawGrid();
    addPoints("noNature");
    drawPoints(timeSeriesData, "#524a32")
    drawLineWithValue(timeSeriesData, "#a1987d", "main");
/*

    // Crea un elemento di brush per la selezione
    var brush = d3.brushX()
      .extent([[0, 0], [widthTimeSeries, heightTimeSeries]])
      .on("end", brushed);

// Aggiungi il brush all'elemento g del tuo grafico
    timeSeriesSvg.append("g")
      .attr("class", "brush")
      .call(brush);

 */

  });
}

function brushed() {
  if (!d3.event.selection) return; // Se la selezione è nulla, esci dalla funzione

  // Ottieni la data iniziale e finale selezionate
  var [x0, x1] = d3.event.selection.map(xScaleTimeSeries.invert);

  // Formatta le date nel formato desiderato (ad esempio, "YYYY-MM-DD")
  var formattedStartDate = d3.timeFormat("%Y-%m-%d")(x0);
  var formattedEndDate = d3.timeFormat("%Y-%m-%d")(x1);

  // Stampa le date iniziale e finale
  console.log("Data Iniziale:", formattedStartDate);
  console.log("Data Finale:", formattedEndDate);
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