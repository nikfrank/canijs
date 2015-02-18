canijs docs
===

quickstart
---

import q.js
import cani-core.js

    Cani.core.confirm(moduleOrModules).then(function(mOrMs){...});

is the way to make sure you have an asset

import any modules you are using

import your caniconfig.js file (which has field for each module) a demo of which is available

caniconfig boots the core and then each module, which triggers callbacks on any confirms waiting (confirm will automatically resolve if the asset is already present)

this is pretty much only useful when confirming a state (ie logged in), which may then trigger booting modules who were waiting for something (ie fbgraph boots on fb [login])

anyhow, you pretty much don't have to think about it much, as long as you  import things in the right order and confirm the module before calling anything from it

a pattern I use in angular is to put placeholder functions on the scope

    $scope.save = function(){ console.log('module not yet loaded'); };

which I replace on confirm

    Cani.core.confirm('idb').then(function(idb){
        $scope.save = function(query){ idb.save(...).then(res -> ...); };
    });

usually in angular the promise resolution on idb.save will need a $scope.$apply();