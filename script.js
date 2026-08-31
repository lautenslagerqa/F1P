
const base_url = "https://api.jolpi.ca/ergast/f1/";
var year = 2026;
async function getUser() {
    var api_url = `${base_url}${year}/driverstandings/`;
    const response = await fetch(api_url);
    
    const data = await response.json();
    console.log(data.MRData.StandingsTable.StandingsLists);
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;
    const l = dStands.length;
    const fst = stands.DriverStandings[0]
    //document.querySelector('#head').innerHTML = fst.Driver.givenName;
    var table = document.getElementById("tab").getElementsByTagName('tbody')[0];
    document.getElementById('tbod').innerHTML = '';
    for (let i = 0; i < l; i++) {
        var newRow = table.insertRow();
        var c1 = newRow.insertCell(0);
        var c2 = newRow.insertCell(1);
        var c3 = newRow.insertCell(2);
        c1.innerHTML = dStands[i].Driver.givenName;
        c2.innerHTML = dStands[i].points;
        c3.innerHTML = dStands[i].wins;
    }
}

function saveInput() {
    var y = document.getElementById('year');
    year = y.value;
    getUser();
}
getUser();