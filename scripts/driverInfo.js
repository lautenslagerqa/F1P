
const base_url = "https://api.jolpi.ca/ergast/f1/";
let year = 2026;
let drivers = [];
let dID = [];
let wikiArr = [];
let famNameArr = [];
let elimDriv = [];
let numberArr = [];
let dobArr = [];
let winArr = [];
let remainingRaces = 0;
let roundNum = 0;
const driverImageNames = {
    hulkenberg: "hulkenburg",
    hirakawa: "ryo_hirakawa"
};


async function getDrivers() {
    const api_url = `${base_url}${year}/drivers/`;
    const response = await fetch(api_url);
    // const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
    const data = await response.json();
    const dStands = data.MRData.DriverTable.Drivers;
    // const dStands = stands.DriverStandings;

    drivers = [];
    dobArr = [];
    dID = [];
    famNameArr = [];
    wikiArr = [];
    numberArr = [];
    const completedRounds = Number(dStands.round);
    
    for (let i = 0; i < dStands.length; i++) {
        drivers.push(dStands[i].familyName);
        dID.push(dStands[i].driverId);
        numberArr.push(dStands[i].permanentNumber || "");
        // famNameArr.push(dStands[i].familyName);
        wikiArr.push(dStands[i].url);
        dobArr.push(dStands[i].dateOfBirth);
    }

}

function displayDrivers() {
    let list = document.getElementById("driverList");
    list.replaceChildren();
    for (let i = 0; i<drivers.length; i++) {
        let item = document.createElement("li");
        let driverId = dID[i];
        const imageName = driverImageNames[driverId] || driverId;
        item.className = "eliminated-card";

        const portrait = document.createElement("img");
        portrait.src = `../images/drivers/${imageName}.avif`;
        portrait.alt = "";
        portrait.loading = "lazy";
        portrait.onerror = () => portrait.remove();
        
        const details = document.createElement("div");
        details.className = "eliminated-card-details";

        const name = document.createElement("h3");
        name.textContent = drivers[i];

        const dob = document.createElement("p");
        dob.textContent = dobArr[i];
        
        const link = document.createElement("a");
        link.textContent = `Wikipedia`;
        link.href = wikiArr[i] || "";

        const number = document.createElement("span");
        number.className = "eliminated-position";
        number.textContent = `#${numberArr[i]}`;

        details.append(name, dob, link);
        item.append(portrait, details, number);
        list.append(item);
    }
}


/**
 * Initial page load: fetch the current standings and prediction state.
 */
async function initPrediction() {
    await Promise.all([getDrivers()]);
    displayDrivers();
}

initPrediction();