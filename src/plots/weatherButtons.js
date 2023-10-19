// Dimensioni dei bottoni
let buttonRadius = 20;
var buttonPadding = 0; // Spazio tra i bottoni

const imagePaths = [
  "dataset/img/nuvoloso.png",
  "dataset/img/sole.png",
  "dataset/img/grandine.png",
  "dataset/img/pioggia.png",
  "dataset/img/neve.png",
  "dataset/img/no-meteo.png"
];
// Funzione per creare bottoni HTML
function createHTMLButtons() {
  let buttonData = ["Button 1", "Button 2", "Button 3", "Button 4", "Button 5", "Button 6"];
  const buttonsContainer = document.getElementById("buttons");

  buttonData.forEach((buttonText, i) => {
    const button = document.createElement("button");
    button.id = "Button" + (i + 1); // Assegna un ID univoco
    button.className = "circular-button"; // Applica la classe CSS per i bottoni circolari
    button.style.marginTop = (buttonRadius * 0.9 + buttonPadding) + "px"; // Aggiungi spazio tra i bottoni
    button.style.backgroundSize = "cover"; // Imposta l'immagine per riempire completamente il bottone
    button.style.backgroundImage = `url(${imagePaths[i]})`; // Imposta l'immagine di sfondo del bottone
    button.addEventListener("click", function () {
      console.log("ID del bottone:", this.id);
    });

    button.addEventListener("mouseover", function () {
      console.log("ID del bottone:", this.id);
    });

    button.addEventListener("mouseout", function () {
      console.log("ID del bottone:", this.id);
    });

    buttonsContainer.appendChild(button);
  });

}