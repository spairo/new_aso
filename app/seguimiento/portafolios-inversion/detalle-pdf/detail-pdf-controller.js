	(function wrapper() {
		'use strict';
		angular
			.module('app')
			.controller('DetailPdfController', DetailPdfController);

			function DetailPdfController(detailPdfService, $scope, $window, $filter, $cookies, $route, $location, $routeParams, $timeout){

				this.id = $routeParams.id;
				this.serie = $routeParams.serie;
				this.banquero = $cookies.get('banquero');

				if(this.id && this.serie){
					this.detailgraphics = {};
					this.detailgraphics.nuEstrategia = this.id;
					this.detailgraphics.fhInicial = null;
					this.detailgraphics.fhFinal = null;
					this.detailgraphics.cdGraficas = ["precio + cupon","precio valmer","rendimientos","cupones","activo referencia"];

					detailPdfService
						.getDetalleGraficas(this.detailgraphics)
						.then(onFirstload.bind(this));
				}

				function onFirstload(response){
					//Alternative Future
					$scope.data = response.data.data;
					$scope.data.map(function(series){
						series.values = series.values.map(function(d){
							return {
								x: d[0],
								y: d[1]
							};
						});
						return series;
					});
					this.actives = response.data.activosReferencia;
				}

				function onGetDataModal(response) {
					this.modal = response.data;
				}
				function onGetDataModalR(response) {
					this.modalR =  response.data;
				}

				function onGetDetail(response) {
					if(response.data && response.data.graficaCupones === null){
						response.data.graficaCupones = {};
						response.data.graficaCupones.datos = [0,0,0];
						response.data.graficaCupones.titulos = ["Cupones totales","Cupones observados","Cupones pagados"];
						response.data.graficaCupones.colores = ["#89D1F3", "#009EE5", "#094fa4"];
					}
					if(response.data.detalleCupon === null){
						response.data.detalleCupon = {};
						response.data.detalleCupon.plazoCupon = null;
						response.data.detalleCupon.cuponActual = null;
						response.data.detalleCupon.fhCuponActual = null;
						response.data.detalleCupon.fhSigCupon = null;
						response.data.detalleCupon.cuponPromedio = null;
					}
					this.detail = response.data;

					if (this.banquero === true) {
						this.disclaimer = this.detail.disclaimer.banquero;
					}
					else{
						this.disclaimer = this.detail.disclaimer.cliente;
					}
				}

				this.showDataModal = function showDataModal(coupon) {
					detailPdfService
						.getModal({ params: {idEstrategia: this.id, cupones: coupon} })
						.then(onGetDataModal.bind(this));
				};


				detailPdfService
					.getModal({ params: {idEstrategia: this.id, cupones: 1, banquero : this.banquero} })
					.then(onGetDataModal.bind(this));

				detailPdfService
					.getModal({ params: {idEstrategia: this.id, cupones: 0, banquero : this.banquero} })
					.then(onGetDataModalR.bind(this));

				//Print Detail
				this.printPdf = function printPdf(){
					window.print();
				};

				this.optionsCoupons = {
					scales: {
						xAxes: [
							{
								gridLines: {
									display: false
								},
								ticks: {
									beginAtZero: true,
									display: false
								}
							}
						]
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
							right: 195,
							bottom: 50,
							left: 83
						},
						useInteractiveGuideline: true,
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

				detailPdfService
					.getStrategyDetail({ params: {idEstrategia: this.id} })
					.then(onGetDetail.bind(this));


					angular.element(document).ready(function () {
						var printFn = function() {
							$window.onafterprint = function(){
								$window.close();
							};
							$window.print();
							$timeout($window.onafterprint, 1);
						};
						$timeout(printFn, 1100);
					});
			}
	})();
