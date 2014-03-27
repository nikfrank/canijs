Overall:

-----

merge the save/load actions into modules. split modules into various files -> use the coreScriptElement.onload to order configs

register config actions... test configing... test configing from split files
-> affirm all modules on completion of boot, pass the module through as a param
+> use cast for boot and interally on confirms

=======
build in the confirmations behind the scenes of all Cani.js calls
=======
write documentation on how to use it
ie learn how to format README files properly
=======

doc to register schemas to tables... can autofill ownership, uiding, datestamps in schema... also default overwrite option
  default values per schema. NO DEFAULT VALUES PER TABLE. this makes sense, don't worry about it any more.

write basic schema options, examples

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

- listObjects in bucket

- save files to S3, set up IAM to work public/private

- investigate ACL vs IAM -> leave ACL to max allow, use IAM to limit access (re: least-privilege policy)


- split into modules: auth, doc (dynamo), file (s3)

- reorg the conf pack by module


-----------------------------
Doing:

- test and fix bug with private GSIs maybe

- loading file into DOM

- incorporate a "versioning" dynamo table for all S3 files

-- once save&load/doc&file all work, make save/load convenience functions for versioned docs

-----------------------------
Need to do soon:

- mime types for text file uploads to s3

- handle errors in promises reasonably (deferred.reject) (doing?)

- destringify all objects noted on load

- pack arrays reasonably (remember dy db doesn't order arrays)

- endtoend unit testing through angular -> just use angular. no bs. comment well.

- use $q for Q dependency... works up until callback

--------------------------------------------------------------
- generalized indexing policy, for ranged searches on any data

--------------------------------------------------------------
--------------------------------------------------------------

catchies:

make sure to $scope.$apply() in a .then from a promise


------------------------------------
boot sequence:

module files are loaded into the dom
Cani.core is loaded
modules are added to the Cani singleton
modules register their config functions with the core
config file initiates boot

this may require a bit of wrangling to make sure core comes first.