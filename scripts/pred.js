/**
 * Championship prediction helper.
 *
 * Reads the current season standings and calculates which drivers are still in
 * mathematical contention for the title with a user-specified number of races remaining.
 */
const base_url = "https://api.jolpi.ca/ergast/f1/";
let year = 2026;
let drivers = [];
let dID = [];
let tempStandings = [];
let recentPoints = [];
let elimDriv = [];
let pointsArr = [];
let polesAr = [];
let winArr = [];
let remainingRaces = 0;
/**
 * Loads the season standings and keeps the arrays used by the prediction UI in sync.
 */
// Select the input field and the button
const input = document.getElementById("r");
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
async function getUser() {
    const api_url = `${base_url}${year}/driverstandings/`;
    const [response, poleCounts] = await Promise.all([fetch(api_url), getPoles()]);
    const data = await response.json();
    const stands = data.MRData.StandingsTable.StandingsLists[0];
    const dStands = stands.DriverStandings;

    drivers = [];
    polesAr = [];
    dID = [];
    tempStandings = [];
    pointsArr = [];
    winArr = [];
    const completedRounds = Number(stands.round);

    const table = document.getElementById("tab").getElementsByTagName('tbody')[0];
    document.getElementById('tbod').innerHTML = '';

    for (let i = 0; i < dStands.length; i++) {
        const newRow = table.insertRow();
        const positionCell = newRow.insertCell(0);
        const nameCell = newRow.insertCell(1);
        const pointsCell = newRow.insertCell(2);
        const winsCell = newRow.insertCell(3);
        const polesCell = newRow.insertCell(4);
        const position = i + 1;

        positionCell.textContent = `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : position === 21 ? 'st' : 'th'}`;
        nameCell.innerHTML = `<button class="fill" onclick="champChance(${i})">${dStands[i].Driver.familyName}</button>`;
        pointsCell.innerHTML = dStands[i].points;
        winsCell.innerHTML = dStands[i].wins;

        const poleCount = poleCounts[dStands[i].Driver.driverId] || 0;
        drivers.push(dStands[i].Driver.familyName);
        dID.push(dStands[i].Driver.driverId);
        pointsArr.push(Number(dStands[i].points));
        tempStandings.push(Number(dStands[i].points) / completedRounds);
        winArr.push(Number(dStands[i].wins));
        polesCell.innerHTML = poleCount;
        polesAr.push(poleCount);
    }

    if (dStands.length > 0) {
        await getRecentPoints(stands.round);
        displayMostLikelyWinner();
    } else {
        document.getElementById("winner").textContent = "No recent race data available.";
    }
}
/**
 * Counts all pole positions for each driver in the selected season.
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
 * Totals each driver's points from the requested race and the two races before it.
 */
async function getRecentPoints(number) {
    const latestRound = Number(number);
    if (!Number.isInteger(latestRound) || latestRound < 1) {
        throw new RangeError("Race number must be a positive integer.");
    }
    const firstRound = Math.max(1, latestRound - 2);
    const recentRaceCount = latestRound - firstRound + 1;
    const raceResults = await Promise.all(
        Array.from({ length: latestRound - firstRound + 1 }, (_, index) =>
            fetch(`${base_url}${year}/${firstRound + index}/results`)
        )
    );
    const raceData = await Promise.all(raceResults.map(async (response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch race results: ${response.status}`);
        }
        return response.json();
    }));

    const pointsByDriver = new Map(dID.map((driverId) => [driverId, 0]));
    for (const data of raceData) {
        const races = data.MRData.RaceTable.Races || [];
        for (const race of races) {
            for (const result of race.Results || []) {
                const driverId = result.Driver.driverId;
                if (pointsByDriver.has(driverId)) {
                    pointsByDriver.set(
                        driverId,
                        pointsByDriver.get(driverId) + Number(result.points)
                    );
                }
            }
        }
    }

    recentPoints = dID.map((driverId) => pointsByDriver.get(driverId) / recentRaceCount);
}

/**
 * Displays the driver with the highest combined season and recent points average.
 */
function displayMostLikelyWinner() {
    if (recentPoints.length === 0 || tempStandings.length !== recentPoints.length) {
        document.getElementById("winner").textContent = "No recent race data available.";
        return;
    }

    const combinedAverages = recentPoints.map(
        (recentAverage, index) => (recentAverage * 0.6 + tempStandings[index] * 0.4) / 2
    );
    const highestAverage = Math.max(...combinedAverages);
    const likelyWinners = combinedAverages
        .map((average, index) => average === highestAverage ? drivers[index] : null)
        .filter((driver) => driver !== null);
    document.getElementById("winner").textContent = likelyWinners.join(" / ");
}

/**
 * Fetches the number of races still remaining in the active season.
 */
async function getRemainingRaces() {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/races`);
    const data = await response.json();
    const races = data.MRData.RaceTable.Races || [];
    const today = new Date();

    const upcomingRaces = races.filter((race) => new Date(race.date) > today);
    remainingRaces = upcomingRaces.length;
    document.getElementById("rr").textContent = `Remaining Races: ${remainingRaces}`;
    document.getElementById("r").value = remainingRaces;
}

/**
 * Lists drivers whose championship hopes would end if all remaining races were scored as a win.
 */
function elimDrivers() {
    elimDriv = [];
    const table = document.getElementById("el").getElementsByTagName('tbody')[0];
    table.innerHTML = '';

    for (let i = 0; i < drivers.length; i++) {
        const projectedPoints = (26 * remainingRaces) + Number(pointsArr[i]);
        if (projectedPoints < Number(pointsArr[0])) {
            const row = table.insertRow();
            const driverCell = row.insertCell();
            driverCell.textContent = drivers[i];
            elimDriv.push(drivers[i]);
            console.log(drivers[i]);
        }
    }
}

/**
 * Calculates the point gap required for a driver to reach the current leader.
 */
function champChance(id) {
    const gap = pointsArr[0] - pointsArr[id];
    const message = document.getElementById("errorRace");
    if (elimDriv.length + 1 == drivers.length) {
        message.textContent = `${drivers[0]} is confirmed to be the champion`;
    } else {
        message.textContent = `${drivers[id]} needs to gain ${gap} points on ${drivers[0]} to win the championship`;
    }
}

/**
 * Validates user-entered race totals and updates the prediction model.
 */
async function saveInput() {
    const raceInput = document.getElementById('r');

    if (raceInput.value <= 0) {
        document.getElementById('errorRace').innerText = 'Input must be greater than 1.';
        return;
    }

    if (((Number(raceInput.value) * 26) + Number(pointsArr[pointsArr.length - 1]) > Number(pointsArr[0]))) {
        document.getElementById('errorRace').innerText = 'Input is too big, everyone can win.';
        return;
    }

    document.getElementById('errorRace').innerText = '';
    if (raceInput.value.trim() === '') return;

    const requestedRaces = Number(raceInput.value);
    if (!Number.isInteger(requestedRaces) || requestedRaces < 0) return;

    remainingRaces = requestedRaces;
    await Promise.all([getUser()]);
    elimDrivers();
    const message = document.getElementById("errorRace");
    if (elimDriv.length + 1 == drivers.length) {
        message.textContent = `${drivers[0]} is confirmed to be the champion`;
    }
    
}

/**
 * Initial page load: fetch the current standings and prediction state.
 */
async function initPrediction() {
    await Promise.all([getRemainingRaces(), getUser()]);
    elimDrivers();
}

initPrediction();