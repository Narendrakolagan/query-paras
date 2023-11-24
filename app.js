const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET TO DO

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let todosQuery = "";
  let data = null;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      todosQuery = `
            
            SELECT 
            *
            FROM 
            todo
            WHERE 
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            AND status = '${status}';
            `;
      break;

    case hasPriorityProperty(request.query):
      todosQuery = `
            
            SELECT 
            *
            FROM 
            todo 
            WHERE 
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';
            `;
      break;
    case hasStatusProperty(request.query):
      todosQuery = `
            
            SELECT 
              *
            FROM 
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status = ${status};
            `;
      break;
    default:
      todosQuery = `
            
            SELECT 
            * 
            FROM 
            todo
            WHERE
            search_q = '%${search_q}%';
            `;
      break;
  }

  data = await db.all(todosQuery);
  response.send(data);
});
