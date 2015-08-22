Cani-s3 read & write example
---

Here, we log in with fb & cognito

then we expose read & write functions onto the window to use

The interesting thing to review here is the config::

the s3 bucket namespace is global! urp.

and...

initOn sets the set of events we're willing to initialize on

here I've used the 'cognito: fb-login' event

that way s3.init will run upon login. He calls Cani.core.affirm('s3', ...)

so then Cani.core.confirm('s3') will resolve once we've logged in!

isn't that fun nu.