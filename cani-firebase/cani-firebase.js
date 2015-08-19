Cani.fire = (function(fire){

	
    var rootRef = new Firebase('https://glowing-fire-921.firebaseio.com/housepartie');
    fire.rootRef = rootRef;

    // put schemas and containers into frebase online
    // futz with the fb profile package and max it out

    Cani.core.on('config: fire', function(conf){ } );
    
    // expose save and load functions

    return fire;

})(Cani.fire||{});
