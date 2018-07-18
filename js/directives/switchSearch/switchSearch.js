(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('switchSearch', switchSearchDirective);

	function switchSearchDirective($filter) {

		var directiveDefinition = {
			link: link,
			replace: true,
			require: '?ngModel',
			restrict: 'A',
			scope: {
				field: '='
			},
			template: '<input type = "search" ng-model = "field"></input>',
		};

		function link(scope, element, attrs, ngModel) {
			ngModel.$parsers.unshift(function viewValue(viewValue){
				viewValue = viewValue.toLowerCase();
				if(viewValue === "n" || viewValue === "no"){
					return false;
				}
				if(viewValue === "y" || viewValue === "s" || viewValue === "si"){
					return true;
				}
				// Estrategia Viva
				if(viewValue === "v" || viewValue === "vi" || viewValue === "viv" || viewValue === "viva" || viewValue === "vivo"){
					return 1;
				}
				// Estrategia Vencida
				if(viewValue === "v" || viewValue === "ve" || viewValue === "ven" || viewValue === "venc" || viewValue === "venci" || viewValue === "vencid" || viewValue === "vencida" || viewValue === "vencido"){
					return 4;
				}
				// Estrategia Amortizada
				if(viewValue === "a" || viewValue === "am" || viewValue === "amo" || viewValue === "amor" || viewValue === "amort" || viewValue === "amorti" || viewValue === "amortiz" || viewValue === "amortiza" || viewValue === "amortizad"  || viewValue === "amortizada"  || viewValue === "amortizado"){
					return 5;
				}
				// Estrategia Cancelada
				if(viewValue === "c" || viewValue === "ca" || viewValue === "can" || viewValue === "canc" || viewValue === "cance" || viewValue === "cancel" || viewValue === "cancela" || viewValue === "cancelad" || viewValue === "cancelada"  || viewValue === "cancelado"){
					return 6;
				}
			});
		}
		return directiveDefinition;
	}
})();
