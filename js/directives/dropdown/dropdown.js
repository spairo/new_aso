(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.controller('DropdownDirectiveController', DropdownDirectiveController)
		.directive('dropdown', dropdownDirective);

	function DropdownDirectiveController($timeout) {
		this.fill = function fill() {
			if (!this.hasOwnProperty('overwrite')) {
				this.overwrite = !this.model;
			}

			if (this.selected >= 0 && this.overwrite) {
				this.model = this.options[this.selected];
			}

			$timeout(this.onUpdate, 0);
		};

		// this.overwrite es una bandera para saber si se va a sobreescribir el modelo o no cuando haya un selected presente
		// !this.model te regresa un booleano
		// this.overwrite, en caso de ser false, solo se respeta la primera vez
	}

	function dropdownDirective() {
		var directiveDefinition = {
			bindToController: true,
			compile: compile,
			controller: DropdownDirectiveController,
			controllerAs: 'dropdown',
			restrict: 'E',
			replace: true,
			scope: {
				disabled: '@',
				label: '@?',
				model: '=',
				onUpdate: '&',
				onOpen: '&',
				options: '=',
				required: '=?',
				selected: '='
			},
			templateUrl: 'js/directives/dropdown/template.html'
		};

		function compile(element, attrs) {
			attrs.label = attrs.label ? '.' + attrs.label : '';
		}

		return directiveDefinition;
	}
})();
