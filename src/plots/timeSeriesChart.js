/*
var timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "-50 -300 1300 400")
  .classed("svg-content-responsive", true)
  .append("g").attr("transform", "translate(0, 0)");

 */
var margin = {top: 10, right: 30, bottom: 160, left: 0};
var widthInfoBox = 49;
var heightInfoBox = 35.5;
var incidentiPerIntervallo = [];
var flagInterval = false;
var switchInput, switchBrushInput, switchWeatherInput;
var formattedStartDate, formattedEndDate, brushGroup, dateFormatter;
let currentTransform = d3.zoomIdentity;
var incidentiPerIntervalloTwo = [];

// append the svg object to the body of the page
var timeSeriesSvg = d3.select("#timeSeries")
  .append("div")
  .classed("svg-container-largo", true)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 679 270")
  .classed("svg-content-responsive", true)
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .append("g").attr("transform", "translate(9, -33)");


let xScaleTimeSeries, yScaleTimeSeries, xAxisTimeSeries, yAxisTimeSeries, pointsGroup, focusGroup;
let townHallClicked = false;
let widthTimeSeries = 500;
let heightTimeSeries = 200;
let parseTime = d3.timeParse("%Y-%m-%d");
let line, xHoverLine, infoBox;
let timeSeriesData, timeSeriesDataDaily;
let arrayOfData = [];
let idPoints;
let tickValues;
let focusArray = [];
let focusNatureArray = [];
let switchValue;
let infoBoxArray = [];
let infoBoxNatureArray = [];
let keysLegends = [];
let vBarChart = false;
const overviewHeight = 50; // or any desired height for the overview
const overviewMargin = { top: 10, right: 50, bottom: 20, left: 50 }; // or adjust as needed
const overviewWidth = widthTimeSeries + overviewMargin.left + overviewMargin.right;
let grid;
let vGridLines;
let hGridLines;
let allPoints;
let tooltipTime;
let previousZoomValue = 0;
let isDrawed = false;
var x0, x1;



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

let zoomState = "normal";
let currentCsvFileName;

