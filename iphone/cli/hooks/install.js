/*
 * install.js: Titanium iOS CLI install hook
 *
 * Copyright (c) 2012, Appcelerator, Inc.  All Rights Reserved.
 * See the LICENSE file for more information.
 */

var appc = require('node-appc'),
	i18n = appc.i18n(__dirname),
	__ = i18n.__,
	__n = i18n.__n,
	afs = appc.fs,
	path = require('path'),
	async = require('async'),
	exec = require('child_process').exec;

exports.cliVersion = '>=3.X';

exports.init = function (logger, config, cli) {
	
	cli.addHook('build.post.compile', {
		priority: 8000,
		post: function (build, finished) {
			if (cli.argv.target != 'device') return finished();
			
			if (cli.argv['build-only']) {
				logger.info(__('Performed build only, skipping installing of the application'));
				return finished();
			}
			
			var devices = build.devices;
			
			async.parallel([
				function (next) {
					var pkgapp = path.join(build.xcodeEnv.path, 'Platforms', 'iPhoneOS.platform', 'Developer', 'usr', 'bin', 'PackageApplication');
					if (afs.exists(pkgapp)) {
						exec('"' + pkgapp + '" "' + build.xcodeAppDir + '"', function (err, stdout, stderr) {
							if (err) {
								logger.warn(__('An error occurred running the iOS Package Application tool'));
								stderr.split('\n').forEach(logger.debug);
								if (deviceId) {
									logger.warn(__('We need an IPA file to install to device, installing to iTunes instead'));
									devices = [{
										id: null,
										name: 'iTunes'
									}];
								}
							}
							next();
						});
					} else {
						logger.warn(__('Unable to locate iOS Package Application tool'));
						next();
					}
				}
			], function () {
				var ipa = path.join(path.dirname(build.xcodeAppDir), build.tiapp.name + '.ipa');
				
				devices.length || device.push({
					id: null,
					name: 'iTunes'
				});
				
				if (afs.exists(ipa) && devices.length > 1 || (devices.length == 1 && devices[0].id)) {
					async.series(devices.filter(function (device) { return !!device.id; }).map(function (device) {
						return function (next) {
							logger.info(__('Installing application to %s device %s', device.deviceClass, device.name.cyan));
							appc.ios.install(device.id, ipa, logger, function (err) {
								var details;
								if (err) {
									details = [err];
									if (err == 'ApplicationVerificationFailed') {
										details.push(
											__('Are you sure the device "%s" has the provisioning profile installed?', device.name),
											build.provisioningProfile
												? '    ' + build.provisioningProfile.uuid + '  ' + build.provisioningProfile.appId + ' (' + build.provisioningProfile.name + ')'
												: '    ' + build.provisioningProfileUUID
										);
									}
								}
								next(details);
							});
						};
					}), function (err) {
						if (err) {
							finished(new appc.exception(__('Failed to install app to device: ' + err.shift()), err));
						} else {
							finished();
						}
					});
				} else {
					afs.exists(ipa) || (ipa = build.xcodeAppDir);
					logger.info(__('Installing application into iTunes'));
					
					exec('open -b com.apple.itunes "' + ipa + '"', function (err, stdout, stderr) {
						if (err) {
							return finished(new appc.exception(__('Failed to launch iTunes')));
						}
						
						logger.info(__('Initiating iTunes sync'));
						exec('osascript "' + path.join(build.titaniumIosSdkPath, 'itunes_sync.scpt') + '"', function (err, stdout, stderr) {
							if (err) {
								finished(new appc.exception(__('Failed to initiate iTunes sync'), stderr.split('\n').filter(function (line) { return !!line.length; })));
							} else {
								finished();
							}
						});
					});
				}
			});
		}
	});
	
};
