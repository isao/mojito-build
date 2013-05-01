var test = require('tap').test,
    path = require('path'),
    fn = require('../lib/shared');


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
            uris: []
        },
        context: {
            device: 'iphone'
        },
        contextqs: '?device=iphone',
        tunnelpf: '/tunnel',
        staticpf: 'staticpf'
    };
}

test('copyModule', function(t) {
    t.plan(2);
    
    fn.init({copydir: function(from, to) {
    	t.equal(from, 'path/from/node_modules/Blue');
    	t.equal(to, 'path/to/Blue');
    }});

    fn.copyModule('path/from', 'Blue', 'path/to');
});

test('mapStoreUris modifies buildmap param by reference', function(t) {
    var buildmap = {},
        storemap = {
            '/staticpf/top_frame/assets/index.css': '/path/to/app/mojits/top_frame/assets/index.css'
        },
        expected = {
            '/staticpf/top_frame/assets/index.css?device=iphone': '/staticpf/top_frame/assets/index.css'
        };

    t.plan(1);
    fn.mapStoreUris(buildmap, getConf(), storemap);
    t.same(buildmap, expected);
});

test('mapStoreUris maps css, js, json files', function(t) {
    var buildmap = {
            '/?device=iphone': '/index.html'
        },
        storemap = {
            '/staticpf/top_frame/assets/index.css': '/path/to/app/mojits/top_frame/assets/index.css',
            '/staticpf/top_frameBinderIndex.js': '/path/to/app/mojits/top_frame/binders/index.js',
            '/staticpf/top_frame/package.json': '/path/to/app/mojits/top_frame/package.json',
            '/staticpf/top_frame/views/index.hb.html': '/path/to/app/mojits/top_frame/views/index.hb.html',
            '/favicon.ico': '/Users/isao/Repos/mojito/myfork/lib/app/assets/favicon.ico',
        },
        expected = {
            '/?device=iphone': '/index.html',
            '/staticpf/top_frame/assets/index.css?device=iphone': '/staticpf/top_frame/assets/index.css',
            '/staticpf/top_frameBinderIndex.js?device=iphone': '/staticpf/top_frameBinderIndex.js',
            '/staticpf/top_frame/package.json?device=iphone': '/staticpf/top_frame/package.json'
        },
        conf = getConf();

    fn.init({copy: function(from, to) {
    	t.ok(from.match(/(html|ico)$/));
    	t.ok(to.match(/(html|ico)$/));
    }});

    t.plan(5);

    fn.mapStoreUris(buildmap, conf, storemap);
    t.same(buildmap, expected);
});

test('mapDefxUris adds definition.json for client mojits', function(t) {
    var mojits = [{
            source: {
                fs: {
                    fullPath: '/Users/isao/Repos/mojito/apps/test50/test50/mojits/top_frame',
                    rootDir: '/Users/isao/Repos/mojito/apps/test50/test50/mojits/top_frame',
                    rootType: 'app',
                    subDir: '.',
                    subDirArray: [ '.' ],
                    isFile: false,
                    ext: '',
                    basename: ''
                },
                pkg: { name: 'yahoo.application.test50', version: '0.0.1', depth: 0 }
            },
            type: 'mojit',
            name: 'top_frame',
            id: 'mojit--top_frame',
            affinity: { affinity: 'common' },
            selector: '*',
            mime: { type: 'application/octet-stream', charset: undefined },
            url: '/yahoo.application.test50/top_frame'
        }],
        store = {
            getResourceVersions: function(filter) {
                t.equal(typeof filter, 'object');
                t.ok(filter.type);
                return mojits;
            }
        },
        buildmap = {},
        expected = {'/tunnel/yahoo.application.test50/top_frame/definition.json?device=iphone': '/yahoo.application.test50/top_frame/definition.json'};

    t.plan(5);
    fn.mapDefxUris(buildmap, getConf(), store);
    t.same(buildmap, expected);
});

test('mapDefxUris does nothing if mojit has no "url"', {timeout: 99}, function(t) {
    var mojits = [{
            source: {
                fs: {
                    fullPath: '/Users/isao/Repos/mojito/apps/test50/test50/mojits/top_frame',
                    rootDir: '/Users/isao/Repos/mojito/apps/test50/test50/mojits/top_frame',
                    rootType: 'app',
                    subDir: '.',
                    subDirArray: [ '.' ],
                    isFile: false,
                    ext: '',
                    basename: ''
                },
                pkg: { name: 'yahoo.application.test50', version: '0.0.1', depth: 0 }
            },
            type: 'mojit',
            name: 'top_frame',
            id: 'mojit--top_frame',
            affinity: { affinity: 'common' },
            selector: '*',
            mime: { type: 'application/octet-stream', charset: undefined },
            REDACTED_URL: '/yahoo.application.test50/top_frame'
        }],
        store = {
            getResourceVersions: function(filter) {
                t.equal(typeof filter, 'object');
                t.ok(filter.type);
                return mojits;
            }
        },
        buildmap = {},
        expected = {};

    t.plan(3);
    fn.mapDefxUris(buildmap, getConf(), store);
    t.same(buildmap, expected);
});

