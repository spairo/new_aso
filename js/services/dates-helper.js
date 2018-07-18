(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.service('DatesHelper', DatesHelperService);

		function DatesHelperService() {
		this.today = this.settle(new Date(), true);
		this.oneDay = 86400000;
	}
	DatesHelperService.prototype = {
		daysBetween: function daysBetween(to, from) {
			to = this.settle(to, true);
			from = this.settle(from, true) || this.today;

			return parseInt(((to - from) / this.oneDay).toFixed(0), 10);
		},
		settle: function settle(date, asUNIX) {
			date = new Date(date);
			date.setHours(0,0,0,0);

			if (asUNIX) {
				date = date.getTime();
			}

			return date;
		}
	};
})();
