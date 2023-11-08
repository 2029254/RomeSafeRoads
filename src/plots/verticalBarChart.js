//const barChartSvg = d3.select("#barChartSvg");

// append the svg object to the body of the page
var barChartSvg = d3.select("#verticalBarChart")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 750 370")
    .classed("svg-content-responsive", true)
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(-20, 0)");

let width = 500;
let height = 300;

let xScale, yScale, g, dataAboutYearSorted, tooltip;

function drawColorsLegend(){

  let keys = ["> 0 and \u2264 500", "> 500 and \u2264 1500", "> 1500 and \u2264 4000", "> 4000 and \u2264 9000",  "> 9000 and \u2264 15000", "> 15000"];
  let size = 13;

  barChartSvg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 500)
    .attr("y", function(d,i){ return 30 + i*(size+5)}) // 30 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return setBarColor(d)})
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);


  barChartSvg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 500 + size*1.2)
    .attr("y", function(d,i){ return 30 + i*(size+5) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
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

  barChartSvg.selectAll("mylabels")
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

function drawAxesAndBars(csvFileName){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.160);
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
    if(buttonWeatherValue === undefined || buttonWeatherValue === "None" || buttonWeatherValue === "First")
       yScale.domain([0, 24000]);
    else yScale.domain([0, Math.max.apply(null, MinMax)]);

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
      .on("click", function (d) {onclickBar(d)})
      .on("mouseover", handleMouseOver)
      .on("mouseout", function (d) {handleMouseOut(d)})
      .on("mousemove", handleMouseOver)
      .attr("class", "bar")
      .style("transition", "0.3s");

    // axis x description
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .style("font-family", "Lora")
      .append("text")
      .attr("y", 37)
      .attr("x", width - 315)
      .attr("fill", "black")
      .text("Accidents' nature");

    // axis y description
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d){return d;}).ticks(12))
      .style("font-family", "Lora")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -105)
      .attr("dy", "-5.1em")
      .attr("fill", "black")
      .text("Number of accidents");

  });
}

function drawAxesAndBarsFromChoroplethMap(data){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.160);
  yScale = d3.scaleLinear().range([height, 0]);

    // get data group by year
    dataAboutYearSorted = data.sort(function (a, b) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });

    // definition of axes domain
    xScale.domain(dataAboutYearSorted.map(function (d) { return d.NaturaIncidente; }));
    let MinMax = dataAboutYearSorted.map(function (d) { return d.NumeroIncidenti; })
    if(buttonWeatherValue === undefined || buttonWeatherValue === "None" || buttonWeatherValue === "First")
      yScale.domain([0, 20]);
    else yScale.domain([0, Math.max.apply(null, MinMax)]);

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
      .on("click", function (d) {onclickBar(d)})
      .on("mouseover", handleMouseOver)
      .on("mouseout", function (d) {handleMouseOut(d)})
      .on("mousemove", handleMouseOver)
      .attr("class", "bar")
      .style("transition", "0.3s");

    // axis x description
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", 37)
      .attr("x", width - 278)
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
}


function drawVerticalBarChart(csvFileName) {

  drawAxesAndBars(csvFileName);
  drawColorsLegend();

}

function setBarColor(accidentNumber) {
  if (accidentNumber > 0 && accidentNumber <= 500)
    return "#1a9850"
  else if (accidentNumber > 500 && accidentNumber <= 1500)
    return "#91cf60";
  else if (accidentNumber > 1500 && accidentNumber <= 4000)
    return "#d9ef8b";
  else if (accidentNumber > 4000 && accidentNumber <= 9000)
    return "#fee08b";
  else if (accidentNumber > 9000 && accidentNumber <= 15000)
    return "#fc8d59";
  else if (accidentNumber > 15000)
    return "#d73027";
  else if (accidentNumber.toString() === "> 0 and \u2264 500")
    return "#1a9850"
  else if (accidentNumber.toString() === "> 500 and \u2264 1500")
    return "#91cf60"
  else if (accidentNumber.toString() === "> 1500 and \u2264 4000")
    return "#d9ef8b"
  else if (accidentNumber.toString() === "> 4000 and \u2264 9000")
    return "#fee08b"
  else if (accidentNumber.toString() === "> 9000 and \u2264 15000")
    return "#fc8d59"
  else if (accidentNumber.toString() === "> 15000")
    return "#d73027"
}
function handleMouseOver(d) {
    //d3.select(this).style("fill", "grey");

    barChartSvg.selectAll(".bar")
        .filter(function (datum) {
            return datum !== d;
        })
        .style("opacity", 0.3);

    barChartSvg.selectAll("#"+ d.NaturaIncidente).style("text-decoration", "underline")
    /*barChartSvg.append("text")
      .attr("class", "bar-label")
      .attr("x", 120)
      .attr("y", 30)
      .text(setAccidentsNumberAndNatureAndYear(d))
      .style("font-size", "12px");*/

    tooltip = d3.select("#popup");
        tooltip.style("opacity", 0.8);

        tooltip.html(setAccidentsNumberAndNatureAndYear(d))
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("left", (d3.event.pageX + 9 + "px"))
        .style("top", (d3.event.pageY - 9 + "px"));
  }

