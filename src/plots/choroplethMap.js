const choroplethMapSvg = d3.select("#choroplethMap")
  .append("svg")
  .attr("width", 470)
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
}

function handleMouseOutChoroplethMap() {
  d3.select(this)
    .style("fill", "steelblue");
  choroplethMapSvg.select(".bar-label").remove();
}