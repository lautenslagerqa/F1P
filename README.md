# Formula Predict

Formula Predict is a **capstone project** for exploring Formula 1 driver standings and championship scenarios. It is a static website and does not require a build step or package installation.

## Features

- View driver standings by season, including points, wins, and pole positions.
- Compare two drivers head-to-head for a selected season.
- Explore a championship projection by assigning finishing positions to upcoming races.
- View a prediction based on recent race results and see which drivers are mathematically out of contention given a chosen number of races remaining.

## Data

Season standings, qualifying results, and race results are loaded from the [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/), which provides an Ergast-compatible Formula 1 data API. An internet connection is required to load the data.

## Project structure

- `index.html` — standings and driver comparison
- `sections/predict.html` — race-winner and championship-contender predictions
- `sections/project.html` — projected standings
- `scripts/` — JavaScript for page behavior and API requests
- `styles/styles.css` — shared page styles
- `images/` — project images
