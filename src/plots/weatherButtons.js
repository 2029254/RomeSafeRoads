// Dimensioni dei bottoni
let buttonRadius = 20;
let buttonPadding = 0; // Spazio tra i bottoni
let buttonWeatherValue
let buttonFlag = false;

const imagePaths = [
  "dataset/img/cloudy.png",
  "dataset/img/sunny.png",
  "dataset/img/rainy.png",
  "dataset/img/snowy.png",
  "dataset/img/none.png"
];
// Funzione per creare bottoni HTML
function createHTMLButtons() {
  let buttonData = ["Cloudy", "Sunny", "Rainy", "Severe", "None"];
  const buttonsContainer = document.getElementById("buttons");

  buttonData.forEach((buttonText, i) => {
    const button = document.createElement("button");
    const buttonLabel = document.createElement("div"); // Elemento per la scritta
    button.id = buttonData[i]; // Assegna un ID univoco
    button.className = "circular-button"; // Applica la classe CSS per i bottoni circolari
    button.style.marginTop = (buttonRadius * 0.8 + buttonPadding) + "px"; // Aggiungi spazio tra i bottoni
    button.style.marginLeft = "7px"; // Aggiungi spazio tra i bottoni
    button.style.backgroundSize = "cover"; // Imposta l'immagine per riempire completamente il bottone
    button.style.backgroundImage = `url(${imagePaths[i]})`; // Imposta l'immagine di sfondo del bottone
    buttonLabel.textContent = button.id; // Imposta il testo del bottone
    buttonLabel.style.color = "white"; // Aggiungi spazio tra i bottoni
    buttonLabel.style.fontSize = "9px"; // Aggiungi spazio tra i bottoni
    buttonLabel.style.marginTop = "25px"; // Aggiungi spazio tra i bottoni
    //buttonLabel.style.marginLeft = "-1.5px"; // Aggiungi spazio tra i bottoni
    buttonLabel.style.alignContent = "center"; // Aggiungi spazio tra i bottoni

    button.addEventListener("click", function () {

      buttonLabel.style.color = "black"; // Mostra il buttonLabel al passaggio del mouse
      button.style.transform = "scale(1.2)";
      buttonWeatherValue = this.id
      let year = document.getElementById("yearSlider").value;
      if (buttonWeatherValue === "None") {
        buttonFlag = false;
        updatePlotsBasingOnSelectedYear();
      }
      else {
        buttonFlag = true;
        let csvFileNameVerticalBarChart = "dataset/processed/weather/" + year + "/general-accidents/generalAccidents" + buttonWeatherValue + year + ".csv";
        let csvFileNameChoroplethMap = "dataset/processed/weather/" + year + "/deaths/deathsAccidents" + buttonWeatherValue + year + ".csv";

        barChartSvg.selectAll("*").remove();
        drawVerticalBarChart(csvFileNameVerticalBarChart);

        choroplethMapSvg.selectAll("*").remove();
        drawChoroplethMap(csvFileNameChoroplethMap);
      }

    });

    button.addEventListener("mouseover", function () {
      buttonLabel.style.color = "black"; // Mostra il buttonLabel al passaggio del mouse
      button.style.transform = "scale(1.2)";
    });

    button.addEventListener("mouseout", function () {
      if (!buttonFlag) {
        buttonLabel.style.color = "white";// Mostra il buttonLabel al passaggio del mouse
        button.style.transform = "scale(1)";
      }
    });

    button.appendChild(buttonLabel); // Aggiungi il buttonLabel come figlio del bottone
    buttonsContainer.appendChild(button);
  });

}