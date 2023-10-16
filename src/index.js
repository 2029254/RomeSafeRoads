
function updatePlotsBasingOnSelectedYear(){

  let selectedYear = document.getElementById("yearMenu").value;
  console.log(selectedYear)
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
/*
  // retrieve current year
    d3.csv(csvFileName, function(data) {
    //return data

    // sort in ascending order
    data.sort(function(a) {
      return d3.ascending(parseFloat(a['NumeroIncidenti']));
    });
  });
 */

  //ora aggiorno i grafici che mostrano la citta selezionata
  //svgVerticalBarChart.selectAll("*").remove();
  drawVerticalBarChart(csvFileName);

}