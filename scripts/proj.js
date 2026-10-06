
/**
 * Projections for the current Formula 1 championship.
 *
 * This script loads the current season standings, counts poles by driver, and
 * lets the user assign projected finishing positions to see how the points table
 * would shift.
 */
const base_url = "https://api.jolpi.ca/ergast/f1/";
let year = 2026;
let drivers = [];
let dID = [];
let pointsArr = [];
let polesAr = [];
let winArr = [];
const positionPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0];
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
/**
 * Fetches the current season driver standings and populates the table.
 * Also stores driver metadata so projected results can be recalculated.
 */
async function getUser() {
    const api_url = `${base_url}${year}/driverstandings/`;
    const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
    const data = await response.json();
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;
    const table = document.getElementById("tab").getElementsByTagName('tbody')[0];

    drivers = [];
    dID = [];
    pointsArr = [];
    polesAr = [];
    winArr = [];

    document.getElementById('tbod').innerHTML = '';

    for (let i = 0; i < dStands.length; i++) {
        const row = table.insertRow();
        row.dataset.driverIndex = i;

        const nameCell = row.insertCell(0);
        const pointsCell = row.insertCell(1);
        const winsCell = row.insertCell(2);
        const polesCell = row.insertCell(3);

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
    }
}

/**
 * Collects pole positions across all qualifying sessions in the selected year.
 * The Ergast API paginates qualifying results, so multiple pages are fetched.
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
 * Validates the user-entered season year and refreshes the standings table.
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
    updateStandings();
}

/**
 * Populates the drop-down selectors used to simulate future finishing positions.
 */
function getDrivers() {
    const tab = document.getElementById('inputRows');
    tab.innerHTML = '';

    for (let position = 1; position <= 10; position++) {
        const row = tab.insertRow();
        const labelCell = row.insertCell(0);
        const selectCell = row.insertCell(1);
        const select = document.createElement('select');

        select.className = 'driver';
        select.name = 'driver';
        select.add(new Option('Select a driver', ''));

        drivers.forEach((driver, driverIndex) => {
            select.add(new Option(driver, driverIndex));
        });

        select.addEventListener('change', updateStandings);
        labelCell.textContent = `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}`;
        selectCell.appendChild(select);
    }
}

/**
 * Recalculates projected standings after the user picks driver finishes.
 */
function updateStandings() {
    const standingRows = document.querySelectorAll('#tbod tr');
    const projectedPoints = pointsArr.map(Number);

    document.querySelectorAll('#inputRows select').forEach((select, positionIndex) => {
        if (select.value !== '') {
            projectedPoints[Number(select.value)] += positionPoints[positionIndex];
        }
    });

    standingRows.forEach((row) => {
        const driverIndex = Number(row.dataset.driverIndex);
        row.cells[1].textContent = projectedPoints[driverIndex];
    });

    [...standingRows]
        .sort((rowA, rowB) => Number(rowB.cells[1].textContent) - Number(rowA.cells[1].textContent))
        .forEach((row) => document.getElementById('tbod').appendChild(row));
}

getUser().then(getDrivers);