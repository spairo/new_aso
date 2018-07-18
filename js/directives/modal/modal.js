(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.controller('ModalController', ModalController)
		.directive('modal', modalDirective);

	function ModalController($timeout) {
		$timeout((function constructor() {
			this.api = this;
		}).bind(this));
	}

	ModalController.prototype = {
		close: function close() {
			delete this.opened;
			this.onClose();
		},
		dismiss: function dismiss() {
			this.close();
			this.onDismiss();
		},
		open: function open() {
			this.opened = true;
		},
		success: function success() {
			this.close();
			this.onSuccess();
		}
	};

	function modalDirective() {
		var directiveDefinition = {
			bindToController: true,
			controller: 'ModalController',
			controllerAs: 'modal',
			restrict: 'E',
			replace: true,
			scope: {
				api: '=name',
				noClose: '<?',
				onClose: '&',
				onDismiss: '&',
				onSuccess: '&',
				size: '<'
			},
			templateUrl: 'js/directives/modal/template.html',
			transclude: true
		};

		return directiveDefinition;
	}
})();
