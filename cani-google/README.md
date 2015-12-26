Cani-google
---

This makes logging in with google+ from webpages super easy

Also check out cani-cognito to use google-login for cognito auth!

(( cani-ggdrive will depend on this ))

---

making a google app with drive:

https://developers.google.com/+/web/signin/
https://developers.google.com/drive/web/quickstart/js

using

console.developers.google.com/apis/api/plus/overview

---

make app

enable google plus api

w these scopes

https://www.googleapis.com/auth/plus.login
https://www.googleapis.com/auth/plus.me

click on credentials -> put in domains

grab the client ID from th credentials list page

(Now,

we have to verify our domains (something facebook doesn't have!))?


I suppose the popups are just for authd apis
and login is via redirect?

https://developers.google.com/api-client-library/javascript/features/authentication


This is necessary for generating the auth token at the beginning of the session, but it could be jarring when authorize is called later to refresh the token. To improve the user experience, gapi.auth.authorize supports an "immediate" mode, which refreshes the token without a popup. checkAuth calls authorize with immediate: true as in the example above.

use this

https://github.com/EddyVerbruggen/cordova-plugin-googleplus

to make cani-phonegap-google & cani-phonegap-google-mock

---

later, this module (or through sub modules) should support google-api incremental scope authorization
