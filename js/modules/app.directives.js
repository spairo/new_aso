(function wrapper() {
	'use strict';

	angular.module('app.directives', [
		'angularUtils.directives.dirPagination',
		'chart.js',
		'ngDragDrop',
		'ngAnimate',
		'ngMessages',
		'ngSanitize',
		'rzModule',
		'ui.validate',
		'nvd3'
	]);
})();
