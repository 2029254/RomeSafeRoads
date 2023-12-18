//var choroplethMapSvg = d3.select("#choroplethMapSvg");

// append the svg object to the body of the page
var choroplethMapSvg = d3.select("#choroplethMap")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 370")
    .classed("svg-content-responsive", true)
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(25, -15)");

let dataAboutTownHall;
let path, tooltipChor;
let centroidTownHalls = new Map();

function drawChoroplethMap(csvFileNameChoroplethMap) {

  // function to get and filter csv data
  d3.csv(csvFileNameChoroplethMap, function (data) {
    dataAboutTownHall = data.filter(function (row) {
      return row['Municipio'];
    });

// Definisci la proiezione geografica
  let projection = d3.geoMercator()
    .center([12.4964, 41.9028]) // Coordinata centrale per Roma
    .scale(30000)
    .translate([500 / 2.2, 350 / 1.90]);

// Crea un generatore di percorsi geografici
  path = d3.geoPath().projection(projection);

// Carica i dati GeoJSON dei comuni
  d3.json("dataset/source/choropleth-map/municipi.geojson", function (error, data) {
    if (error) throw error;
    centroidTownHalls.clear();
    // Crea i percorsi geografici
    choroplethMapSvg.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "area")
      .style("transition", "0.3s")
      .style("stroke", "black")
      .style("stroke-width", "0.3px")
      .attr("id",function (d) {
        centroidTownHalls.set(d.properties.nome, path.centroid(d));
        return d.properties.nome })
      .style("fill",function (d) { return setBarColorChoroplethMap(d)}) // Colore di riempimento
      .on("click", function (d) {

        let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);

        if (townHallAndAccidentsNumber !== undefined) {
            accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti;

            //click solo su aree con numeroincidenti>1
            if (accidentsNumber > 1) {

                console.log(d.properties.nome)
                townHallClicked = true;

                d3.csv(csvFileNameChoroplethMapNature, function (data) {
                  let dataResult = [];
                  data.filter(function (row) {
                    if (row['Municipio'] === d.properties.nome.toString())
                      dataResult.push(row)
                  });

                  let rightNatureArray = [];
                  dataResult.filter(function (row) {
                    if (row['NaturaIncidente'] === "C1")
                      rightNatureArray.push(row)
                  });


                  // Definisci il parser per le date
                  let parseTime = d3.timeParse("%Y-%m-%d");
                  let newArrayOfData = rightNatureArray.map(item => {
                    return {
                      Municipio: item.Municipio,
                      DataOraIncidente: parseTime(item.DataOraIncidente),
                    };
                  });

                  console.log(newArrayOfData);

                  // Usa reduce per raggruppare per data e calcolare il conteggio
                  let incidentiRaggruppati = Object.values(newArrayOfData.reduce((acc, item) => {
                    let data = item.DataOraIncidente;
                    const dataString = data.toDateString();
                    if (!acc[dataString]) {
                      acc[dataString] = { Data: data, NumeroIncidenti: 0 };
                    }
                    acc[dataString].NumeroIncidenti++;
                    return acc;
                  }, {}));

                  console.log(incidentiRaggruppati)

              //    let dataset  = Object.values(incidentiRaggruppati).map(({ DataOraIncidente, ...rest }) => rest);

               //   console.log(dataset)

                  const finalDataset = Object.values(incidentiRaggruppati).map(({ Data, ...rest }) => ({ DataOraIncidente: Data, ...rest }));

                  console.log(finalDataset)

                  finalDataset.forEach(d => {
                    d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
                  });

                  finalDataset.forEach(d => {
                      console.log(d)
                  });

                  const finalDatasetWithMissingDates = addMissingDatesWithZeroes(finalDataset);

/*
                  timeSeriesSvg.selectAll("*").remove();
                  arrayOfData = []
                timeSeriesSvg.append("text")
                  .attr("class", "bar-label")
                  .attr("x", 360)
                  .attr("y", 10)
                  //.text("In " + d.properties.nome + " happened " + accidentsNumber + " deaths accidents")
                  .text("Fatal pedestrian accidents happened in " + d.properties.nome)
                  .style("font-family", "Lora")
                  .style("font-size", "12px");

                  // console.log(finalDataset)
                  arrayOfData.push(finalDatasetWithMissingDates)
                  setAxesScalePedestrianDeaths(finalDatasetWithMissingDates);
                  drawAxesPedestrianDeaths(finalDatasetWithMissingDates);
                  drawLineWithValue(finalDatasetWithMissingDates);

                  addPoints()
                  drawPoints(finalDatasetWithMissingDates );
                  drawGridPedestrianDeaths();

 */
                  // Vertical bar chart interaction
                  console.log(dataResult)
                  const conteggiNature = {};

                  // Iterare attraverso i dati e aggiornare i conteggi
                  dataResult.forEach(item => {
                    const natura = item.NaturaIncidente;
                    if (conteggiNature[natura]) {
                      conteggiNature[natura]++;
                    } else {
                      conteggiNature[natura] = 1;
                    }
                  });

                  // Convertire i conteggi in un array di oggetti
                  const resultVerticalChart = Object.keys(conteggiNature).map(natura => ({
                    NaturaIncidente: natura,
                    NumeroIncidenti: conteggiNature[natura],
                  }));

                  console.log(resultVerticalChart);
                  barChartSvg.selectAll("*").remove();
                  drawAxesAndBarsFromChoroplethMap(resultVerticalChart, true);
                  drawColorsLegend();
                  keysLegends = [];

                  timeSeriesSvg.selectAll("*").remove();
                  drawTimeSeriesChart(csvFileNameTimeSeries);

                  })
                }
            }
        })
      .on("mouseover",  function(d) {
        let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);
        if (townHallAndAccidentsNumber !== undefined)
          accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti
        else
          accidentsNumber = 0

        /*if (!isActive) {
            choroplethMapSvg.selectAll(".area")
                .filter(function (datum) {
                    return datum !== d;
                })
                .style("opacity", 0.5);

        //d3.select(this).style("fill", "grey");
        }*/
        //if (accidentsNumber > 1) {
        if (!isActive) {
            // Rendi meno opache tutte le aree tranne l'area corrente
            choroplethMapSvg.selectAll(".area")
              .style("opacity", 0.3);
              d3.select(this)
              .style("opacity", 1); // Imposta l'opacità dell'area corrente a 1
        }
        //puntatore pointer solo per le aree con numeroincidenti >1
        if (accidentsNumber > 1) {
            d3.select(this).style("cursor", "pointer");
            // Resto del tuo codice di gestione dell'evento mouseover
        }
        //}

        /*choroplethMapSvg.append("text")
          .attr("class", "bar-label")
          .attr("x", 300)
          .attr("y", 30)
          .text("In " + d.properties.nome + " happened " + accidentsNumber + " deaths accidents")
          .style("font-size", "12px");*/
      })
      .on("mouseout", handleMouseOutChoroplethMap)
      .on("mousemove",  function(d) {
              tooltipChor = d3.select("#popupChoropleth");
                      tooltipChor.style("opacity", 0.9);

                      tooltipChor.html(d.properties.nome + "<br>" + "<tspan style='font-weight: bold;'>" + "deaths: "+ accidentsNumber + "</tspan>")
                      .style("color", "#524a32")
                      .style("font-family", "Lora")
                      .style("font-size", "10px")
                      //.style("font-weight", "bold")
                      .style("left", (d3.event.pageX + 9 + "px"))
                      .style("top", (d3.event.pageY - 9 + "px"));
      });
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

  const legendCells = [1, 3, 5, 10, 20, 30, 45]; // Valori per le celle

  choroplethMapSvg.selectAll("rect")
    .data(legendCells)
    .enter()
    .append("rect")
    .attr("x",  500) // Posiziona le celle orizzontalmente
    //.attr("y",  (d, i) => i * 31)
    .attr("y",  (d,i) => 70 + 31 * i)
    .attr("width", 8) // Larghezza delle celle
    .attr("height", 30)
    .style("fill", function (d,i) { return setLegendColorsChoroplethMap(legendCells[i])}); // Colora le celle in base al valore

  choroplethMapSvg.selectAll("text")
    .data(legendCells)
    .enter()
    .append("text")
    .attr("x", 518 ) // Posiziona le etichette al centro delle celle
    .attr("y", (d, i) => i * 30.7 + 104 )
    .style("font-family", "Lora")
    .text((d) => `${d}`); // Testo dell'etichetta

  choroplethMapSvg.selectAll("line")
    .data(legendCells) // Ignora l'ultimo valore
    .enter()
    .append("line")
    .attr("x1", 500)
    .attr("y1", (d,i) => 100.5 + 31 * i) // Inizio della lineetta
    .attr("x2", 511)
    .attr("y2", (d,i) => 100.5 + 31 * i) // Fine della lineetta
    .style("stroke", "black")
    .style("stroke-width", "1px");
  });
  }


