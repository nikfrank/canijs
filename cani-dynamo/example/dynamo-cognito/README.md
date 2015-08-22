Cani-dynamo read & write example
---

Here, we log in with fb & cognito

then we expose read & write functions onto the window to use

The interesting thing to review here is the config::

defining our schemaFields secures types

the table def is necessary to work

and...

initOn sets the set of events we're willing to initialize on

here I've used the 'cognito: fb-login' event

that way dynamo.init will run upon login. He calls Cani.core.affirm('dynamo', ...)

so then Cani.core.confirm('dynamo') will resolve once we've logged in!

isn't that fun nu.