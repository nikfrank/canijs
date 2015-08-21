var that = {
    login:function(permissions, success, failure){
	return Cani.core.confirm('fb')
	    .then(R.prop('fb'), failure)
	    .then(R.createMapEntry('authResponse'))
	    .then(success);
    }
};
