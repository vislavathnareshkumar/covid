const express = require("express");

const app = express();

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let dbCovid = null;

const initializeDBAndServer = async () => {
  try {
    dbCovid = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error :${(e, message)}`);
  }
};

initializeDBAndServer();

///API 1

app.get("/states/", async (request, response) => {
  const StatesQuery = `
    SELECT 
    state_id as stateId,
    state_name as stateName,
    population as population

    FROM 
    state

    `;
  const States = await dbCovid.all(StatesQuery);

  response.send(States);
  console.log(States);
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const statesIdQuery = `
    SELECT 
    state_id AS stateId ,
    state_name AS stateName,
    population AS population 
    FROM
    state
    WHERE
    state_id = ${stateId}

    `;
  const statesId = await dbCovid.get(statesIdQuery);

  response.send(statesId);
});

/// API 3

app.post("/districts/", async (request, response) => {
  const district = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = district;

  const districtPost = `
    INSERT INTO
    district(district_name,state_id,cases, cured , active , deaths )

    VALUES(
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}




    )`;

  await dbCovid.run(districtPost);

  response.send("District Successfully Added");
});

// API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtCasesQuery = `
    SELECT 
    district_id AS districtId,
    district_name AS districtName,
    state_id AS stateId ,
    cases AS cases,
    cured AS cured,
    active AS active ,
    deaths AS deaths
    FROM 
    district
    WHERE
    district_id = ${districtId} 

    `;
  const districtCases = await dbCovid.get(districtCasesQuery);

  response.send(districtCases);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDelete = `
    DELETE
    FROM
    district
    WHERE
    district_id = ${districtId}`;
  await dbCovid.run(districtDelete);
  response.send("District Removed");
});

// API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const districtDetailsUpadte = `
   
    UPDATE district 
            SET 
                district_name='${districtName}',
                state_id=${stateId},
                cases=${cases},
                cured=${cured},
                active=${active},
                deaths=${deaths}
            WHERE district_id=${districtId}
    `;
  await dbCovid.run(districtDetailsUpadte);

  response.send("District Details Updated");
});

module.exports = app;

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const totatCasesQuery = `
    SELECT
    SUM(cases) AS totalCases ,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive ,
    SUM(deaths) AS totalDeaths
    FROM
    district
    WHERE
    state_id =${stateId} ;
    
    `;
  const totalCases = await dbCovid.get(totatCasesQuery);
  response.send(totalCases);
});

// API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateNameQuery = `
    SELECT
    state_name AS stateName
    FROM 
    state
    WHERE
    state_id = (
        SELECT state_id
        FROM 
        district
        WHERE
        district_id =${districtId}
    )`;
  const stateName = await dbCovid.get(stateNameQuery);
  response.send(stateName);
});
