'use strict';

Cani.core.confirm('google').then(function(google){
    google.login().then(function(r){
        console.log('login', r);
    });
});

Cani.core.confirm('google: login')
    .then(console.log.bind(console));
