const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

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

//API 1 Register with 3 scenarios

app.post("/register", async (request, response) => {
  const requestBody = request.body;
  const { username, name, password, gender, location } = requestBody;
  const usernameQuery = `
    SELECT * FROM user WHERE username = '${username}';
  `;
  const dbUser = await db.get(usernameQuery);
  if (dbUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const encryptedPassword = await bcrypt.hash(password, 5);
      console.log(encryptedPassword);
      const postQuery = `
        INSERT INTO user(username,name,password,gender, location)
        VALUES(
            '${username}',
            '${name}',
            '${encryptedPassword}',
            '${gender}',
            '${location}'
        );
      `;
      const dbResponse = await db.run(postQuery);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//API 2 with 3 scenarios
app.post("/login", async (request, response) => {
  const requestBody = request.body;
  console.log(requestBody);
  const { username, password } = requestBody;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
