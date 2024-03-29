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
var new_grp = require('./routes/new_grp');
var list_grp = require('./routes/list_grp');
var edit_grp = require('./routes/edit_grp');
var new_thrd = require('./routes/new_thrd');
var get_thrd = require('./routes/get_thrd');
var edit_pref = require('./routes/edit_pref');
var add_cmt = require('./routes/add_cmt');
var list_notif = require('./routes/list_notif');
var edit_pro = require('./routes/edit_pro');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.raw({limit: '50mb'}) );
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

//Import session
var session = require('./session');
app.use(session);

//Protect upload folder
app.get('/upload/*', function(req, res, next) {
    if (req.session.user)
        next();
    else
        res.sendStatus(403);
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome/'));
app.use('/html5shiv', express.static(__dirname + '/node_modules/html5shiv/dist/'));
app.use('/respond', express.static(__dirname + '/node_modules/respond.js/dest/'));
app.use('/metismenu', express.static(__dirname + '/node_modules/metismenu/dist/'));
app.use('/timepicker', express.static(__dirname + '/node_modules/timepicker/'));
app.use('/datepair', express.static(__dirname + '/node_modules/datepair.js/dist'));


app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/search', search);
app.use('/get_pm', get_pm);
app.use('/add_pm', add_pm);
app.use('/list_pm', list_pm);
app.use('/content', content);
app.use('/new_grp', new_grp);
app.use('/list_grp', list_grp);
app.use('/edit_grp', edit_grp);
app.use('/new_thrd', new_thrd);
app.use('/get_thrd', get_thrd);
app.use('/edit_pref', edit_pref);
app.use('/add_cmt', add_cmt);
app.use('/list_notif', list_notif);
app.use('/edit_pro', edit_pro);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);

});

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

module.exports = app;
