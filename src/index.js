
function updatePlotsBasingOnSelectedYear(){
  let selectedYear = document.getElementById("yearMenu").value;
  let csvFileNameVerticalBarChart = "dataset/processed/";
  let csvFileNameChoroplethMap = "dataset/processed/";

  switch(selectedYear) {
    case '2022':
      csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
      csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")
      break;
    case '2021':
      csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2021.csv")
      csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2021.csv")
      break;
    case '2020':
      csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2020.csv")
      csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2020.csv")
      break;
    case '2019':
      csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2019.csv")
      csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2019.csv")
      break;
    default:
      csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
      csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")

  }

  barChartSvg.selectAll("*").remove();
  drawVerticalBarChart(csvFileNameVerticalBarChart);


  let removeAllButtons = document.querySelectorAll(".circular-button");
  removeAllButtons.forEach(function(button) {button.remove();});
  createHTMLButtons();

  choroplethMapSvg.selectAll("*").remove();
  drawChoroplethMap(csvFileNameChoroplethMap);

  timeSeriesSvg.selectAll("*").remove();
  drawTimeSeriesChart();


}