// Dimensioni dei bottoni
let buttonRadius = 20;
let buttonPadding = 8; // Spazio tra i bottoni
let buttonWeatherValue = "First"
let buttonFlag = false;

const imagePaths = [
  "dataset/img/BlackAndWhite/CloudyBW.png",
  "dataset/img/BlackAndWhite/SunnyBW.png",
  "dataset/img/BlackAndWhite/RainyBW.png",
  "dataset/img/BlackAndWhite/SevereBW.png",
  "dataset/img/BlackAndWhite/NoneBW.png"
];

const imageClick = "dataset/img/"
let buttonsContainer;
// Funzione per creare bottoni HTML
function createHTMLButtons() {
  let buttonData = ["Cloudy", "Sunny", "Rainy", "Severe", "First"];
  buttonsContainer = document.getElementById("buttons");

  buttonData.forEach((buttonText, i) => {
    const button = document.createElement("button");
    const buttonLabel = document.createElement("div"); // Elemento per la scritta
    if(i!==9) {
      button.id = buttonData[i]; // Assegna un ID univoco
      button.className = "circular-button"; // Applica la classe CSS per i bottoni circolari
      button.style.animation = "pop 0.5s ease-in-out";
      if (i!==0) button.style.marginTop = (buttonRadius * 1.5 + buttonPadding) + "px"; // Aggiungi spazio tra i bottoni
      //button.style.marginLeft = "0px"; // Aggiungi spazio tra i bottoni
      button.style.backgroundSize = "28px"; // Imposta l'immagine per riempire completamente il bottone
      button.style.backgroundRepeat = "no-repeat";

      button.style.backgroundColor = "white";
      button.style.backgroundPositionX = "5.2px";
      button.style.backgroundPositionY = "5px";
      button.style.backgroundImage = `url(${imagePaths[i]})`; // Imposta l'immagine di sfondo del bottone
      buttonLabel.id = "Label" + button.id; // Imposta il testo del bottone
      buttonLabel.textContent = button.id; // Imposta il testo del bottone
      buttonLabel.style.fontFamily = "Lora"
      buttonLabel.style.fontWeight = "bold"
      buttonLabel.style.color = "#f7f3eb"; // Aggiungi spazio tra i bottoni
      buttonLabel.style.fontSize = "8px"; // Aggiungi spazio tra i bottoni
      buttonLabel.style.marginTop = "25px"; // Aggiungi spazio tra i bottoni
      //buttonLabel.style.marginLeft = "-1.5px"; // Aggiungi spazio tra i bottoni
      buttonLabel.style.alignContent = "center"; // Aggiungi spazio tra i bottoni
    } else {
      button.id = buttonData[i]; // Assegna un ID univoco
      button.style.backgroundColor = "#f7f3eb";
      button.className = "bucket"; // Applica la classe CSS per i bottoni circolari
      button.style.animation = "pop 0.5s ease-in-out";
      button.style.marginTop = (buttonRadius * 1.2 + buttonPadding) + "px"; // Aggiungi spazio tra i bottoni
      //button.style.marginLeft = "0px"; // Aggiungi spazio tra i bottoni
      button.style.backgroundSize = "28px"; // Imposta l'immagine per riempire completamente il bottone
      button.style.backgroundRepeat = "no-repeat";
      button.style.backgroundPositionX = "5.2px";
      button.style.backgroundPositionY = "5px";
      button.style.backgroundImage = `url(${imagePaths[i]})`; // Imposta l'immagine di sfondo del bottone
    }
    if (button.id === "First") button.hidden = true

    console.log(buttonWeatherValue)
    button.addEventListener("click", function () {
      // Aggiungi il loader al DOM
      let loader = document.getElementById("loader");
      loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
      barChartSvg.style("opacity", 0.3);

      let body = document.getElementById("body");

      if (buttonWeatherValue !== this.id) {
        let buttonWeatherValueNew = document.getElementById(buttonWeatherValue);
        let labelWeatherValue = document.getElementById("Label" + buttonWeatherValue);
        buttonWeatherValueNew.style.backgroundColor = "white";
        labelWeatherValue.style.color = "#f7f3eb";
        buttonWeatherValueNew.style.border = "1px solid #d4d0c5";
        buttonWeatherValueNew.style.boxShadow = "0 2px 4px darkslategray";
        buttonWeatherValueNew.style.transform = "scale(1)";
        buttonWeatherValueNew.style.backgroundImage = `url(${imageClick + "BlackAndWhite/" + buttonWeatherValue + "BW.png"})`;
      }

      // Imposta l'animazione per il bottone "None"
      if (this.id === "None") {
        buttonLabel.style.color = "#524a32";
        button.style.transform = "scale(1.2)";
        button.style.backgroundImage = `url(${imageClick + this.id + ".png"})`;
        buttonWeatherValue = this.id;
        let year = document.getElementById("yearSlider").value;
        updatePlotsBasingOnSelectedYear();
        // Imposta un timer per riportare il bottone "None" allo stato precedente dopo 2 secondi
        setTimeout(function () {
          button.style.transform = "scale(1)";
          button.style.transition = "0.5s";
          button.style.backgroundImage = `url(${imageClick + "BlackAndWhite/NoneBW.png"})`;
          buttonWeatherValue="First"
          // body.style.backgroundColor = "#f6fad9"
        }, 1000);
      } else {
        buttonLabel.style.color = "#524a32";
        button.style.backgroundColor = "#e6e1d5";
        button.style.transform = "scale(1.2)";
        button.style.backgroundImage = `url(${imageClick + this.id + ".png"})`;
        button.style.border = "1px solid #524a32";
        buttonWeatherValue = this.id;
        let year = document.getElementById("yearSlider").value;

        buttonFlag = true;

        setTimeout(function () {
          loader.style.display = "none";
          let csvFileNameVerticalBarChart = "dataset/processed/weather/" + year + "/general-accidents/generalAccidents" + buttonWeatherValue + year + ".csv";
          barChartSvg.selectAll("*").remove();
          drawVerticalBarChart(csvFileNameVerticalBarChart);
          barChartSvg.style("opacity", 1);
        }, 1000); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
      }
    });


    button.addEventListener("mouseover", function () {
      if (this.id !== buttonWeatherValue) {
        button.style.animation = "pop 0.5s ease-in-out";
        buttonLabel.style.color = "#a1987d"; // Mostra il buttonLabel al passaggio del mouse
        buttonLabel.style.animation = "pop 0.5s ease-in-out";
        button.style.transform = "scale(1.2)";
      }
    });

    button.addEventListener("mouseout", function () {
      if (this.id !== buttonWeatherValue) {
        buttonLabel.style.color = "#f7f3eb";// Mostra il buttonLabel al passaggio del mouse
        buttonLabel.style.animation = "none";
        button.style.transform = "scale(1)";
      }
    });

    button.appendChild(buttonLabel); // Aggiungi il buttonLabel come figlio del bottone
    buttonsContainer.appendChild(button);
  });

}