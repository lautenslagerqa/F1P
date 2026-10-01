const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
var drivers = [];
var dID = [];
var pointsArr = [];
var polesAr = [];
var winArr = [];
let rr = 0;
async function getUser() {
    var api_url = `${base_url}${year}/driverstandings/`;
    const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
    const data = await response.json();
    //console.log(data.MRData.StandingsTable.StandingsLists);
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;
    const l = dStands.length;
    drivers = [];
    polesAr = [];
    const fst = stands.DriverStandings[0]
    //document.querySelector('#head').innerHTML = fst.Driver.givenName;
    var table = document.getElementById("tab").getElementsByTagName('tbody')[0];
    document.getElementById('tbod').innerHTML = '';
    for (let i = 0; i < l; i++) {
        var newRow = table.insertRow();
        var p1 = newRow.insertCell(0);
        var c1 = newRow.insertCell(1);
        var c2 = newRow.insertCell(2);
        var c3 = newRow.insertCell(3);
        var c4 = newRow.insertCell(4);
        let position = i+1;
        p1.textContent = `${position}${(position) === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}`;
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
// function getDrivers() {
//     const selectElement1 = document.getElementById('driv1');
//     selectElement1.innerHTML = '';
//     const selectElement2 = document.getElementById('driv2');
//     selectElement2.innerHTML = '';
//     for (let i = 0; i < drivers.length; i++) {
//         var option = drivers[i];
//         //console.log(option);
//         const newOption1 = document.createElement('option');
//         newOption1.value = i; 
//         newOption1.textContent = option;
//         const newOption2 = document.createElement('option');
//         newOption2.value = i; 
//         newOption2.textContent = option;
//         selectElement1.appendChild(newOption1);
//         selectElement2.appendChild(newOption2);
//     }
//     drivers.forEach(option => {
//     });

// }
async function getRemainingRaces() {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/races`);
    const data = await response.json();
    const races = data.MRData.RaceTable.Races || [];
    const today = new Date();
 
    const upcomingRaces = races.filter(race => new Date(race.date) > today);
    rr = upcomingRaces.length;
    console.log(`Remaining races: ${upcomingRaces.length}`);
    document.getElementById("rr").textContent = `Remaining Races: ${upcomingRaces.length}`;
    document.getElementById("r").value = rr;
}
 
function elimDrivers() {
    var table = document.getElementById("el").getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    for (let i = 0; i < drivers.length; i++) {
        let newPoints = (26 * rr) + Number(pointsArr[i]);
        if (newPoints < Number(pointsArr[0])) {
            console.log(drivers[i] + ` : ${pointsArr[i]} : ${newPoints} : ${rr}`);
            let row = table.insertRow();
            let c1 = row.insertCell();
            c1.textContent = drivers[i];

        }
    }
}


async function saveInput() {
    // var y = document.getElementById('y');
    // year = y.value;
    const raceInput = document.getElementById('r');
    if (raceInput.value.trim() === '') return;
    const requestedRaces = Number(raceInput.value);
    if (!Number.isInteger(requestedRaces) || requestedRaces < 0) return;
    rr = requestedRaces;
    await Promise.all([getUser()]);
    elimDrivers();
}

async function initPrediction() {
    await Promise.all([getRemainingRaces(), getUser()]);
    elimDrivers();
}

initPrediction();