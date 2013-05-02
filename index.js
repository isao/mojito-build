/*jslint node:true, nomen:true */
'use strict';

var path = require('path'),
    qs = require('querystring'),

    log = require('./lib/log'),
    parseCsvObj = require('./lib/shared').parseCsvObj,
    writer = require('./lib/writer'),
    Scraper = require('./lib/scraper'),
    Builder = require('./lib/html5app');


function getConfigs(buildtype, env, store) {
    var builddir = env.args.shift() || env.opts.directory,
        appconf = store.getAppConfig(env.opts.context) || {/* no app.json? */},
        contextqs = qs.stringify(env.opts.context), // context as uri query string
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
        mojitodir: env.mojito.path,
        app: {
            name: env.app.name,
            version: env.app.version,
            specs: appconf.specs || {},
            dir: env.app.path // i.e. process.cwd()
        },
        build: {
            attachManifest: dotbuild.attachManifest || false,
            forceRelativePaths: dotbuild.forceRelativePaths || false,
            insertCharset: dotbuild.insertCharset || 'UTF-8',
            port: env.opts.port || 1111,
            dir: dotbuild.buildDir,
            type: buildtype,
            uris: dotbuild.urls || []
        },
        context: env.opts.context,
        contextqs: contextqs.length ? '?' + contextqs : '',
        tunnelpf: appconf.tunnelPrefix || '/tunnel',
        staticpf: appconf.staticHandling.prefix || '/static'
    };
}

/**
 * Invoked by cli.js. Checks and normalizes input, optionally deletes
 * destination dir, then invokes subcommand html5app.js.
 */
// todo use real error objects with exit codes
function main(env, cb) {
    var buildtype = (env.args.shift() || '').toLowerCase(),
        Mojito,
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
    case '':
        return cb('Missing type');
    default:
        return cb('Invalid type');
    }

    // hash a cli context string like 'device:iphone,environment:test'
    env.opts.context = typeof env.opts.context === 'string' ?
        parseCsvObj(env.opts.context) : {};

    // todo error objects with exit codes instead of strings
    if (!env.app) {
        cb('Please re-run this command in the top level of your application directory.');
        return;
    } else if (!env.mojito) {
        cb('Please install Mojito locally with your application.');
        return;
    }

    // init resource store
    Mojito = require(path.join(env.mojito.path, 'lib', 'mojito'));
    Store = require(path.join(env.mojito.path, 'lib', 'store'));
    store = Store.createStore({
        root: env.app.path,
        context: env.opts.context
    });

    // normalize inputs
    conf = getConfigs(buildtype, env, store);

    function next(err) {
        if (err) {
            return cb('Error removing ' + conf.build.dir + "\n" + err, null, true);
        }

        var builder = new Builder(writer, new Scraper(Mojito));

        builder.exec(conf, store, function ondone(err, msg) {
            cb(err, err ? null : 'Done.');
        });
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
    'Usage: mojito build [options] <type> [destination]',
    '',
    'A type of "html5app" is currently the only build type.',
    'The destination can be specified in one of the following ways:',
    '- the last argument',
    '- using the --directory <path> option',
    '- specifying a directory in application.json with the property',
    '  builds.html5app.buildDir: "<path>"',
    '- otherwise the destination will be "artifacts/builds/html5app"',
    '  in the application (current working) directory.',
    '',
    'Example: mojito build html5app ../myapp-build',
    '  Builds app in directory named "myapp-build" one directory up',
    '',
    'Options:',
    ' --directory <path>  Specify a destination directory.',
    ' -d <path>           Short for --directory',
    ' --replace           Replace the destination directory (delete first).',
    ' -r                  Short for --replace',
    ' --context           Specifies context for build, i.e. "lang=en-GB".',
    ' -c                  Short for --context\n'].join('\n  ');

exports.getConfigs = getConfigs;

module.exports = exports;
