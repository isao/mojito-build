var test = require('tap').test,
    fn = require('../');


test('main: err missing type', function(t) {
    var env = {
            args: [],
            opts: {}
        };

    function cb(err) {
        t.equal(err, 'Missing type');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: err invalid type', function(t) {
    var env = {
            args: ['nonesuch'],
            opts: {}
        };

    function cb(err) {
        t.equal(err, 'Invalid type');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: err pls re-run in ur app', function(t) {
    var env = {
            args: ['html5app'],
            opts: {}
        };

    function cb(err) {
        t.equal(err, 'Please re-run this command in the top level of your application directory.');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: err pls re-run in ur app w/ --context', function(t) {
    var env = {
            args: ['html5app'],
            opts: {context: 'device:iphone'}
        };

    function cb(err) {
        t.equal(err, 'Please re-run this command in the top level of your application directory.');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: err pls install mojito', function(t) {
    var env = {
            args: ['html5app'],
            opts: {},
            app: true
        };

    function cb(err) {
        t.equal(err, 'Please install Mojito locally with your application.');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: err pls install mojito #2 w/ --log', function(t) {
    var env = {
            args: ['html5app'],
            opts: {loglevel:'error'},
            app: true
        };

    function cb(err) {
        t.equal(err, 'Please install Mojito locally with your application.');
    }

    t.plan(1);
    fn(env, cb);
});

test('main: fail cause i don gotz no mox', function(t) {
    var env = {
            args: ['html5app'],
            opts: {},
            app: {},
            mojito: {}
        };

    t.plan(1);
    t.throws(function() {
        fn(env, cb);
    }, 'empty env.mojito object throws');

});
