//var choroplethMapSvg = d3.select("#choroplethMapSvg");

// append the svg object to the body of the page
var choroplethMapSvg = d3.select("#choroplethMap")
    .append("div")
    //.attr("id", "map")
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
let projection;
let groupedByTownHall;

function drawChoroplethMap(csvFileNameChoroplethMap) {

  // function to get and filter csv data
  d3.csv(csvFileNameChoroplethMap, function (data) {
    dataAboutTownHall = data.filter(function (row) {
      return row['Municipio'];
    });

// Definisci la proiezione geografica
  projection = d3.geoMercator()
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
      .style("fill", function(d) {
        // Verifica se csvFileNameChoroplethMap contiene la parola "general"
        if (csvFileNameChoroplethMap.includes("general")) {
          // Se sì, chiama la funzione setBarColorChoroplethMap
          return setBarColorChoroplethMapGeneral(d);
        } else {
          // Altrimenti, chiama un'altra funzione
          return setBarColorChoroplethMap(d);
        }
      }) // Colore di riempimento
      .on("click", function (d) {
        switchWeatherInput.value = 'ON'
        switchWeatherInput.checked = true;
        sliderWeatherSwitch.style.backgroundColor = '#facdcd'
        sliderWeatherSwitch.classList.toggle('checked', switchWeatherInput.checked);
        weatherOnLabel.style.display = "none";
        weatherOffLabel.style.display = "block";
        let loader = document.getElementById("loader");
        loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
        barChartSvg.style("opacity", 0.3);

        document.getElementById("Cloudy").disabled = true;
        document.getElementById("Sunny").disabled = true;
        document.getElementById("Rainy").disabled = true;
        document.getElementById("Severe").disabled = true;

        // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
        document.getElementById("Cloudy").classList.add("disabled");
        document.getElementById("Sunny").classList.add("disabled");
        document.getElementById("Rainy").classList.add("disabled");
        document.getElementById("Severe").classList.add("disabled");

        let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
        let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
        buttonWeatherValueNew.style.backgroundColor = "white";
        labelWeatherValue.style.color = "#f7f3eb";
        buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
        buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
        buttonWeatherValueNew.style.transform = "scale(1)";
        buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;

        let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);

        if (townHallAndAccidentsNumber !== undefined) {
            accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti;

            //click solo su aree con numeroincidenti>1
            if (accidentsNumber > 1) {

                console.log(d.properties.nome)
                townHallClicked = true;

              selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');

              if (selectedRadioButton.id === "General")
                csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNatureGeneral" + selectedYear + ".csv";
              else
                csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";

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

                  setTimeout(function () {
                    barChartSvg.selectAll("*").remove();
                    drawAxesAndBarsFromChoroplethMap(resultVerticalChart, true);
                    drawColorsLegend();
                   // keysLegends = [];
                   // timeSeriesSvg.selectAll("*").remove();
                   // drawTimeSeriesChart(csvFileNameTimeSeries);
                    loader.style.display = "none";
                    barChartSvg.style("opacity", 1);
                  }, 2000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

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

                      tooltipChor.html(d.properties.nome + "<br>" + "<tspan style='font-weight: bold;'>" + "accidents: "+ accidentsNumber + "</tspan>")
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

    var legendCells = [];
      legendCells = [1, 2, 4, 8, 16, 2000, 3500, 5000, 6500]; // Valori per le celle

  choroplethMapSvg.selectAll("rect")
    .data(legendCells)
    .enter()
    .append("rect")
    .attr("x",  500) // Posiziona le celle orizzontalmente
    //.attr("y",  (d, i) => i * 31)
    .attr("y",  (d,i) => 48 + 31 * i)
    .attr("width", 8) // Larghezza delle celle
    .attr("height", 30)
    .style("fill", function (d,i) {
      if(csvFileNameChoroplethMap.includes("general"))
      return setLegendColorsChoroplethMapGeneral(legendCells[i])
      else
      return setLegendColorsChoroplethMap(legendCells[i])

    }); // Colora le celle in base al valore

  choroplethMapSvg.selectAll("text")
    .data(legendCells)
    .enter()
    .append("text")
    .attr("x", 518 ) // Posiziona le etichette al centro delle celle
    .attr("y", (d, i) => i * 30.7 + 82 )
    .style("font-family", "Lora")
    .text((d) => `${d}`); // Testo dell'etichetta

  choroplethMapSvg.selectAll("line")
    .data(legendCells) // Ignora l'ultimo valore
    .enter()
    .append("line")
    .attr("x1", 500)
    .attr("y1", (d,i) => 78.5 + 31 * i) // Inizio della lineetta
    .attr("x2", 511)
    .attr("y2", (d,i) => 78.5 + 31 * i) // Fine della lineetta
    .style("stroke", "black")
    .style("stroke-width", "1px");
  });
  }

function drawChoroplethMapFromTimeSeries(formattedStartDate, formattedEndDate) {
   selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');
   let csvFileNameChoroplethMapTwo
    if (selectedRadioButton.id === "General")
      csvFileNameChoroplethMapTwo = "dataset/processed/choroplethMap/" + "choroplethMapDailyGeneral" + selectedYear + ".csv";
      else
      csvFileNameChoroplethMapTwo = "dataset/processed/choroplethMap/" + "choroplethMapDaily" + selectedYear + ".csv";

  // function to get and filter csv data
  d3.csv(csvFileNameChoroplethMapTwo, function (data) {
    var filteredData = data.filter(function (row) {
      var rowDataOraIncidente = row['DataOraIncidente'];
      return rowDataOraIncidente >= formattedStartDate && rowDataOraIncidente <= formattedEndDate;
    });

    groupedByTownHall = new Map();
    filteredData.forEach(item => {
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
    console.log(incidentCounts)


    // Definisci la proiezione geografica
    projection = d3.geoMercator()
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
        .style("fill",function (d) {
          return setBarColorChoroplethMapFromOtherCharts(d)}) // Colore di riempimento
        .on("mouseover",  function(d) {
          let townHallAndAccidentsNumber = groupedByTownHall.get(d.properties.nome);
          if (townHallAndAccidentsNumber !== undefined) {
            accidentsNumber = townHallAndAccidentsNumber.length; // Se il comune è presente, ottieni il numero di incidenti
          } else
            accidentsNumber = 0; // Se il comune non è presente, impostalo su 0

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

          }
        })
        .on("mouseout", handleMouseOutChoroplethMap)
        .on("mousemove",  function(d) {
          tooltipChor = d3.select("#popupChoropleth");
          tooltipChor.style("opacity", 0.9);

          tooltipChor.html(d.properties.nome + "<br>" + "<tspan style='font-weight: bold;'>accidents:" + ": "+ accidentsNumber + "</tspan>")
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

        var legendCells = [];
          legendCells = [1, 2, 4, 8, 16, 2000, 3500, 5000, 6500]; // Valori per le celle

      choroplethMapSvg.selectAll("rect")
        .data(legendCells)
        .enter()
        .append("rect")
        .attr("x",  500) // Posiziona le celle orizzontalmente
        //.attr("y",  (d, i) => i * 31)
        .attr("y",  (d,i) => 48 + 31 * i)
        .attr("width", 8) // Larghezza delle celle
        .attr("height", 30)
        .style("fill", function (d,i) {
          if(csvFileNameChoroplethMap.includes("general"))
          return setLegendColorsChoroplethMapGeneral(legendCells[i])
          else
          return setLegendColorsChoroplethMap(legendCells[i])

        }); // Colora le celle in base al valore


  choroplethMapSvg.selectAll("text")
    .data(legendCells)
    .enter()
    .append("text")
    .attr("x", 518 ) // Posiziona le etichette al centro delle celle
    .attr("y", (d, i) => i * 30.7 + 82 )
    .style("font-family", "Lora")
    .text((d) => `${d}`); // Testo dell'etichetta

  choroplethMapSvg.selectAll("line")
    .data(legendCells) // Ignora l'ultimo valore
    .enter()
    .append("line")
    .attr("x1", 500)
    .attr("y1", (d,i) => 78.5 + 31 * i) // Inizio della lineetta
    .attr("x2", 511)
    .attr("y2", (d,i) => 78.5 + 31 * i) // Fine della lineetta
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

function setBarColorChoroplethMapFromOtherCharts(d) {
  let townHallAndAccidentsNumber = groupedByTownHall.get(d.properties.nome);
  if (townHallAndAccidentsNumber !== undefined) {
    accidentsNumber = townHallAndAccidentsNumber.length; // Se il comune è presente, ottieni il numero di incidenti
  } else
    accidentsNumber = 0; // Se il comune non è presente, impostalo su 0

  if (townHallAndAccidentsNumber !== undefined) {

    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#f7fbff"
    else if (accidentsNumber > 1 && accidentsNumber <= 2)
      return "#deebf7";
    else if (accidentsNumber > 2 && accidentsNumber <= 4)
      return "#c6dbef";
    else if (accidentsNumber > 4 && accidentsNumber <= 8)
      return "#9ecae1";
    else if (accidentsNumber > 8 && accidentsNumber <=  16)
      return "#6baed6";
    else if (accidentsNumber > 16 && accidentsNumber <= 2000)
      return "#4292c6";
    else if (accidentsNumber > 2000 && accidentsNumber <= 3500)
      return "#2171b5";
    else if (accidentsNumber > 3500 && accidentsNumber <= 5000)
      return "#08519c";
    else if (accidentsNumber > 5000 && accidentsNumber <= 6500)
      return "#08306b";
    else
      return "#08306b";
  } else
    return "#ffffff";
}

function setBarColorChoroplethMapGeneral(d) {
  let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);

  if (townHallAndAccidentsNumber !== undefined) {
    let accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti

    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#f7fbff"
    else if (accidentsNumber > 1 && accidentsNumber <= 2)
      return "#deebf7";
    else if (accidentsNumber > 2 && accidentsNumber <= 4)
      return "#c6dbef";
    else if (accidentsNumber > 4 && accidentsNumber <= 8)
      return "#9ecae1";
    else if (accidentsNumber > 8 && accidentsNumber <=  16)
      return "#6baed6";
    else if (accidentsNumber > 16 && accidentsNumber <= 2000)
      return "#4292c6";
    else if (accidentsNumber > 2000 && accidentsNumber <= 3500)
      return "#2171b5";
    else if (accidentsNumber > 3500 && accidentsNumber <= 5000)
      return "#08519c";
    else if (accidentsNumber > 5000 && accidentsNumber <= 6500)
      return "#08306b";
    else
      return "#08306b";
  } else
    return "#f7fbff";
}

function setBarColorChoroplethMap(d) {
    //console.log("CISOCOCFOOD")
    //console.log(d)
  let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === d.properties.nome);
    //console.log(townHallAndAccidentsNumber)
  if (townHallAndAccidentsNumber !== undefined) {
    let accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti
    //console.log("VEDIAMO QUAUNTI: "+ accidentsNumber)

    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#f7fbff"
    else if (accidentsNumber > 1 && accidentsNumber <= 2)
      return "#deebf7";
    else if (accidentsNumber > 2 && accidentsNumber <= 4)
      return "#c6dbef";
    else if (accidentsNumber > 4 && accidentsNumber <= 8)
      return "#9ecae1";
    else if (accidentsNumber > 8 && accidentsNumber <=  16)
      return "#6baed6";
    else if (accidentsNumber > 1000 && accidentsNumber <= 2500)
      return "#4292c6";
    else if (accidentsNumber > 2500 && accidentsNumber <= 3500)
      return "#2171b5";
    else if (accidentsNumber > 3500 && accidentsNumber <= 5000)
      return "#08519c";
    else if (accidentsNumber > 5000 && accidentsNumber <= 6500)
      return "#08306b";
    else
      return "#08306b";
  } else
    return "#f7fbff";
}

function setLegendColorsChoroplethMapGeneral(accidentsNumber) {
    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#f7fbff"
    else if (accidentsNumber > 1 && accidentsNumber <= 2)
      return "#deebf7";
    else if (accidentsNumber > 2 && accidentsNumber <= 4)
      return "#c6dbef";
    else if (accidentsNumber > 4 && accidentsNumber <= 8)
      return "#9ecae1";
    else if (accidentsNumber > 8 && accidentsNumber <=  16)
      return "#6baed6";
    else if (accidentsNumber > 1000 && accidentsNumber <= 2500)
      return "#4292c6";
    else if (accidentsNumber > 2500 && accidentsNumber <= 3500)
      return "#2171b5";
    else if (accidentsNumber > 3500 && accidentsNumber <= 5000)
      return "#08519c";
    else if (accidentsNumber > 5000 && accidentsNumber <= 6500)
      return "#08306b";
    else
      return "#08306b";
}
function setLegendColorsChoroplethMap(accidentsNumber) {

    if (accidentsNumber > 0 && accidentsNumber <= 1)
      return "#f7fbff"
    else if (accidentsNumber > 1 && accidentsNumber <= 2)
      return "#deebf7";
    else if (accidentsNumber > 2 && accidentsNumber <= 4)
      return "#c6dbef";
    else if (accidentsNumber > 4 && accidentsNumber <= 8)
      return "#9ecae1";
    else if (accidentsNumber > 8 && accidentsNumber <=  16)
      return "#6baed6";
    else if (accidentsNumber > 1000 && accidentsNumber <= 2500)
      return "#4292c6";
    else if (accidentsNumber > 2500 && accidentsNumber <= 3500)
      return "#2171b5";
    else if (accidentsNumber > 3500 && accidentsNumber <= 5000)
      return "#08519c";
    else if (accidentsNumber > 5000 && accidentsNumber <= 6500)
      return "#08306b";
    else
      return "#08306b";

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

let map; // Definisci una variabile globale per la mappa

function drawMapWithStreet(csvFileNameChoroplethMap) {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsYXJpZXRpIiwiYSI6ImNsdDdoeTVsZTAxcnMya25jcXhpb3F5czIifQ._ky2_tL4UyzLmrLkhzCv2Q';

    // Se la mappa non è stata ancora creata, creiamola
    if (!map) {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/danielarieti/cltd8ma5k002d01qp82p96d0n',
            center: [12.4964, 41.9028], // Coordinate di Roma
            zoom: 8.5, // Livello di zoom iniziale
            minZoom: 8.5, // Imposta lo zoom minimo
        });
        map.on('load', function() {
            // Aggiungi i dati dei confini municipali
            map.addSource('municipi', {
                'type': 'geojson',
                'data': 'dataset/source/choropleth-map/municipi.geojson'
            });
            //colorizeMap(csvFileNameChoroplethMap);

            // Stile per i confini municipali
            map.addLayer({
                'id': 'municipi-layer',
                'type': 'line',
                'source': 'municipi',
                'layout': {},
                'paint': {
                    'line-color': '#bdb49b',
                    'line-width': 0.3,
                    'line-opacity': 0.5 // Opacità delle linee dei comuni
                }
            });

        });
    } else {
        // Se la mappa esiste già, rimuovi solo i layer aggiuntivi, ma lascia il layer di base
       map.once('style.load', function() {
            // Rimuovi tutti i layer aggiuntivi
            const layers = map.getStyle().layers;
            console.log(layers)
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (layer.id !== 'background' && layer.id !== 'municipi-layer') {
                    map.removeLayer(layer.id);
                }
            }

            // Rimuovi tutti i source aggiuntivi
            const sources = Object.keys(map.getStyle().sources);
            sources.forEach(function(source) {
                if (source !== 'municipi') {
                    map.removeSource(source);
                }
            });
            //colorizeMap(csvFileNameChoroplethMap);

            // Aggiungi di nuovo i dati dei confini municipali
            map.addSource('municipi', {
                'type': 'geojson',
                'data': 'dataset/source/choropleth-map/municipi.geojson'
            });

            // Aggiungi di nuovo lo stile per i confini municipali
            map.addLayer({
                'id': 'municipi-layer',
                'type': 'line',
                'source': 'municipi',
                'layout': {},
                'paint': {
                    'line-color': '#bdb49b',
                    'line-width': 0.3,
                    'line-opacity': 0.5 // Opacità delle linee dei comuni
                }
            });
        });
    }
        if(switchBrushInput.value === "ON"){
          colorizeMapFromTimeSeries(formattedStartDate, formattedEndDate)
        } else {
        //console.log(switchBrushInput.value)
          colorizeMap(csvFileNameChoroplethMap);
        }
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function colorizeMap(csvFileNameChoroplethMap) {
  // function to get and filter csv data
  d3.csv(csvFileNameChoroplethMap, function (data) {
    dataAboutTownHall = data.filter(function (row) {
      return row['Municipio'];
    });
    // Carica i dati dei comuni di Roma
    fetch("dataset/source/choropleth-map/municipi.geojson")
        .then(response => response.json())
        .then(data => {
             // Rimuovi tutti i layer 'municipi-fill-' esistenti
            //removeMunicipiLayers();
            // Rimuovi tutti i layer aggiuntivi
            const layers = map.getStyle().layers;
            let municipiLayerRemoved = false;
            layers.forEach(function(layer) {
                if (layer.id.startsWith('municipi-fill-')) {
                    if (map.getLayer(layer.id)) { // Verifica se il layer esiste nella mappa
                        map.removeLayer(layer.id);
                        municipiLayerRemoved = true;
                        //console.log('Layer ' + layer.id + ' removed');
                    } else {
                        //console.log('Layer ' + layer.id + ' does not exist');
                    }
                }
            });

            data.features.forEach(function(element) {
             const randomSuffix = generateRandomString(30);
             //console.log(randomSuffix)
             const layerId = 'municipi-fill-' + element.properties.nome + '-' + randomSuffix;
             //console.log(layerId)
                map.addLayer({
                    'id': layerId,
                    'type': 'fill',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': element.geometry
                        }
                    },
                    'layout': {},
                    'paint': {
                        'fill-color': setBarColorChoroplethMap(element),
                        'fill-opacity': 1,
                        'fill-outline-color': 'black'
                    }
                }, 'road-path'); // Aggiungi sotto il layer delle strade


            // Aggiungi l'evento mouseover
            map.on('mousemove', layerId, function(e) {
                // Estrai il nome del municipio dall'ID del layer
                let layer_Id = e.features[0].layer.id;
                let municipio = layer_Id.replace('municipi-fill-', ''); // Rimuovi il prefisso "municipi-fill-"
                const parts = municipio.split('-'); // Dividi la stringa in base al carattere '-'
                const municipioAttuale = parts[0]; // Ottieni la parte prima del primo '-'
                const stringaRandom = parts[1];
                //console.log(municipioAttuale)

                // Trova il numero di incidenti per il municipio corrente
                let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === municipioAttuale);
                let accidentsNumber = townHallAndAccidentsNumber ? townHallAndAccidentsNumber.NumeroIncidenti : 0;

                console.log(accidentsNumber); //Numero di incidenti per il municipio corrente
                // Imposta l'opacità del layer corrente a 1 e degli altri a 0.3
                map.setPaintProperty('municipi-fill-' + municipioAttuale + "-" + stringaRandom, 'fill-opacity', 1);
                map.getStyle().layers.forEach(function(layer) {
                    if (layer.id.startsWith('municipi-fill-') && layer.id !== 'municipi-fill-' + municipioAttuale + "-" + stringaRandom) {
                        map.setPaintProperty(layer.id, 'fill-opacity', 0.4);
                    }
                });
                // Creazione e visualizzazione del tooltip
                tooltipChor = d3.select("#popupChoropleth");
                tooltipChor.style("opacity", 0.9);
                tooltipChor.html(municipioAttuale + "<br>" + "<tspan style='font-weight: bold;'>" + "accidents: "+ accidentsNumber + "</tspan>")
                    .style("color", "#524a32")
                    .style("font-family", "Lora")
                    .style("font-size", "10px")
                    .style("left", (e.originalEvent.clientX + 9 + "px")) // Utilizza e.originalEvent per accedere all'evento mouse nativo
                    .style("top", (e.originalEvent.clientY - 9 + "px"));
            });

            // Ripristina lo stile originale al mouseleave
            map.on('mouseout', layerId, function(e) {
                map.getStyle().layers.forEach(function(layer) {
                    if (layer.id.startsWith('municipi-fill-')) {
                        map.setPaintProperty(layer.id, 'fill-opacity', 1);
                    }
                });
                  tooltipChor = d3.select("#popupChoropleth");
                  tooltipChor.style("opacity", 0);
            });


            map.on('click', layerId, function(e) {
                // Estrai il nome del municipio dall'ID del layer
                let layer_Id = e.features[0].layer.id;
                let municipio = layer_Id.replace('municipi-fill-', ''); // Rimuovi il prefisso "municipi-fill-"
                const parts = municipio.split('-'); // Dividi la stringa in base al carattere '-'
                const municipioAttuale = parts[0]; // Ottieni la parte prima del primo '-'
                const stringaRandom = parts[1];

                // Trova il numero di incidenti per il municipio corrente
                let townHallAndAccidentsNumber = dataAboutTownHall.find((element) => element.Municipio === municipioAttuale);
                let accidentsNumber = townHallAndAccidentsNumber ? townHallAndAccidentsNumber.NumeroIncidenti : 0;
                    switchWeatherInput.value = 'ON'
                    switchWeatherInput.checked = true;
                    sliderWeatherSwitch.style.backgroundColor = '#facdcd'
                    sliderWeatherSwitch.classList.toggle('checked', switchWeatherInput.checked);
                    weatherOnLabel.style.display = "none";
                    weatherOffLabel.style.display = "block";
                    let loader = document.getElementById("loader");
                    loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
                    barChartSvg.style("opacity", 0.3);

                    document.getElementById("Cloudy").disabled = true;
                    document.getElementById("Sunny").disabled = true;
                    document.getElementById("Rainy").disabled = true;
                    document.getElementById("Severe").disabled = true;

                    // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
                    document.getElementById("Cloudy").classList.add("disabled");
                    document.getElementById("Sunny").classList.add("disabled");
                    document.getElementById("Rainy").classList.add("disabled");
                    document.getElementById("Severe").classList.add("disabled");

                    let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
                    let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
                    buttonWeatherValueNew.style.backgroundColor = "white";
                    labelWeatherValue.style.color = "#f7f3eb";
                    buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
                    buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
                    buttonWeatherValueNew.style.transform = "scale(1)";
                    buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;


                    if (townHallAndAccidentsNumber !== undefined) {
                        accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti;

                        //click solo su aree con numeroincidenti>1
                        if (accidentsNumber > 1) {


                            townHallClicked = true;
                          selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');

                          if (selectedRadioButton.id === "General")
                            csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNatureGeneral" + selectedYear + ".csv";
                          else
                            csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";

                            d3.csv(csvFileNameChoroplethMapNature, function (data) {
                              let dataResult = [];
                              data.filter(function (row) {
                                if (row['Municipio'] === municipioAttuale.toString())
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


                              const finalDataset = Object.values(incidentiRaggruppati).map(({ Data, ...rest }) => ({ DataOraIncidente: Data, ...rest }));

                              console.log(finalDataset)

                              finalDataset.forEach(d => {
                                d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
                              });

                              finalDataset.forEach(d => {
                                  console.log(d)
                              });

                              const finalDatasetWithMissingDates = addMissingDatesWithZeroes(finalDataset);

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

                              setTimeout(function () {
                                barChartSvg.selectAll("*").remove();
                                drawAxesAndBarsFromChoroplethMap(resultVerticalChart, true);
                                drawColorsLegend();
                                loader.style.display = "none";
                                barChartSvg.style("opacity", 1);
                              }, 2000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

                              })
                            }
                        }
            });

          });
        })
        .catch(error => {
            console.error("Errore nel caricamento dei dati:", error);
        });
      });
}

function colorizeMapFromTimeSeries(formattedStartDate, formattedEndDate) {
   console.log("DATA INIZIO: "+ formattedStartDate + " " + "DATA FINE: " + formattedEndDate)
   selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');
   let csvFileNameChoroplethMapTwo;
    if (selectedRadioButton.id === "General")
      csvFileNameChoroplethMapTwo = "dataset/processed/choroplethMap/" + "choroplethMapDailyGeneral" + selectedYear + ".csv";
      else
      csvFileNameChoroplethMapTwo = "dataset/processed/choroplethMap/" + "choroplethMapDaily" + selectedYear + ".csv";
  // function to get and filter csv data
  d3.csv(csvFileNameChoroplethMapTwo, function (data) {
    var filteredData = data.filter(function (row) {
      var rowDataOraIncidente = row['DataOraIncidente'];
      return rowDataOraIncidente >= formattedStartDate && rowDataOraIncidente <= formattedEndDate;
    });

    groupedByTownHall = new Map();
    filteredData.forEach(item => {
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
    //console.log("GHHHHHHHHHHHHHHHHHHHHHHHHHH: ")
    //console.log(incidentCounts)
    // Carica i dati dei comuni di Roma
    console.log("ciaociaociao")
    fetch("dataset/source/choropleth-map/municipi.geojson")
        .then(response => response.json())
        .then(data => {

            // Rimuovi tutti i layer aggiuntivi
            const layers = map.getStyle().layers;
            let municipiLayerRemoved = false;
            layers.forEach(function(layer) {
                if (layer.id.startsWith('municipi-fill-')) {
                    if (map.getLayer(layer.id)) { // Verifica se il layer esiste nella mappa
                        map.removeLayer(layer.id);
                        municipiLayerRemoved = true;
                        console.log('Layer ' + layer.id + ' removed');
                    } else {
                        console.log('Layer ' + layer.id + ' does not exist');
                    }
                }
            });
             console.log("ooooooooooooooooooooooo")
            data.features.forEach(function(element) {
             const randomSuffix = generateRandomString(30);
             console.log(randomSuffix)
             const layerId = 'municipi-fill-' + element.properties.nome + '-' + randomSuffix;
             //console.log(layerId)
                map.addLayer({
                    'id': layerId,
                    'type': 'fill',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': element.geometry
                        }
                    },
                    'layout': {},
                    'paint': {
                        'fill-color': setBarColorChoroplethMapFromOtherCharts(element),
                        'fill-opacity': 1,
                        'fill-outline-color': 'black'
                    }
                }, 'road-path'); // Aggiungi sotto il layer delle strade


            // Aggiungi l'evento mouseover
            map.on('mousemove', layerId, function(e) {
                // Estrai il nome del municipio dall'ID del layer
                let layer_Id = e.features[0].layer.id;
                let municipio = layer_Id.replace('municipi-fill-', ''); // Rimuovi il prefisso "municipi-fill-"
                const parts = municipio.split('-'); // Dividi la stringa in base al carattere '-'
                const municipioAttuale = parts[0]; // Ottieni la parte prima del primo '-'
                const stringaRandom = parts[1];
                //console.log(municipioAttuale)

                // Trova il numero di incidenti per il municipio corrente
                //let townHallAndAccidentsNumber = incidentCounts.find((element) => element.Municipio === municipioAttuale);
                let townHallAndAccidentsNumber = incidentCounts.get(municipioAttuale);
                console.log("MARCIO: ")
                console.log(townHallAndAccidentsNumber)
                let accidentsNumber = townHallAndAccidentsNumber ? townHallAndAccidentsNumber : 0;

                console.log(accidentsNumber); //Numero di incidenti per il municipio corrente
                // Imposta l'opacità del layer corrente a 1 e degli altri a 0.3
                map.setPaintProperty('municipi-fill-' + municipioAttuale + "-" + stringaRandom, 'fill-opacity', 1);
                map.getStyle().layers.forEach(function(layer) {
                    if (layer.id.startsWith('municipi-fill-') && layer.id !== 'municipi-fill-' + municipioAttuale + "-" + stringaRandom) {
                        map.setPaintProperty(layer.id, 'fill-opacity', 0.4);
                    }
                });
                // Creazione e visualizzazione del tooltip
                tooltipChor = d3.select("#popupChoropleth");
                tooltipChor.style("opacity", 0.9);
                tooltipChor.html(municipioAttuale + "<br>" + "<tspan style='font-weight: bold;'>" + "accidents: "+ accidentsNumber + "</tspan>")
                    .style("color", "#524a32")
                    .style("font-family", "Lora")
                    .style("font-size", "10px")
                    .style("left", (e.originalEvent.clientX + 9 + "px")) // Utilizza e.originalEvent per accedere all'evento mouse nativo
                    .style("top", (e.originalEvent.clientY - 9 + "px"));
            });

            // Ripristina lo stile originale al mouseleave
            map.on('mouseout', layerId, function(e) {
                map.getStyle().layers.forEach(function(layer) {
                    if (layer.id.startsWith('municipi-fill-')) {
                        map.setPaintProperty(layer.id, 'fill-opacity', 1);
                    }
                });
                  tooltipChor = d3.select("#popupChoropleth");
                  tooltipChor.style("opacity", 0);
            });


            map.on('click', layerId, function(e) {
                // Estrai il nome del municipio dall'ID del layer
                let layer_Id = e.features[0].layer.id;
                let municipio = layer_Id.replace('municipi-fill-', ''); // Rimuovi il prefisso "municipi-fill-"
                const parts = municipio.split('-'); // Dividi la stringa in base al carattere '-'
                const municipioAttuale = parts[0]; // Ottieni la parte prima del primo '-'
                const stringaRandom = parts[1];

                // Trova il numero di incidenti per il municipio corrente
                //let townHallAndAccidentsNumber = incidentCounts.find((element) => element.Municipio === municipioAttuale);
                let townHallAndAccidentsNumber = incidentCounts.get(municipioAttuale);
                let accidentsNumber = townHallAndAccidentsNumber ? townHallAndAccidentsNumber : 0;
                    switchWeatherInput.value = 'ON'
                    switchWeatherInput.checked = true;
                    sliderWeatherSwitch.style.backgroundColor = '#facdcd'
                    sliderWeatherSwitch.classList.toggle('checked', switchWeatherInput.checked);
                    weatherOnLabel.style.display = "none";
                    weatherOffLabel.style.display = "block";
                    let loader = document.getElementById("loader");
                    loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
                    barChartSvg.style("opacity", 0.3);

                    document.getElementById("Cloudy").disabled = true;
                    document.getElementById("Sunny").disabled = true;
                    document.getElementById("Rainy").disabled = true;
                    document.getElementById("Severe").disabled = true;

                    // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
                    document.getElementById("Cloudy").classList.add("disabled");
                    document.getElementById("Sunny").classList.add("disabled");
                    document.getElementById("Rainy").classList.add("disabled");
                    document.getElementById("Severe").classList.add("disabled");

                    let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
                    let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
                    buttonWeatherValueNew.style.backgroundColor = "white";
                    labelWeatherValue.style.color = "#f7f3eb";
                    buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
                    buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
                    buttonWeatherValueNew.style.transform = "scale(1)";
                    buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;


                    if (townHallAndAccidentsNumber !== undefined) {
                        accidentsNumber = townHallAndAccidentsNumber.NumeroIncidenti;

                        //click solo su aree con numeroincidenti>1
                        if (accidentsNumber > 1) {


                            townHallClicked = true;

                          selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');

                          if (selectedRadioButton.id === "General")
                            csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNatureGeneral" + selectedYear + ".csv";
                          else
                            csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";

                            d3.csv(csvFileNameChoroplethMapNature, function (data) {
                              let dataResult = [];
                              data.filter(function (row) {
                                if (row['Municipio'] === municipioAttuale.toString())
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
                              console.log("PROVIAMO CHE SUCCEDE")
                              console.log(incidentiRaggruppati)


                              const finalDataset = Object.values(incidentiRaggruppati).map(({ Data, ...rest }) => ({ DataOraIncidente: Data, ...rest }));

                              console.log(finalDataset)

                              finalDataset.forEach(d => {
                                d.NumeroIncidenti = parseInt(d.NumeroIncidenti);
                              });

                              finalDataset.forEach(d => {
                                  console.log(d)
                              });

                              const finalDatasetWithMissingDates = addMissingDatesWithZeroes(finalDataset);

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

                              setTimeout(function () {
                                barChartSvg.selectAll("*").remove();
                                drawAxesAndBarsFromChoroplethMap(resultVerticalChart, true);
                                drawColorsLegend();
                                loader.style.display = "none";
                                barChartSvg.style("opacity", 1);
                              }, 2000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

                              })
                            }
                        }
            });

          });
        })
        .catch(error => {
            console.error("Errore nel caricamento dei dati:", error);
        });
      });
}















