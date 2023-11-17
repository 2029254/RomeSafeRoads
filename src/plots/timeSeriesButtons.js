
var buttonsTimeSeries = d3.select("#container1")
console.log(buttonsTimeSeries)

document.addEventListener('DOMContentLoaded', function () {
  $('#option1Collapse, #option2Collapse').on('show.bs.collapse', function () {
    // Chiude tutti gli altri collapse aperti
    $('#option1Collapse, #option2Collapse').not(this).collapse('hide');
  });
});

  buttonsTimeSeries.on('click', function () {
    buttonsTimeSeries.style('background-color', '#e6e1d5');
    if (buttonsTimeSeries !== this.id) {
      let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
      buttonWeatherValueNew.style.backgroundColor = "white";
      buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
      buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
      buttonWeatherValueNew.style.transform = "scale(1)";
      buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;
    }
  });


