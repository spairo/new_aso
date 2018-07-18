(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.controller('ProgressController', ProgressController)
		.directive('totalProgress', progressDirective);

	function ProgressController($timeout) {
		$timeout((function constructor() {
			if (this.total != null) {
				var total = this.total > 100 ? 100 : this.total;

				this.integer = Array(Math.floor(total / 10));
				this.unit = Array(total % 10);
			}
		}).bind(this));
	}

	function progressDirective() {
		var directiveDefinition = {
			bindToController: true,
			controller: 'ProgressController',
			controllerAs: 'progress',
			replace: true,
			restrict: 'E',
			scope: {
				total: '=',
			},
			templateUrl: 'js/directives/progress/template.html'
		};

		return directiveDefinition;
	}
})();
