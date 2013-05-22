mojito-cli-build [![Build Status](https://travis-ci.org/yahoo/mojito-cli-build.png)](https://travis-ci.org/yahoo/mojito-cli-build)
==========

This package provides the `build` command for the [`mojito-cli`](https://github.com/yahoo/mojito-cli) tool, to create static snapshots of mojito applications for HTML5 app publishing. Install `mojito-cli` to use the `mojito doc` command.

    npm install -g mojito-cli

Usage
-----

From the top of your mojito application directory, with mojito installed locally:

    mojito build html5app

By default, the static files will be saved in `artifacts/builds/html5app/`. You can specify another destination like:

    mojito build html5app ../myhtml5app

Or

    mojito build html5app --directory ../myhtml5app

ALternatively, you can specify your own default in application.json builds.html5app.buildDir. See the [build configuration reference](http://developer.yahoo.com/cocktails/mojito/docs/intro/mojito_configuring.html#builds-object).

Specify a [context](http://developer.yahoo.com/cocktails/mojito/docs/topics/mojito_using_contexts.html):

    mojito build html5app --context "key1:value1,key2:value2,key3:value3"


Discussion/Forums
-----------------

http://developer.yahoo.com/forum/Yahoo-Mojito

Licensing and Contributions
---------------------------

mojito-cli-build is licensed under a BSD license (see LICENSE.txt). To contribute to the Mojito project, please see [Contributing](https://github.com/yahoo/mojito/wiki/Contributing-Code-to-Mojito).

The Mojito project is a [meritocratic, consensus-based community project](https://github.com/yahoo/mojito/wiki/Governance-Model) which allows anyone to contribute and gain additional responsibilities.
