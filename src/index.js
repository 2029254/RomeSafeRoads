
function updatePlotsBasingOnSelectedYear(){
  let selectedYear = document.getElementById("yearMenu").value;
  let csvFileName = "dataset/processed/";
  switch(selectedYear) {
    case '2022':
      csvFileName = csvFileName.concat("verticalBarChartData2022.csv")
      break;
    case '2021':
      csvFileName = csvFileName.concat("verticalBarChartData2021.csv")
      break;
    case '2020':
      csvFileName = csvFileName.concat("verticalBarChartData2020.csv")
      break;
    case '2019':
      csvFileName = csvFileName.concat("verticalBarChartData2019.csv")
      break;
    default:
      csvFileName = csvFileName.concat("verticalBarChartData2022.csv")
  }

  barChartSvg.selectAll("*").remove();
  drawVerticalBarChart(csvFileName);


  let removeAllButtons = document.querySelectorAll(".circular-button");
  removeAllButtons.forEach(function(button) {button.remove();});
  createHTMLButtons();


}