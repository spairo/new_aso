(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('scrollTo', scrollTo);

	function scrollTo() {
		var directiveDefinition = {
			restrict: 'A',
			link: function(scope, $elm) {
				$elm.on('click', function() {
					if($elm[0].className === 'arrow-right') {
						$('.offer-pg-cont').animate({scrollLeft: '+=' + 319}, '3000');
					}else{
						$('.offer-pg-cont').animate({scrollLeft: '-=' + 319}, '3000');
					}
				});
			}
		};
		return directiveDefinition;
	}

})();
