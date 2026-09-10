
const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
var drivers = [];
var dID = [];
var pointsArr = [];
var polesAr = [];
var winArr = [];
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
        dID.push(dStands[i].Driver.driverId);
        pointsArr.push(dStands[i].points);
        winArr.push(dStands[i].wins);
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
    polesAr.push(p);
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
    for (let i = 0; i < drivers.length; i++) {
        var option = drivers[i];
        console.log(option);
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
    var t = document.getElementById('comp');
    // var d1_url = `${base_url}${year}/drivers/${d1}/driverstandings/`;
    // const response1 = await fetch(d1_url);
    // var d2_url = `${base_url}${year}/drivers/${d2}/driverstandings/`;
    // const response2 = await fetch(d2_url);
    // const data1 = await response1.json();
    // const data2 = await response2.json();
    // const p1 = data1.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].points;
    // const p2 = data2.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].points;
    // const w1 = data1.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].wins;
    // const w2 = data2.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].wins;
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
    
}
getUser().then(getDrivers);