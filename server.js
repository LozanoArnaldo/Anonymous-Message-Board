'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

const helmet = require("helmet");
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));


app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectToDatabase() {
  // Try Atlas first if available, fallback to in-memory database
  if (process.env.MONGO_URI && process.env.NODE_ENV !== 'test') {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log("MongoDB Atlas connected successfully");
      return;
    } catch (err) {
      console.warn("MongoDB Atlas connection failed, falling back to in-memory database");
      console.log("Atlas error:", err.message);
    }
  }
  
  // Use in-memory MongoDB (for testing or as fallback)
  try {
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("In-memory MongoDB connected successfully");
  } catch (err) {
    console.error("Failed to connect to any database:", err.message);
    process.exit(1);
  }
}

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests after DB connection!
async function startServer() {
  await connectToDatabase();
  
  const listener = app.listen(process.env.PORT || 5000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          console.log('Tests are not valid:');
          console.error(e);
        }
      }, 1500);
    }
  });
}

startServer().catch(console.error);

module.exports = app; //for testing