function handleMouseOutChoroplethMap() {
  choroplethMapSvg.select(".bar-label").remove();
  tooltipChor.style("opacity", 0);
  /*if (!isActive) {
    d3.select(this)
        .style("fill", function (d) {
        return setBarColorChoroplethMap(d)
      });
  }*/
    if (!isActive) {
        // Ripristina l'opacità di tutte le aree al valore predefinito (ad esempio 1)
        choroplethMapSvg.selectAll(".area")
            .style("opacity", 1);
    }
}

function setBarColorChoroplethMap(d) {
  let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);

  if (townHallAndAccidentsNumber !== undefined) {
    let accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti

    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#d9d9d9"
    else if (accidentsNumber > 1 && accidentsNumber <= 3)
      return "#bdbdbd";
    else if (accidentsNumber > 3 && accidentsNumber <= 5)
      return "#969696";
    else if (accidentsNumber > 5 && accidentsNumber <= 10)
      return "#737373";
    else if (accidentsNumber > 10 && accidentsNumber <= 20)
      return "#525252";
    else if (accidentsNumber > 20 && accidentsNumber <= 30)
      return "#373737";
    else
      return "#000000";
  } else
    return "#f0f0f0";
}

function setLegendColorsChoroplethMap(accidentsNumber) {

  if (accidentsNumber > 0 && accidentsNumber <= 1)
    return "#d9d9d9"
  else if (accidentsNumber > 1 && accidentsNumber <= 3)
    return "#bdbdbd";
  else if (accidentsNumber > 3 && accidentsNumber <= 5)
    return "#969696";
  else if (accidentsNumber > 5 && accidentsNumber <= 10)
    return "#737373";
  else if (accidentsNumber > 10 && accidentsNumber <= 20)
    return "#525252";
  else if (accidentsNumber > 20 && accidentsNumber <= 30)
    return "#373737";
  else
    return "#000000";

}

