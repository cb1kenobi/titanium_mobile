(function(api){

	var match = navigator.userAgent.toLowerCase().match(/(webkit|gecko|trident|presto)/),
		runtime = match ? match[0] : "unknown",
		createUUID = Ti._5.createUUID,
		id = localStorage && localStorage.getItem("ti:titaniumPlatformId") ?
			localStorage.getItem("ti:titaniumPlatformId") : createUUID();

	// Interfaces
	Ti._5.EventDriven(api);

	// Properties
	Ti._5.propReadOnly(api, {
		BATTERY_STATE_CHARGING: 1,
		BATTERY_STATE_FULL: 2,
		BATTERY_STATE_UNKNOWN: -1,
		BATTERY_STATE_UNPLUGGED: 0,
		address: null,
		architecture: null,
		availableMemory: null,
		batteryLevel: null,
		batteryMonitoring: null,
		batteryState: api.BATTERY_STATE_UNKNOWN,
		id: id,
		isBrowser: true,
		locale: navigator.language,
		macaddress: null,
		model: null,
		name: navigator.userAgent,
		netmask: null,
		osname: "mobileweb",
		ostype: navigator.platform,
		runtime: runtime,
		processorCount: null,
		username: null,
		version: require.config.ti.version
	});

	// Methods
	api.createUUID = createUUID;

	api.canOpenURL = function(url){
		return true;
	};

	api.openURL = function(url){
		var m = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?/.exec(url);
		if ( (/^([tel|sms|mailto])/.test(url) || /^([\/?#]|[\w\d-]+^:[\w\d]+^@)/.test(m[1])) && !/^(localhost)/.test(url) ) {
			setTimeout(function () {
				window.location.href = url;
			}, 1);
		} else {
			window.open(url);
		}
	};

	localStorage.setItem("ti:titaniumPlatformId", id);

})(Ti._5.createClass("Ti.Platform"));
