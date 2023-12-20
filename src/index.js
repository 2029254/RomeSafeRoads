const slider = document.getElementById("yearSlider");
const decrementButton = document.getElementById("decrementButton");
const incrementButton = document.getElementById("incrementButton");
let titleValue = document.getElementById("title");
let periodValue = document.getElementById("period");


// Aggiorna il valore del Range Slider quando si spostano i bottoni + e -
function updateSliderValue() {
  titleValue.textContent = "Rome Road Insights " + slider.value
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


// Gestisce il clic sul pulsante +
incrementButton.addEventListener("click", () => {
  const currentValue = parseInt(slider.value);
  if (currentValue < 2022) {
    slider.value = (currentValue + 1).toString();
    updateSliderValue();
    updatePlotsBasingOnSelectedYear()

  }
});

decrementButton.addEventListener("click", () => {
  const currentValue = parseInt(slider.value);
  if (currentValue > 2019) {
    slider.value = (currentValue - 1).toString();
    updateSliderValue();
    updatePlotsBasingOnSelectedYear()
  }
});



let csvFileNameChoroplethMapNature;
let csvFileNameTimeSeries;
let selectedYear;
let csvFileNameScatterPlot;

function updatePlotsBasingOnSelectedYear(){
  idPoints = 0
  arrayOfData = [];
  focusArray = [];
  focusNatureArray = [];
  infoBoxArray = [];
  infoBoxNatureArray = [];
  keysLegends = [];

  let csvFileNameVerticalBarChart = "dataset/processed/verticalBarChart/";
  let csvFileNameChoroplethMap = "dataset/processed/choroplethMap/";
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
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2022.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2022.csv")
        break;
      case '2021':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2021.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2021.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2021.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2021.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2021.csv")
        break;
      case '2020':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2020.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2020.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2020.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2020.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2020.csv")
        break;
      case '2019':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2019.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2019.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2019.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2019.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2019.csv")
        break;
      default:
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022.csv")
        csvFileNameChoroplethMapNature = csvFileNameChoroplethMapNature.concat("choroplethMapNature2022.csv")
        csvFileNameScatterPlot = csvFileNameScatterPlot.concat("PCA-2022.csv")
    }
  } else {
    csvFileNameVerticalBarChart = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
    csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap"+ selectedYear +".csv")
    csvFileNameTimeSeries = "dataset/processed/timeSeries/timeSeriesData" + selectedYear + ".csv";
    csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";
    csvFileNameScatterPlot = "dataset/processed/scatterPlot/PCA-" + selectedYear + ".csv";

  }

  barChartSvg.selectAll("*").remove();
  drawVerticalBarChart(csvFileNameVerticalBarChart);

 // let removeAllButtons = document.querySelectorAll(".circular-button");
 // removeAllButtons.forEach(function(button) {button.remove();});
  //createHTMLButtons();

  choroplethMapSvg.selectAll("*").remove();
  drawChoroplethMap(csvFileNameChoroplethMap);

  timeSeriesSvg.selectAll("*").remove();
  drawTimeSeriesChart(csvFileNameTimeSeries);

  scatterPlotpSvg.selectAll("*").remove();
  drawScatterPlot(csvFileNameScatterPlot);

}