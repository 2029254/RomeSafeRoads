const slider = document.getElementById("yearSlider");
console.log(slider)
const decrementButton = document.getElementById("decrementButton");
const incrementButton = document.getElementById("incrementButton");
let titleValue = document.getElementById("title");
let periodValue = document.getElementById("period");
let bucketButton = document.getElementById("reset");
const resetText = document.getElementById('resetText');
let loader = document.getElementById("loader");
let loaderC = document.getElementById("loaderC");
let loaderS = document.getElementById("loaderS");
let loaderP = document.getElementById("loaderP");

// Aggiungi event listener per l'evento mouseenter per mostrare il testo
bucketButton.addEventListener('mouseenter', function() {
    resetText.style.display = 'inline';
    bucketButton.style.transform = "scale(1.09)";
});

// Aggiungi event listener per l'evento mouseleave per nascondere il testo
bucketButton.addEventListener('mouseleave', function() {
    resetText.style.display = 'none';
    bucketButton.style.transform = "scale(1)";
});

bucketButton.addEventListener("click", function () {

  loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
  loaderC.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
  loaderS.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
  loaderP.style.display = "block"; // Assicurati che il loader sia inizialmente visibile

  barChartSvg.style("opacity", 0.3);
  choroplethMapSvg.style("opacity", 0.3);
  timeSeriesSvg.style("opacity", 0.3);
  scatterPlotpSvg.style("opacity", 0.3);

  // buttonLabel.style.color = "#524a32";
  bucketButton.style.transform = "scale(1.2)";
  bucketButton.style.backgroundImage = `url(${imageClick + "None" + ".png"})`;
  let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
  let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
  buttonWeatherValueNew.style.backgroundColor = "white";
  labelWeatherValue.style.color = "#f7f3eb";
  buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
  buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
  buttonWeatherValueNew.style.transform = "scale(1)";
  buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;
  buttonWeatherValue="First"
  switchBrushInput.checked = false;
  sliderBrushSwitch.style.backgroundColor = '#facdcd'
  switchBrushInput.value = "OFF"; // Aggiorna manualmente il valore dell'input
  switchInput.checked = false;
  sliderSwitch.style.backgroundColor = '#facdcd'
  switchInput.value = "OFF"; // Aggiorna manualmente il valore dell'input
  brushOnLabel.style.display = "none";
  brushOffLabel.style.display = "block";
  onLabel.style.display = "none";
  offLabel.style.display = "block";

  sliderSwitch.classList.toggle('checked', switchInput.checked);
  sliderBrushSwitch.classList.toggle('checked', switchBrushInput.checked);

  document.getElementById("Cloudy").disabled = false;
  document.getElementById("Sunny").disabled = false;
  document.getElementById("Rainy").disabled = false;
  document.getElementById("Severe").disabled = false;

  // Aggiungi o rimuovi la classe CSS "disabled" per dare un effetto visivo ai pulsanti disabilitati
  document.getElementById("Cloudy").classList.remove("disabled");
  document.getElementById("Sunny").classList.remove("disabled");
  document.getElementById("Rainy").classList.remove("disabled");
  document.getElementById("Severe").classList.remove("disabled");


  updatePlotsBasingOnSelectedYear();
  // Imposta un timer per riportare il bottone "None" allo stato precedente dopo 2 secondi
  setTimeout(function () {
    bucketButton.style.transform = "scale(1)";
    bucketButton.style.transition = "0.5s";
    bucketButton.style.backgroundImage = `url(${imageClick + "BlackAndWhite/NoneBW.png"})`;
    // body.style.backgroundColor = "#f6fad9"
  }, 1000);
});
// Aggiorna il valore del Range Slider quando si spostano i bottoni + e -
  function updateSliderValue() {
  titleValue.textContent = "Rome Safe Roads " + slider.value
  if (slider.value === "2022")
    periodValue.textContent = " (Jan - Aug)";
  else
    periodValue.textContent = " (Jan - Dic)";

}

// Aggiorna il valore del Range Slider quando si cambia il valore del Range Slider manualmente
slider.addEventListener("input", () => {
  updateSliderValue();
  updatePlotsBasingOnSelectedYear()
});



let csvFileNameChoroplethMapNature;
let csvFileNameTimeSeries;
let selectedYear;
let csvFileNameScatterPlot;
let csvFileNameVerticalBarChart;
let csvFileNameChoroplethMap;
function updatePlotsBasingOnSelectedYear(){
  idPoints = 0
  arrayOfData = [];
  focusArray = [];
  focusNatureArray = [];
  infoBoxArray = [];
  infoBoxNatureArray = [];
  keysLegends = [];

  csvFileNameVerticalBarChart = "dataset/processed/verticalBarChart/";
  csvFileNameChoroplethMap = "dataset/processed/choroplethMap/";
  csvFileNameTimeSeries = "dataset/processed/timeSeries/";
  csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/";
  csvFileNameScatterPlot = "dataset/processed/scatterPlot/";
  selectedYear = document.getElementById("yearSlider").value;

  console.log(selectedYear)
  console.log(buttonWeatherValue)

  if (buttonWeatherValue === undefined || buttonWeatherValue === "None" || buttonWeatherValue === "First") {
    switch (selectedYear) {
      case '2022':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022Daily.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2022.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2022.csv")
        break;
      case '2021':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2021.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2021.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2021Daily.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2021.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2021.csv")
        break;
      case '2020':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2020.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2020.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2020Daily.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2020.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2020.csv")
        break;
      case '2019':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2019.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2019.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2019Daily.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2019.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2019.csv")
        break;
      default:
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022Daily.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2022.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2022.csv")
    }
  } else {
    csvFileNameVerticalBarChart = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
    csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap"+ selectedYear +".csv")
    csvFileNameTimeSeries = "dataset/processed/timeSeries/timeSeriesData" + selectedYear + "Daily.csv";
    csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";
    csvFileNameScatterPlot = "dataset/processed/scatterPlot/PCA-" + selectedYear + ".csv";

  }

  barChartSvg.selectAll("*").remove();
  drawVerticalBarChart(csvFileNameVerticalBarChart);

 // let removeAllButtons = document.querySelectorAll(".circular-button");
 // removeAllButtons.forEach(function(button) {button.remove();});
 // createHTMLButtons();

  choroplethMapSvg.selectAll("*").remove();
  drawChoroplethMap(csvFileNameChoroplethMap);

  timeSeriesSvg.selectAll("*").remove();
  drawTimeSeriesChart(csvFileNameTimeSeries);

  scatterPlotpSvg.selectAll("*").remove();
  drawScatterPlot(csvFileNameScatterPlot);

  setTimeout(function () {
    loader.style.display = "none";
    loaderC.style.display = "none";
    loaderS.style.display = "none";
    loaderP.style.display = "none";

    barChartSvg.style("opacity", 1);
    choroplethMapSvg.style("opacity", 1);
    timeSeriesSvg.style("opacity", 1);
    scatterPlotpSvg.style("opacity", 1);
  }, 2000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

}
