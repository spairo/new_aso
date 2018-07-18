(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.controller('SpinnerController', SpinnerController)
		.directive('spinner', spinnerDirective);

	function SpinnerController($http, $timeout) {
		$timeout((function constructor() {
			this.loading = function loading() {
				return $http.pendingRequests.length;
			};
		}).bind(this));
	}

	function spinnerDirective() {
		var directiveDefinition = {
			controller: 'SpinnerController',
			controllerAs: 'spinner',
			replace: true,
			restrict: 'E',
			templateUrl: 'js/directives/spinner/template.html',
		};

		return directiveDefinition;
	}
})();
