function drawVerticalBarChart(csvFileName) {
  let svg = d3.select("svg"),
    margin = 230,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

  let xScale = d3.scaleBand().range([0,  svg.attr("width") - 230]).padding(0.165),
    yScale = d3.scaleLinear().range([height, 0]);

  let g = svg.append("g")
    .attr("transform", "translate(" + 90 + "," + 20 + ")");

  d3.csv(csvFileName, function(data) {
    let dataAboutYear = data.filter(function (row) {
      return row['NaturaIncidente'];
    });

    let dataAboutYearSorted = dataAboutYear.sort(function (a, b) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });

    xScale.domain(dataAboutYearSorted.map(function (d) {return d.NaturaIncidente;}));

    let MinMax = dataAboutYearSorted.map(function (d) {
      return d.NumeroIncidenti;
    })

    yScale.domain([0, MinMax[MinMax.length-1]]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", height - 231)
      .attr("x", width - 148)
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .text("Accidents' nature");

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

    g.selectAll(".bar")
      .data(dataAboutYearSorted)
      .enter().append("rect")
      //.attr("class", "bar")
      .attr("x", function(d) { return xScale(d.NaturaIncidente); })
      .attr("y", function(d) { return yScale(d.NumeroIncidenti); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height - yScale(d.NumeroIncidenti)})
      .style("fill",  function(d) { return setBarColor(d.NumeroIncidenti)}) // Assegna il colore direttamente
      .style("stroke", "black") // Aggiungi un bordo nero
      .style("stroke-width", 0.3) // Imposta la larghezza del bordo
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

  });

  function setBarColor(accidentNumber) {
    if(accidentNumber >0 && accidentNumber <= 2000)
      return "red"
    else if (accidentNumber >2000 && accidentNumber <= 7000)
      return "steelblue"
    else
      return "green"
  }

  function handleMouseOver(d) {
    d3.select(this)
      .style("fill", "grey"); // Cambia il colore della barra al passaggio del mouse
    // Mostra il numero associato alla barra
    var xPos = parseFloat(d3.select(this).attr("x")) + 25;
    svg.append("text")
      .attr("class", "bar-label")
      .attr("x", xPos)
      .attr("y", 10)
      .text(d.NumeroIncidenti)
      .style("font-size", "12px");
  }

  function handleMouseOut() {
    d3.select(this)
      .style("fill", function(d) { return setBarColor(d.NumeroIncidenti)}); // Ripristina il colore originale della barra
    // Rimuovi il numero in cima alla barra
    svg.select(".bar-label").remove();
  }

  // select the svg area
  var SVG = d3.select("#my_dataviz3")

// create a list of keys
  var keys = [">0 and <=400", ">400 and <=700", ">700 and <=1000"]

// Usually you have a color scale in your chart already
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet1);

// Add one dot in the legend for each name.
  var size = 15

  SVG.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 100)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)})
    .style("stroke", "black") // Aggiungi un bordo nero
    .style("stroke-width", 0.5); // Imposta la larghezza del bordo

// Add one dot in the legend for each name.
  SVG.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 100 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")


  var SVG2 = d3.select("#my_dataviz4")
  var keys2 = ["[C1] Run-off-road collision",
                       "[C2] Injury",
                       "[C3] Pedestrian investment",
                       "[C4] Overturning",
                       "[C5] Vehicles collision",
                       "[C6] Rear-end collision",
                       "[C7] Road conditions",
                       "[C8] Other nature"]

  var keys2 = ["[C1] Pedestrian investment",
    "[C2] Vehicles collision (moving)",
    "[C3] Vehicles collision with a stationary vehicle",
    "[C4] Rear-end collision",
    "[C5] Road conditions",
    "[C6] Injury",
    "[C7] Injury",
    "[C8] Other nature"]

// Add one dot in the legend for each name.
  SVG.selectAll("mylabels")
    .data(keys2)
    .enter()
    .append("text")
    .attr("x", 300 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")


}
