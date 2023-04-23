var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var handlebars = require('handlebars');
var mathHelpers = require('./public/javascripts/math-helpers');
var session = require('express-session');
const nocache = require('nocache');
require('dotenv').config();


var {MongoClient} = require('mongodb-legacy');

var adminRouter = require('./routes/admin');
var userRouter = require('./routes/users');

var db = require('./config/connection');

var app = express();

app.use(nocache());

// view engine setup

handlebars.registerHelper(mathHelpers);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine ({extname: 'hbs',defaultLayout: 'layout', layoutsDir:__dirname + '/views/layout/',partialsDir:__dirname+'/views/partials/'}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:600000}
}))

db.connect((err) => {
  console.log("Mongodb Connecting---")
  if(err) console.log('Connection Failed'+err);
  else console.log('Database Connected');
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  let errorPage;
  res.render('error', {errorPage: true });
});

module.exports = app; 