function showNumberOfAccidents(townHall, number) {

  const selectedPath = choroplethMapSvg.select(`path[id='${townHall}']`);
  //selectedPath.style("fill", "yellow");

  let centroidInterested = centroidTownHalls.get(townHall);
  let marginNumberY = 5;
  let marginNumberX = 0;
  let marginNumberCircleX = 0;

  if(townHall.toString() === "Municipio VI" ) {
    marginNumberX = 15;
    marginNumberCircleX = marginNumberX;
  } else if (townHall.toString() === "Municipio XV"){
    marginNumberY = 23;
    marginNumberX = -12;
    marginNumberCircleX = -12;
  } else if (townHall.toString() === "Municipio XIII" && number > 9){
    marginNumberCircleX = -2.5
  }

 choroplethMapSvg.append("circle")
    .attr("cx", centroidInterested[0] - marginNumberCircleX + 2.8)
    .attr("cy", centroidInterested[1] + marginNumberY - 3.5)
    .attr("r", 8) // Imposta il raggio del cerchio
    .style("font-family", "Lora")
    .style("stroke", "#d4d0c5") // Colore del bordo
    .style("stroke-width", "1px") // Spessore del bordo
    .style("fill", "white")
    .style("opacity", "0.7")
    .style("filter", "drop-shadow(0 1px 1px darkslategray)");

  choroplethMapSvg.append("text")
    .text(number)
    .attr("id", "text-number-town-hall") // Assegna un ID univoco, ad esempio "uniqueID"
    .attr("x", function() {
            // Verifica se il numero ha due cifre
            if (number >= 10) {
                return centroidInterested[0] - marginNumberX + 5.5;
            } else {
                return centroidInterested[0] - marginNumberX + 3;
            }
    })
    .attr("y", centroidInterested[1] + marginNumberY) // Coordinata y del testo
    .attr("text-anchor", "middle")
    //.style("fill", "white")
    .style("font-size", "9px")
    .style("fill", "#524a32")
    .style("opacity", "0.8")
    .style("font-family", "Lora")
    .style("font-weight", "bold");
}
function fillOtherTownHalls(map){
  Array.from(centroidTownHalls.keys()).forEach(item => {
    let selectedTownHall = choroplethMapSvg.select(`path[id='${item}']`);
    if(!map.has(item))
      selectedTownHall.style("opacity", "0.3")
  });
}

