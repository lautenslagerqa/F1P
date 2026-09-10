
const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
var drivers = [];
async function getUser() {
    var api_url = `${base_url}${year}/driverstandings/`;
    const response = await fetch(api_url);
    
    const data = await response.json();
    console.log(data.MRData.StandingsTable.StandingsLists);
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;
    const l = dStands.length;
    drivers = [];
    const fst = stands.DriverStandings[0]
    //document.querySelector('#head').innerHTML = fst.Driver.givenName;
    var table = document.getElementById("tab").getElementsByTagName('tbody')[0];
    document.getElementById('tbod').innerHTML = '';
    for (let i = 0; i < l; i++) {
        var newRow = table.insertRow();
        var c1 = newRow.insertCell(0);
        var c2 = newRow.insertCell(1);
        var c3 = newRow.insertCell(2);
        var c4 = newRow.insertCell(3);
        c1.innerHTML = dStands[i].Driver.familyName;
        c2.innerHTML = dStands[i].points;
        c3.innerHTML = dStands[i].wins;
        var p = await getPoles(dStands[i].Driver.driverId);
        drivers.push(dStands[i].Driver.familyName);
        c4.innerHTML = p;

    }
}

async function getPoles(i) {
    var p = 0;
    var pole_url = `${base_url}${year}/drivers/${i}/qualifying/`;
    const resp = await fetch(pole_url);
    const d = await resp.json();
    const poles = d.MRData.RaceTable.Races;
    const len = poles.length;
    for (let i = 0; i < len; i++) {
        if (poles[i].QualifyingResults?.[0]?.position == 1) p++;
    }
    return p;
}
async function saveInput() {
    var y = document.getElementById('year');
    year = y.value;
    await getUser();
    getDrivers();
}
function getDrivers() {
    const selectElement1 = document.getElementById('driv1');
    selectElement1.innerHTML = '';
    const selectElement2 = document.getElementById('driv2');
    selectElement2.innerHTML = '';
    drivers.forEach(option => {
        console.log(option);
        const newOption1 = document.createElement('option');
        newOption1.value = option; 
        newOption1.textContent = option;
        const newOption2 = document.createElement('option');
        newOption2.value = option; 
        newOption2.textContent = option;
        selectElement1.appendChild(newOption1);
        selectElement2.appendChild(newOption2);
    });

}

getUser().then(getDrivers);