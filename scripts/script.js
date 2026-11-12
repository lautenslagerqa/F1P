
/**
 * Compare two drivers in the current season.
 *
 * This script loads the standings for a selected year and compares key metrics
 * such as points, wins, and poles between two drivers for quick side-by-side analysis.
 */
// Select the input field and the button
const input = document.getElementById("year");
const button = document.getElementById("smt");

// Listen for a keydown event inside the input field
input.addEventListener("keydown", function(event) {
  // Check if the pressed key is "Enter"
  if (event.key === "Enter") {
    // Prevent the default form submission behavior (if inside a form)
    event.preventDefault();
    // Programmatically click the button
    button.click();
  }
});
const base_url = "https://api.jolpi.ca/ergast/f1/";
let year = 2026;
let drivers = [];
let cons = [];
let dID = [];
let cID = [];
let pointsArr = [];
let cpointsArr = [];
let polesAr = [];
let winArr = [];
let cwinArr = [];
const driverImageNames = {
    hulkenberg: "hulkenburg",
    hirakawa: "ryo_hirakawa"
};

/**
 * Fetches the standings for the active year and stores the values required for comparison.
 */
async function getUser(type) {
    if (type == "d") {
        const api_url = `${base_url}${year}/driverstandings/`;
        const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
        const data = await response.json();
        const stands = data.MRData.StandingsTable.StandingsLists[0];
        const dStands = stands.DriverStandings;

        drivers = [];
        polesAr = [];
        dID = [];
        pointsArr = [];
        winArr = [];

        const table = document.getElementById("tab").getElementsByTagName('tbody')[0];
        document.getElementById('tbod').innerHTML = '';

        for (let i = 0; i < dStands.length; i++) {
            const row = table.insertRow();
            const imageCell = row.insertCell(0);
            const positionCell = row.insertCell(1);
            const nameCell = row.insertCell(2);
            const pointsCell = row.insertCell(3);
            const winsCell = row.insertCell(4);
            const polesCell = row.insertCell(5);

            const position = i + 1;
    

            positionCell.textContent = `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : position === 21 ? 'st': 'th'}`;
            nameCell.innerHTML = dStands[i].Driver.familyName;
            pointsCell.innerHTML = dStands[i].points;
            winsCell.innerHTML = dStands[i].wins;

            const poleCount = poleCounts[dStands[i].Driver.driverId] || 0;
            drivers.push(dStands[i].Driver.familyName);
            dID.push(dStands[i].Driver.driverId);
            pointsArr.push(Number(dStands[i].points));
            winArr.push(Number(dStands[i].wins));
            polesAr.push(poleCount);
            polesCell.innerHTML = poleCount;
            let driverId = dStands[i].Driver.driverId;
            const imageName = driverImageNames[driverId] || driverId;
            const portrait = new Image();//document.createElement("img");
            portrait.hidden = true;
            portrait.onload = () => {
                portrait.hidden = false;
            };
            portrait.onerror = () => {
                portrait.hidden = true;
            };
            portrait.src = `./images/drivers/${imageName}.avif`;
            portrait.alt = "";
            portrait.loading = "lazy";
            portrait.onerror = () => portrait.remove();
            imageCell.className = "standingsIMG" ;
            imageCell.append(portrait);      
        }

    } else {
        const api_url = `${base_url}${year}/constructorstandings/`;
        const [response] = await Promise.all([fetch(api_url)]);
        const data = await response.json();
        const stands = data.MRData.StandingsTable.StandingsLists[0];
        const cStands = stands.ConstructorStandings;

        cons = [];
        // polesAr = [];
        cID = [];
        cpointsArr = [];
        cwinArr = [];

        const table = document.getElementById("tab").getElementsByTagName('tbody')[0];
        document.getElementById('tbod').innerHTML = '';

        for (let i = 0; i < cStands.length; i++) {
            const row = table.insertRow();
            const imageCell = row.insertCell(0);
            const positionCell = row.insertCell(1);
            const nameCell = row.insertCell(2);
            const pointsCell = row.insertCell(3);
            const winsCell = row.insertCell(4);
            // const polesCell = row.insertCell(5);

            const position = i + 1;
    

            positionCell.textContent = `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : position === 21 ? 'st': 'th'}`;
            nameCell.innerHTML = cStands[i].Constructor.name;
            pointsCell.innerHTML = cStands[i].points;
            winsCell.innerHTML = cStands[i].wins;

            // const poleCount = poleCounts[cStands[i].Constructor.constructorID] || 0;
            cons.push(cStands[i].Constructor.name);
            let conId = cStands[i].Constructor.constructorId;
            console.log(cStands[i].Constructor.name);
            cID.push(cStands[i].Constructor.constructorId);
            cpointsArr.push(Number(cStands[i].points));
            cwinArr.push(Number(cStands[i].wins));
            // polesAr.push(poleCount);
            // polesCell.innerHTML = poleCount;
            const cimageName = conId;
            const portrait = new Image();//document.createElement("img");
            portrait.hidden = true;
            portrait.onload = () => {
                portrait.hidden = false;
            };
            portrait.onerror = () => {
                portrait.hidden = true;
            };
            portrait.src = `./images/teams/${conId}.avif`;
            portrait.alt = "";
            portrait.loading = "lazy";
            portrait.onerror = () => portrait.remove();
            imageCell.className = "cStandingsIMG" ;
            imageCell.append(portrait);  
        }

        }
}

/**
 * Counts how many poles each driver has achieved across the season.
 */
