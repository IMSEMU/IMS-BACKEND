import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/index.js';

dotenv.config();

const app = express();

const whitelist = ['http://localhost:3000'];

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    } else if (whitelist.indexOf(origin) === -1) {
      return callback(new Error('not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  methods: 'GET, PATCH, POST, PUT, DELETE',
};
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Methods', 'GET, PATCH, POST, PUT, DELETE');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept'
//   );
//   res.header('Access-Control-Allow-Credentials', 'true');

//   next();
// });
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.json());
app.use('/api/v1', router);

const port = 8080;

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
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

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message, err);
  server.close(() => {
    process.exit(1);
  });
});
