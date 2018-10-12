var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { MiddlewareChain, enhanceApp } = require('../../dist/index');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 初始化中间件链
var chain = new MiddlewareChain();

chain
  .middleware('logger')
  .use(logger('dev'))
  .end()
  .middleware('json')
  .use(express.json())
  .end()
  .middleware('urlEncoded')
  .use(express.urlencoded({ extended: false }))
  .end()
  .middleware('cookie')
  .use(cookieParser())
  .end()
  .middleware('static')
  .use(express.static(path.join(__dirname, 'public')))
  .end();


// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

chain
  .middleware('index')
  .use('/', indexRouter)
  .end()
  .middleware('users')
  .use('/users', usersRouter)
  .end();

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

console.log('-----------产生的中间件配置----------');
console.log(JSON.stringify(chain.toConfig(), {} , 2))
console.log('----------------------------------');


enhanceApp(app, chain.toConfig());
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

module.exports = app;
