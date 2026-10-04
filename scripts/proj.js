
const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
var drivers = [];
var dID = [];
var pointsArr = [];
var polesAr = [];
var winArr = [];
var positionPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0];
async function getUser() { //updates data arrays and makes standings table
    var api_url = `${base_url}${year}/driverstandings/`;
    const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
    const data = await response.json();
    console.log(data.MRData.StandingsTable.StandingsLists);
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;
    const l = dStands.length;
    drivers = [];
    dID = [];
    pointsArr = [];
    polesAr = [];
    winArr = [];
    const fst = stands.DriverStandings[0]
    //document.querySelector('#head').innerHTML = fst.Driver.givenName;
    var table = document.getElementById("tab").getElementsByTagName('tbody')[0];
    document.getElementById('tbod').innerHTML = '';
    for (let i = 0; i < l; i++) {
        var newRow = table.insertRow();
        newRow.dataset.driverIndex = i;
        var c1 = newRow.insertCell(0);
        var c2 = newRow.insertCell(1);
        var c3 = newRow.insertCell(2);
        var c4 = newRow.insertCell(3);
        c1.innerHTML = dStands[i].Driver.familyName;
        c2.innerHTML = dStands[i].points;
        c3.innerHTML = dStands[i].wins;
        var p = poleCounts[dStands[i].Driver.driverId] || 0;
        drivers.push(dStands[i].Driver.familyName);
        dID.push(dStands[i].Driver.driverId);
        pointsArr.push(dStands[i].points);
        winArr.push(dStands[i].wins);
        c4.innerHTML = p;

    }
}

async function getPoles() {
    const pageSize = 100;
    const firstResponse = await fetch(`${base_url}${year}/qualifying/?limit=${pageSize}`);
    const firstPage = await firstResponse.json();
    const total = Number(firstPage.MRData.total);
    const remainingPages = await Promise.all(
        Array.from({ length: Math.ceil((total - pageSize) / pageSize) }, (_, page) => {
            const offset = (page + 1) * pageSize;
            return fetch(`${base_url}${year}/qualifying/?limit=${pageSize}&offset=${offset}`)
                .then(response => response.json());
        })
    );
    const poleCounts = {};
    for (const page of [firstPage, ...remainingPages]) {
        for (const race of page.MRData.RaceTable.Races) {
            for (const result of race.QualifyingResults || []) {
                if (result.position == 1) {
                    const driverId = result.Driver.driverId;
                    poleCounts[driverId] = (poleCounts[driverId] || 0) + 1;
                }
            }
        }
    }
    return poleCounts;
}
async function saveInput() { //gets year input and checks to see if valid
    var y = document.getElementById('year');
    if (y.value < 1955 || y.value > new Date().getFullYear()) {
        document.getElementById('errorYear').innerText = 'Input must be from 1955-present.';
    } else {
        document.getElementById('errorYear').innerText = '';
        year = y.value;
        await getUser();
        getDrivers();
        updateStandings();
    }
}
function getDrivers() { //gets all the drivers for the dropdowns
    const tab = document.getElementById('inputRows');
    tab.innerHTML = '';
    for (let position = 1; position <= 10; position++) {
        const newRow = tab.insertRow();
        var c1 = newRow.insertCell(0);
        var c2 = newRow.insertCell(1);
        const select = document.createElement('select');
        select.className = 'driver';
        select.name = 'driver';
        select.add(new Option('Select a driver', ''));
        drivers.forEach((driver, driverIndex) => {
            select.add(new Option(driver, driverIndex));
        });
        select.addEventListener('change', updateStandings);
        c1.textContent = `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}`;
        c2.appendChild(select);
    }

}

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