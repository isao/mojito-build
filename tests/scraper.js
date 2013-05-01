var test = require('tap').test,
    log = require('../lib/log'),
    Scraper = require('../lib/scraper');


log.pause();


test('scraper start', function(t) {
    var opts = {port:'of oakland', context: 'cargo:full'},
        scraper,
        mojito;

    mojito = {
        createServer: function(actual) {
         t.same(actual, opts);
        }
    };

    t.plan(2);
    scraper = new Scraper(mojito);
    t.same(scraper.start(opts), scraper);
});

test('scraper fetch & listen(err)', function(t) {
    var scraper,
        mojito;

    function listen(a1, a2, listenHandler) {
        t.same(a1, null);
        t.same(a2, null);
        listenHandler('omg!'); // err…
    }

    function cb(err) {
        t.equal(err, 'Failed to start server.'); // …goes here
    }

    function onerror(err) {
        t.equal(err, 'omg!'); // …and here
    }

    mojito = {
        createServer: function(opts) {
            return {listen: listen};
        }
    };

    t.plan(4);
    scraper = new Scraper(mojito);
    scraper.start({});

    scraper.on('error', onerror);
    scraper.fetch({}, cb);
});

test('scraper fetch & listen() w/ 1 url', function(t) {
    var scraper,
        mojito,
        buildmap = {'/a/b/c?def': '/a/b/c'};

    function listen(a1, a2, listenHandler) {
        t.same(a1, null);
        t.same(a2, null);
        listenHandler();
    }

    function getWebPage(key, opts, getWebPageCb) {
        t.equal(key, '/a/b/c?def');
        t.same(opts, {headers: {'x-mojito-build': 'html5app'}});
        
        getWebPageCb(null, key, '/a/b/c content');
    }

    function ondone(err, have, failed) {
        t.same(err, null);
        t.equal(have, Object.keys(buildmap).length); // 1
        t.equal(failed, 0);
    }

    function close() {
        t.equal(arguments.length, 0);
    }

    mojito = {
        createServer: function(opts) {
            return {
                listen: listen,
                getWebPage: getWebPage,
                close: close
            };
        }
    };

    t.plan(8);
    scraper = new Scraper(mojito);
    scraper.start({});

    scraper.on('scraping-done', ondone);
    scraper.fetch(buildmap, 'never called');
});

test('scraper fetch & listen() w/ 2 urls', function(t) {
    var scraper,
        mojito,
        buildmap = {
            '/a/b/c?def': '/a/b/c',
            '/n/o/p?def': '/n/o/p'
        };

    function listen(a1, a2, listenHandler) {
        listenHandler();
    }

    function getWebPage(key, opts, getWebPageCb) {
        getWebPageCb(null, key, 'untested');
    }

    function ondone(err, have, failed) {
        t.same(err, null);
        t.equal(have, Object.keys(buildmap).length); // 2
        t.equal(failed, 0);
    }

    function close() {
    }

    mojito = {
        createServer: function(opts) {
            return {
                listen: listen,
                getWebPage: getWebPage,
                close: close
            };
        }
    };

    t.plan(3);
    scraper = new Scraper(mojito);
    scraper.start({});

    scraper.on('scraping-done', ondone);
    scraper.fetch(buildmap, 'never called');
});

test('scraper fetch & listen() w/ getWebPageCb err', {timeout: 22}, function(t) {
    var scraper,
        mojito,
        buildmap = {'/a/b/c?def': '/a/b/c'};

    function listen(a1, a2, listenHandler) {
        t.same(a1, null);
        t.same(a2, null);
        listenHandler();
    }

    function getWebPage(key, opts, getWebPageCb) {
        t.equal(key, '/a/b/c?def');
        t.same(opts, {headers: {'x-mojito-build': 'html5app'}});
        getWebPageCb('OOOHH NOES!', 'oaktown/is/not/a/url');
    }
    
    function onwarn(msg) {
        t.equal(msg, 'FAILED to get oaktown/is/not/a/url');
    }

    function ondone(err, have, failed) {
        t.same(err, null);
        t.equal(have, Object.keys(buildmap).length); // 1
        t.equal(failed, 1);
    }

    function close() {
        t.equal(arguments.length, 0);
    }

    mojito = {
        createServer: function(opts) {
            return {
                listen: listen,
                getWebPage: getWebPage,
                close: close
            };
        }
    };

    t.plan(9);
    scraper = new Scraper(mojito);
    scraper.start({});

    scraper.on('warn', onwarn);
    scraper.on('scraping-done', ondone);
    scraper.fetch(buildmap, 'never called');
});
