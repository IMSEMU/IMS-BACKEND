import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import db from "./config/db.config.js";
import Roles from "./models/role.model.js";
import WorkDone from "./models/workdone.model.js";

dotenv.config();

const app = express();

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    } else if (whitelist.indexOf(origin) === -1) {
      return callback(new Error("not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  methods: "GET, PATCH, POST, PUT, DELETE",
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", router);

const port = 8080;

db.sync({ force: false }).then(async () => {
  // Check if the "roles" table is empty
  const roleCount = await Roles.count();
  const workCount = await WorkDone.count();

  if (roleCount === 0) {
    // Insert default roles
    await Roles.bulkCreate([
      { id: "1", name: "student" },
      { id: "2", name: "dept_sup" },
      { id: "3", name: "comp_sup" },
      { id: "4", name: "admin" },
    ]);

    console.log('Default roles inserted into the "roles" table.');
  } else {
    console.log('no need for insert "roles" table.');
  }

  if (workCount === 0) {
    // Insert default roles
    await WorkDone.bulkCreate([
      { workid: "1", work: "Developing Software" },
      { workid: "2", work: "Operating system installation and maintenance" },
      {
        workid: "3",
        work: "Working as part of a team in a large software project",
      },
      { workid: "4", work: "Hardware fault diagnosis and repairs" },
      { workid: "5", work: "Designing WEB pages" },
      {
        workid: "6",
        work: "Developing a WEB application using ASP, .NET, PHP etc",
      },
      { workid: "7", work: "Designing/working with databases" },
      { workid: "8", work: "Learning to use complex company software" },
      { workid: "9", work: "Network installation and maintenance" },
    ]);

    console.log('Default work inserted into the "workdone" table.');
  } else {
    console.log('no need for insert "workdone" table.');
  }
});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});
app.get("/", (req, res) => {
  res.json({ message: "Welcome to IMS." });
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message, err);
  server.close(() => {
    process.exit(1);
  });
});
