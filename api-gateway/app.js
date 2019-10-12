var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const formidableMiddleware = require('express-formidable');
var timeout = require('connect-timeout'); //express v4


var e2eRouter = require('./routes/E2E');
var rtRouter = require('./routes/RT');
var bdtRouter = require('./routes/BDT');
var vrtRouter = require('./routes/VRT');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(formidableMiddleware({
  encoding: 'utf-8',
  multiples: true, // req.files to be arrays of files
}))
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(timeout(99999999));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.use('/e2e', e2eRouter);
app.use('/rt', rtRouter);
app.use('/bdt', bdtRouter);
app.use('/vrt', vrtRouter);

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
  res.send(err.message);
});

module.exports = app;
