[![Dependency Status](https://www.versioneye.com/user/projects/564f636bff016c003a000205/badge.svg?style=flat)](https://www.versioneye.com/user/projects/564f636bff016c003a000205)
[![Coverage Status](https://coveralls.io/repos/nikfrank/canijs/badge.svg?branch=master)](https://coveralls.io/r/nikfrank/canijs?branch=master)
[![Build Status](https://travis-ci.org/nikfrank/canijs.svg?branch=master)](https://travis-ci.org/nikfrank/canijs)

The point of this project is to make a bunch of different APIs and modules exposed by various providers
(AWS, Google, Facebook, Phonegap, Twitter, Reddit, etc.) work withe same grammar.

These are mostly client side, however, the AWS sdk runs on node, so I'm working out imports for either.

This project should be becoming stable in the near future, which is to say chill your balls!

(( I need tables of contents ))

(( and directory structure listings ))
(( see https://github.com/AngularClass/angular2-webpack-starter ))


quickstart
---

```
npm i canijs
```

import q.js

import cani.js

import cani-module-mashu.js

```js
    Cani.core.confirm('moduleOrModules').then((mOrMs) => ,,,);
```

is the way to make sure you have an asset

import your caniconfig.js file (which has field for each module) a demo of which is available

caniconfig boots the core and then each module, which triggers callbacks on any confirms waiting

this is pretty much only useful when confirming a state (ie logged in), which may then trigger 
booting modules who were waiting for something (ie fbgraph boots on fb [login])

anyhow, you pretty much don't have to think about it much, as long as you 
import things in the right order and confirm the module before calling anything from it

a pattern I use in angular is to put placeholder functions on the scope

    $scope.save = function(){ console.log('module not yet loaded'); };

which I replace on confirm

    Cani.core.confirm('idb').then(function(){
        $scope.save = function(query){ Cani.idb.save(...params).then((res) => ,,,); };
    });

all calls through Cani are promise based (even synchronous stuff like localStorage)

that way, if I point window.Q to $q in a .run() module, there's no need to $scope.$apply/$digest

only after window.Q exists (ie after app.js runs), I import caniconfig.js to boot the cani modules.

This should be pretty clear in the examples. If it isn't, copy my bad behaviour or pull request.

Look into the example and api folder of each module for more documentation!


## Testing

unit tests are written for mocha, with istanbul coverage

there are a few modules which only run in the browser (fb, localStorage, webRTC),
or should be tested in both anyhow (all aws modules)

I'm getting through unit tests now, then I'll write e2e tests, then I'll figure out
how to get the coverage working for e2e

right now it looks like a bitch, so I'm hoping someone makes it suck less by the time I need it!