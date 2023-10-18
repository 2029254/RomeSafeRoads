const barChartSvg = d3.select("#barChartSvg");
let margin = 230;
let width = 600 - margin;
let  height = barChartSvg.attr("height") - margin;

let xScale, yScale, g, dataAboutYearSorted;

function drawColorsLegend(){

  let keys = ["> 0 and <= 5000", "> 5000 and <= 10000", "> 10000"];
  let size = 15;

  barChartSvg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 500)
    .attr("y", function(d,i){ return 30 + i*(size+5)}) // 30 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return setBarColor(d)})
    .style("stroke", "black")
    .style("stroke-width", 0.5);

  barChartSvg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 500 + size*1.2)
    .attr("y", function(d,i){ return 30 + i*(size+5) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  let groups = ["[C1] Pedestrian investment",
                        "[C2] Vehicles collision (moving)",
                        "[C3] Vehicles collision with a stationary vehicle",
                        "[C4] Rear-end collision",
                        "[C5] Road conditions",
                        "[C6] Injury",
                        "[C7] Injury",
                        "[C8] Other nature"];

  barChartSvg.selectAll("mylabels")
    .data(groups)
    .enter()
    .append("text")
    .attr("x", 480 + size*1.2)
    .attr("y", function(d,i){ return 130 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

}

function drawAxesAndBars(csvFileName){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.165);
  yScale = d3.scaleLinear().range([height, 0]);

  // function to get and filter csv data
  d3.csv(csvFileName, function (data) {
    let dataAboutYear = data.filter(function (row) {
      return row['NaturaIncidente'];
    });

    // get data group by year
    dataAboutYearSorted = dataAboutYear.sort(function (a, b) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });

    // definition of axes domain
    xScale.domain(dataAboutYearSorted.map(function (d) { return d.NaturaIncidente; }));
    let MinMax = dataAboutYearSorted.map(function (d) { return d.NumeroIncidenti; })
    yScale.domain([0, 23000]);

    // bars creation
    g = barChartSvg.append("g").attr("transform", "translate(" + 90 + "," + 20 + ")");
    g.selectAll(".bar")
      .data(dataAboutYearSorted)
      .enter().append("rect")
      .attr("x", function (d) { return xScale(d.NaturaIncidente); })
      .attr("y", function (d) { return yScale(d.NumeroIncidenti); })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.NumeroIncidenti) })
      .style("fill", function (d) { return setBarColor(d.NumeroIncidenti) })
      .style("stroke", "black") // Aggiungi un bordo nero
      .style("stroke-width", 0.3) // Imposta la larghezza del bordo
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    // axis x description
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", height - 231)
      .attr("x", width - 148)
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .text("Accidents' nature");

    // axis y description
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d){return d;}).ticks(12))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -105)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .text("Number of accidents");
  });
}

function drawVerticalBarChart(csvFileName) {

  drawAxesAndBars(csvFileName);
  drawColorsLegend();

}

function setBarColor(accidentNumber) {
    if(accidentNumber > 0 && accidentNumber <= 5000)
      return "green"
    else if (accidentNumber > 5000 && accidentNumber <= 10000)
      return "steelblue";
    else if (accidentNumber > 10000)
      return "red";
    else if (accidentNumber.toString() === "> 0 and <= 5000")
      return "green"
    else if (accidentNumber.toString() === "> 5000 and <= 10000")
      return "steelblue"
    else
      return "red";
}

function handleMouseOver(d) {
    d3.select(this).style("fill", "grey");
    barChartSvg.append("text")
      .attr("class", "bar-label")
      .attr("x", 120)
      .attr("y", 30)
      .text(setAccidentsNumberAndNatureAndYear(d))
      .style("font-size", "12px");
  }

function handleMouseOut() {
    d3.select(this)
      .style("fill", function(d) { return setBarColor(d.NumeroIncidenti)});
    barChartSvg.select(".bar-label").remove();
  }

function setAccidentsNumberAndNatureAndYear(d) {
  let result = '[' + d.NumeroIncidenti + '] of '
  switch(d.NaturaIncidente.toString()) {
    case 'C1':
      return result.concat("Pedestrian investment")
    case 'C2':
      return result.concat("Vehicles collision (moving)")
    case 'C3':
      return result.concat("Vehicles collision (stationary vehicle)")
    case 'C4':
      return result.concat("Rear-end collision")
    case 'C5':
      return result.concat("Road conditions")
    case 'C6':
      return result.concat("Injury")
    case 'C7':
      return result.concat("Injury")
    default:
      return result.concat("Other nature")
  }

}