function resetTownHall(){
  d3.selectAll("#text-number-town-hall").remove();
  choroplethMapSvg.selectAll("circle").remove();
  Array.from(centroidTownHalls.keys()).forEach(item => {
    let selectedPath = choroplethMapSvg.select(`path[id='${item}']`);
    selectedPath.style("opacity", "1")
    selectedPath.style("fill", function(d) {
      return setBarColorChoroplethMap(d);

    });
  });
}


function addMissingDatesWithZeroes(data) {
  const newData = [];
  let endDate
  if (selectedYear === "2022")
  endDate = new Date('2022-09-01'); // Imposta la tua data di fine
  else {
    let nextYear = parseInt(selectedYear) + 1;
    endDate = new Date(nextYear + '-01-01'); // Imposta la tua data di fine
  }

  const startDate = new Date(selectedYear + '-01-01'); // Imposta la tua data di inizio
  let currentDate = new Date(startDate);

  const existingDates = data.map(item => item.DataOraIncidente.toISOString()); // Creare un array di date esistenti

  // Aggiungi manualmente il 01 gennaio se manca nei dati
  if (existingDates.indexOf(startDate.toISOString()) === -1) {
    newData.push({ DataOraIncidente: new Date(startDate), NumeroIncidenti: 0 });
  }

  while (currentDate <= endDate) {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const datesToAdd = [10, 20];

    if (currentDate.getDate() === 1) {
      datesToAdd.push(1); // Aggiungi il 01 solo se la data corrente è il 01 di un mese
    }
    if (currentDate.getMonth() === 11)
      datesToAdd.push(30)

      for (const day of datesToAdd) {
        const newDate = new Date(currentYear, currentMonth, day, 0, 0, 0);


        if (
          existingDates.indexOf(newDate.toISOString()) === -1 &&
          newDate >= startDate &&
          newDate <= endDate
        ) {
          newData.push({DataOraIncidente: newDate, NumeroIncidenti: 0});
        }
      }


    // Passa al mese successivo
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Combinare i nuovi dati con i dati esistenti
  const combinedData = [...newData, ...data];

  // Ordina i dati per DataOraIncidente
  combinedData.sort((a, b) => a.DataOraIncidente - b.DataOraIncidente);

  return combinedData;
}








