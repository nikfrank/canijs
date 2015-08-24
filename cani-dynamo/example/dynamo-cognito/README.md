Cani-dynamo read & write example
---

Here, we log in with fb & cognito

then we expose read & write functions onto the window to use



demo-config.js:
---


initOn

he sets the set of events we're willing to initialize on

here I've used the 'cognito: fb-login' event

that way dynamo.init will be run upon login; he calls Cani.core.affirm('dynamo', ...)

so then Cani.core.confirm('dynamo') will resolve once we've logged in!

isn't that fun nu.


___



table.reservedAttributes

this is a list of all the names you've given things you shouldn't have, because they were on this list:

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html

and you've gotten a

    Attribute name is a reserved keyword

error.

cani-dynamo implements this workaround:

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ExpressionPlaceholders.html

az all you have to do to is LIST YOUR SINS AND REPENT.



dynamo & cognito w IAM setup walkthrough
---

1) set up facebook app

developers.facebook.com

hit myapps, add a new app, WWW website

make a name, hit create new facebook app, and pick a category

copy the appId out of the generated code you see now (or later on the app's page)

paste that sucker into the cani-config as

    { fb: { App : 'THE CODE YOU JUST COPIED'} }

and give facebook a url (localhost while testing...)



2) set up dynamo table

aws.amazon.com, sign in to console -> dynamoDB (blue on the left most the way down)

create table button, type in a name

pick a hashKey & rangeKey (explaining such it outside the scope of this document

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForTables.html )

CURRENTLY CANI-DYNAMO DOES NOT IMPLEMENT QUERYING GSIs or LSIs

for this demo, the default settings for the rest of the create table wizard should be fine.

to get the ARN for your cani-config, click on the table in your list of tables

then at the bottom, hit the "details" tab and scroll down



3) set up AWS cognito pool

aws.amazon.com, sign in to console -> cognito (purple on the right in the middle)

create new identity pool, name it, leave unauthorized access ie "guest login" disabled

unzip Authentication Providers header, facebook tab, paste that facebook app id from earlier

unzip View Details zippy, the first section should be regarding "Your authenticated identities"

unzip the auth role's View Policy Document header

hit edit, read this:

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/UsingIAMWithDDB.html

so you aren't lying when you say "ok" to the warning

if can use cognitoIAMpolicy.json from this example, make sure to change the ARN to your table's (from step 2)



step 4) Success!

now the demo code should run on your localhost, where you can have fun making todo items.