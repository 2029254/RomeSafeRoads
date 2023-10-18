
var choroplethMapSvg = d3.select("#choroplethMap")
  .append("svg")
  .attr("width", 600)
  .attr("height", 350)
  .attr("x", 50)
  .attr("y", 50);


function drawChoroplethMap() {
// Definisci la proiezione geografica
  let projection = d3.geoMercator()
    .center([12.4964, 41.9028]) // Coordinata centrale per Roma
    .scale(30000)
    .translate([500 / 2, 350 / 2]);

// Crea un generatore di percorsi geografici
  let path = d3.geoPath().projection(projection);

// Carica i dati GeoJSON dei comuni
  d3.json("dataset/source/choropleth-map/municipi.geojson", function (error, data) {
    if (error) throw error;

    // Crea i percorsi geografici
    choroplethMapSvg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "steelblue") // Colore di riempimento
      .on("click", function (d) {
      //  document.querySelector(".map-container").classList.add("disable-events");
        console.log(d.properties.nome)
      })
      .on("mouseover",  function(d) {
        d3.select(this).style("fill", "grey");
        choroplethMapSvg.append("text")
          .attr("class", "bar-label")
          .attr("x", 300)
          .attr("y", 30)
          .text(d.properties.nome)
          .style("font-size", "12px");
      })
      .on("mouseout", handleMouseOutChoroplethMap);
    //  document.querySelector("#choroplethMap").style.pointerEvents = "auto"
    // document.querySelector("#choroplethMap").style.pointerEvents = "none"
  });

  const scale = d3.scaleLinear()
    .domain([0, 100]) // Imposta il dominio
    .range([0, 200]); // Imposta l'intervallo

choroplethMapSvg
  .append("svg")
    .attr("width", 100)
    .attr("height", 250)
    .attr("x", 150)
    .attr("y", 250);

  const legendCells = [5, 10, 15, 20, 25, 30]; // Valori per le celle

  choroplethMapSvg.selectAll("rect")
    .data(legendCells)
    .enter()
    .append("rect")
    .attr("x",  490) // Posiziona le celle orizzontalmente
    //.attr("y",  (d, i) => i * 31)
    .attr("y",  (d,i) => 70 + 31 * i)
    .attr("width", 8) // Larghezza delle celle
    .attr("height", 30)
    .style("fill", "steelblue"); // Colora le celle in base al valore

  choroplethMapSvg.selectAll("text")
    .data(legendCells)
    .enter()
    .append("text")
    .attr("x", 508 ) // Posiziona le etichette al centro delle celle
    .attr("y", (d, i) => i * 30.7 + 104 )
    .text((d) => `${d}`); // Testo dell'etichetta

  choroplethMapSvg.selectAll("line")
    .data(legendCells) // Ignora l'ultimo valore
    .enter()
    .append("line")
    .attr("x1", 490)
    .attr("y1", (d,i) => 100.5 + 31 * i) // Inizio della lineetta
    .attr("x2", 501)
    .attr("y2", (d,i) => 100.5 + 31 * i) // Fine della lineetta
    .style("stroke", "black")
    .style("stroke-width", 1);
}

function handleMouseOutChoroplethMap() {
  d3.select(this)
    .style("fill", "steelblue");
  choroplethMapSvg.select(".bar-label").remove();
}