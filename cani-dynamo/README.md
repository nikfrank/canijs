Cani-dynamo
---

read and write to/from dynamo tables!

set up schemas for each of your tables

the schemas in the democonfig and example should show you which info to copy paste from AWS.

(( using GSI and LSI is currently unsupported. not for long though ))


if your table requires authentication,

initOn:['cognito: fb-login']



dynamoDB reserved words
---

cani-dynamo doesn't sanitize for keywords. doing so would add 5286 bytes of this list

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html

which you could just memorize! I had to learn this the hard way about the word "owner"

cani-dynamo implements this workaround:

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ExpressionPlaceholders.html

all you have to do to use it is attach an array of verboten names to the schema's table as 

    {
     table:{
      arn:'...', hashKey:'...', rangeKey:'...', indices:[],
      reservedAttributes:
      ['rollback','atomic','capacity','and','revoke','authorization','then','invalidate','current','exec']
     }
    }

in the cani-config. Your's probably won't be that particular list of words though.


todo
...

(( allow for config in multiple regions ))