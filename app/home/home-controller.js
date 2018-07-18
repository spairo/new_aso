(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('HomeController', HomeController);

	function HomeController(homeService, $cookies) {

		// Scroll al mostrar mas de 4 gráficas
		function onGetCharts(response) {
			this.charts = response.data;

			var graph = this.charts.length <= 4 ? 1272 : 1272 + (320 * (this.charts.length - 4));
			this.widthGraphic = graph + 'px';

			// Open disclaimer modal
			if (window.localStorage.getItem('stDiscModal') === "true") {
				this.discModal.open();
			}
		}

		// Close disclaimer modal
		this.discModalClose = function discModalClose(){
			window.localStorage.setItem("stDiscModal", false);
			this.discModal.close();
		};

		homeService
			.getCharts()
			.then(onGetCharts.bind(this));
	}

})();
