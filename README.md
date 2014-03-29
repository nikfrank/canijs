Overall:

-----

finish saving docs, clean up and use in housepartie

split modules into various files -> use requirejs to load modules, document

test configing from split files

- handle errors in promises reasonably (deferred.reject)

more query options (alltables, other operators)

-> scan when no index is present

rewrite on s3, dy+s3 versioning

=======
write documentation on how to use it
=======


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

-> affirm all modules on completion of boot, pass the module through as a param
+> use cast for boot and interally on confirms

doc to register schemas to tables... can autofill ownership, uiding, datestamps in schema... also default overwrite option
  default values per schema. NO DEFAULT VALUES PER TABLE. this makes sense, don't worry about it any more.

write basic schema options, examples

- destringify all objects noted on load


-----------------------------
Doing:

- loading file into DOM

- incorporate a "versioning" dynamo table for all S3 files

-- once save&load/doc&file all work, make save/load convenience functions for versioned docs

-----------------------------
Need to do soon:

- mime types for text file uploads to s3

- endtoend unit testing through angular -> just use angular. no bs. comment well.

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

do this with require to batch the files together, document