# Cani-s3

Cani-s3 mediates dealing w aws s3 for you.
```js
Cani.s3.list('canijs').then(...);
Cani.s3.upload('canijs', nuKey, nuItem).then(...);
Cani.s3.read('canijs', keys).then(...);
```


include these scripts

```html
<script src="aws-sdk.js"></script>
<script src="canijs/cani.js"></script>
<script src="canijs/cani-s3/cani-s3.js"></script>
```

put this in your Caniconfig

```js
{
    "Bucket": "canijs-images",
    "initOn": [
        "cognito: fb-login"
    ]
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
Cani.s3.list('bucketName').then(function(items){
  console.log('there are '+items.length+' items');
});
```
```js
Cani.s3.upload('bucketName', 'keyForFileInBucket', {object:'written as a stringify'}).then(function(res){
   // I can't remember what res is here. Should probably check that!
});
```
```js
Cani.s3.read('bucketName', ['key1', 'key2']).then(function(items){
   console.log('got '+Object.keys(items).join(' ')+' from bucket ');
});
```

Read the AWS [docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
to learn about prefices and CORS on buckets!
## Examples
---

Available [`here`](https://github.com/nikfrank/canijs/tree/master/cani-s3/example)


## Full API
---

### Config Options
---



* **config..Bucket**

  * the name of the default s3 bucket you'll be dealing with



* **config..initOn**

  * The events to run init as a response to.The example boots once fb logs in through cognito



### Module Exposures
---

* **init()**
  *  this is used internally with initOn, but you can init whenever you want
    keep in mind though, the auth state of the window.AWS singleton at the time of init
    stays withis table for its lifecycle. So only init once you've authed!

* **initBucket(bucket)**
  *  initialize some bucket. For now you'll need to call this 
    for buckets other than the default bucket.

* **upload(bucket, key, fileData)**
  *  upload the fileData as key to the bucket. WOW

* **read(bucket, key)**
  *  read key out of bucket. also works for [keys]

* **list(bucket, prefix)**
  *  lists contents of bucket with [optionally] prefix


# Notes
---

Look into s3 ia if you're precocious!