define(['Ti/_/lang'], function(lang) {
	var nav = navigator,
		apps = nav.mozApps,
		app = apps && apps.getSelf(),
		installed = false;

	app && (app.onsuccess = function (e) {
		installed = !!e.result;
	});

	return lang.setObject('Ti.MobileWeb', {
		isInstalled: function () {
			return installed;
		},
		install: function (params) {
			params || (params = {});
			var onerror = params.onerror;

			if (apps) {
				var inst = app.install('manifest.webapp');
				params.onsuccess && (inst.onsuccess = function () {
					params.onsuccess();
				});
			}

			if (onerror) {
				if (apps) {
					inst.onerror = function () {
						onerror({
							message: inst.error.name
						});
					};
				} else {
					onerror({
						message: 'Browser does not support Application Installation and Management APIs'
					});
				}
			}
		}
	});
});