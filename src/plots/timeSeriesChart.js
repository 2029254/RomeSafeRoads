const timeSeriesSvg = d3.select("#timeSeries")
  .append("svg")
  .attr("width", 800)
  .attr("height", 232)
  //.attr("x", 200)
 // .attr("y", -200);

function drawTimeSeriesChart(){

  const timeSeriesData = [
    { date: "2023-01-01", value: 10 },
    { date: "2023-02-01", value: 15 },
    { date: "2023-03-01", value: 12 }];

  // Definisci il parser per le date
  const parseTime = d3.timeParse("%Y-%m-%d");

// Converti le date da stringhe a oggetti Date
  timeSeriesData.forEach(d => {
    d.date = parseTime(d.date);
  });

  const widthTimeSeries = 500;
  const heightTimeSeries = 200;


  const xScaleTimeSeries = d3.scaleTime()
    .domain(d3.extent(timeSeriesData, d => d.date))
    .range([0, widthTimeSeries]);


  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

  const yScaleTimeSeries = d3.scaleLinear()
    .domain([0, d3.max(timeSeriesData, d => d.value)])
    .range([heightTimeSeries, 0]);

  console.log(timeSeriesData)

  timeSeriesSvg.append("path")
    .datum(timeSeriesData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  const xAxisTimeSeries = d3.axisBottom(xScaleTimeSeries);
  const yAxisTimeSeries = d3.axisLeft(yScaleTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(150, ${heightTimeSeries - 0})`)
    .call(xAxisTimeSeries);

  timeSeriesSvg.append("g")
    .attr("transform", `translate(150, 0)`)
    .call(yAxisTimeSeries);
}