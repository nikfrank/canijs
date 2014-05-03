if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.ggdrive = (function(ggdrive){

    Cani.core.on('config: ggdrive', function(conf){ 

	Cani.core.affirm('ggdrive');
    });
    

    return ggdrive;

})(Cani.ggdrive||{});
