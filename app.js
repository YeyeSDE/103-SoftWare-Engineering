const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const layouts = require("express-ejs-layouts");
const pw_auth_router = require('./routes/pwauth')
const toDoRouter = require('./routes/todo');
const transactionRouter = require('./routes/transaction');
const weatherRouter = require('./routes/weather');
require('dotenv').config();



const User = require('./models/User');

/* **************************************** */
/*  Connecting to a Mongo Database Server   */
/* **************************************** */
const mongodb_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pwdemo';
console.log('MONGODB_URI=',process.env.MONGODB_URI);

const mongoose = require( 'mongoose' );

mongoose.connect( mongodb_URI);

const db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

/* **************************************** */
/* Enable sessions and storing session data in the database */
/* **************************************** */
const session = require("express-session"); // to handle sessions using cookies 
var MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});

// Catch errors                                                                      
store.on('error', function(error) {
  console.log(error);
});

/* **************************************** */
/*  middleware to make sure a user is logged in */
/* **************************************** */
function isLoggedIn(req, res, next) {
  "if they are logged in, continue; otherwise redirect to /login "
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

/* **************************************** */
/* creating the app */
/* **************************************** */
var app = express();

app.use(session({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week                                        
  },
  store: store,
  // Boilerplate options, see:                                                       
  // * https://www.npmjs.com/package/express-session#resave                          
  // * https://www.npmjs.com/package/express-session#saveuninitialized               
  resave: true,
  saveUninitialized: true
}));

// view engine setup
// set the application's 'views' directory to the 'views' folder within the current directory.
app.set('views', path.join(__dirname, 'views'));

// set the application's view engine to ejs.
app.set('view engine', 'ejs');

// sse the 'dev' logger middleware for HTTP request logging.
app.use(logger('dev'));

// parse JSON request bodies.
app.use(express.json());

// parse URL-encoded request bodies.
app.use(express.urlencoded({ extended: false }));

// parse cookies from incoming requests.
app.use(cookieParser());

// serve static files from the 'public' directory within the current directory.
app.use(express.static(path.join(__dirname, 'public')));

// use the 'pw_auth_router' middleware for requests that match its routes.
app.use(pw_auth_router)

// use the 'layouts' middleware for rendering views with layouts.
app.use(layouts);

// set up a route for the application's root path ('/').
// when a GET request is received for this route, render the 'index' view.
app.get('/', (req,res,next) => {
  res.render('index');
})

// set up a route for the '/about' path.
// this route requires the user to be authenticated, and when a GET request is received for this route, render the 'about' view.
app.get('/about', 
  isLoggedIn,
  (req,res,next) => {
    res.render('about');
  }
)

// set multiple features for the app by set of routes and controller functions that are encapsulated in separate routers
app.use(toDoRouter);
app.use(transactionRouter);
app.use(weatherRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// export the module
module.exports = app;

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});