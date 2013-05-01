var test = require('tap').test,
    log = require('../lib/log'),
    Html5app = require('../lib/html5app'),
    writer,
    store;


log.pause();


writer = {
    read: function() {},
    write: function() {},
    writeJson: function() {},
    copy: function() {},
    copydir: function() {},
    rmrf: function() {}
};

store = {
    getAllURLs: function() {
    },
    getResourceVersions: function() {
        return [];
    }
};

function getConf() {
    return {
        mojitodir: '/Users/isao/Repos/mojito/myfork/',
        app: {
            name: 'staticpf',
            version: '0.0.1',
            specs: {
                frame: {},
                tunnelProxy: {}
            },
            dir: '/path/to/app'
        },
        snapshot: {
            name: '',
            tag: '',
            packages: {}
        },
        build: {
            attachManifest: false,
            forceRelativePaths: false,
            insertCharset: 'UTF-8',
            port: 1111,
            dir: '/path/to/build/dir',
            type: 'html5app',
            uris: ['p1', 'p2']
        },
        context: {
            device: 'iphone'
        },
        contextqs: '?device=iphone',
        tunnelpf: '/tunnel',
        staticpf: 'staticpf'
    };
}

test('zz', function(t) {
    var conf = getConf(),
        done = function done() {},
        scraper = {
            on: function(event_name, cb) {
                // this function is called twice
                t.ok(event_name.match(/scraped-one|scraping-done/));
                t.equal(typeof cb, 'function', 'cb is a function');
                
                // on success, cb is called by scraping-done event
                if (event_name === 'scraping-done') {
                	t.same(done, cb);
                }
                return scraper;
            },
            start: function(obj) {
                t.same(obj,{port: conf.build.port, context: conf.context});
                return scraper;
            },
            fetch: function(obj, cb) {
                expected = {
                    '/?device=iphone': '/index.html',
                    'p1?device=iphone': 'p1',
                    'p2?device=iphone': 'p2',
                    '/tunnel/staticpf/frame/specs/default.json?device=iphone': '/staticpf/frame/specs/default.json',
                    '/tunnel/staticpf/tunnelProxy/specs/default.json?device=iphone': '/staticpf/tunnelProxy/specs/default.json'
                }
                t.same(obj, expected);
            }
        },
        html5app = new Html5app(writer, scraper);

    t.plan(7);

    html5app.exec(conf, store, done);

    t.end();
});
