let backgroundColor = '#d8f3fe';

let goldColor = '#D9A62E';
let silverColor = '#AEB5BE';
let bronzeColor = '#B97855';

let data;
let selectedCountry;
let selectedCountryCode;

let margin = 20;
let labelWidth = 190;
let genders = ["Men", "Women", "Mixed"];


async function setup() {
  data = await loadTable("assets/medallists.csv", ",", "header");

  let params = getURLParams();
  selectedCountryCode = params.country_code;
  selectedCountry = params.country;

  createCanvas(windowWidth, windowHeight);
}


function drawLegend(x, y) {
  fill(255);
  stroke(190);
  rect(x, y, 270, 48);
  noStroke();
  textSize(14);
  textAlign(LEFT, CENTER);

  fill(goldColor);
  circle(x + 17, y + 24, 12);
  fill(0);
  text("Oro", x + 31, y + 24);

  fill(silverColor);
  circle(x + 91, y + 24, 12);
  fill(0);
  text("Argento", x + 105, y + 24);

  fill(bronzeColor);
  circle(x + 183, y + 24, 12);
  fill(0);
  text("Bronzo", x + 197, y + 24);
}


function draw() {
  background(backgroundColor);

  let eventGenders = {};
  let seen = {};
  let disciplines = {};

  // individua il genere.
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let discipline = data.getString(rowNumber, "discipline");
    let event = data.getString(rowNumber, "event_name");
    let gender = data.getString(rowNumber, "gender");
    let eventId = discipline + "|" + event;

    if (!eventGenders[eventId]) {
      eventGenders[eventId] = { M: false, F: false };
    }

    eventGenders[eventId][gender] = true;
  }

  // conta una sola medaglia per gara, paese e tipo.
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    let country = data.getString(rowNumber, "country");
    let countryCode = data.getString(rowNumber, "country_code");

    if ((selectedCountryCode && countryCode === selectedCountryCode) || (!selectedCountryCode && country === selectedCountry)) {
      selectedCountry = country;
      let discipline = data.getString(rowNumber, "discipline");
      let event = data.getString(rowNumber, "event_name");
      let medal = data.getString(rowNumber, "medal");
      let gender = data.getString(rowNumber, "gender");
      let eventId = discipline + "|" + event;
      let medalId = eventId + "|" + medal;

      if (!seen[medalId]) {
        seen[medalId] = true;

        if (eventGenders[eventId].M && eventGenders[eventId].F) {
          gender = "Mixed";
        } else if (gender === "F") {
          gender = "Women";
        } else {
          gender = "Men";
        }

        if (!disciplines[discipline]) {
          disciplines[discipline] = {
            Men: [],
            Women: [],
            Mixed: []
          };
        }

        disciplines[discipline][gender].push(medal);
      }
    }
  }

  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(30);
  textStyle(BOLD);
  text(selectedCountry, margin, 34);
  textStyle(NORMAL);
  drawLegend(max(margin, width - 290), 58);

  let disciplineNames = Object.keys(disciplines).sort();
  let chartTop = 145;
  let rowHeight = min(42, (height - chartTop - margin) / disciplineNames.length);
  let cellWidth = (width - labelWidth - 2 * margin) / 3;
  let diameter = 16;
  let dotGap = 7;

  textSize(16);
  textAlign(LEFT, CENTER);
  fill(0);
  noStroke();

  for (let column = 0; column < genders.length; column++) {
    text(
      genders[column],
      margin + labelWidth + column * cellWidth,
      chartTop - 22
    );
  }

  for (let i = 0; i < disciplineNames.length; i++) {
    let discipline = disciplineNames[i];
    let rowTop = chartTop + i * rowHeight;
    let y = rowTop + rowHeight / 2;

    fill(0);
    text(discipline, margin, y);

    for (let column = 0; column < genders.length; column++) {
      let gender = genders[column];
      let medals = disciplines[discipline][gender];

      medals.sort((a, b) => {
        let order = { GOLD: 1, SILVER: 2, BRONZE: 3 };
        return order[a] - order[b];
      });

      let startX = margin + labelWidth + column * cellWidth;
      let maxDots = max(1, floor(cellWidth / (diameter + dotGap)));

      for (let j = 0; j < medals.length; j++) {
        let x = startX + (j % maxDots) * (diameter + dotGap) + diameter / 2;
        let dotY = y + (floor(j / maxDots) - (ceil(medals.length / maxDots) - 1) / 2) * (diameter + 3);

        if (medals[j] === "GOLD") {
          fill(goldColor);
        } else if (medals[j] === "SILVER") {
          fill(silverColor);
        } else {
          fill(bronzeColor);
        }

        circle(x, dotY, diameter);
      }
    }
  }
}