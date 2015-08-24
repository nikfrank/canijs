Cani-dynamo
---

read and write to/from dynamo tables!

the schemas in the democonfig and example should show you which info to copy paste from AWS to get it working.

Listing fields is optional, but if you don't cani-dynamo might guess wrong.

(( using GSI and LSI is currently unsupported. not for long though ))


if your table requires authentication, use

    initOn:['cognito: fb-login']

in the config

for more on seeing how to set up cognito with dynamo, see the example README


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