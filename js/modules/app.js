(function wrapper() {
	'use strict';

	var app = angular
		.module('app', ['app.routes', 'app.services', 'app.directives', 'app.filters', 'app.extensions'])
		.config(configProviders);

	function configProviders($controllerProvider, $provide) {
		app.controller = $controllerProvider.register;
		app.factory = $provide.factory;
		app.service = $provide.service;
	}
})();
