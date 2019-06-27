var express = require('express');
var glob = require('glob');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
// var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var exphbs = require('express-handlebars');

module.exports = function(app, config, io) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';
  app.enable('trust proxy');
  app.engine(
    'handlebars',
    exphbs({
      layoutsDir: config.root + '/app/views/layouts/',
      defaultLayout: 'main',
      partialsDir: [config.root + '/app/views/partials/'],
    }),
  );
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');

  //存取記錄

  // Logging Starts here
  var FileStreamRotator = require('file-stream-rotator');
  var fs = require('fs');
  var logDirectory = path.join(global.appRoot, 'log');
  // 目錄未建立就建立
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  // 檔案名稱、日期格式及記錄週期設定
  var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: '30d', //記錄週期區間30天
  });

  // 搭配file-stream-rotator寫入文件 combined是比較詳細的request記錄 是morgan的設定
  app.use(logger('combined', { stream: accessLogStream }));
  //簡單的request 記錄輸出到console
  app.use(logger('dev'));

  //存取紀錄 END

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var cookieSessionMiddleware = cookieSession({
    name: 'session',
    keys: ['qeqw456789a'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
  io.use(function(socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
  });
  app.use(cookieSessionMiddleware);

  // app.use(session({
  //   secret: '123456',
  //   name: 'cookie-name',
  //   proxy: true,
  //   resave: true,
  //   saveUninitialized: true
  // }));

  app.use('*', (req, res, next) => {
    if (
      req.baseUrl === '/api/login' ||
      req.baseUrl === '/api/logout' ||
      req.baseUrl === '/api/user'
    ) {
      return next();
    }
    if (req.session.user) {
      next();
    } else {
      console.error(
        `NOT ALLOWED REQUEST ${req.baseUrl} FROM ${req.ip} DUE TO NOT LOGINED!!`,
      );
      return res.sendStatus(500);
    }
  });

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function(controller) {
    require(controller)(app);
  });

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error',
      });
    });
  }

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error',
    });
  });

  return app;
};
