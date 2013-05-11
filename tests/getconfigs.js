var test = require('tap').test,
    path = require('path'),
    fn = require('../build').getConfigs;


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

function getEnv(args, opts) {
    return {
        args: args || [],
        opts: opts || {context:{}},
        mojito: {path: 'path/to/mojito'},
        app: {
            name: 'billy',
            version: '1.2.3',
            specs: {},
            path: 'goat/lake'
        }
    };
}

test('getConfigs() no application.json', function(t) {
    var type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: 'path/to/mojito',
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
            context: {}, // n.b. always an object in normal flow
            contextqs: '',
            tunnelpf: '/tunnel',
            staticpf: '/static'
        },
        env = getEnv([builddir]);

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, {}, 'getAppConfig false');
            return false;
        }
    };

    t.plan(2);

    actual = fn(type, env, store);
    t.same(actual, expected);
});

test('getConfigs() minimal configs', function(t) {
    var ctx = {device: 'iphone'},
        type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: 'path/to/mojito',
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
        },
        env = getEnv([builddir], {context: ctx});

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return {specs:{}};
        }
    };

    t.plan(2);

    actual = fn(type, env, store);
    t.same(actual, expected);
});

test('getConfigs() some configs', function(t) {
    var ctx = {device: 'iphone'},
        type = 'html5app',
        builddir = 'path/to/builddir',
        store,
        actual,
        expected = {
            mojitodir: 'path/to/mojito',
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
        },
        env = getEnv([builddir], {context: ctx});

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return getMockConfig();
        }
    };

    t.plan(2);

    actual = fn(type, env, store);
    t.same(actual, expected);
});

test('getConfigs() w/ buildDir config', function(t) {
    var ctx = {device: 'iphone'},
        opts = {context: ctx},
        type = 'html5app',
        store,
        actual,
        expected = {
            mojitodir: 'path/to/mojito',
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
        },
        env = getEnv([], {context: ctx});

    store = {
        getAppConfig: function(t_ctx) {
            var c = getMockConfig();
            c.builds.html5app.buildDir = 'buildDir/from/configs';
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return c;
        }
    };

    t.plan(2);

    actual = fn(type, env, store);
    t.same(actual, expected);
});

test('getConfigs() no specified buildDir', function(t) {
    var ctx = {device: 'iphone'},
        type = 'html5app',
        store,
        actual,
        expected = {
            mojitodir: 'path/to/mojito',
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
        },
        env = getEnv([], {context: ctx});

    store = {
        getAppConfig: function(t_ctx) {
            t.same(t_ctx, ctx, 'getAppConfig mock');
            return getMockConfig();
        }
    };

    t.plan(2);

    actual = fn(type, env, store);
    t.same(actual, expected);
});
