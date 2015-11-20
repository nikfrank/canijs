# Cani-dynamo

Cani-dynamo makes using AWS dynamoDB more like actual noSQL
```js
Cani.dynamo.save('item', nuItem).then(...);
Cani.dynamo.load('item', {owner:this.userId}).then(...);
```


include these scripts

```html
<script src="aws-sdk.js"></script>
<script src="canijs/cani.js"></script>
<script src="canijs/cani-dynamo/cani-dynamo.js"></script>
```

put this in your Caniconfig

```js
{
    "dynamo": {
        "schemas": {
            "item": {
                "fields": {
                    "somehash": "S",
                    "id": "N",
                    "owner": "S",
                    "price": "N"
                },
                "table": {
                    "arn": "arn:aws:dynamodb:eu-west-1:000000000000:table/tableName",
                    "hashKey": "id",
                    "rangeKey": "somehash",
                    "indices": []
                }
            }
        },
        "awsConfigPack": {
            "region": "eu-west-1"
        },
        "initOn": [
            "cognito: fb-login"
        ]
    }
}
```

see [`demo-caniconfig.js`](https://github.com/nikfrank/canijs/blob/master/src/docs/democonfig.js)
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
Cani.dynamo.save('item', {
   owner:this.userId, id:1440, somehash:'blahblahblah', price:2000
}).then(function(res){
   // I can't remember what res is here. Should probably check that!
});
```
```js
Cani.dynamo.load('item', {price:{LT:3000}}).then(function(items){
   console.log('there are '+items.length+' items under 3000 shmekels');
});
```

Read the AWS [docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)
to learn about indices (GSI) that will let you query your data how you please


## Examples
---

Available [`here`](https://github.com/nikfrank/canijs/tree/master/cani-dynamo/example)


## Full API
---

### Config Options
---



* **config..dynamo**

  * 

* **config.dynamo.schemas**

  * "types" for the functional minded. Each schema has a table and a format



* **config.dynamo.schemas.<<schemaName>>**

  * the keys here are the schema names



* **config.dynamo.schemas.<<schemaName>>.fields**

  * object of:
    * keys - fields on every item; 
    *  values - dynamo type. see: http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html
  * ((check impl.))



* **config.dynamo.schemas.<<schemaName>>.table**

  * Table description from AWS. Read the DataModel link re: indices



* **config.dynamo.schemas.<<schemaName>>.table.arn**

  * grab this off the table properties



* **config.dynamo.schemas.<<schemaName>>.table.hashKey**

  * exact query main hash key



* **config.dynamo.schemas.<<schemaName>>.table.rangeKey**

  * operator query range key



* **config.dynamo.schemas.<<schemaName>>.table.indices**

  * additional indices on table. Yet unimplemented here.






* **config.dynamo.awsConfigPack**

  * object to configure region. This is inconsistent withe cognito conf :(



* **config.dynamo.initOn**

  * array of events to trigger Cani.dynamo.init on. Use this with login events!




### Module Exposures
---

* **init()**
  *  this is used internally with initOn, but you can init whenever you want
    keep in mind though, the auth state of the window.AWS singleton at the time of init
    stays withis table for its lifecycle. So only init once you've authed!

* **write((unimplemented))**
  *  will be used once the grammar is standardized.

* **save('schemaName', {query})**
  *  query is the entire object you're saving
    Cani.dyanmo will guess the type to save as unless explicitly stated in schema conf.

* **load('schemaName', {query}, (({options})) )**
  *  options ((unimplemented)) to set index
    query is {hashKey:'val', otherKey:{operator:'val'}, odKey:'val'}
    operator is from [EQ | LE | LT | GE | GT | BEGINS_WITH | BETWEEN] for key &
    from [EQ | NE | LE | LT | GE | GT | NOT_NULL | NULL | CONTAINS | NOT_CONTAINS | BEGINS_WITH | IN | BETWEEN] for other?
    see http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Condition.html

* **erase(schemaName, query)**
  *  pass in a schema, hashKey and rangeKey to delete the item


# Notes
---

Scan operations are not supported because I think they're stupid. I'm sure that'll change eventually