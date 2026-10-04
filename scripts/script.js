
const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
var drivers = [];
var dID = [];
var pointsArr = [];
var polesAr = [];
var winArr = [];
async function getUser() { //saves drivers and other data to arrays and makes table on page
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
        polesAr.push(p);

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
async function saveInput() { //gets year input and checks if it's correct
    var y = document.getElementById('year');
    if (y.value < 1955 || y.value > new Date().getFullYear()) {
        document.getElementById('errorYear').innerText = 'Input must be from 1955-present.';
    } else {
        document.getElementById('errorYear').innerText = '';
        year = y.value;
        await getUser();
        getDrivers();
    }
}
function getDrivers() {
    const selectElement1 = document.getElementById('driv1');
    selectElement1.innerHTML = '';
    const selectElement2 = document.getElementById('driv2');
    selectElement2.innerHTML = '';
    for (let i = 0; i < drivers.length; i++) {
        var option = drivers[i];
        //console.log(option);
        const newOption1 = document.createElement('option');
        newOption1.value = i; 
        newOption1.textContent = option;
        const newOption2 = document.createElement('option');
        newOption2.value = i; 
        newOption2.textContent = option;
        selectElement1.appendChild(newOption1);
        selectElement2.appendChild(newOption2);
    }
    drivers.forEach(option => {
    });

}
async function compInput() {
    var d1 = (document.getElementById('driv1')).value;
    var d2 = (document.getElementById('driv2')).value; 
    if (d1 == d2) {
        document.getElementById('errorDriv').innerText = 'Inputs must be different people.';
    } else {
        document.getElementById('errorDriv').innerText = '';
        var t = document.getElementById('comp');
        row = t.rows[0];
        row.innerHTML = "";

        var c1 = document.createElement('th');
        c1.innerHTML = 'Points';
        row.appendChild(c1);
        var c2 = row.insertCell(1);
        var c3 = row.insertCell(2);
        c2.innerHTML = pointsArr[d1];
        c3.innerHTML = pointsArr[d2];
        row = t.rows[1];
        row.innerHTML = "";

        c1 = document.createElement('th');
        c1.innerHTML = 'Wins';
        row.appendChild(c1);
        c2 = row.insertCell(1);
        c3 = row.insertCell(2);
        c2.innerHTML = winArr[d1];
        c3.innerHTML = winArr[d2];

        row = t.rows[2];
        row.innerHTML = "";
        c1 = document.createElement('th');
        c1.innerHTML = 'Poles';
        row.appendChild(c1);
        c2 = row.insertCell(1);
        c3 = row.insertCell(2);
        c2.innerHTML = polesAr[d1];
        c3.innerHTML = polesAr[d2];
        compColor();
    }
}

function compColor() { 
    var t = document.getElementById('comp');
    for (let i = 0; i < t.rows.length; i++) {
        var rows = t.rows[i];
        var c1 = parseInt(rows.cells[1].innerText);
        var c2 = parseInt(rows.cells[2].innerText);
        if (c1 > c2) {
            rows.cells[1].style.backgroundColor = 'lightblue';
        } else if (c1 == c2) {
            rows.cells[1].style.backgroundColor = 'lightgray';
            rows.cells[2].style.backgroundColor = 'lightgray';
        } else {
            rows.cells[2].style.backgroundColor = 'lightblue';
        }
    }
}

getUser().then(getDrivers);