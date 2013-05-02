/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
// todo: use scanfs instead
'use strict';

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    copydir = require('wrench').copyDirSyncRecursive; // http://git.io/KYvKWw


function read(from) {
    return fs.readFileSync(from, 'utf-8');
}

function write(filepath, str) {
    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, str, 'utf-8');
}

function writeJson(filepath, obj) {
    write(filepath, JSON.stringify(obj, null, 4));
}

function copy(from, to) {
    write(to, read(from));
}

function rmrf(dir, cb) {
    rimraf(dir, cb);
}

module.exports = {
    read: read,
    write: write,
    writeJson: writeJson,
    copy: copy,
    copydir: copydir,
    rmrf: rmrf
};
