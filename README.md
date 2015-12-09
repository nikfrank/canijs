[![Dependency Status](https://www.versioneye.com/user/projects/564f636bff016c003a000205/badge.svg?style=flat)](https://www.versioneye.com/user/projects/564f636bff016c003a000205)
[![Coverage Status](https://coveralls.io/repos/nikfrank/canijs/badge.svg?branch=master)](https://coveralls.io/r/nikfrank/canijs?branch=master)
[![Build Status](https://travis-ci.org/nikfrank/canijs.svg?branch=master)](https://travis-ci.org/nikfrank/canijs)

# Canijs

Promise based grammar and convenience layer for various web APIs/SDKs
(AWS, Google, Facebook, Phonegap, ((Twitter)), ((Reddit)), ((webRTC)), etc.)

imagine
```js
Cani.login.to('facebook').then(updateUserData);
```
then
```js
Cani.post({type:'link', from:'fb_id1', to:'fb_id2', src:'http://...'})
    .to('facebook');
```

Code this beautiful doesn't run quite yet - canijs is still in the module development phase; the goal though is to make code read that much like English for everything I ever do!

Right now I'm working to make all the modules env independent (node, es5, es6)

This project should be becoming stable in the near future.

You can see ((all)) demos running at canijs.herokuapp.com

## Table of Contents
(( these shoudl be hashlinks ))

* project structure
* quickstart
    * angular
* confirming states
    * angular resolve
* modules & examples
  * starting point
  * quickstart
  * important events
  * examples & API

## Project Structure
```html
canijs
│   cani.js
│
└───cani-module (for module in canijs)
    │   cani-module.js
    │
    ├───example
    │   └───example-with-module
    │       ...files-for-example.html/js/css
    │
    └───api/README.md
│
└───test
└───in-the-works
```

## quickstart

```
npm i canijs
```
from index.html
```html
<script src="lib/q/1.4.1/q.min.js"></script>
<script src="lib/canijs/cani.js"></script>
<script src="lib/canijs/cani-module/cani-module.js"></script>
<script src="cani-config.js"></script>
```
and in cani-config.js
```js
Cani.core.boot({
    moduleName:{
        option:'value'
    }
});
```
then in any javascript imported anywhere
```js
Cani.core.confirm('moduleName').then((mod) => (mod.whatever()));
```
this is similar to the pattern in angular of
1. register modules
2. bootstrap
3. do stuff using those modules

the Cani.core.confirm syntax though allows for lazy loading of modules, although you'd have to cast the config event to them on your own (all core.boot does is cast a general config event withe general config json)

you can also confirm multiple modules at once, ie to confirm a login and dynamo instance and then to update it from a localStorage cache ((example coming soon!))

```js
core.confirm(['mod1', 'mod2', 'login-state'])
    .then(({mod1, mod2}) => mod2.load({usr:usrId}).then(mod1.save));
```
this acts like a Q.all (because it is), and never blocks.

#### angular

if you point window.Q to $q in a .run() module, there's no need to $scope.$apply/$digest from promise callbacks

however, q is still a dependency for canijs whether or not you do this - unless you can guarantee the shim before cani.js loads -> pull request me at will about this.

the behaviour is evident in one of the cani-s3 examples.


## Confirming States

As shown above, core.confirm also allows for confirming a state (ie logged in), which may then trigger updates to a view or login state in your app (from cani-dynamo/example/dynamo-cognito)

```js
Cani.core.confirm('fb: login')
    .then(function(loginData){return {authResponse:loginData};})
    .then(Cani.cognito.onLogin)
    .then(function(cogId){ window.cogId = cogId; });
```
or could be used in an angular resolve (from cani-s3/example/s3-ng-cognito)
```js
resolve:{
    CaniDep:function(){
        return Cani.core.confirm(['cognito: fb-login', 's3']);
    }
}
```
in order to guarantee login and s3 availability for a given view
wOOOOOOOOOOooooOOOOooOOOOOooOOooOoooOoOoOoOooOoOoh!


## Modules & Examples
starting point, quickstart, important events, examples & API
available in each of: ((links))
* core
* cognito
* dynamo
* s3
* fb
* ...

also, for anything not covered in the examples, read through the tests! ((link))
 
 this here is an example of the EAT philosophy - Examples Above Tests

## Testing

unit tests are written for mocha, with istanbul coverage

there are a few modules which only run in the browser (fb, localStorage, webRTC),
or should be tested in both anyhow (all aws modules)

I'm getting through unit tests now, then I'll write e2e tests, then I'll figure out
how to get the coverage working for e2e

right now it looks like a bitch, so I'm hoping someone makes it suck less by the time I need it!