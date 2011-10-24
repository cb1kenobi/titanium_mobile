(function(api){
	// Interfaces
	Ti._5.EventDriven(api);

	api.id = "${app_id}";
	api.name = "${app_name}";
	api.version = "${app_version}";
	api.publisher = "${app_publisher}";
	api.description = "${app_description}";
	api.copyright = "${app_copyright}";
	api.url = "${app_url}";
	api.guid = "${app_guid}";
	api.idleTimerDisabled = true;
	api.proximityDetection = false;
	api.proximityState = 0;
		
	var analytics = "${app_analytics}";

	// Methods
	api.getArguments = function(){
		console.debug('Method "Titanium.App.getArguments" is not implemented yet.');
	};
})(Ti._5.createClass('Ti.App'));
