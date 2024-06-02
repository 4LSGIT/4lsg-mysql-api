/*const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the 4lsg API.", test: process.env.test });
});

require("./app/routes/tutorial.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});*/





const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Configuration
const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as ID " + db.threadId);
});

// Route to handle user authentication and query processing
app.get("/", (req, res) => {
  const { username, password, query } = req.query;

  // Query to check user authorization
  const authQuery = `SELECT user_auth FROM users WHERE user_name='${username}' AND user_password='${password}'`;

  db.query(authQuery, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error executing authorization query" });
    } else {
      if (result.length > 0 && result[0].user_auth === "authorized") {
        // User is authorized, proceed with the main query
        db.query(query, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Error executing main query" });
          } else {
            res.json({ data: result });
          }
        });
      } else {
        res.status(401).json({ error: "Unauthorized access" });
      }
    }
  });
});

// Set port and start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
