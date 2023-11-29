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
  .attr("viewBox", "0 0 800 270")
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
let timeSeriesData;
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
    .attr('width', 49)
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
function drawLineWithValue(data, color, id) {
  let curve = d3.curveCardinal;

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
    .attr("stroke-width", 1.8)
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
      if (switchValue === "OFF" || switchValue === undefined)
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
      let accidentsText = `${formattedDate}`;

      infoBoxArray.forEach((infoBox, index) => {
        infoBox.select('text')
          .append('tspan')
          .style("color", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .style('font-weight', 'bold')
          .text(accidentsText)
          .attr('x', 0)
          .attr('dy', '-1.5px'); // Imposta l'offset verticale per la seconda riga

        infoBox.select('text')
          .append('tspan')
          .style("fill", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .style("text-align", "left")
          .attr('x', 0)
          .attr('dy', '15.2px') // Imposta l'offset verticale per la terza riga
          .text("n1 ");

        infoBox.select('text')
          .append('tspan')
          .style("fill", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .text(accidentsCountText);


        infoBox.select('text')
          .append('tspan')
          .html("<br>")
          .attr('x', 0)
          .attr('dy', '10.2px'); // Imposta l'offset verticale per la terza riga

        if(infoBoxNatureArray.length > 0) {


          infoBox.select('text')
            .append('tspan')
            .style("fill", color)
            .style("font-family", "Lora")
            .style("font-size", "10px")
            .style("text-align", "left")
            .attr('x', 0)
            .attr('dy', '11.2px') // Imposta l'offset verticale per la terza riga
            .text("n2 ");

          infoBox.select('text')
            .append('tspan')
            .style("fill", color)
            .style("font-family", "Lora")
            .style("font-size", "10px")
            .text(accidentsCountTextNature);
        }
      });

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
          .style("stroke", "#f00c0c")
          .style("stroke-width", "1")
          .style("fill", "none");

        // Aggiungi cerchio più piccolo per tutti i punti
        d3.select(this).append("circle")
          .attr("class", "inner-point")
          .attr("cx", xScaleTimeSeries(d.DataOraIncidente))
          .attr("cy", yScaleTimeSeries(d.NumeroIncidenti))
          .attr("r", 1.3)
          .style("fill", "#524a32");
        //  .on("mouseover", showIncidentCount)
        //  .on("mouseout", hideIncidentCount);
      }
    });
}
function drawTimeSeriesChart(csvFileName){

  d3.csv(csvFileName, function (data) {
    timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });

    convertData(timeSeriesData);
    setAxesScale(timeSeriesData);
    drawAxes(timeSeriesData);

    drawGrid();
    drawLineWithValue(timeSeriesData, "#ded6bf", "main");
    addPoints("noNature");
    drawPoints(timeSeriesData, "#ded6bf");
    if (switchValue === "OFF" || switchValue === undefined) drawXHoverLine();
    if(selectedYear!== "2022") drawUnit(20); else drawUnit(0);
    drawLegend("General\naccidents","#ded6bf", 15.5);

    if (switchValue === "OFF" || switchValue === undefined) {
      drawInfoBox("main");
      infoBoxArray.push(infoBox);
    } else {
      timeSeriesSvg.selectAll("*").remove();
      drawGrid();
      drawZoom(timeSeriesData);
    }

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
    .text("30 days")
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
      return i === 0 ? "#ded6bf" : color;
    })
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);

}
document.addEventListener('DOMContentLoaded', function() {
  const switchInput = document.getElementById('switch');
  const sliderSwitch = document.querySelector('.slider-switch');

  switchInput.addEventListener('change', function() {
    switchValue = $(this).is(":checked") ? "ON" : "OFF";
    console.log("Switch value:", switchValue);
    sliderSwitch.classList.toggle('checked');
    keysLegends = []
    infoBoxNatureArray = []
    focusNatureArray = []
    timeSeriesSvg.selectAll("*").remove();
    drawTimeSeriesChart(csvFileNameTimeSeries);

  });
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
      .scaleExtent([1, 10])  // Limita gli estremi del livello di zoom
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
    .attr("width", 500)
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
    .attr("stroke", "#ded6bf")
    .attr("stroke-width", 1.8)
    .attr("d", line)
    .attr("transform", "translate(51, 50)");

// ...

  let isZooming = false;
  const xExtent = d3.extent(data, d => d.DataOraIncidente);
  const yExtent = d3.extent(data, d => d.NumeroIncidenti);  // Calcola l'estensione dei valori y nel tuo set di dati


// Funzione chiamata durante l'evento di zoom
  function zoomed() {
    const { transform } = d3.event;

    if (transform.k === 1) {
      // Se lo zoom è 1, non stiamo effettuando uno zoom, quindi fissiamo l'asse x
      transform.x = 0;
      transform.y = 0;
    } else {
      // Se lo zoom non è 1, stiamo effettuando uno zoom
      isZooming = true;
    }

    // Limita il movimento dell'asse x ai limiti della data nel set di dati
    const xMin = Math.min(0, widthTimeSeries - widthTimeSeries * transform.k);
    const xMax = Math.max(widthTimeSeries - widthTimeSeries * transform.k, 0);

    // Verifica se il primo valore a sinistra è visibile nel rettangolo rosso
    const firstVisibleX = xScaleTimeSeries.domain()[0];
    const firstVisibleXPosition = transform.applyX(xScaleTimeSeries(firstVisibleX));
    const isLeftOverflow = firstVisibleXPosition < xMin;

    // Se il primo valore è fuori dal rettangolo rosso, applica uno spostamento minimo
    if (isLeftOverflow) {
      transform.x = Math.min(0, xMin + 10); // 10 è un valore arbitrario, puoi regolarlo a seconda delle tue esigenze
    } else {
      transform.x = Math.min(xMax, Math.max(xMin, transform.x));
    }

    // Limita il movimento dell'asse y ai limiti dei valori y nel set di dati
    transform.y = Math.min(0, Math.max(heightTimeSeries - heightTimeSeries * transform.k, transform.y));

    // Aggiorna l'asse x zoomato con la trasformazione di zoom
    timeSeriesSvg.select(".x-axis").call(xAxisZoom.scale(transform.rescaleX(xScaleTimeSeries)));

    // Aggiorna l'asse y con la trasformazione di zoom
    timeSeriesSvg.select(".y-axis").call(yAxisTimeSeries.scale(transform.rescaleY(yScaleTimeSeries)));

    // Aggiorna la linea del grafico con la trasformazione di zoom
    timeSeriesSvg.selectAll(".line")
      .attr("d", line.x(d => transform.applyX(xScaleTimeSeries(d.DataOraIncidente)))
        .y(d => transform.applyY(yScaleTimeSeries(d.NumeroIncidenti))));

    // Nascondi l'asse x fisso durante lo zoom
    timeSeriesSvg.selectAll(".fixed-x-axis")
      .style("display", "none");

    // Aggiorna il clip path della griglia durante lo zoom
    d3.select("#grid-clip-path rect")
      .attr("width", widthTimeSeries )
      .attr("height", heightTimeSeries);

    // Aggiorna la posizione e la dimensione delle linee della griglia durante lo zoom
    vGridLines.attr("x1", d => transform.applyX(xScaleTimeSeries(d))).attr("x2", d => transform.applyX(xScaleTimeSeries(d)));
    hGridLines.attr("y1", d => transform.applyY(yScaleTimeSeries(d))).attr("y2", d => transform.applyY(yScaleTimeSeries(d)));


  }


// Alla fine della tua funzione zoomed, puoi aggiungere il seguente codice per reimpostare il flag dopo lo zoom
  timeSeriesSvg.on("end", function () {
    isZooming = false;
  });

// ...

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


