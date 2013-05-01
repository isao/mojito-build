var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    copydir = require('wrench').copyDirSyncRecursive,

    test = require('tap').test,
    fn = require('../lib/writer'),
    
    somefrom = path.resolve(__dirname, '../package.json'),
    someto = path.resolve(__dirname, 'artifacts', 'deleteme.json');


test('writer copy()', function(t) {
    var expected = fs.readFileSync(somefrom),
        actual;

    fn.copy(somefrom, someto);
    actual = fs.readFileSync(someto);
    t.same(actual, expected);
    t.end();
});

test('writer writeJson()', function(t) {
    var expected = {a:1, b:2},
        actual;

    fn.writeJson(someto, expected);
    actual = require(someto);
    t.same(actual, expected);
    t.end();
});

test('writer rimraf() - [deletes prev test(s) artifact]', function(t) {
    var rmrf_me = path.resolve(__dirname, 'artifacts');

    function cb(err) {
        t.ok(!err);
    }
    
    t.plan(1);
    fn.rmrf(rmrf_me, cb);
});
