var test = require('tap').test,
    path = require('path'),
    fn = require('../').getConfigs;

function getMockConfig(specs) {
    return {
        specs: {},
        builds: {
            html5app: {
                attachManifest: true,
                forceRelativePaths: true,
                urls: []
            }
        }
    };
}

function getMockResourceVersions() {
    return [{
        source: {
            pkg: {name: 'billy', version: '1.2.3'},
            fs: {rootDir: 'goat/lake'}
        }
    }];
}

test('getConfigs() no application.json', function(t) {
    var type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: undefined,
            app: {
                name: 'billy',
                version: '1.2.3',
                specs: {},
                dir: 'goat/lake'
            },
            build: {
                attachManifest: false,
                forceRelativePaths: false,
                insertCharset: 'UTF-8',
                port: 1111,
                dir: path.resolve(builddir),
                type: type,
                uris: []
            },
            context: undefined, // n.b. always an object in normal flow
            contextqs: '',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        };

    store = {
        getAppConfig: function(t_ctx) {
            t.equal(t_ctx, undefined, 'getAppConfig false');
            return false;
        },
        getResourceVersions: function rv(filterObj) {
            var expected = {name:'package'};
            t.same(filterObj, expected, 'getResourceVersions mock');
            return getMockResourceVersions();
        }
    };

    t.plan(3);

    actual = fn({}, type, builddir, store);
    t.same(actual, expected);
});

test('getConfigs() minimal configs', function(t) {
    var ctx = {device: 'iphone'},
        opts = {context: ctx},
        type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: undefined,
            app: {
                name: 'billy',
                version: '1.2.3',
                specs: {},
                dir: 'goat/lake'
            },
            build: {
                attachManifest: false,
                forceRelativePaths: false,
                insertCharset: 'UTF-8',
                port: 1111,
                dir: path.resolve(builddir),
                type: type,
                uris: []
            },
            context: ctx,
            contextqs: '?device=iphone',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        };

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return {specs:{}};
        },
        getResourceVersions: function rv(filterObj) {
            var expected = {name:'package'};
            t.same(filterObj, expected, 'getResourceVersions mock');
            return getMockResourceVersions();
        }
    };

    t.plan(3);

    actual = fn(opts, type, builddir, store);
    t.same(actual, expected);
});

test('getConfigs() some configs', function(t) {
    var ctx = {device: 'iphone'},
        opts = {context: ctx},
        type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: undefined,
            app: {
                name: 'billy',
                version: '1.2.3',
                specs: {},
                dir: 'goat/lake'
            },
            build: {
                attachManifest: true,
                forceRelativePaths: true,
                insertCharset: 'UTF-8',
                port: 1111,
                dir: path.resolve(builddir),
                type: type,
                uris: []
            },
            context: ctx,
            contextqs: '?device=iphone',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        };

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return getMockConfig();
        },
        getResourceVersions: function rv(filterObj) {
            var expected = {name:'package'};
            t.same(filterObj, expected, 'getResourceVersions mock');
            return getMockResourceVersions();
        }
    };

    t.plan(3);

    actual = fn(opts, type, builddir, store);
    t.same(actual, expected);
});

test('getConfigs() w/ buildDir config', function(t) {
    var ctx = {device: 'iphone'},
        opts = {context: ctx},
        type = 'html5app',
        builddir = '',
        store,
        actual,
        expected = {
            mojitodir: undefined,
            app: {
                name: 'billy',
                version: '1.2.3',
                specs: {},
                dir: 'goat/lake'
            },
            build: {
                attachManifest: true,
                forceRelativePaths: true,
                insertCharset: 'UTF-8',
                port: 1111,
                dir: 'buildDir/from/configs',
                type: type,
                uris: []
            },
            context: ctx,
            contextqs: '?device=iphone',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        };

    store = {
        getAppConfig: function(t_ctx) {
            var c = getMockConfig();
            c.builds.html5app.buildDir = 'buildDir/from/configs';
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return c;
        },
        getResourceVersions: function rv(filterObj) {
            var expected = {name:'package'};
            t.same(filterObj, expected, 'getResourceVersions mock');
            return getMockResourceVersions();
        }
    };

    t.plan(3);

    actual = fn(opts, type, builddir, store);
    t.same(actual, expected);
});

test('getConfigs() no specified buildDir', function(t) {
    var ctx = {device: 'iphone'},
        opts = {context: ctx},
        type = 'html5app',
        builddir = '',
        store,
        actual,
        expected = {
            mojitodir: undefined,
            app: {
                name: 'billy',
                version: '1.2.3',
                specs: {},
                dir: 'goat/lake'
            },
            build: {
                attachManifest: true,
                forceRelativePaths: true,
                insertCharset: 'UTF-8',
                port: 1111,
                dir: path.resolve('artifacts/builds', type),
                type: type,
                uris: []
            },
            context: ctx,
            contextqs: '?device=iphone',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        };

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return getMockConfig();
        },
        getResourceVersions: function rv(filterObj) {
            var expected = {name:'package'};
            t.same(filterObj, expected, 'getResourceVersions mock');
            return getMockResourceVersions();
        }
    };

    t.plan(3);

    actual = fn(opts, type, builddir, store);
    t.same(actual, expected);
});
