/*jslint node:true, nomen:true */
'use strict';

var path = require('path'),
    qs = require('querystring'),

    BASE,
    CWD,
    Mojito,
    parseCsv = require('./lib/shared').parseCsv,
    writer = require('./lib/writer'),
    Scraper = require('./lib/scraper'),
    Builder = require('./lib/html5app');


function getConfigs(opts, buildtype, builddir, store) {
    var appconf = store.getAppConfig(opts.context) || {/* no app.json? */},
        pkgmeta = store.getResourceVersions({name: 'package'})[0].source,
        contextqs = qs.stringify(opts.context), // context as uri query string
        dotbuild; // shortcut to appconf.builds[buildtype]

    // define required parent properties, if missing
    dotbuild = (appconf.builds && appconf.builds[buildtype]) || {};
    appconf.staticHandling = appconf.staticHandling || {};

    if (builddir) {
        // override application.json:builds[buildtype].buildDir with cli arg
        dotbuild.buildDir = path.resolve(builddir);
    }

    if (!dotbuild.hasOwnProperty('buildDir')) {
        // use default build dir ./artifacts/builds/html5app
        dotbuild.buildDir = path.resolve('artifacts/builds', buildtype);
    }

    // ok, we should have all the inputs we need to proceed with any build
    // apply some default for anything that may be undefined
    return {
        mojitodir: BASE,
        app: {
            name: pkgmeta.pkg.name,
            version: pkgmeta.pkg.version,
            specs: appconf.specs || {},
            dir: pkgmeta.fs.rootDir // should be same as CWD
        },
        build: {
            attachManifest: dotbuild.attachManifest || false,
            forceRelativePaths: dotbuild.forceRelativePaths || false,
            insertCharset: dotbuild.insertCharset || 'UTF-8',
            port: opts.port || 1111,
            dir: dotbuild.buildDir,
            type: buildtype,
            uris: dotbuild.urls || []
        },
        context: opts.context,
        contextqs: contextqs.length ? '?' + contextqs : '',
        tunnelpf: appconf.tunnelPrefix || '/tunnel',
        staticpf: appconf.staticHandling.prefix || '/static'
    };
}

/**
 * Invoked by cli.js. Checks and normalizes input, optionally deletes
 * destination dir, then invokes subcommand html5app.js.
 */
function main(env, cb) {
    var buildtype = String(env.args[0]).toLowerCase(),
        Store,
        store,
        conf;

    if (env.opts.loglevel) {
        log.level = env.opts.loglevel;
        log.silly('logging level set to', env.opts.loglevel);
    }

    switch (buildtype) {
    case 'html5app':
        break;
    case 'undefined':
        return cb('Missing type', null, true);
    default:
        return cb('Invalid type', null, true);
    }

    if (env.app && env.mojito) {
        BASE = env.mojito.path;
        CWD = env.app.path;
    } else {
        return cb('Not a Mojito directory', null, true);
    }

    // hash a cli context string like 'device:iphone,environment:test'
    env.opts.context = typeof env.opts.context === 'string' ?
        parseCsv(env.opts.context) : {};

    // init resource store
    Mojito = require(path.join(env.mojito.path, 'lib', 'mojito'));
    Store = require(path.join(env.mojito.path, 'lib', 'store'));
    store = Store.createStore({
        root: CWD,
        context: env.opts.context
    });

    // normalize inputs
    conf = getConfigs(env.opts, buildtype, env.args[1], store);

    function next(err) {
        if (err) {
            return cb('Error removing ' + conf.build.dir + "\n" + err, null, true);
        }

        var builder = new Builder(writer, new Scraper(Mojito));
        builder.exec(conf, store, cb);
    }

    if (env.opts.replace) {
        writer.rmrf(conf.build.dir, next);
    } else {
        next();
    }
}

exports = main;

exports.options = [
    {shortName: 'c', hasValue: true,  longName: 'context'},
    {shortName: 'p', hasValue: true,  longName: 'port'},
    {shortName: 'r', hasValue: false, longName: 'replace'}
];

exports.usage = [
    'mojito build {type} [destination]',
    '',
    'type: "html5app" is currently the only valid type',
    'destination: (optional) the directory where the build output goes.',
    '  By default this is the type i.e. "./artifacts/builds/<type>"',
    '',
    'OPTIONS:',
    ' --replace: Tells the build system to delete the destination directory and replace it.',
    '        -r: Short for --replace',
    ' --context: Tells the build system what context to build with i.e. device=iphone&lang=en-GB.',
    '        -c: Short for --context\n'].join('\n  ');

exports.getConfigs = getConfigs;

module.exports = exports;
