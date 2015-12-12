# Cani-cognito

Cani-cognito does the dirty work of oauth token management
```js
Cani.core.confirm('fb: login')
.then(function(loginData){return {authResponse:loginData};})
.then(Cani.cognito.login);
```


include these scripts

```html
<script src="aws-sdk.js"></script>
<script src="canijs/cani.js"></script>
<script src="canijs/cani-cognito/cani-cognito.js"></script>
<script src="canijs/cani-id-provider/cani-id-provider.js"></script>
```

put this in your Caniconfig

```js
{
    "cognito": {
        "provider": "fb",
        "IdentityPoolId": "eu-west-1:c5b3e48a-d5df-4ea3-bb42-91404d7c2248",
        "AWSregion": "eu-west-1"
    },
    "fb": {
        "App": "492663127567107"
    }
}
```

see [`demo-caniconfig.js`](https://github.com/nikfrank/canijs/blob/master/democonfig.js)
for examples of all the config options for all the modules


## Getting Started
---

```
npm i -S canijs
```

then include the aws sdk, canijs core, cani-dynamo, and your Caniconfig.js of course


## Basic use
---

```js
Cani.core.confirm('cognito').then(function(){
Cani.core.confirm('fb: login')
.then(function(loginData){return {authResponse:loginData};})
.then(Cani.cognito.onLogin)
.then(function(userData){
console.log(userData);
});
```

Read the AWS [docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html)

## Examples
---

Available [`here`](https://github.com/nikfrank/canijs/tree/master/cani-cognito/example)


## Full API
---

### Config Options
---



* **config..cognito**

  * 

* **config.cognito.provider**

  * only 'fb' works for now. ((will add google+ soon))



* **config.cognito.IdentityPoolId**

  * arn from AWS of the cognito ID pool



* **config.cognito.AWSregion**

  * region from AWS of the cognito ID pool




* **config..fb**

  * cognito works with providers, although AWS allows developer identities 
  * http://docs.aws.amazon.com/cognito/devguide/identity/developer-authenticated-identities/ 
  * which is super useful as firebase email auth + AWS cognito lambda = AWS email login.



### Module Exposures
---

* **onLogin({authResponse:providerResponse})**
  *  call this when the provider has authed 
so Cani.cognito can signal the login event (which Cani.dynamo or s3 initOn from)
for some reason, the onLogin expects the 
provider's response wrapped in a {authResponse:...} object. I can't remember why.


# Notes
---

Just pass the authResponse to cognito.onLogin and cognito signals auth related boots!