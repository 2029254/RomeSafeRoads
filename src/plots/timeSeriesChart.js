const timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("width", 800)
  .attr("height", 232);

function drawTimeSeriesChart(csvFileName){

  d3.csv(csvFileName, function (data) {
    let timeSeriesData = data.filter(function (row) {
      return row['DataOraIncidente', 'NumeroIncidenti'];
    });
    console.log(timeSeriesData)

  // Definisci il parser per le date
  let parseTime = d3.timeParse("%Y-%m-%d");

 // Converti le date da stringhe a oggetti Date
  timeSeriesData.forEach(d => {
    d.DataOraIncidente = parseTime(d.DataOraIncidente);
    d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
  });

  let widthTimeSeries = 500;
  let heightTimeSeries = 200;

  let xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(timeSeriesData, d => d.DataOraIncidente))
    .range([0, widthTimeSeries]);

    let yScaleTimeSeries = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => d.NumeroIncidenti)+9])
      .range([heightTimeSeries, 0]);

  let line = d3.line()
    .x(d => xScaleTimeSeries(d.DataOraIncidente))
    .y(d => yScaleTimeSeries(d.NumeroIncidenti));

  timeSeriesSvg.append("path")
    .datum(timeSeriesData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5)
    .attr("d", line)
    .attr("transform", `translate(149, 10)`);

  // Trova la data minima e massima nei tuoi dati
  const minDate = d3.min(timeSeriesData, d => d.DataOraIncidente);
  const maxDate = d3.max(timeSeriesData, d => d.DataOraIncidente);

 let tickValues = [];
 let currentDate = d3.timeMonth.floor(minDate);
  while (currentDate <= maxDate) {
    tickValues.push(currentDate);
    for (let i = 1; i < 3; i++) {
      const nextDate = d3.timeDay.offset(currentDate, i*10);
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
    currentDate = d3.timeDay.offset(currentDate, 200000);
  }

 // Crea l'asse x con i tickValues
  let xAxisTimeSeries = d3.axisBottom(xScaleTimeSeries)
    .tickValues(tickValues)
    .tickFormat(date => {
      let day = d3.timeFormat("%d")(date);
      if (day === "01") {
        return d3.timeFormat("%b")(date);
      }
      return "";
    });

  let yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries);
  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, ${heightTimeSeries + 10})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(148, 10)`)
    .call(yAxisTimeSeries);


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
      .attr("transform", `translate(148.5,  10)`)
      .style("stroke", "gray")
      .style("stroke-dasharray", "5, 5")
      .style("stroke-width", 0.3)
      .filter((d, i) => i > 0);


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
      .attr("transform", `translate(148, 10.5)`)
      .style("stroke", "gray")
      .style("stroke-dasharray", "5, 5")
      .style("stroke-width", 0.3)
      .filter((d, i) => i > 0);


      // Aggiungi un gruppo per i punti interattivi
      let pointsGroup = timeSeriesSvg.append("g")
        .attr("transform", `translate(149, 10)`);

      // Aggiungi cerchi per i punti di cambio di inclinazione
      pointsGroup.selectAll(".point")
        .data(timeSeriesData)
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

      // Funzione per mostrare il numero di incidenti
      function showIncidentCount(d) {
        let incidentCount = d.NumeroIncidenti;
        let xPosition = xScaleTimeSeries(d.DataOraIncidente);
        let yPosition = yScaleTimeSeries(incidentCount) - 15;

        pointsGroup.append("text")
          .attr("class", "incident-count")
          .attr("x", xPosition)
          .attr("y", yPosition)
          //.text("Incidenti: " + incidentCount)
          .text(incidentCount)
          .style("font-size", "12px")
          .style("fill", "black");
      }

      // Funzione per nascondere il numero di incidenti
      function hideIncidentCount() {
        pointsGroup.selectAll(".incident-count").remove();
      }
  });
}