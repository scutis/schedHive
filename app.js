var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Import routes
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var search = require('./routes/search');
var get_pm = require('./routes/get_pm');
var add_pm = require('./routes/add_pm');
var content = require('./routes/content');
var list_pm = require('./routes/list_pm');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome/'));
app.use('/html5shiv', express.static(__dirname + '/node_modules/html5shiv/dist/'));
app.use('/respond', express.static(__dirname + '/node_modules/respond.js/dest/'));
app.use('/metismenu', express.static(__dirname + '/node_modules/metismenu/dist/'));


//Import session
var session = require('./session');
app.use(session);

app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/search', search);
app.use('/get_pm', get_pm);
app.use('/add_pm', add_pm);
app.use('/list_pm', list_pm);
app.use('/content', content);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.redirect('/'); //redirect to index
    /*
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    */
});
/*
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
*/

module.exports = app;