function convertData(data){
  // Converti le date da stringhe a oggetti Date
  data.forEach(d => {
    d.DataOraIncidente = parseTime(d.DataOraIncidente);
    d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
  });

  arrayOfData.push(data)
}
function setAxesScale(data) {

  xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(data, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

  yScaleTimeSeries = d3.scaleLinear();

  if (switchInput.value === "ON") {
    yScaleTimeSeries.domain([0, 160])
  } else {
    yScaleTimeSeries.domain([0, 160])
  }

  yScaleTimeSeries.range([heightTimeSeries, 0]);
}

function setAxesScalePedestrianDeaths(data) {

  xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(data, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

  yScaleTimeSeries = d3.scaleLinear()
    .domain([0, 5])
    .range([heightTimeSeries, 0]);
}

function drawFocus(color, id){

  let focus = timeSeriesSvg.append("g")
    .attr('id', "focus_" + id)
    .attr('class', "focus")
    .style('display', 'block');

  focus.append('circle')
    .attr('r', 4.5)
    .attr('fill', color)
    .attr('stroke', '#f7f3eb')
    .attr('stroke-width', 1.8);

  if(id === "main")
    focusArray.push(focus);
  else
    focusNatureArray.push(focus);

}

function drawXHoverLine(){

  // Aggiungi la nuova linea che si muove lungo l'asse x
  xHoverLine = timeSeriesSvg.append('line')
    .attr('class', 'x-hover-line hover-line')
    .attr('stroke-width', 0.6)
    .style("opacity", "0.7")
    .style("stroke", "#524a32") // Colore del bordo
    .attr('y1', 50)  // Altezza dell'asse Y
    .attr('y2', 250)
    .attr('stroke-dasharray', '3,3')  // Imposta la linea tratteggiata
    .style('display', 'none');  // Nascondi la linea all'inizio

}

function drawInfoBox(id){
  // Aggiungi il riquadro di informazioni con rect e text
  infoBox = timeSeriesSvg.append('g')
    .attr('id', "infobox_" + id)
    .attr('class', 'info-box')
    .style('display', 'none');

  infoBox.append('rect')
    .attr('class', 'info-box-rect')
    .attr('width', 80)
    .attr('height', 35.5)
    .attr('rx', 8) // Arrotonda gli angoli orizzontali
    .attr('ry', 8) // Arrotonda gli angoli verticali
    .style("opacity", "0.8")
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


}
/*
function drawLineWithValue(data, color, id) {
  const curve = d3.curveCardinal;

  line = d3.line()
    .curve(curve)
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

  timeSeriesSvg.append("path")
    .datum(data)
    .attr("id", "line_"+ id)
    .attr("class", "line_" + id)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 0.8)
    .attr("d", line)
    .attr("transform", `translate(51, 50)`);

  drawFocus(color, id);
  //drawInfoBox();

  timeSeriesSvg.append('rect')
    .attr('width', 500)
    .attr('height', 300)
    .style('fill', 'none')
    .style('translate', '50px')
    .style('pointer-events', 'all')
    .on('mouseover', () => {
      focusArray.forEach((focus, index) => {
        focus.style('display', 'block');
      });
      focusNatureArray.forEach((focus, index) => {
        focus.style('display', 'block');
      });
      xHoverLine.style('display', 'block');  // Mostra la linea quando il mouse entra nell'area
      infoBox.style('display', 'block');
    })
    .on('mouseout', () => {
      focusArray.forEach((focus, index) => {
        focus.style('display', 'none');
      });
      focusNatureArray.forEach((focus, index) => {
        focus.style('display', 'none');
      });
      xHoverLine.style('display', 'none');  // Nascondi la linea quando il mouse esce dall'area
      infoBox.style('display', 'none');
    })
    .on('mousemove', mousemove);

  function mousemove() {
    const x0 = xScaleTimeSeries.invert(d3.mouse(this)[0]);
    const bisect = d3.bisector(d => d.DataOraIncidente).left;
    const i = bisect(data, x0, 1);

    // Check if the index is within the bounds of the data array
    if (i > 0 && i < data.length) {
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0.DataOraIncidente > d1.DataOraIncidente - x0 ? d1 : d0;

      // Calcola la posizione desiderata del focus
      const focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
      const focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;

      console.log("FOCUS GROUP")
      console.log(focusArray)

      focusArray.forEach((focus, index) => {
        const focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
        const focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;
        focus.transition()
          .duration(50)
          .attr('transform', `translate(${focusX},${focusY})`);
      });


      focusArray.forEach((f, index) => {
        const focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
        const focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;
        f.transition()
          .duration(50)
          .attr('transform', `translate(${focusX},${focusY})`);
      });


      // Aggiorna la posizione della linea lungo l'asse x
      xHoverLine.transition()
        .duration(50)
        .attr('x1', focusX)
        .attr('x2', focusX);

      // Aggiorna la posizione del riquadro di informazioni
      infoBox.transition()
        .duration(50).attr('transform', `translate(${focusX + 3}, 50)`);

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

*/
function drawLineWithValue(data, color, id, timeseries) {
  let curve = d3.curveCardinal;

  line = d3.line()
    //.curve(curve)
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

  timeSeriesSvg.append("path")
    .datum(data)
    .attr("id", "line_"+ id)
    .attr("class", "line_" + id)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1.3)
    .attr("d", line)
    .attr("transform", `translate(51, 50)`);

   drawFocus(color, id);


  timeSeriesSvg.append('rect')
    .attr('width', 500)
    .attr('height', 500)
    .style('fill', 'none')
    .style('translate', '50px')
    .style('pointer-events', 'all')
    .on('mouseover', () => {
      focusArray.forEach((focus, index) => {
        focus.style('display', 'block');
      });
      focusNatureArray.forEach((focus, index) => {
        focus.style('display', 'block');
      });
      infoBoxArray.forEach((infoBox, index) => {
        infoBox.style('display', 'block');
      });
      infoBoxNatureArray.forEach((infoBox, index) => {
        infoBox.style('display', 'block');
      });
      xHoverLine.style('display', 'block');  // Mostra la linea quando il mouse entra nell'area
    })
    .on('mouseout', () => {
      focusArray.forEach((focus, index) => {
        focus.style('display', 'none');
      });
      focusNatureArray.forEach((focus, index) => {
        focus.style('display', 'none');
      });
      infoBoxArray.forEach((infoBox, index) => {
        infoBox.style('display', 'none');
      });
      infoBoxNatureArray.forEach((infoBox, index) => {
        infoBox.style('display', 'none');
      });
      xHoverLine.style('display', 'none');  // Nascondi la linea quando il mouse esce dall'area
    })
    .on('mousemove', function(event) {
      if (switchInput.value === "OFF" && switchBrushInput.value === "OFF")
        mousemove.call(this, event); // Usa call per garantire il corretto contesto 'this'
    });

  function mousemove(event) {
    let x0 = xScaleTimeSeries.invert(d3.mouse(this)[0]);
    let bisect = d3.bisector(d => d.DataOraIncidente).left;
    let i = bisect(timeSeriesData, x0, 1);

    // Check if the index is within the bounds of the data array
    if (i > 0 && i < timeSeriesData.length) {
      let d0 = timeSeriesData[i - 1];
      let d1 = timeSeriesData[i];
      let d = x0 - d0.DataOraIncidente > d1.DataOraIncidente - x0 ? d1 : d0;

      // Calcola la posizione desiderata del focus
      let focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
      let focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;

      console.log("FOCUS GROUP")

      focusArray.forEach((f, index) => {
        let focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
        let focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;
        f.transition()
          .duration(50)
          .attr('transform', `translate(${focusX},${focusY})`);
      });

      // Aggiorna la posizione della linea lungo l'asse x
      xHoverLine.transition()
        .duration(50)
        .attr('x1', focusX)
        .attr('x2', focusX);

      // Aggiorna la posizione del riquadro di informazioni
      infoBoxArray.forEach((infoBox, index) => {
        infoBox.transition()
          .duration(50).attr('transform', `translate(${focusX + 3}, 50)`);
      });

      // Aggiorna la posizione del riquadro di informazioni
      infoBoxArray.forEach((infoBox, index) => {
        infoBox.select('text').selectAll('tspan').remove(); // Rimuovi eventuali elementi tspan esistenti
      });
      let accidentsCountText= `${d.NumeroIncidenti}`;
      let accidentsCountTextNature = "";


      if (focusNatureArray.length !== 0) {
        timeSeriesSvg.selectAll(".info-box-rect").attr('height', 46.5);

        let x0 = xScaleTimeSeries.invert(d3.mouse(this)[0]);
        let bisect = d3.bisector(d => d.DataOraIncidente).left;
        let i = bisect(data, x0, 1);

        // Check if the index is within the bounds of the data array
        if (i > 0 && i < data.length) {
          let d0 = data[i - 1];
          let d1 = data[i];
          let d = x0 - d0.DataOraIncidente > d1.DataOraIncidente - x0 ? d1 : d0;

          // Calcola la posizione desiderata del focus
          let focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
          let focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;

          focusNatureArray.forEach((focus, index) => {
            let focusX = xScaleTimeSeries(d.DataOraIncidente) + 51;
            let focusY = yScaleTimeSeries(d.NumeroIncidenti) + 50;
            focus.transition()
              .duration(50)
              .attr('transform', `translate(${focusX},${focusY})`);
          });

          // Aggiorna la posizione della linea lungo l'asse x
          xHoverLine.transition()
            .duration(50)
            .attr('x1', focusX)
            .attr('x2', focusX);

          accidentsCountTextNature = `${d.NumeroIncidenti}`;
        }

      }

      let date = new Date(d.DataOraIncidente);
      let day = date.getDate();
      let monthAbbreviation = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
      let formattedDate = `${day} ${monthAbbreviation}`;

      accidentsText = `${formattedDate}`;

      infoBoxArray.forEach((infoBox, index) => {
        infoBox.select('text')
          .append('tspan')
          .style("color", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .style('font-weight', 'bold')
          .text(accidentsText)
          .attr('x', 15)
          .attr('dy', '-1.5px'); // Imposta l'offset verticale per la seconda riga

        if(!flagInterval) {
          timeSeriesSvg.selectAll(".info-box-rect").attr('height', 35.5);

          infoBox.select('text')
            .append('tspan')
            .style("fill", "#cab2d6")
            .style("font-family", "Lora")
            .style("font-size", "10px")
            .style("text-align", "left")
            .attr('x', 15)
            .attr('dy', '15.2px') // Imposta l'offset verticale per la terza riga
            .text("n1 ");

          // Aggiungi uno spazio dopo "n2"
          infoBox.select('text')
            .append('tspan')
            .style("fill", "white")
            .text(" C"); // Aggiungi uno spazio vuoto

          infoBox.select('text')
            .append('tspan')
            .style("fill", "#cab2d6")
            .style("font-family", "Lora")
            .style("font-size", "10px")
            .text(accidentsCountText);

          infoBox.select('text')
            .append('tspan')
            .html("<br>")
            .attr('x', 0)
            .attr('dy', '10.2px'); // Imposta l'offset verticale per la terza riga

          if(infoBoxNatureArray.length > 0) {

            timeSeriesSvg.selectAll(".info-box-rect").attr('height', 46.5);

            infoBox.select('text')
              .append('tspan')
              .style("fill", color)
              .style("font-family", "Lora")
              .style("font-size", "10px")
              .style("text-align", "left")
              .attr('x', 15)
              .attr('dy', '11.2px') // Imposta l'offset verticale per la terza riga
              .text("n2 ");

            // Aggiungi uno spazio dopo "n2"
            infoBox.select('text')
              .append('tspan')
              .style("fill", "white")
              .text(" C"); // Aggiungi uno spazio vuoto

            infoBox.select('text')
              .append('tspan')
              .style("fill", color)
              .style("font-family", "Lora")
              .style("font-size", "10px")
              .text(accidentsCountTextNature);
          }
        } else {
          timeSeriesSvg.selectAll(".info-box-rect").attr('height', 20.5);

        }
      });

    }
    flagInterval = false;
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

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, ${heightTimeSeries + 50})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(50, 50)`)
    .call(yAxisTimeSeries);

}


function drawGrid(){

  // Crea un clip path per la griglia
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "grid-clip-path")
    .append("rect")
    .attr("width", 500)
    .attr("height", 200);


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
    .attr("clip-path", "url(#grid-clip-path)");


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
    .style("stroke-width", 0.3)
    .attr("clip-path", "url(#grid-clip-path)");


  // Memorizza le linee della griglia in variabili globali
  vGridLines = timeSeriesSvg.selectAll("line.vgrid");
  hGridLines = timeSeriesSvg.selectAll("line.hgrid");

  // Crea un gruppo per la griglia
  grid = timeSeriesSvg.append("g").attr("class", "grid-group");
}

function drawGridDaily(allXTicks, allYTicks){
  // Crea un clip path per la griglia
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "grid-clip-path")
    .append("rect")
    .attr("width", 500)
    .attr("height", 200);

  // Aggiungi linee tratteggiate verticali
  timeSeriesSvg.selectAll("line.vgrid")
    .data(allXTicks)
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
    .attr("clip-path", "url(#grid-clip-path)");


  // Aggiungi linee tratteggiate orizzontali
  timeSeriesSvg.selectAll("line.hgrid")
    .data(allYTicks)
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
    .style("stroke-width", 0.3)
    .attr("clip-path", "url(#grid-clip-path)");


  // Memorizza le linee della griglia in variabili globali
  vGridLines = timeSeriesSvg.selectAll("line.vgrid");
  hGridLines = timeSeriesSvg.selectAll("line.hgrid");

  // Crea un gruppo per la griglia
  grid = timeSeriesSvg.append("g").attr("class", "grid-group");
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
      if (d === maxIncident && (switchInput.value==="OFF" ||  switchBrushInput.value==="ON" || switchInput.value==="ON")) {
        d3.select(this).append("circle")
          .attr("class", "outer-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 8)
          .style("stroke", "#f00c0c")
          .style("stroke-width", "1")
          .style("fill", "none")
          .attr("clip-path", "url(#circle-clip-path)");

        // Aggiungi cerchio più piccolo per tutti i punti
        d3.select(this).append("circle")
          .attr("class", "inner-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 1.3)
          .style("fill", "#827c68");
      }
      if (d !== maxIncident && switchBrushInput.value==="OFF" && switchInput.value==="OFF") {
        d3.select(this).append("circle")
          .on("mouseover", showIncidentCount)
          .on("mouseout", hideIncidentCount);
      }

      if (switchInput.value==="ON") {
        // Aggiungi cerchio più piccolo per tutti i punti con clip path
        d3.select(this).append("circle")
          .attr("class", "inner-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 3.5)
          .style("fill", "#827c68")
          .attr("clip-path", "url(#points-clip-path)")
          .on("mouseover", showIncidentCount)
          .on("mouseout", hideIncidentCount);
      }
    });
}

function drawTimeSeriesChart(csvFileName){
  incidentiPerIntervallo = []

  d3.csv(csvFileName, function (data) {
    timeSeriesDataDaily = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });
    convertData(timeSeriesDataDaily);

// Funzione per calcolare la somma degli incidenti per un intervallo di date
    function calcolaSommaIncidenti(data, inizio, fine) {

      var sommaIncidenti = data.reduce(function (acc, row) {
        // Estrai la data dall'oggetto row
        var dataIncidente = new Date(row['DataOraIncidente']);

        // Verifica se la data rientra nell'intervallo specificato
        if (dataIncidente >= inizio && dataIncidente <= fine)
          // Se sì, aggiungi il numero di incidenti alla somma
          return acc + parseInt(row['NumeroIncidenti']);
        else return acc;
      }, 0);
      console.log('Somma incidenti per intervallo:', sommaIncidenti);
      return sommaIncidenti;
    }

// Per ciascun intervallo di date, calcola la somma degli incidenti e aggiungi il risultato all'array incidentiPerIntervallo
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-01-01'), new Date(selectedYear + '-01-31')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-02-01'), new Date(selectedYear + '-03-02')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-03-03'), new Date(selectedYear + '-04-01')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-04-02'), new Date(selectedYear + '-05-01')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-05-02'), new Date(selectedYear + '-05-31')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-06-01'), new Date(selectedYear + '-06-30')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-07-01'), new Date(selectedYear + '-07-30')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-07-31'), new Date(selectedYear + '-08-29')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-08-30'), new Date(selectedYear + '-09-28')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-09-29'), new Date(selectedYear + '-10-28')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-10-29'), new Date(selectedYear + '-11-27')));
    incidentiPerIntervallo.push(calcolaSommaIncidenti(timeSeriesDataDaily, new Date(selectedYear + '-11-28'), new Date(selectedYear + '-12-27')));

// Adesso incidentiPerIntervallo conterrà le somme degli incidenti per ciascun intervallo di date
    console.log(incidentiPerIntervallo);

  });

  d3.csv(csvFileName, function (data) {
    timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });

    convertData(timeSeriesData);
    setAxesScale(timeSeriesData);
    drawAxes(timeSeriesData);

    drawGrid();
    drawLineWithValue(timeSeriesData, "#cab2d6", "main");
    addPoints("noNature");
    drawPoints(timeSeriesData, "#ded6bf");
    if (switchInput.value === "OFF" || switchInput.value === undefined) drawXHoverLine();
    if(selectedYear!== "2022") drawUnit(20); else drawUnit(0);
    drawLegend("General\naccidents","#ded6bf", 15.5);

    if (switchInput.value === "ON") {
      timeSeriesSvg.selectAll("*").remove();
      drawGrid();
      if (selectedYear !== "2022") drawUnit(20); else drawUnit(0);
      keysLegends = []
      drawLegend("General\naccidents", "#ded6bf", 15.5);
      currentCsvFileName = "dataset/processed/timeSeries/timeSeriesData" + selectedYear + "Daily.csv";
      drawZoom(timeSeriesDataDaily);
      /*addPoints("noNature");
      drawPoints(timeSeriesDataDaily, "#ded6bf");*/
    } else if (switchBrushInput.value === "ON") {
      timeSeriesSvg.selectAll("*").remove();
      if (selectedYear !== "2022") drawUnit(20); else drawUnit(0);
      keysLegends = []
      drawLegend("General\naccidents", "#ded6bf", 15.5);
      currentCsvFileName = "dataset/processed/timeSeries/timeSeriesData" + selectedYear + "Daily.csv";
      setAxesScale(timeSeriesData);
      drawAxes(timeSeriesData);
      drawGrid();
      drawLineWithValue(timeSeriesData, "#cab2d6", "main");
      addPoints("noNature");
      drawPoints(timeSeriesData, "#ded6bf");

      // Crea un elemento di brush per la selezione
    var brush = d3.brushX()
      .extent([[0, 0], [500, 200]])
      .on("start", function() {
        // Rimuovi i testi delle date precedenti quando inizi un nuovo brush
        d3.selectAll(".brush .start-date, .brush .end-date").remove();
        d3.selectAll(".selection-bar").remove();

        loaderC.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
        choroplethMapSvg.style("opacity", 0.3);
        loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
        barChartSvg.style("opacity", 0.3);

      })
      .on("end", function(d) {
        return brushedTimeSeries(d);
      });


      // Aggiungi il brush all'elemento g del tuo grafico
      brushGroup = timeSeriesSvg.append("g")
        .attr("transform", "translate(50, 50)")  // Assicurati di traslare il rettangolo in base alla tua disposizione grafica
        .attr("class", "brush")
        .call(brush);

        // Applica uno stroke nero solo agli handle destro e sinistro (verticale) del brush
        /*brushGroup.selectAll(".handle--e, .handle--w")
          //.style("stroke", "#b8ab97")
          //.style("fill", "#b8ab97")
          .attr("rx", "4")
          .attr("ry", "4");*/

        // Seleziona l'area selezionata dal brush
        brushGroup.select(".selection")
          .style("stroke", "#d4ccbe")
          //.style("stroke-width", "5px")
          .style("fill", "#c4bbad"); // Imposta il colore dell'area selezionata



       // Aggiungi i testi delle date all'elemento g del brush
       /*timeSeriesSvg.append("g")
         .attr("transform", "translate(50, 50)")  // Assicurati di traslare il rettangolo in base alla tua disposizione grafica
         .attr("class", "brush")
         .call(brush)
         .append("text")
         .attr("class", "start-date")
         .style("fill", "#524a32")
         .style("font-family", "Lora")
         .style("font-size", 10 + "px")
         .style("font-weight", "bold")
         //.attr("x", 60)
         .attr("y", -5)
         .style("text-anchor", "end")
         .text("");

       timeSeriesSvg.select(".brush")
         .append("text")
         .attr("class", "end-date")
         .style("fill", "#524a32")
         .style("font-family", "Lora")
         .style("font-size", 10 + "px")
         .style("font-weight", "bold")
         //.attr("x", 440)
         .attr("y", -5)
         .style("text-anchor", "start")
         .text("");*/

    } else {
      drawInfoBox("main");
      infoBoxArray.push(infoBox);
    }

  });
}

function brushedTimeSeries(d) {
  console.log("CIAO")
  if (!d3.event.selection) {
    setTimeout(function () {
      loaderC.style.display = "none";
      choroplethMapSvg.style("opacity", 1);
      loader.style.display = "none";
      barChartSvg.style("opacity", 1);
    }, 800);
    return;} // Se la selezione è nulla, esci dalla funzione

  // Ottieni la data iniziale e finale selezionate
  [x0, x1] = d3.event.selection.map(xScaleTimeSeries.invert);

  // Formatta le date nel formato desiderato (ad esempio, "YYYY-MM-DD")
  formattedStartDate = d3.timeFormat("%Y-%m-%d")(x0);
  formattedEndDate = d3.timeFormat("%Y-%m-%d")(x1);

   // Formatta le date nel formato desiderato per essere visualizzate sul brush
   newStartDate = d3.timeFormat("%d %b")(x0);
   newEndDate = d3.timeFormat("%d %b")(x1);


  // Aggiungi i nuovi testi delle date
  d3.select(".brush")
    .append("text")
    .attr("class", "start-date")
    .style("fill", "#524a32")
    .style("text-anchor", "start")
    .style("font-family", "Lora")
    .style("font-size", 10 + "px")
    .style("font-weight", "bold")
    .attr("y", -5)
    .attr("x", xScaleTimeSeries(x0) - 10) // Posiziona il testo a sinistra del punto di inizio della selezione
    .text(newStartDate);

  d3.select(".brush")
    .append("text")
    .attr("class", "end-date")
    .style("fill", "#524a32")
    .style("text-anchor", "end")
    .style("font-family", "Lora")
    .style("font-size", 10 + "px")
    .style("font-weight", "bold")
    .attr("y", -5)
    .attr("x", xScaleTimeSeries(x1) + 10) // Posiziona il testo a destra del punto di fine della selezione
    .text(newEndDate);

          // Aggiungi le barre verticali con estremità arrotondate
        d3.select(".brush")
             .append("path")
             .attr("class", "selection-bar")
             .style("stroke", "#b8ab97")
             .style("stroke-width", 3)
             .attr("d", d3.line()([[xScaleTimeSeries(x0), 0], [xScaleTimeSeries(x0), heightTimeSeries]]))
             .attr("fill", "none")
             .attr("stroke-linecap", "round");

        d3.select(".brush")
             .append("path")
             .attr("class", "selection-bar")
             .style("stroke", "#b8ab97")
             .style("stroke-width", 3)
             .attr("d", d3.line()([[xScaleTimeSeries(x1), 0], [xScaleTimeSeries(x1), heightTimeSeries]]))
             .attr("fill", "none")
             .attr("stroke-linecap", "round");

  // Stampa le date iniziale e finale
  console.log("Data Iniziale:", formattedStartDate);
  console.log("Data Finale:", formattedEndDate);

    // Calcola la distanza tra i punti di inizio e fine della selezione
    var selectionDistance = xScaleTimeSeries(x1) - xScaleTimeSeries(x0);
    console.log("QUANTO MISURA: "+selectionDistance)

    // Imposta un margine destro per il testo della data di inizio se la selezione è troppo piccola
    var marginForStartDate;
    if (selectionDistance < 17) marginForStartDate=70;
    else if (selectionDistance>=17 && selectionDistance<20) marginForStartDate=50;
    else if (selectionDistance>=20 && selectionDistance<38) marginForStartDate=50;
    else if (selectionDistance>=38 && selectionDistance<50) marginForStartDate=60;
    else if (selectionDistance>=50 && selectionDistance<85) marginForStartDate=80;
   // else if (selectionDistance>=73 && selectionDistance<85) marginForStartDate=110;
    else marginForStartDate=0;
    console.log("MARGINE: "+marginForStartDate)

    // Aggiorna il testo della data di inizio
    d3.select(".brush .start-date")
      .text(newStartDate)
      .attr("x", xScaleTimeSeries(x0) - (marginForStartDate/2)); // Posiziona il testo a sinistra del punto di inizio della selezione

    // Aggiorna il testo della data di fine
    d3.select(".brush .end-date")
      .text(newEndDate)
      .attr("x", xScaleTimeSeries(x1) + (marginForStartDate/2)); // Posiziona il testo a destra del punto di fine della selezione

  updateAllGraphs(formattedStartDate, formattedEndDate);

  let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
  let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
  buttonWeatherValueNew.style.backgroundColor = "white";
  labelWeatherValue.style.color = "#f7f3eb";
  buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
  buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
  buttonWeatherValueNew.style.transform = "scale(1)";
  buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;

  setTimeout(function () {
    loaderC.style.display = "none";
    choroplethMapSvg.style("opacity", 1);
    loader.style.display = "none";
    barChartSvg.style("opacity", 1);
  }, 800);

}


function updateAllGraphs(formattedStartDate, formattedEndDate ) {
  barChartSvg.selectAll("*").remove();
  drawVerticalBarChartFromTimeSeries(formattedStartDate, formattedEndDate);
  drawColorsLegend();
  keysLegends = [];

  choroplethMapSvg.selectAll("*").remove();
  drawChoroplethMapFromTimeSeries(formattedStartDate, formattedEndDate);
}
// Funzione per mostrare il numero di incidenti
function showIncidentCount(d) {
  let incidentCount = d.NumeroIncidenti;
  let xPosition = currentTransform.applyX(xScaleTimeSeries(d.DataOraIncidente)) - 6;
  let yPosition = currentTransform.applyY(yScaleTimeSeries(incidentCount)) - 10;
  let marginNumberCircleX;

  tooltipTime = d3.select("#popupTimeSeries");

  tooltipTime.html(incidentCount)
        .style("opacity", 0.8)
        .style("text-align", "center")
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", 10 + "px")
        .style("font-weight", "bold")
        .style("left", (d3.event.pageX - 10 + "px"))
        .style("top", (d3.event.pageY - 30 + "px"));

  if (incidentCount < 10) marginNumberCircleX = 2.5;
  else if (incidentCount >= 10 && incidentCount < 100) marginNumberCircleX = 5.5;
  else marginNumberCircleX = 8.5;


/*pointsGroup.append("circle")
    .attr("id", "num")
    .attr("class", "show")
    .attr("cx", xPosition + marginNumberCircleX)
    .attr("cy", yPosition - 7.5)
    .attr("r", 11)
    .style("stroke", "#d4d0c5") // Colore del bordo
    .style("stroke-width", "1px") // Spessore del bordo
    .style("fill", "white")
    .style("opacity", "0.4")
    .style("filter", "drop-shadow(0 1px 1px darkslategray)"); // Ombra

pointsGroup.append("text")
    .attr("class", "incident-count")
    .style("font-family", "Lora")
    .attr("x", xPosition + marginNumberCircleX)
    .attr("y", yPosition - 7.5)
    .attr("text-anchor", "middle")
    .attr("dy", "0.40em") // Aggiungi questa linea per centrare verticalmente
    .text(incidentCount)
    .style("font-size", fontSize)
    .style("fill", "#524a32")
    .style("opacity", "0.8")
    .style("font-weight", "bold");*/
}

// Funzione per nascondere il numero di incidenti
function hideIncidentCount() {
  //pointsGroup.selectAll(".incident-count").remove();
  d3.selectAll("#num").remove();
  tooltipTime.style("opacity", 0);
}
/*
function drawLegend(nature, color){

  keysLegends.push(nature);
  let size = 13;

  timeSeriesSvg.selectAll("mydots")
    .data(keysLegends)
    .enter()
    .append("rect")
    .attr("x", 580)
    .attr("y", function(d,i){ return 60 + i*(size+5)}) // 30 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", color)
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);


  timeSeriesSvg.selectAll("mylabels")
    .data(keysLegends)
    .enter()
    .append("text")
    .attr("x", 580 + size*1.2)
    .attr("y", function(d,i){ return 60 + i*(size+5) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .style("fill", "#524a32")
    .style("font-family", "Lora")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  let groups = ["[C1] Pedestrian hit",
    "[C2] Vehicles collision (moving)",
    "[C3] Vehicles collision with a stationary vehicle",
    "[C4] Rear-end collision",
    "[C5] Collision with obstacle",
    "[C6] Sudden braking and vehicle fall",
    "[C7] Overturning and run-off-road",
    "[C8] Side/head-on collision",
  ];

  timeSeriesSvg.selectAll("mylabels")
    .data(groups)
    .enter()
    .append("text")
    .attr("x", 480 + size*1.2)
    .attr("y", function(d,i){ return 180 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .html(function(d) {
      let parts = d.split(" "); // Dividi la stringa in parti
      return "<tspan font-weight='bold' >" + parts[0] + ' '+"</tspan>" + "<tspan id='" + parts[0].slice(1, -1)+"'>"+parts.slice(1).join(" ")+"</tspan>";
    })
    .attr("text-anchor", "left")
    .style("font-family", "Lora")
    .style("fill", "#524a32")
    .style("alignment-baseline", "middle")
}

 */
let legend, textElementTwo;

function drawUnit(val) {
  legend = timeSeriesSvg.append("g");
  // Aggiungi il trattino sopra a tutto
  legend.append("line")
    .attr("x1", 568)
    .attr("y1", 70)  // Regola la posizione verticale del trattino
    .attr("x2", 628 - val)
    .attr("y2", 70)
    .style("stroke", "#524a32")
    .style("stroke-width", 1);

  // Aggiungi le stanghette laterali
  legend.append("line")
    .attr("x1", 568)
    .attr("y1", 67)  // Regola la posizione verticale della stanghetta
    .attr("x2", 568)
    .attr("y2", 73)
    .style("stroke", "#524a32")
    .style("stroke-width", 1);

  legend.append("line")
    .attr("x1", 628 - val)
    .attr("y1", 67)  // Regola la posizione verticale della stanghetta
    .attr("x2", 628 - val)
    .attr("y2", 73)
    .style("stroke", "#524a32")
    .style("stroke-width", 1);

  // Aggiungi la scritta sotto il trattino
  legend.append("text")
    .text("31 days")
    .attr("x", 599 - (val/2))
    .attr("y", 83)  // Regola la posizione verticale della scritta
    .style("fill", "#524a32")
    .style("font-family", "Lora")
    .style("text-anchor", "middle");
}

function drawLegend(text, color, value) {

  keysLegends.push(text)
  let size = 13;

  if(vBarChart) { // Aggiungi un'area di testo per la legenda
    textElementTwo = legend.append("text")
      .attr("class", "txt")
      .attr("x", 587 + size * 1.2)
      .attr("y", function (d, i) {
        return 143 + i * (size + 5) + (size / 2)
      }) // 30 is where the first dot appears. 25 is the distance between dots
      .style("fill", "#524a32")
      .style("font-family", "Lora")
      .style("text-anchor", "left"); // Imposta l'allineamento sul centro

    // Suddividi il testo in righe usando il tag <tspan>
    const linesTwo = text.split('\n');
    for (let i = 0; i < linesTwo.length; i++) {
      textElementTwo.append("tspan")
        .text(linesTwo[i])
        .attr("class", "txt")
        .attr("x", 570 + size * 1.2)
        .attr("dy", i === 0 ? 0 : "1.1em");
    }
    vBarChart = false;
  }else {
    // Aggiungi un'area di testo per la legenda
    const textElement = legend.append("text")
      .attr("x", 587 + size * 1.2)
      .attr("y", function(d,i){
        return 108 + i*(size+5) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
      .style("fill", "#524a32")
      .style("font-family", "Lora")
      .attr("text-anchor", "left");

    // Suddividi il testo in righe usando il tag <tspan>
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      textElement.append("tspan")
        .text(lines[i])
        .attr("x", 570 + size * 1.2)
        .attr("text-anchor", "left")
    .attr("dy", i === 0 ? 0 : "1.1em");
    }
  }

  // Aggiungi nuovi rettangoli in base all'array keysLegends
  timeSeriesSvg.selectAll(".mydotss")  // Aggiungi il punto (.) prima di "mydotss"
    .data(keysLegends)
    .enter()
    .append("rect")
    .attr("class", "mydotss")
    .attr("x", 568)
    .attr("y", function(d, i) { return 111 + i * (size + value); })
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d, i) {
      return i === 0 ? "#cab2d6" : color;
    })
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);

}
var onLabel, offLabel, brushOnLabel, brushOffLabel, sliderSwitch, sliderBrushSwitch, sliderBrushSwitch, weatherOffLabel, weatherOnLabel;
var flagWeatherCondition = false;
document.addEventListener('DOMContentLoaded', function() {

  // Primo switch
  switchInput = document.getElementById('switch');
  switchInput.value = this.checked ? "ON" : "OFF";
  console.log("ZOOM VALUE: " + switchInput.value);
  sliderSwitch = document.querySelector('.slider-switch');
  onLabel = document.getElementById("on");
  offLabel = document.getElementById("off");

  // Secondo switch
  switchBrushInput = document.getElementById('switchBrush');
  switchBrushInput.value = this.checked ? "ON" : "OFF";
  console.log("BRUSH VALUE: " + switchBrushInput.value);
  sliderBrushSwitch = document.querySelector('.slider-switch-brush');
  brushOnLabel = document.getElementById("brushon");
  brushOffLabel = document.getElementById("brushoff");
  var previousBrushValue = false;

    // Terzo switch
    switchWeatherInput = document.getElementById('switchWeather');
    switchWeatherInput.value = this.checked ? "OFF" : "ON";
    console.log("WEATHER VALUE: " + switchWeatherInput.value);
    sliderWeatherSwitch = document.querySelector('.slider-switch-weather');
    weatherOnLabel = document.getElementById("weatheron");
    weatherOffLabel = document.getElementById("weatheroff");
    var previousWeatherValue = false;

  switchInput.addEventListener('change', function() {
    let loaderS = document.getElementById("loaderS");
    loaderS.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    timeSeriesSvg.style("opacity", 0.3);
    // Imposta il valore dell'input in base allo stato dello switch
    switchInput.value = this.checked ? "ON" : "OFF";
    // Assicurati che solo uno dei due switch sia attivo
    if (this.checked) {
      switchBrushInput.checked = false;
      switchBrushInput.value = "OFF"; // Aggiorna manualmente il valore dell'input
      /*if (buttonWeatherValue !== "First") {
       // let csvFileNameVerticalBarChart = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
       // barChartSvg.selectAll("*").remove();
       // drawVerticalBarChart(csvFileNameVerticalBarChart);
        let button = document.getElementById(buttonWeatherValue);
        let buttonLabel = document.getElementById("Label" + buttonWeatherValue);
        buttonLabel.style.color = "#524a32";
        button.style.backgroundColor = "#e6e1d5";
        button.style.transform = "scale(1.2)";
        button.style.backgroundImage = `url(${imageClick + buttonWeatherValue + ".png"})`;
        button.style.border = "1px solid #524a32";
      } else {
     //   barChartSvg.selectAll("*").remove();
     //   drawVerticalBarChart(csvFileNameVerticalBarChart);
      }*/

      /*document.getElementById("Cloudy").disabled = true;
      document.getElementById("Sunny").disabled = true;
      document.getElementById("Rainy").disabled = true;
      document.getElementById("Severe").disabled = true;*/

    } else if (switchBrushInput.value === "OFF"){
      // Se lo switch non è attivo, abilita i pulsanti e rimuovi la classe CSS "disabled"
      document.getElementById("Cloudy").disabled = false;
      document.getElementById("Sunny").disabled = false;
      document.getElementById("Rainy").disabled = false;
      document.getElementById("Severe").disabled = false;
    }
    // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
   /* document.getElementById("Cloudy").classList.toggle("disabled", this.checked);
    document.getElementById("Sunny").classList.toggle("disabled", this.checked);
    document.getElementById("Rainy").classList.toggle("disabled", this.checked);
    document.getElementById("Severe").classList.toggle("disabled", this.checked);*/
    updateSwitches();
    setTimeout(function () {
      loaderS.style.display = "none";
      timeSeriesSvg.style("opacity", 1);
    }, 1000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
  });

  switchBrushInput.addEventListener('change', function() {
    let loaderS = document.getElementById("loaderS");
    loaderS.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    timeSeriesSvg.style("opacity", 0.3);
    let loader = document.getElementById("loader");
    loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    barChartSvg.style("opacity", 0.3);
    // Imposta il valore dell'input in base allo stato dello switch
    switchBrushInput.value = this.checked ? "ON" : "OFF";
    // Assicurati che solo uno dei due switch sia attivo
    if (this.checked) {
      switchInput.checked = false;
      switchInput.value = "OFF"; // Aggiorna manualmente il valore dell'input
      switchWeatherInput.checked = true;
      switchWeatherInput.value = "OFF";
      document.getElementById("Cloudy").disabled = true;
      document.getElementById("Sunny").disabled = true;
      document.getElementById("Rainy").disabled = true;
      document.getElementById("Severe").disabled = true;

    } else if (switchBrushInput.value === "OFF"){
      document.getElementById("Cloudy").disabled = false;
      document.getElementById("Sunny").disabled = false;
      document.getElementById("Rainy").disabled = false;
      document.getElementById("Severe").disabled = false;
      switchWeatherInput.checked = false;
      switchWeatherInput.value = "ON";
      if (buttonWeatherValue !== "First") {
        let csvFileNameVerticalBarChart = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
        barChartSvg.selectAll("*").remove();
        drawVerticalBarChart(csvFileNameVerticalBarChart);
      } else {
        barChartSvg.selectAll("*").remove();
        drawVerticalBarChart(csvFileNameVerticalBarChart);
      }

      choroplethMapSvg.selectAll("*").remove();
      drawChoroplethMap(csvFileNameChoroplethMap);

      let button = document.getElementById(buttonWeatherValue);
      let buttonLabel = document.getElementById("Label" + buttonWeatherValue);
      buttonLabel.style.color = "#524a32";
      button.style.backgroundColor = "#e6e1d5";
      button.style.transform = "scale(1.2)";
      button.style.backgroundImage = `url(${imageClick + buttonWeatherValue + ".png"})`;
      button.style.border = "1px solid #524a32";

    } else if (switchInput.value === "OFF"){
      document.getElementById("Cloudy").disabled = false;
      document.getElementById("Sunny").disabled = false;
      document.getElementById("Rainy").disabled = false;
      document.getElementById("Severe").disabled = false;
    }
    // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
    document.getElementById("Cloudy").classList.toggle("disabled", this.checked);
    document.getElementById("Sunny").classList.toggle("disabled", this.checked);
    document.getElementById("Rainy").classList.toggle("disabled", this.checked);
    document.getElementById("Severe").classList.toggle("disabled", this.checked);
    updateSwitches();
    setTimeout(function () {
      loaderS.style.display = "none";
      timeSeriesSvg.style("opacity", 1);
      loader.style.display = "none";
      barChartSvg.style("opacity", 1);
    }, 1000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
  });


    switchWeatherInput.addEventListener('change', function() {
      flagWeatherCondition = true;
      // Imposta il valore dell'input in base allo stato dello switch
      switchWeatherInput.value = this.checked ? "OFF" : "ON";
      // Aggiungi il loader al DOM
      let loader = document.getElementById("loader");
      loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
      barChartSvg.style("opacity", 0.3);
      // Assicurati che solo uno dei due switch sia attivo
      if (!this.checked) {
        if (switchBrushInput.value === "ON") {
           timeSeriesSvg.selectAll("*").remove();
           drawTimeSeriesChart(csvFileNameTimeSeries);
        }
        switchBrushInput.checked = false;
        switchBrushInput.value = "OFF"; // Aggiorna manualmente il valore dell'input
        document.getElementById("Cloudy").disabled = false;
        document.getElementById("Sunny").disabled = false;
        document.getElementById("Rainy").disabled = false;
        document.getElementById("Severe").disabled = false;
        if (buttonWeatherValue !== "First") {
          let csvFileNameVerticalBarChartWeather = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
          barChartSvg.selectAll("*").remove();
          drawVerticalBarChart(csvFileNameVerticalBarChartWeather);
        } else {
          barChartSvg.selectAll("*").remove();
          drawVerticalBarChart(csvFileNameVerticalBarChart);
        }
        let buttonWeather = document.getElementById(buttonWeatherValue);
        let buttonWeatherLabel = document.getElementById("Label" + buttonWeatherValue);
        buttonWeatherLabel.style.color = "#524a32";
        buttonWeather.style.backgroundColor = "#e6e1d5";
        buttonWeather.style.transform = "scale(1.2)";
        buttonWeather.style.backgroundImage = `url(${imageClick + buttonWeatherValue + ".png"})`;
        buttonWeather.style.border = "1px solid #524a32";

      } else if (switchWeatherInput.value === "OFF"){
          barChartSvg.selectAll("*").remove();
          drawVerticalBarChart(csvFileNameVerticalBarChart);
          //drawVerticalBarChart(csvFileNameVerticalBarChart);
          document.getElementById("Cloudy").disabled = true;
          document.getElementById("Sunny").disabled = true;
          document.getElementById("Rainy").disabled = true;
          document.getElementById("Severe").disabled = true;

        //choroplethMapSvg.selectAll("*").remove();
        //drawChoroplethMap(csvFileNameChoroplethMap);


      let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
      let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
      buttonWeatherValueNew.style.backgroundColor = "white";
      labelWeatherValue.style.color = "#f7f3eb";
      buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
      buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
      buttonWeatherValueNew.style.transform = "scale(1)";
      buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;
      }
    // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
    document.getElementById("Cloudy").classList.toggle("disabled", this.checked);
    document.getElementById("Sunny").classList.toggle("disabled", this.checked);
    document.getElementById("Rainy").classList.toggle("disabled", this.checked);
    document.getElementById("Severe").classList.toggle("disabled", this.checked);
    updateSwitches();
      setTimeout(function () {
        loader.style.display = "none";
        barChartSvg.style("opacity", 1);
      }, 1000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
    });

  function updateSwitches() {

    console.log("ZOOM VALUE: " + switchInput.value);
    console.log("BRUSH VALUE: " + switchBrushInput.value);

    // Aggiorna l'aspetto degli switch
    updateSwitchAppearance(switchInput, sliderSwitch, onLabel, offLabel, switchInput.checked);
    updateSwitchAppearance(switchBrushInput, sliderBrushSwitch, brushOnLabel, brushOffLabel, switchBrushInput.checked);
    updateWeatherAppearance(switchWeatherInput, sliderWeatherSwitch, weatherOnLabel, weatherOffLabel, switchWeatherInput.checked);


    if (!flagWeatherCondition) {
        // Altro codice per aggiornare l'interfaccia utente in base allo stato degli switch
        keysLegends = [];
        infoBoxNatureArray = [];
        focusNatureArray = [];
        timeSeriesSvg.selectAll("*").remove();
        drawTimeSeriesChart(csvFileNameTimeSeries);
        currentCsvFileName = csvFileNameTimeSeries;
        console.log("PROVSSSS: " + currentCsvFileName);
   }
   flagWeatherCondition = false;
  }

  function updateSwitchAppearance(input, slider, onLabel, offLabel, checked) {
    if (checked) {
      slider.style.backgroundColor = "#c2e0bc";
      onLabel.style.display = "block";
      offLabel.style.display = "none";
    } else {
      slider.style.backgroundColor = "#facdcd";
      onLabel.style.display = "none";
      offLabel.style.display = "block";
    }
    slider.classList.toggle('checked', checked);
  }

    function updateWeatherAppearance(input, slider, onLabel, offLabel, checked) {
      if (checked) {
        slider.style.backgroundColor = "#facdcd";
        onLabel.style.display = "none";
        offLabel.style.display = "block";
      } else {
         slider.style.backgroundColor = "#c2e0bc";
         onLabel.style.display = "block";
         offLabel.style.display = "none";
      }
      slider.classList.toggle('checked', checked);
    }

});


function drawZoom(data) {

  // Aggiungi un'area di sfondo rettangolare per catturare gli eventi di zoom
  timeSeriesSvg.append("rect")
    .attr("width", 500)
    .attr("height", 200)
    .style("fill", "none")  //red
    .style("pointer-events", "all")
    .attr("transform", "translate(50, 50)")  // Assicurati di traslare il rettangolo in base alla tua disposizione grafica
    .call(d3.zoom()
      .scaleExtent([1, 24])  // Limita gli estremi del livello di zoom
      .on("zoom", zoomed));

  // Aggiungi un clip path solo per il rettangolo rosso
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "clip-path-red")
    .append("rect")
    .style("fill", "none")
    .attr("width", 500)
    .attr("height", 200);

  // Aggiungi un secondo clip path solo per l'asse x e il rettangolo rosso
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "clip-path-x")
    .append("rect")
    .style("fill", "none")
    .attr("width", 514)
    .attr("height", 200);

  // Inizializza un clip path per i punti
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "points-clip-path")
    .append("rect")
    .style("fill", "none")
    .attr("transform", `translate(-2.5, 0)`)
    .attr("width", 505)
    .attr("height", 200);

  // Inizializza un clip path per i punti
  timeSeriesSvg.append("defs").append("clipPath")
    .attr("id", "circle-clip-path")
    .append("rect")
    .style("fill", "none")
    .attr("transform", `translate(-2.5, 0)`)
    .attr("width", 505)
    .attr("height", 200);

  // Aggiungi gli assi come gruppi separati
  timeSeriesSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(50, ${heightTimeSeries + 50})`)
    .style("font-family", "Lora")
    .call(xAxisTimeSeries)
    .attr("clip-path", "url(#clip-path-x)")
    .append("text")
    .attr("y", 37)
    .attr("x", 247)
    .attr("fill", "black")
    .text("Time interval");

  // Aggiorna la linea del grafico per utilizzare il clip path solo per il rettangolo rosso
  timeSeriesSvg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("clip-path", "url(#clip-path-red)")  // Applica il clip path solo per il rettangolo rosso
    .attr("fill", "none")
    .attr("stroke", "#cab2d6")
    .attr("stroke-width", 1.3)
    .attr("d", line)
    .attr("transform", "translate(51, 50)");


  let isZooming = false;
  const xExtent = d3.extent(data, d => d.DataOraIncidente);
  const yExtent = d3.extent(data, d => d.NumeroIncidenti);  // Calcola l'estensione dei valori y nel tuo set di dati

    // Crea un singolo rettangolo senza l'uso di un array di dati
    timeSeriesSvg.append("rect")
      .attr("class", "mydotss")
      .attr("x", 552)
      .attr("y", 247)
      .attr("width", 15)
      .attr("height", 10)
      .style("fill", "#f7f3eb");

// Funzione chiamata durante l'evento di zoom
  function zoomed() {
    const transform = d3.event.transform;

    // Imposta i limiti di trasformazione per evitare che i valori escano dagli assi
        transform.x = Math.min(0, Math.max(widthTimeSeries - widthTimeSeries * transform.k, transform.x));
        transform.y = Math.min(0, Math.max(heightTimeSeries - heightTimeSeries * transform.k, transform.y));

        // Aggiorna l'asse x e y in base alla trasformazione
        timeSeriesSvg.select(".x-axis").call(xAxisZoom.scale(transform.rescaleX(xScaleTimeSeries)));
        timeSeriesSvg.select(".y-axis").call(yAxisTimeSeries.scale(transform.rescaleY(yScaleTimeSeries)));

    if (transform.k === 1) {
      transform.x = 0;
      transform.y = 0;
    }

    var numIntermediateTicks

    // Calcola la distanza tra i tick in base al livello di zoom
    const originalTickDistance = xScaleTimeSeries(tickValues[1]) - xScaleTimeSeries(tickValues[0]);
    const zoomFactor = transform.k;
    if(transform.k > 10 && transform.k < 10.6)
      numIntermediateTicks = Math.floor(zoomFactor-2);
    else if (transform.k > 12 && transform.k < 12.6)
      numIntermediateTicks = Math.floor(zoomFactor) + 2;
    else if (transform.k > 12.6)
      numIntermediateTicks = Math.floor(zoomFactor) + 5;
    else if (transform.k > 14 && transform.k < 16.6)
      numIntermediateTicks = Math.floor(zoomFactor) + 5 ;
    else
      numIntermediateTicks = Math.floor(zoomFactor);
    const newTickDistance = originalTickDistance / (numIntermediateTicks + 1);

    if (selectedYear === "2022") valueToReach = 8; else valueToReach = 12;

    const intermediateTicks = [];

    // Genera i tick giornalieri
    for (let n = 0; n <= valueToReach; n = n + 1) {
      for (let i = 1; i <= numIntermediateTicks; i++) {
        const intermediateTickValue = xScaleTimeSeries.invert(xScaleTimeSeries(tickValues[n]) + i * newTickDistance);
        intermediateTicks.push(intermediateTickValue);
      }
    }
    var allTicks = [...tickValues, ...intermediateTicks];
    console.log("ehiehiehi = " + allTicks)
    // Imposta i tick sull'asse x in base al livello di zoom
    console.log("ZOOM: "+transform.k)
    if (transform.k > 13 && transform.k < 17 || (transform.k > 20 &&  transform.k < 21)) {}
    else if (transform.k > 1.5) {
      timeSeriesSvg.select(".x-axis").call(xAxisZoom.tickValues(allTicks));
    } else {
      timeSeriesSvg.select(".x-axis").call(xAxisZoom.tickValues(tickValues));
    }
    if (previousZoomValue > transform.k && transform.k <= 4.5) {
      isDrawed = false;
      pointsGroup.selectAll(".point").remove();
    }
    else if (previousZoomValue < transform.k && transform.k >= 4.5 && isDrawed === false) {
        isDrawed = true;
        addPoints("noNature");
        drawPoints(timeSeriesDataDaily, "#ded6bf");
    }
    previousZoomValue = transform.k;
   /* if (transform.k === 24 && zoomState === "normal") {
      zoomState = "maxZoom";
      currentCsvFileName = "dataset/processed/timeSeries/timeSeriesData" + selectedYear + "Daily.csv";
      // Aggiorna il tuo grafico con i nuovi dati da currentCsvFileName
      d3.csv(currentCsvFileName, function (data) {
        timeSeriesDataDaily = data.filter(function (row) {
          return row['DataOraIncidente', 'NumeroIncidenti'];
        });
        convertData(timeSeriesDataDaily);
        drawLineWithValue(timeSeriesDataDaily, "red", "main");
        addPoints("noNature");
        drawPoints(timeSeriesDataDaily, "#ded6bf");
      });
    }
    if (transform.k !== 24 && zoomState === "maxZoom") {
        zoomState = "normal";
        currentCsvFileName = csvFileNameTimeSeries;
    }*/
    //console.log(currentCsvFileName)
/*
    let valueToReach;
    let valueToReachOne;
    if(selectedYear === "2022") valueToReachOne = 5.7; else valueToReachOne = 8.4;


    for (let i = valueToReachOne; i <= numIntermediateTicks; i= i+valueToReachOne) {
      if(selectedYear === "2022") valueToReach = 8; else valueToReach = 12;
      for(let n = 0; n <= valueToReach; n=n+1) {
        if(i!==0) {
          intermediateTickValue = xScaleTimeSeries.invert(xScaleTimeSeries(tickValues[n]) + i * newTickDistance);
          console.log(intermediateTickValue)
          intermediateTicks.push(intermediateTickValue);
        }
      }
 */
  // Imposta la griglia per ogni tick value quando lo zoom è massimo
  if (transform.k>=0 && transform.k<= 24) {
    // Rimuovi la vecchia griglia
    vGridLines.remove();
    hGridLines.remove();

    // Ottieni tutti i tick values correnti e disegna la griglia
    const allYTicks = yAxisTimeSeries.scale().ticks().filter(tick => Number.isInteger(tick));
    drawGridDaily(allTicks, allYTicks)
    const yAxisFormat = d3.format(".0f");
    yAxisTimeSeries.tickValues(allYTicks)
       .tickFormat(d => Number.isInteger(d) ? yAxisFormat(d) : null);
  }
  else {
   // Rimuovi la vecchia griglia
    vGridLines.remove();
    hGridLines.remove();
    yAxisTimeSeries.tickValues(null).tickFormat(null);
    drawGrid()
  }

timeSeriesSvg.selectAll(".y-axis text")
      .style("display", function(d) {
        const yValue = transform.applyY(yScaleTimeSeries(d));
        return (yValue >= 0 && yValue <= heightTimeSeries) ? "block" : "none";
      });

    // Rimuovi i valori degli assi che sono al di fuori dei limiti dell'asse X
    timeSeriesSvg.selectAll(".x-axis text")
      .style("display", function(d) {
        const xValue = transform.applyX(xScaleTimeSeries(d));
        return (xValue >= 0 && xValue <= widthTimeSeries) ? "block" : "none";
      });


    const xMinNew = Math.min(0, widthTimeSeries - widthTimeSeries * transform.k);
    const xMaxNew = Math.max(widthTimeSeries - widthTimeSeries * transform.k, 0);

    const firstVisibleX = xScaleTimeSeries.domain()[0];
    const firstVisibleXPosition = transform.applyX(xScaleTimeSeries(firstVisibleX));
    const isLeftOverflow = firstVisibleXPosition < xMinNew;

    if (isLeftOverflow) {
      transform.x = Math.min(0, xMinNew + 10);
    } else {
      transform.x = Math.min(xMaxNew, Math.max(xMinNew, transform.x));
    }

    transform.y = Math.min(0, Math.max(heightTimeSeries - heightTimeSeries * transform.k, transform.y));

    timeSeriesSvg.select(".x-axis").call(xAxisZoom.scale(transform.rescaleX(xScaleTimeSeries)));
    timeSeriesSvg.select(".y-axis").call(yAxisTimeSeries.scale(transform.rescaleY(yScaleTimeSeries)));

    // Aggiorna il grafico e gli elementi correlati
    timeSeriesSvg.selectAll(".line")
      .attr("d", line.x(d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
        .y(d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti))));

    timeSeriesSvg.selectAll(".fixed-x-axis")
      .style("display", "none");

    d3.select("#grid-clip-path rect")
      .attr("width", widthTimeSeries)
      .attr("height", heightTimeSeries);

    vGridLines.attr("x1", d => transform.applyX(xScaleTimeSeries(d))).attr("x2", d => transform.applyX(xScaleTimeSeries(d)));
    hGridLines.attr("y1", d => transform.applyY(yScaleTimeSeries(d))).attr("y2", d => transform.applyY(yScaleTimeSeries(d)));

    pointsGroup.selectAll(".point").selectAll(".inner-point")
       .attr("cx", d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
       .attr("cy", d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti)));

    pointsGroup.selectAll(".point").selectAll(".outer-point")
       .attr("cx", d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
       .attr("cy", d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti)));

    /*if (zoomState=="normal") {
        pointsGroup.selectAll(".point").selectAll(".inner-point")
          .attr("cx", d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
          .attr("cy", d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti)));
    }
    else if (zoomState=="maxZoom") {
        pointsGroup.selectAll(".point").selectAll(".inner-point")
          .attr("cx", d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
          .attr("cy", d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti)));
    }*/

    pointsGroup.selectAll(".incident-count")
      .attr("x", d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)) - 6)
      .attr("y", d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti)) - 10);
  }

// Alla fine della tua funzione zoomed, puoi aggiungere il seguente codice per reimpostare il flag dopo lo zoom
  timeSeriesSvg.on("end", function () {
    isZooming = false;
  });

  const xAxisZoom = d3.axisBottom(xScaleTimeSeries)
    .tickValues(tickValues)
    .tickFormat(date => d3.timeFormat("%d %b")(date));


  const yAxisTimeSeriesZoom = d3.axisLeft(yScaleTimeSeries);

  timeSeriesSvg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(50, 50)`)
    .style("font-family", "Lora")
    .call(yAxisTimeSeries.tickFormat(function(d){return d;}))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -58)
    .attr("fill", "black")
    .text("Accidents' number");
}