test('mapFunkySpecUris maps app.json specs to default.json files', function(t) {
    var buildmap = {},
        expected = {
            '/tunnel/staticpf/frame/specs/default.json?device=iphone': '/staticpf/frame/specs/default.json',
            '/tunnel/staticpf/tunnelProxy/specs/default.json?device=iphone': '/staticpf/tunnelProxy/specs/default.json'
        };

    fn.mapFunkySpecUris(buildmap, getConf());
    t.same(buildmap, expected);
    t.end();
});

test('mapFunkySpecUris handles obscure Livestand mojit specs', function(t) {
    var buildmap = {},
        expected = {'tunnelpf/staticpf/foo/specs/bar.json?foo=bar': '/staticpf/foo/specs/bar.json'};

    fn.mapFunkySpecUris(buildmap, {staticpf:'staticpf', contextqs: '?foo=bar', tunnelpf:'tunnelpf',app:{specs:{'foo:bar':{}}}});
    t.same(buildmap, expected); 
    t.end();
});

test('makeManifest writes build/dir/cache.manifest', function(t) {
    var buildmap = buildmap = {
            '/?device=iphone': '/index.html'
        };

    fn.init({write: function(dest, str) {
        var lines = str.split('\n');
    	t.equal(dest, 'build/dir/cache.manifest');
    	t.equal(lines.shift(), 'CACHE MANIFEST');
    	t.equal(lines.pop(), '/index.html');
    }});
    
    t.plan(3);
    fn.makeManifest(buildmap, 'build/dir', new Date());
});

test('mungePage does nothing unless attachManifest, insertCharset, forceRelativePaths are true', function(t) {
    var uri = '/uri.html',
        oldstr = 'blah blah <html> blah blah',
        newstr;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/uri.html');
    	t.equal(str, oldstr);
    }});

    t.plan(3);
    newstr = fn.mungePage(getConf(), uri, oldstr);
    t.equal(newstr, oldstr);

});

test('test mungePage does nothing if uri is not *.html', function(t) {
    var uri = '/uri.css',
        oldstr = 'blah blah <html> blah blah',
        newstr,
        expected = 'blah blah <html manifest="some/uri"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;
    conf.build.insertCharset = 'UTF-8';

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/uri.css');
    	t.equal(str, oldstr);
    }});

    t.plan(3);

    newstr = fn.mungePage(getConf(), uri, oldstr);    
    t.equal(newstr, oldstr);
});

test('mungePage for attachManifest:true', function(t) {
    var uri = '/uri.html',
        oldstr = 'blah blah <html> blah blah',
        newstr,
        expected = 'blah blah <html manifest="cache.manifest"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/uri.html');
    	t.equal(str, expected);
    }});

    t.plan(4)
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(expected, newstr);
});

test('mungePage for forceRelativePaths:true', function(t) {
    var uri = '/foo/bar/uri.html',
        oldstr = 'blah blah <a href="/foo/bar/baz/bah.html"> blah blah',
        newstr,
        expected = 'blah blah <a href="baz/bah.html"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/foo/bar/uri.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);
});


test('mungePage for forceRelativePaths:true nested', function(t) {
    var uri = '/foo/bar/baz/bah/uri.html',
        oldstr = 'blah blah <a href="/foo/bah.html"> blah blah',
        newstr,
        expected = 'blah blah <a href="../../../bah.html"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/foo/bar/baz/bah/uri.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);
});

test('mungePage for forceRelativePaths:true with no common root', function(t) {
    var uri = '/a/b/c/uri.html',
        oldstr = 'blah blah <a href="/foo/bar/baz/bah.html"> blah blah',
        newstr,
        expected = 'blah blah <a href="../../../foo/bar/baz/bah.html"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/a/b/c/uri.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);    
});

test('mungePage for forceRelativePaths:true again..', function(t) {
    var uri = '/foo/bar/baz/bah/uri.html',
        oldstr = 'blah blah <a href="/foo/bah.html"> blah blah',
        newstr,
        expected = 'blah blah <a href="../../../bah.html"> blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/foo/bar/baz/bah/uri.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);    
});

test('mungePage for insertCharset:true, "/"', function(t) {
    var uri = '/',
        oldstr = 'blah blah <head beepoo="boppoo"\npoo> blah blah',
        newstr,
        expected = 'blah blah <head beepoo="boppoo"\npoo>\n<meta charset="UTF-8">\n blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/index.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);    
});

test('mungePage for insertCharset:true simple tag', function(t) {
    var uri = '/',
        oldstr = 'blah blah <head> blah blah',
        newstr,
        expected = 'blah blah <head>\n<meta charset="UTF-8">\n blah blah',
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    fn.init({write: function(dest, str) {
    	t.equal(dest, '/path/to/build/dir/index.html');
    	t.equal(str, expected);
    }});

    t.plan(4);
    newstr = fn.mungePage(conf, uri, oldstr);

    t.notEqual(newstr, oldstr);
    t.equal(newstr, expected);    
});

test('mungePage for insertCharset:true does nothing if there already is a charset metatag', function(t) {
    var uri = '/',
        oldstr = 'blah blah <head boo\npoo> blah blah<meta charset="zippy">',
        newstr,
        conf = getConf();

    conf.build.attachManifest = true;
    conf.build.forceRelativePaths = true;

    t.plan(1);
    newstr = fn.mungePage(conf, uri, oldstr);
    t.equal(newstr, oldstr);
});