async function getPoles() {
    const pageSize = 100;
    const firstResponse = await fetch(`${base_url}${year}/qualifying/?limit=${pageSize}`);
    const firstPage = await firstResponse.json();
    const total = Number(firstPage.MRData.total);
    const remainingPages = await Promise.all(
        Array.from({ length: Math.ceil((total - pageSize) / pageSize) }, (_, page) => {
            const offset = (page + 1) * pageSize;
            return fetch(`${base_url}${year}/qualifying/?limit=${pageSize}&offset=${offset}`)
                .then((response) => response.json());
        })
    );

    const poleCounts = {};
    for (const page of [firstPage, ...remainingPages]) {
        for (const race of page.MRData.RaceTable.Races) {
            for (const result of race.QualifyingResults || []) {
                if (Number(result.position) === 1) {
                    const driverId = result.Driver.driverId;
                    poleCounts[driverId] = (poleCounts[driverId] || 0) + 1;
                }
            }
        }
    }

    return poleCounts;
}

/**
 * Checks that the selected year is valid and reloads the data set.
 */
async function saveInput() {
    const yearInput = document.getElementById('year');

    if (yearInput.value < 1955 || yearInput.value > new Date().getFullYear()) {
        document.getElementById('errorYear').innerText = 'Input must be from 1955-present.';
        return;
    }

    document.getElementById('errorYear').innerText = '';
    year = Number(yearInput.value);
    await getUser();
    getDrivers();
}

/**
 * Populates both driver selection lists with the current season's competitors.
 */
function getDrivers() {
    const selectElement1 = document.getElementById('driv1');
    const selectElement2 = document.getElementById('driv2');

    selectElement1.innerHTML = '';
    selectElement2.innerHTML = '';

    for (let i = 0; i < drivers.length; i++) {
        const option = drivers[i];
        const newOption1 = document.createElement('option');
        const newOption2 = document.createElement('option');

        newOption1.value = String(i);
        newOption1.textContent = option;

        newOption2.value = String(i);
        newOption2.textContent = option;

        selectElement1.appendChild(newOption1);
        selectElement2.appendChild(newOption2);
    }
}

/**
 * Compares the selected drivers side-by-side and highlights the lead metric.
 */
async function compInput() {
    const driverOne = document.getElementById('driv1').value;
    const driverTwo = document.getElementById('driv2').value;

    if (driverOne === driverTwo) {
        document.getElementById('errorDriv').innerText = 'Inputs must be different people.';
        return;
    }

    document.getElementById('errorDriv').innerText = '';
    const table = document.getElementById('comp');

    let row = table.rows[0];
    row.innerHTML = '';

    const imageCell = document.createElement('th');
    imageCell.textContent = 'Image';
    row.appendChild(imageCell);
            
    const driverOneId = dID[driverOne];
    const driverTwoId = dID[driverTwo];
    const portrait1 = new Image();
    portrait1.src = `./images/drivers/${driverImageNames[driverOneId] || driverOneId}.avif`;
    portrait1.alt = "";
    portrait1.loading = "lazy";
    portrait1.onerror = () => portrait1.remove();
    let firstIMG = row.insertCell(1);
    let secondIMG = row.insertCell(2);
    firstIMG.append(portrait1);

    const portrait2 = new Image();
    portrait2.src = `./images/drivers/${driverImageNames[driverTwoId] || driverTwoId}.avif`;
    portrait2.alt = "";
    portrait2.loading = "lazy";
    portrait2.onerror = () => portrait2.remove();
    secondIMG.append(portrait2);

    row = table.rows[1];
    row.innerHTML = '';

    let categoryCell = document.createElement('th');
    categoryCell.innerHTML = 'Points';
    row.appendChild(categoryCell);

    let firstMetric = row.insertCell(1);
    let secondMetric = row.insertCell(2);
    firstMetric.innerHTML = pointsArr[driverOne];
    secondMetric.innerHTML = pointsArr[driverTwo];

    row = table.rows[2];
    row.innerHTML = '';
    categoryCell = document.createElement('th');
    categoryCell.innerHTML = 'Wins';
    row.appendChild(categoryCell);
    firstMetric = row.insertCell(1);
    secondMetric = row.insertCell(2);
    firstMetric.innerHTML = winArr[driverOne];
    secondMetric.innerHTML = winArr[driverTwo];

    row = table.rows[3];
    row.innerHTML = '';
    categoryCell = document.createElement('th');
    categoryCell.innerHTML = 'Poles';
    row.appendChild(categoryCell);
    firstMetric = row.insertCell(1);
    secondMetric = row.insertCell(2);
    firstMetric.innerHTML = polesAr[driverOne];
    secondMetric.innerHTML = polesAr[driverTwo];

    compColor();
}

/**
 * Applies a light highlight for whichever driver is ahead in each comparison row.
 */
function compColor() {
    const table = document.getElementById('comp');

    for (const row of table.rows) {
        if (row.cells.length < 3 || row.cells[0].textContent === 'Image') {
            continue;
        }

        const firstCell = row.cells[1];
        const secondCell = row.cells[2];
        firstCell.style.background = '';
        secondCell.style.background = '';
        firstCell.style.backgroundColor = '';
        secondCell.style.backgroundColor = '';
        const firstValue = Number(firstCell.textContent);
        const secondValue = Number(secondCell.textContent);

        if (firstValue > secondValue) {
            firstCell.style.background = '#e11d48';
        } else if (firstValue === secondValue) {
            firstCell.style.backgroundColor = 'rgba(225, 29, 72, 0.18)';
            secondCell.style.backgroundColor = 'rgba(225, 29, 72, 0.18)';
        } else { 
            secondCell.style.background = '#e11d48';
        }
    }
}

getUser("d").then(getDrivers);