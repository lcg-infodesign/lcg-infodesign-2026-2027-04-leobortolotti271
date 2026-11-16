// Variabili condivise
let data;
let countries = [];
let backgroundColor = '#d8f3fe';

let goldColor = '#D9A62E';
let silverColor = '#AEB5BE';
let bronzeColor = '#B97855';

let margin = 20;
let labelWidth = 135;
let hoveredCountry = null;
let hoveredData = null;
let tooltipX = 0;
let tooltipY = 0;


// carica i dati e conta una sola medaglia per paese, gara e tipo.
async function setup() {
  createCanvas(windowWidth, windowHeight);

  data = await loadTable("assets/medallists.csv", ",", "header");

  let seen = {};

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let country = data.getString(rowNumber, "country");
    let event = data.getString(rowNumber, "event_name");
    let medal = data.getString(rowNumber, "medal");
    let discipline = data.getString(rowNumber, "discipline");
    let id = country + "|" + discipline + "|" + event + "|" + medal;

    if (!seen[id]) {
      seen[id] = true;

      let countryData = countries.find(item => item.name === country);

      if (!countryData) {
        countryData = {
          name: country,
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
          total: 0
        };
        countries.push(countryData);
      }

      countryData[medal]++;
      countryData.total++;
    }
  }

  // ordina i paesi in base al numero di medaglie.
  countries.sort((a, b) => b.total - a.total);
}


function drawLegend(x, y) {
  fill(255);
  stroke(190);
  rect(x, y, 520, 94);
  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);

  fill(goldColor);
  circle(x + 16, y + 20, 10);
  fill(0);
  text("Oro", x + 29, y + 20);

  fill(silverColor);
  circle(x + 92, y + 20, 10);
  fill(0);
  text("Argento", x + 105, y + 20);

  fill(bronzeColor);
  circle(x + 194, y + 20, 10);
  fill(0);
  text("Bronzo", x + 207, y + 20);

  fill(0);
  text("Ogni barra rappresenta un paese.", x + 12, y + 42);
  text("Lunghezza della barra: numero totale di medaglie.", x + 12, y + 60);
  text("Passa il mouse su una barra per vedere il numero di medaglie", x + 12, y + 78);
}


function draw() {
  background(backgroundColor);

  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(30);
  textStyle(BOLD);
  text("Medaglie vinte alle Olimpiadi Invernali di Milano Cortina 2026", margin, 34);
  textStyle(NORMAL);

  drawLegend(max(margin, width - 540), 58);

  let chartTop = 155;
  let chartHeight = height - chartTop - margin;
  let rowHeight = chartHeight / countries.length;
  let maxTotal = countries[0].total;
  let maxBarWidth = width - labelWidth - 2 * margin;

  hoveredCountry = null;
  hoveredData = null;
  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < countries.length; i++) {
    let country = countries[i];
    let y = chartTop + i * rowHeight;
    let barX = margin + labelWidth;
    let barY = y + rowHeight * 0.2;
    let barHeight = rowHeight * 0.6;
    let barWidth = max(2, map(country.total, 0, maxTotal, 0, maxBarWidth));

    fill(0);
    text(country.name, margin, y + rowHeight / 2);

    let goldWidth = barWidth * country.GOLD / country.total;
    let silverWidth = barWidth * country.SILVER / country.total;
    let bronzeWidth = barWidth * country.BRONZE / country.total;

    fill(goldColor);
    rect(barX, barY, goldWidth, barHeight);

    fill(silverColor);
    rect(barX + goldWidth, barY, silverWidth, barHeight);

    fill(bronzeColor);
    rect(barX + goldWidth + silverWidth, barY, bronzeWidth, barHeight);

    if (
      mouseX >= barX &&
      mouseX <= barX + barWidth &&
      mouseY >= barY &&
      mouseY <= barY + barHeight
    ) {
      hoveredCountry = country.name;
      hoveredData = country;
    }
  }

  if (hoveredData) {
    let boxWidth = 205;
    let boxHeight = 104;
    tooltipX = min(mouseX + 15, width - boxWidth - 10);
    tooltipY = min(mouseY + 15, height - boxHeight - 10);
    tooltipX = max(10, tooltipX);
    tooltipY = max(10, tooltipY);

    fill(255);
    stroke(100);
    rect(tooltipX, tooltipY, boxWidth, boxHeight);
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(13);
    textStyle(BOLD);
    text(hoveredData.name, tooltipX + 10, tooltipY + 17);
    textStyle(NORMAL);
    text("Medaglie totali = " + hoveredData.total, tooltipX + 10, tooltipY + 37);
    text("Oro = " + hoveredData.GOLD, tooltipX + 10, tooltipY + 55);
    text("Argento = " + hoveredData.SILVER, tooltipX + 10, tooltipY + 73);
    text("Bronzo = " + hoveredData.BRONZE, tooltipX + 10, tooltipY + 91);
  }

  cursor(hoveredCountry ? HAND : ARROW);
}


function mousePressed() {
  if (hoveredCountry) {
    let newURL = "detail.html?country=" + encodeURIComponent(hoveredCountry);
    window.location.href = newURL;
  }
}
