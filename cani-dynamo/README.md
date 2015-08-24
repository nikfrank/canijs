Cani-dynamo
---

read and write to/from Cani-dynamo tables!

set up schemas for each of your tables

(( allow for config in multiple regions ))

if your table requires authentication,

initOn:['cognito: fb-login']


other reading
---

note: cani-dynamo doesn't sanitize for keywords. doing so would add 5286 bytes of this list

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html

which you could just memorize! I had to learn this the hard way about the word "owner"

The workaround is to allow for explicit "Attribute" name query syntax.