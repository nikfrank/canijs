Cani-cognito
------------

use credentials passed from facebook (later google or whatever)

pass them to AWS cognito identity pool set up for this application.

Step 1:

set up an app on developers.facebook.com

http://stackoverflow.com/questions/7506392/how-to-create-android-facebook-key-hash

Step 2:

set up cani-phonegap, cani-phonegap-fb to handle logging in with facebook

see the READMEs in their folders for more on how to do that

Step 3:

make an identity pool on aws-cognito, grab it's role ARN and region for the caniconfig

Step 4:

    Cani.phonegapFb.login(fbpermissions).then(Cani.cognito.onLogin)

Step 5:

now that you've logged into facebook and registered to AWS cognito, feel free to

    .then(Cani.core.confirm('s3'))
    .then(Cani.s3.init)
    
    .then(Cani.core.confirm('dynamo'))
    .then(Cani.dynamo.init);

making sure to init the other aws services AFTER the cognito login has occurred.