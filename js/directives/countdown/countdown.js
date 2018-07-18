(function wrapper() {
	'use strict';

	angular
	.module('app.directives')
	.directive('countdown', countdown);

	function countdown() {
		var directiveDefinition = {
			restrict: 'A',
			scope: {},
			link: function(scope, elm, attrs) {
				var date = new Date(parseFloat(attrs.countdown));
				var hours   = date.getHours();
				var minutes = date.getMinutes();
				var seconds = date.getSeconds();
				var timer2 = hours+':'+minutes+':'+seconds;

				var interval = setInterval(function() {
					var timer = timer2.split(':');
					var hours = parseInt(timer[0], 10);
					var minutes = parseInt(timer[1], 10);
					var seconds = parseInt(timer[2], 10);
					--seconds;
					minutes = (seconds < 0) ? --minutes : minutes;
					hours = (minutes < 0) ? --hours : hours;

					if (hours <= 0) {
						minutes = (minutes < 0) ? 59 : minutes;
						if (hours < 0) {
							hours = "0";
							minutes = "0";
							seconds = "0";
							clearInterval(interval);
						}
					}
					minutes = (minutes < 0) ? 59 : minutes;
					if (minutes < 0) {
						minutes = '0';
						seconds = '0';
						clearInterval(interval);
					}

					seconds = (seconds < 0) ? 59 : seconds;
					seconds = (seconds < 10) ? '0' + seconds : seconds;
					minutes = (minutes < 10) ? '0' + minutes : minutes;
					hours = (hours < 10) ? '0' + hours : hours;
					elm.html(hours+' '+':'+' '+minutes+' '+':'+' '+seconds);
					timer2 = hours+':'+minutes+':'+seconds;
				}, 1000);
			}
		};
		return directiveDefinition;
	}

})();