function handleMouseOut(d) {
    //d3.select(this)
      //.style("fill", function(d) { return setBarColor(d.NumeroIncidenti)});
    // Nascondi il pop-up
    barChartSvg.selectAll("#"+ d.NaturaIncidente).style("text-decoration", "none")
    tooltip.style("opacity", 0);
    barChartSvg.selectAll("rect")
        .style("opacity", 1);
    barChartSvg.select(".bar-label").remove();

  }

let timer; // Variabile per il timer
let isActive = false; // Variabile per tracciare lo stato del timer
function onclickBar(d) {
console.log(isActive)
  if (!isActive) { // Se il timer non è attivo
    isActive = true;
    timer = setTimeout(function () {
      isActive = false; // Resetta lo stato del timer
      resetTownHall();
    }, 3000);
  } else if (timer){ // Se il timer è già attivo
    clearTimeout(timer); // Interrompi il timer corrente
    timer = setTimeout(function () {
      isActive = false; // Resetta lo stato del timer
      resetTownHall();
    }, 3000);
   // isActive = false; // Resetta lo stato del timer
  }
  resetTownHall();

  let result;
  switch (d.NaturaIncidente.toString()) {
    case 'C1':
      result = "Pedestrian hit";
      break;
    case 'C2':
      result = "Vehicles collision (moving)";
      break;
    case 'C3':
      result = "Vehicles collision (stationary vehicle)";
      break;
    case 'C4':
      result = "Rear-end collision";
      break;
    case 'C5':
      result = "Collision with obstacle";
      break;
    case 'C6':
      result = "Sudden braking and vehicle fall";
      break;
    case 'C7':
      result = "Overturning and run-off-road";
      break;
    default:
      result = "Side/head-on collision";
  }

  let weatherResult = [];
  switch (buttonWeatherValue) {
    case 'Cloudy':
      weatherResult.push("Nuvoloso");
      break;
    case 'Sunny':
      weatherResult.push("Sereno", "Sole radente");
      break;
    case 'Rainy':
      weatherResult.push("Pioggia in atto");
      break;
    case 'Severe':
      weatherResult.push("Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
      break;
    case 'None':
      weatherResult.push("Nuvoloso", "Sereno", "Sole radente","Pioggia in atto", "Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
      break;
    default:
      weatherResult.push("Nuvoloso", "Sereno", "Sole radente","Pioggia in atto", "Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
  }

  d3.csv(csvFileNameChoroplethMapNature, function (data) {

    console.log(weatherResult )
    let dataAboutWeather = [];
    weatherResult.forEach(item => {
     data.filter(function (row) {
        if(row['CondizioneAtmosferica'] === item)
          dataAboutWeather.push(row)
      });
    });

    let dataAboutNature = []
    dataAboutWeather.forEach(item => {
      if (item['NaturaIncidente'] === d.NaturaIncidente.toString() )
        dataAboutNature.push(item)
    });

    let groupedByTownHall = new Map();
    dataAboutNature.forEach(item => {
      let municipio = item.Municipio;
      if (!groupedByTownHall.has(municipio)) {
        groupedByTownHall.set(municipio, []);
      }
      groupedByTownHall.get(municipio).push(item);
    });

    let incidentCounts = new Map();
    groupedByTownHall.forEach((data, municipio) => {
      const count = data.length;
      incidentCounts.set(municipio, count);
    });

    for (const [key, value] of incidentCounts) {
      showNumberOfAccidents(key, value);
    }
    fillOtherTownHalls(incidentCounts);
  });
}

function setAccidentsNumberAndNatureAndYear(d) {
  let result = d.NumeroIncidenti
  return result
  /*switch(d.NaturaIncidente.toString()) {
    case 'C1':
      return result.concat("Pedestrian hit")
    case 'C2':
      return result.concat("Vehicles collision (moving)")
    case 'C3':
      return result.concat("Vehicles collision (stationary vehicle)")
    case 'C4':
      return result.concat("Rear-end collision")
    case 'C5':
      return result.concat("Collision with obstacle")
    case 'C6':
      return result.concat("Sudden braking and vehicle fall")
    case 'C7':
      return result.concat("Overturning and run-off-road")
    default:
      return result.concat("Side/head-on collision")
  }*/

}





