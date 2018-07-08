var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var partials = require('express-partials')
var jwt = require('express-jwt');
var config = require('./config/config.js');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
// app.use(jwt({ secret: config.secret}).unless({path: ['/', /stylesheets/, /assets/, /fonts/, /login/, /logout/]}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);

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
  // res.render('error');
  return res.status(500).json({
    success: false,
    message: err.message,
    status: 500
  })
});

// Get token from Auth0
var { getAuth0Token } = require('./helper')
getAuth0Token();

module.exports = app;
// run on terminal using below command
// DEBUG=web:* npm start
