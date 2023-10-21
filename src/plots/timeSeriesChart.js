const timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("width", 800)
  .attr("height", 232)
  //.attr("x", 200)
 // .attr("y", -200);

function drawTimeSeriesChart(csvFileName){

  d3.csv(csvFileName, function (data) {
    let timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });
    console.log(timeSeriesData)


/*
  const timeSeriesData = [
    { date: "2023-01-01", value: 1 },
    { date: "2023-02-01", value: 1 },
    { date: "2023-02-05", value: 1 },
    { date: "2023-02-06", value: 1 },
    { date: "2023-02-15", value: 1 },
    { date: "2023-05-01", value: 1 },
    { date: "2023-06-01", value: 1 },
    { date: "2023-08-01", value: 1 }];
 */

  // Definisci il parser per le date
  const parseTime = d3.timeParse("%Y-%m-%d");

// Converti le date da stringhe a oggetti Date
  timeSeriesData.forEach(d => {
    d.DataOraIncidente = parseTime(d.DataOraIncidente);
  });

  const widthTimeSeries = 500;
  const heightTimeSeries = 200;


  const xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(timeSeriesData, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);


  const line = d3.line()
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));


  const yScaleTimeSeries = d3.scaleLinear()
    .domain([0, d3.max(timeSeriesData, d => d.NumeroIncidenti)])
    .range([heightTimeSeries, 0]);

  console.log(timeSeriesData)

  timeSeriesSvg.append("path")
    .datum(timeSeriesData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line)
    .attr("transform", `translate(148, 5)`);

  // Trova la data minima e massima nei tuoi dati
  const minDate = d3.min(timeSeriesData, d => d.DataOraIncidente);
  const maxDate = d3.max(timeSeriesData, d => d.DataOraIncidente);

  const tickValues = [];
  let currentDate = d3.timeMonth.floor(minDate);
  while (currentDate <= maxDate) {
    tickValues.push(currentDate);
    for (let i = 1; i < 3; i++) {
      const nextDate = d3.timeDay.offset(currentDate, i * 10);
      if (nextDate <= maxDate) {
        tickValues.push(nextDate);
      }
    }
    currentDate = d3.timeMonth.offset(currentDate, 1);
  }

// Aggiungi i trattini per ogni 10 giorni senza etichette
  console.log(minDate)
  currentDate = d3.timeDay.offset(minDate, 10);
  while (currentDate < maxDate) {
    tickValues.push(currentDate);
    currentDate = d3.timeDay.offset(currentDate, 200);
  }

// Crea l'asse x con i tickValues
  const xAxisTimeSeries = d3.axisBottom(xScaleTimeSeries)
    .tickValues(tickValues)
    .tickFormat(date => {
      const day = d3.timeFormat("%d")(date);
      if (day === "01") {
        return d3.timeFormat("%b")(date);
      }
      return "";
    });


  const yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, ${heightTimeSeries + 5})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, 5)`)
    .call(yAxisTimeSeries);

  });
}