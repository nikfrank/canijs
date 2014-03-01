Progress:

-facebook auth
-aws federated auth
-google auth

-test save doc w google & fb
-run angular
-save, load from angular

-Q load
-notifications for database availability
-stringify, make note of all objects on save

-document aws user-filtering policy setup
-load mine/see all
-promises on save

-save over/new (test req)
- edit resave
- put IAM policies and GSI descriptions into the git

- saving a file
- sort save.file/doc and load.file/doc


-----------------------------
Doing:

- S3 config, sorting the dbs into modules to keep seperate

- listObjects in bucket

- test and fix bug with private GSIs

-----------------------------
Need to do soon:

- handle errors in promises reasonably (deferred.reject) (doing?)

- register watches (notification callbacks) functions, instead of the hacknik shit it is now

- save to private

- destringify all objects noted on load

- pack arrays reasonably (remember dy db doesn't order arrays)

-notifications for sign-in

-endtoend unit testing through angular

-use $q for Q dependency... works up until callback

- save files to S3, set up IAM to work public/private

- incorporate a "versioning" dynamo table for all S3 files

--------------------------------------------------------------
-generalized indexing policy, for ranged searches on any data

-split up modules into different files

--------------------------------------------------------------
--------------------------------------------------------------

catchies:

make sure to $scope.$apply() in a .then from a promise