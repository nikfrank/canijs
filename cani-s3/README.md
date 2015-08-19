Cani-s3
---

read and write items to/from AWS s3

register an initOn event for cani.s3 to initialize once
login has occurred

if your bucket is unsecured, initOn:['config: s3']

if you need cognito fb, initOn:['cognito: fb-login']

at some point, this is going to need to allow for ie:

unsecured init on boot, secured init on fb-login

then read or upload ((fix this to be "write"))

requests are only made once at a time per bucket+key combo