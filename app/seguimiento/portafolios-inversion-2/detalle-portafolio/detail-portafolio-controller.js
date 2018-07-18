(function wrapper() {
	'use strict';
	angular
		.module('app')
		.controller('DetailPortfolioController', DetailPortfolioController);

	function DetailPortfolioController(detailPortfolioService, $scope, $window, $cookies, $route, $location, $routeParams) {

		this.id = $routeParams.id;
		this.serie = $routeParams.serie;
		this.banquero = $cookies.get('banquero');

		this.rendimientosChk = 0;

		if (this.id && this.serie) {
			this.detailgraphics = {};
			this.detailgraphics.nuEstrategia = this.id;
			this.detailgraphics.fhInicial = null;
			this.detailgraphics.fhFinal = null;
			this.detailgraphics.cdGraficas = ["precio + cupon", "precio valmer", "rendimientos", "cupones", "activo referencia"];

			detailPortfolioService
				.getDetalleGraficas(this.detailgraphics)
				.then(onFirstload.bind(this));
		}

		function onFirstload(response) {

			var distance = $('.supBar').offset().top,
				$window = $(window);
			$window.scroll(function () {
				if ($window.scrollTop() >= distance) {
					$('.supBar').addClass("fixedBar");
				} else {
					$('.supBar').removeClass("fixedBar");
				}
			});


			$scope.data = response.data.data;
			$scope.data.map(function (series) {
				series.values = series.values.map(function (d) {
					return {
						x: d[0],
						y: d[1]
					};
				});
				return series;
			});
			this.actives = response.data.activosReferencia;
		}

		this.updateChartDate = function updateChartDate(){
			this.detailgraphics = {};
			this.detailgraphics.nuEstrategia = this.id;
			this.detailgraphics.fhInicial = this.requestgraph.fhInicial;
			this.detailgraphics.fhFinal = this.requestgraph.fhFinal;
			this.detailgraphics.cdGraficas = ["precio + cupon", "precio valmer", "rendimientos", "cupones", "activo referencia"];

			detailPortfolioService
				.getDetalleGraficas(this.detailgraphics)
				.then(onFirstload.bind(this));
		};

		this.monthNames = [
			"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
		];

		function onGetDataModal(response) {
			if(response.data.activityDetails && response.data.activityDetails.length > 0){
				this.couponsHistory = response.data.activityDetails;
			}else{
				this.couponsHistory = [];
			}
		}

		function onGetDetail(response) {

			if (response.data && response.data.graficaCupones === null) {
				response.data.graficaCupones = {};
				response.data.graficaCupones.datos = [0, 0, 0];
				response.data.graficaCupones.titulos = ["Cupones totales", "Cupones observados", "Cupones pagados"];
				response.data.graficaCupones.colores = ["#89D1F3", "#009EE5", "#094fa4"];
			}
			if (response.data.detalleCupon === null) {
				response.data.detalleCupon = {};
				response.data.detalleCupon.plazoCupon = null;
				response.data.detalleCupon.cuponActual = null;
				response.data.detalleCupon.fhCuponActual = null;
				response.data.detalleCupon.fhSigCupon = null;
				response.data.detalleCupon.cuponPromedio = null;
			}
			//TODO
			/*
			if (response.data.detalleEstrategia.datos[14] && response.data.detalleEstrategia.datos[14].nuCatalogo === 2) {
				this.modEFectivo = true;
			} else {
				this.modAnual = true;
			}*/
			this.detail = response.data;
		}

		this.getPrintCheck = function getPrintCheck(event) {
			this.printCheck = event.target.checked;
		};

		this.getCheckCookie = function getCheckCookie() {
			if ($cookies.get('noMostrar') === "true") {
				// Si está checado anteriormente (TRUE), manda nueva ventana
				this.viewPrint();
			} else {
				// Si no está checado (FALSE), abre modal
				this.printModal.open();
			}
		};

		this.closePrintModal = function closePrintModal() {
			if (this.printCheck) {
				//Si el selector está checado, setea la Cookie a TRUE y cierra modal
				$cookies.put('noMostrar', true);
				this.printModal.close();
			} else {
				//Si el selector NO está checado, setea la Cookie a FALSE y cierra modal
				$cookies.put('noMostrar', false);
				this.printModal.close();
			}
		};

		this.reloadChart = function reloadChart() {
			detailPortfolioService
				.getDetalleGraficas(this.detailgraphics)
				.then(onFirstload.bind(this));
		};

		this.showDataModal = function showDataModal(type) {

			detailPortfolioService
				.getASO({
					module : '/structuredProduct/V01/trackingHistory',
					params: {
						strategyId: this.id,
						historyType: type
					}
				}).then(onGetDataModal.bind(this));

			/*
			detailPortfolioService
				.getModal({
					params: {
						idEstrategia: this.id,
						cupones: coupon,
						banquero: this.banquero
					}
				})
				.then(onGetDataModal.bind(this));
			*/
		};

		//viewPrint
		this.viewPrint = function viewPrint() {
			$window.open($window.serverConfig.dynPath + '/#!/portafolios-inversion/detalle/pdf/' + this.serie + '/' + this.id, '_blank');
		};

		this.optionsCoupons = {
			scales: {
				xAxes: [{
					gridLines: {
						display: false
					},
					ticks: {
						beginAtZero: true,
						display: false
					}
				}]
			},
			responsive: false
		};

		//Alternative Future

		var spanish = {
			"decimal": ",",
			"thousands": ".",
			"grouping": [3],
			"currency": ["â‚¬", ""],
			"dateTime": "%a %b %e %X %Y",
			"date": "%d/%m/%Y",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
			"shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
			"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			"shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
		};
		var es = d3.locale(spanish);

		$scope.options = {
			chart: {
				type: 'multiChart',
				height: 450,
				margin: {
					top: 0,
					right: 83,
					bottom: 50,
					left: 83
				},
				useInteractiveGuideline: false,
				switchYAxisOrder: true,
				duration: 500,
				xAxis: {
					axisLabel: 'Fechas',
					tickFormat: function (d) {
						return es.timeFormat('%x')(new Date(d));
					}
				},
				yAxis1: {
					axisLabel: 'Precios',
					tickFormat: function (d) {
						return '$' + d;
					},
					axisLabelDistance: 10
				},
				yAxis2: {
					axisLabel: 'Porcentajes',
					tickFormat: function (d) {
						return d + '%';
					},
				}
			}
		};

		//GET ST Init
		detailPortfolioService
			.getASO({
				module : '/structuredProduct/V01/'+	this.serie,
				params: {
					series: this.id
				}
			}).then(onGetDetail.bind(this));

		/*
		detailPortfolioService
			.getStrategyDetail({
				params: {
					idEstrategia: this.id
				}
			})
			.then(onGetDetail.bind(this));
		*/

	}
})();
