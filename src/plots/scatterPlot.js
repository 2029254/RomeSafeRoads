// append the svg object to the body of the page
var scatterPlotpSvg = d3.select("#scatterPlot")
  .append("div")
  .classed("svg-container-largo", true)  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 850 370")
  .classed("svg-content-responsive", true)
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .append("g").attr("transform", "translate(115, 30)");

let tooltipScatter;
let dots;
let heightScatter = 310;
let widthScatter = 660;
let brushIsActive = false;
let selectedDots;
var markers = [];
var brush;
var allDots = [];

function drawScatterPlot(csvFileNameScatterPlot) {
   brushIsActive=false;
  // Crea un elemento di brush per la selezione
  brush = d3.brush()
    .extent([[0,0], [widthScatter, heightScatter]])
    //.on("start brush end", function(d) {  return brushed(d)})
    .on("start",  function(d) {
      loaderC.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
      choroplethMapSvg.style("opacity", 0.3);
    })
    .on("end",  function(d) { return brushed(d)});


// Aggiungi il brush all'elemento g del tuo grafico
  const gBrush = scatterPlotpSvg.append("g")
    .attr("class", "brush")
    .call(brush)

  d3.csv(csvFileNameScatterPlot , function (data) {

    // Definisci i limiti del tuo scatterplot
    var xMin = -6;
    var xMax = 18;
    var yMin = -6;
    var yMax = 8;

// Definisci la scala per l'asse x
    var xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, 560]);

// Definisci la scala per l'asse y
    var yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([315, 0]);

// Crea gli elementi circolari per il tuo scatterplot
    scatterPlotpSvg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("id",  function (d) { return "dot-" + d.Longitude + "-" + d.Latitude})
      .attr("cx", function (d) {return xScale(d.PC1);})
      .attr("cy", function (d) {return yScale(d.PC2);})
      .attr("r", 3) // Raggio del cerchio
      .attr("col", function(d) { return setPointColor(d); })
      .style("stroke", "#f7f3eb")
      .style("stroke-width", "0.1")
      .style("fill", function(d) { return setPointColor(d); })
      .attr("pointer-events", "all")
      .on("mouseover",  function(d) {
        d3.select(this).transition()
          .duration('100')
          .style("stroke", "#525252")
          .style("stroke-width", "0.3")
          .attr("r", 5);

        tooltipScatter = d3.select("#popupScatterPlot");
        tooltipScatter.style("opacity", 0.9);

        tooltipScatter.html(setPointText(d.TipoVeicolo))
          .style("color", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .style("left", (d3.event.pageX + 9 + "px"))
          .style("top", (d3.event.pageY - 9 + "px"));
      })
      .on("mouseout", function(d) {
        d3.select(this).transition()
          .style("stroke", "#f7f3eb")
          .style("stroke-width", "0.1")
          .duration('200')
          .attr("r", 3);

         tooltipScatter.style("opacity", 0);
      })
      .attr("class", function(d) {
        // Determina il quadrante e assegna una classe
        var quadrant = getQuadrant(d.PC1, d.PC2);
        return "quadrant-" + quadrant;
      });


// Aggiungi gli assi x e y
    scatterPlotpSvg.append("g")
      .attr("transform", "translate(0," + (yScale(0)) + ")")
      .call(d3.axisBottom(xScale))
      /*
      .append("text")
      .style("font-family", "Lora")
      .style("font-size", "11px")
      .attr("y", -8)  // Imposta il nuovo valore di "y" per il punto di ancoraggio
      .attr("x", 20) // Imposta il nuovo valore di "x" per il punto di ancoraggio
      .attr("fill", "black")
      .text("PC1")
       */
      .attr("class", "xAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")
      //.style("opacity", 1)
      .style("opacity", function(d) { return d === 0 ? 0 : 1; })  // Imposta l'opacità per i numeri dell'asse x a 1, tranne per 0;  // Imposta l'opacità per i numeri dell'asse y a 1

    // Imposta l'opacità per l'asse x
    scatterPlotpSvg.select(".xAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".xAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse x
    scatterPlotpSvg.select(".xAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

    scatterPlotpSvg.append("g")
      .attr("transform", "translate(" + (xScale(0)) + ", 0)")
      .call(d3.axisLeft(yScale))
      /*
      .append("text")
      .style("font-family", "Lora")
      .style("font-size", "11px")
      .attr("y", 18)  // Imposta il nuovo valore di "y" per il punto di ancoraggio
      .attr("x", -275) // Imposta il nuovo valore di "x" per il punto di ancoraggio
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .text("PC2")
       */
      .attr("class", "yAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")

    // Imposta l'opacità per l'asse y
    scatterPlotpSvg.select(".yAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".yAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse y
    scatterPlotpSvg.select(".yAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

    drawScatterPlotLegend();
    setTimeout(function () {
      scatterPlotpSvg.style("opacity", 1);
      loaderP.style.display = "none";
    }, 1500); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
  });

}

function drawScatterFromTimeSeries(formattedStartDate, formattedEndDate) {

  // Crea un elemento di brush per la selezione
  var brush = d3.brush()
    .extent([[0,0], [widthScatter, heightScatter]])
    //.on("start brush end", function(d) {  return brushed(d)})
    .on("start",  function(d) {
      loaderC.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
      choroplethMapSvg.style("opacity", 0.3);
    })
    .on("end",  function(d) { return brushed(d)});


// Aggiungi il brush all'elemento g del tuo grafico
  const gBrush = scatterPlotpSvg.append("g")
    .attr("class", "brush")
    .call(brush)

    // function to get and filter csv data
    d3.csv('dataset/processed/scatterPlot/PCA-' + selectedYear + '.csv', function (data) {
      var filteredData = data.filter(function (row) {
        var rowDataOraIncidente = row['DataOraIncidente'];
        return rowDataOraIncidente >= formattedStartDate && rowDataOraIncidente <= formattedEndDate;
      });

    // Definisci i limiti del tuo scatterplot
    var xMin = -6;
    var xMax = 18;
    var yMin = -6;
    var yMax = 8;

// Definisci la scala per l'asse x
    var xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, 560]);

// Definisci la scala per l'asse y
    var yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([315, 0]);

// Crea gli elementi circolari per il tuo scatterplot
    scatterPlotpSvg.selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("id",  function (d) { return "dot-" + d.Longitude + "-" + d.Latitude})
      .attr("cx", function (d) {return xScale(d.PC1);})
      .attr("cy", function (d) {return yScale(d.PC2);})
      .attr("r", 3) // Raggio del cerchio
      .attr("col", function(d) { return setPointColor(d); })
      .style("stroke", "#f7f3eb")
      .style("stroke-width", "0.1")
      .style("fill", function(d) { return setPointColor(d); })
      .attr("pointer-events", "all")
      .on("mouseover",  function(d) {
        d3.select(this).transition()
          .duration('100')
          .style("stroke", "#525252")
          .style("stroke-width", "0.3")
          .attr("r", 5);

        tooltipScatter = d3.select("#popupScatterPlot");
        tooltipScatter.style("opacity", 0.9);

        tooltipScatter.html(setPointText(d.TipoVeicolo))
          .style("color", "#524a32")
          .style("font-family", "Lora")
          .style("font-size", "10px")
          .style("left", (d3.event.pageX + 9 + "px"))
          .style("top", (d3.event.pageY - 9 + "px"));
      })
      .on("mouseout", function(d) {
        d3.select(this).transition()
          .style("stroke", "#f7f3eb")
          .style("stroke-width", "0.1")
          .duration('200')
          .attr("r", 3);

         tooltipScatter.style("opacity", 0);
      })
      .attr("class", function(d) {
        // Determina il quadrante e assegna una classe
        var quadrant = getQuadrant(d.PC1, d.PC2);
        return "quadrant-" + quadrant;
      });


// Aggiungi gli assi x e y
    scatterPlotpSvg.append("g")
      .attr("transform", "translate(0," + (yScale(0)) + ")")
      .call(d3.axisBottom(xScale))
      /*
      .append("text")
      .style("font-family", "Lora")
      .style("font-size", "11px")
      .attr("y", -8)  // Imposta il nuovo valore di "y" per il punto di ancoraggio
      .attr("x", 20) // Imposta il nuovo valore di "x" per il punto di ancoraggio
      .attr("fill", "black")
      .text("PC1")
       */
      .attr("class", "xAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")
      //.style("opacity", 1)
      .style("opacity", function(d) { return d === 0 ? 0 : 1; })  // Imposta l'opacità per i numeri dell'asse x a 1, tranne per 0;  // Imposta l'opacità per i numeri dell'asse y a 1

    // Imposta l'opacità per l'asse x
    scatterPlotpSvg.select(".xAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".xAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse x
    scatterPlotpSvg.select(".xAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

    scatterPlotpSvg.append("g")
      .attr("transform", "translate(" + (xScale(0)) + ", 0)")
      .call(d3.axisLeft(yScale))
      /*
      .append("text")
      .style("font-family", "Lora")
      .style("font-size", "11px")
      .attr("y", 18)  // Imposta il nuovo valore di "y" per il punto di ancoraggio
      .attr("x", -275) // Imposta il nuovo valore di "x" per il punto di ancoraggio
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .text("PC2")
       */
      .attr("class", "yAxis")
      .selectAll("text")  // Seleziona tutti gli elementi di testo sull'asse x
      .style("font-family", "Lora")
      .style("font-size", "11px")

    // Imposta l'opacità per l'asse y
    scatterPlotpSvg.select(".yAxis").select(".domain")
      .style("opacity", 0.5);

    scatterPlotpSvg.select(".yAxis").selectAll(".tick line")  // Seleziona tutti gli elementi della griglia sull'asse x
      .style("opacity", 0.5);   // Imposta l'opacità per la griglia dell'asse x a 0.3

    // Imposta l'opacità per il primo e l'ultimo tick dell'asse y
    scatterPlotpSvg.select(".yAxis").selectAll(".tick:first-of-type line, .tick:last-of-type line")
      .style("opacity", 0.5);

    drawScatterPlotLegend();
    setTimeout(function () {
      scatterPlotpSvg.style("opacity", 1);
      loaderP.style.display = "none";
    }, 1500); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

  });
}

function brushed(d) {
  brushIsActive=true;
  if (!d3.event.selection) {
    setTimeout(function () {
      loaderC.style.display = "none";
      choroplethMapSvg.style("opacity", 1);
      choroplethMapSvg.selectAll("circle").remove();
      choroplethMapSvg.selectAll("#localization").remove();
      markers.forEach((marker) => marker.remove());
      markers = [];
      brushIsActive=false;
      allDots.forEach(function(dot) {
          dot.style("stroke", "#f7f3eb");
      });
      }, 800);
    return;} // Se la selezione è nulla, esci dalla funzione

  choroplethMapSvg.selectAll("#localization").remove();
  markers.forEach((marker) => marker.remove());
  markers = [];

  extent = d3.event.selection;
  selectedDots = []; //qui metto tutti i punti selezionati
  //allDots = []; //qui metto tutti i punti del grafico

  scatterPlotpSvg.selectAll('[id^="dot"]').each(function () {

    const mydot = d3.select(this);

    allDots.push(mydot);
    //controllo se il punto si trova all'interno della selezione
    var isBrushed = extent[0][0] <= mydot.attr('cx') && extent[1][0] >= mydot.attr('cx') && // Check X coordinate
      extent[0][1] <= mydot.attr('cy') && extent[1][1] >= mydot.attr('cy')  // And Y coordinate

    if(isBrushed && !selectedDots.includes(mydot)){ //se il punto si trova nella selezione lo aggiungo a selectedDots
      selectedDots.push(mydot);
      //mydot.style("stroke", "#525252")
      //console.log(mydot);
    } else { //se il punto non si trova nella selezione lo rimuovo da selectedDots
      let indexToRemove = selectedDots.indexOf(mydot);
      if (indexToRemove !== -1) selectedDots.splice(indexToRemove);
      mydot.style("stroke", "#f7f3eb")
    }
  })
  coords = [12.583, 12.5152, 12.5834, 12.6889, 12.6673, 12.2585, 12.488, 12.5295, 12.5444, 12.6673, 12.4819, 12.2407, 12.6011, 12.5994, 12.4982, 12.5927, 12.5976, 12.3783, 12.3975 ]

  selectedDots.forEach(dot => {

    const dotId = dot.attr('id'); // Assumi che l'id sia un attributo dell'elemento dot
    const dotColor = dot.attr('col'); // Assumi che l'id sia un attributo dell'elemento dot

    dot.style("stroke", "#525252")
    let numeri = dotId.match(/(-?\d+\.\d+)/g);

    let latitudine, longitudine;
    if (numeri) {
      // Assegno i valori estratti alle variabili
      latitudine = numeri[0].substr(1,numeri[0].length);
      longitudine = numeri[1].substr(1,numeri[1].length);
    }

      let pointCoordinates = [parseFloat(latitudine), parseFloat(longitudine)];

      console.log(pointCoordinates[0] + " " + pointCoordinates[1])
    if (!coords.includes(pointCoordinates[0])) {
      selectedRadioButtonTwo = document.querySelector('#radiobuttonsTwo input[type="radio"]:checked');
      if(selectedRadioButtonTwo.id === "MapOne") {
        // Aggiungi punti alla mappa
        choroplethMapSvg.append("circle")
          .attr("id", "localization")
          .attr("cx", projection(pointCoordinates)[0])
          .attr("cy", projection(pointCoordinates)[1])
          .attr("r", 3) // Imposta il raggio del cerchio
          .style("stroke", "#525252")
          .style("stroke-width", "0.1")
          .style("fill", dotColor)
      } else {
// Verifica che le coordinate non siano NaN
        if (!isNaN(pointCoordinates[0]) && !isNaN(pointCoordinates[1])) {

              const marker = new mapboxgl.Marker({
                color: dotColor, // Imposta il colore del marker
                scale: 0.4 // Imposta la scala del marker (0.5 renderà il marker la metà della dimensione originale)
                //zoom: 'auto'
              })
                .setLngLat([pointCoordinates[0], pointCoordinates[1]]) // Imposta la posizione del marker
                .addTo(map); // Aggiungi il marker alla mappa
              markers.push(marker)

          /*
          setTimeout(function() {
            marker.remove();
          }, 20000);

           */
        }

        // Rimuovi il marker dopo 2 secondi (puoi regolare questo valore a tuo piacimento)

      }
    }
  });
  setTimeout(function () {
    loaderC.style.display = "none";
    choroplethMapSvg.style("opacity", 1);
  }, 800);
}

function setPointText(tipoVeicolo) {
  if (tipoVeicolo === "Autovettura")
    return "Car"
  else if (tipoVeicolo === "Motociclo")
    return "Motorcycle";
  else if (tipoVeicolo === "Autocarro")
    return "Truck";
  else if (tipoVeicolo === "Ignoto")
    return "Unknown";
}

function setPointColor(d) {
  /*
  if (tipoVeicolo === "Autovettura" || tipoVeicolo === "Car")
    return "#cab2d6"
  else if (tipoVeicolo === "Motociclo" || tipoVeicolo === "Motorcycle")
    return "#b2df8a";
  else if (tipoVeicolo === "Autocarro" || tipoVeicolo === "Truck")
    return "#fdbf6f";
  else if (tipoVeicolo === "Ignoto" || tipoVeicolo === "Unknown")
    return "#a6cee3";


  if (d.Deceduto === 0.0 || d.Deceduto  === '0.0' || d  === "Non-fatal accident")
    return "#c9a18b"
  else return "#8bc8e8"
  */
/*
 if (d.NaturaIncidente === "C1")
   return "#8dd3c7"
 else if (d.NaturaIncidente === "C2")
   return "#ffffb3"
 else if (d.NaturaIncidente === "C3")
   return "#bebada"
 else if (d.NaturaIncidente === "C4")
   return "#fb8072"
 else if (d.NaturaIncidente === "C5")
   return "#80b1d3"
 else if (d.NaturaIncidente === "C6")
   return "#fdb462"
 else if (d.NaturaIncidente === "C7")
   return "#b3de69"
 else if (d.NaturaIncidente === "C8")
   return "#fccde5"
 else return "#8bc8e8"
*/

  if (d.Severity === "1" || d === "Minimal severity")
    return "#c9a18b"
  else if (d.Severity === "2" || d === "Low severity")
    return "#8dd3c7"//"#8bc8e8"
  else if (d.Severity === "3" || d === "Moderate severity")
    return "#f5aeca"//"#8dd3c7"
  else if (d.Severity === "4" || d === "High severity")
    return "#d8f022"
  else if (d.Severity === "5" || d === "Critical severity")
    return "#be6bbf"//"#80b1d3"
  else return "#8bc8e8"
}

function drawScatterPlotLegend() {

 let keys = ["Critical severity", "High severity", "Moderate severity", "Low severity", "Minimal severity"];
 let size = 16; //17

 scatterPlotpSvg.selectAll("mydots")
   .data(keys)
   .enter()
   .append("rect")
   .attr("x", 580)
   .attr("y", function (d, i) {
     console.log(250 + i * (size + 5))
     return 20 + i * (size + 5)
   }) // 30 is where the first dot appears. 25 is the distance between dots
   .attr("width", size)
   .attr("height", size)
   .style("fill", function (d, i) {
   console.log(d)
     return setPointColor(keys[i])
   })
   .style("stroke", "#524a32")
   .style("stroke-width", 0.1);


 scatterPlotpSvg.selectAll("mylabels")
   .data(keys)
   .enter()
   .append("text")
   .attr("x", 580 + size * 1.2)
   .attr("y", function (d, i) {
     return 22 + i * (size + 5) + (size / 2)
   }) // 30 is where the first dot appears. 25 is the distance between dots
   .text(function (d) {
     return d
   })
   .style("fill", "#524a32")
   .style("font-family", "Lora")
   .style("font-size", "12px")
   .attr("text-anchor", "left")
   .style("alignment-baseline", "middle");

}

// Funzione per determinare il quadrante
function getQuadrant(x, y) {
 if (x >= 0 && y >= 0) {
   return 1; // Primo quadrante
 } else if (x < 0 && y >= 0) {
   return 2; // Secondo quadrante
 } else if (x < 0 && y < 0) {
   return 3; // Terzo quadrante
 } else {
   return 4; // Quarto quadrante
 }
}