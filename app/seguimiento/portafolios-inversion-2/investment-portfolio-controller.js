(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('InvestmentPortfolioController', InvestmentPortfolioController);

	function InvestmentPortfolioController(investmentPortfolioService, DatesHelper, $cookies, $location, $route, $timeout, $window) {

		//Initial Build
		function onGetPortfolio(response) {

			this.subjacents = response.data.portfolio.underlyingAssets;
			this.tabs = response.data.portfolio.productTabs;

			if (response.data.portfolio.relatedContracts === null) {
				response.data.relatedContracts = [];
			}

			response.data.portfolio.contratos = [];
			_.forEach(response.data.portfolio.relatedContracts, function(value) {
				response.data.portfolio.contratos.push({ txCatalogo: value });
			});

			this.contrats = response.data.portfolio.contratos;

			if (response.data.portfolio.structuredProductInformation === null) {
				response.data.portfolio.structuredProductInformation = [];
			}

			_.forEach(response.data.portfolio.structuredProductInformation, function(value) {

				if(value.status === '1' || value.status === '3'){
					value.stActivo = true;
				}else{
					value.stActivo = false;
				}

		        var precios = _.map(value.prices, 'priceAmountDate.amount');
		        var fechas = _.map(value.prices, 'priceDate');
		        value.prices.precios = [precios];
		        value.prices.fechas = fechas;
			});

			this.portfolioT = response.data.portfolio.structuredProductInformation;
		}

		function onGetPortfolioUpdate(response) {

			response.data.portfolio.contratos = [];
			_.forEach(response.data.portfolio.relatedContracts, function(value) {
				response.data.portfolio.contratos.push({ txCatalogo: value });
			});

			this.contrats = response.data.portfolio.contratos;

			if (response.data.portfolio.structuredProductInformation === null) {
				response.data.portfolio.structuredProductInformation = [];
			}

			_.forEach(response.data.portfolio.structuredProductInformation, function(value) {

				if(value.status === '1' || value.status === '3'){
					value.stActivo = true;
				}else{
					value.stActivo = false;
				}

				var precios = _.map(value.prices, 'priceAmountDate.amount');
				var fechas = _.map(value.prices, 'priceDate');

		        value.prices.precios = [precios];
		        value.prices.fechas = fechas;
			});

			this.portfolioT = response.data.portfolio.structuredProductInformation;
		}

		function onGetPortfolioST(response) {
			this.briefcases = response.data.portfolio;
		}

		function onGetPortfolioTab(response) {

			if (response.data.portfolio.structuredProductInformation === null) {
				response.data.portfolio.structuredProductInformation = [];
			}

			_.forEach(response.data.portfolio.structuredProductInformation, function(value) {

				if(value.status === '1' || value.status === '3'){
					value.stActivo = true;
				}else{
					value.stActivo = false;
				}

		        var precios = _.map(value.prices, 'priceAmountDate.amount');
						var fechas = _.map(value.prices, 'priceDate');
		
		        value.prices.precios = [precios];
		        value.prices.fechas = fechas;
			});

			response.data.portfolio.contratos = [];

			_.forEach(response.data.portfolio.relatedContracts, function(value) {
				response.data.portfolio.contratos.push({ txCatalogo: value });
			});

			this.contrats = response.data.portfolio.contratos;

			this.subjacents = response.data.portfolio.underlyingAssets;
			this.portfolioT = response.data.portfolio.structuredProductInformation;
			this.activeTabHeader = 0;


			//callback to lateral charts
			if (this.visibleResume.length > 0) {
				this.buildPiechart(this.visibleResume[0].description, this.visibleResume[0].code);
			}

		}

		function onGetLights(response) {
			this.lights = response.data;
		}

		function onGetReport(response) {

			_.forEach(response.data.headers, function(value) {
				if(value.visibilityIndicator.activeField === '1'){
					value.visibleUsuario = true;
				}else{
					value.visibleUsuario = false;
				}
			});

			this.report = response.data;
			this.visibleResume = [];


			for (var i = 0; i < response.data.headers.length; i++) {
				if (response.data.headers[i].visibleUsuario) {
					this.visibleResume.push(response.data.headers[i]);
				}
			}

			//callback to lateral charts
			if (this.banquero && this.contrato !== null) {
				if (this.visibleResume.length > 0) {
					this.buildPiechart(this.visibleResume[0].description, this.visibleResume[0].code);
				}
			} else {
				if (this.visibleResume.length > 0) {
					this.buildPiechart(this.visibleResume[0].description, this.visibleResume[0].code);
				}
			}

		}

		function onGetPieChart(response) {
			
			
			if(response.data && response.data.colors && response.data.colors.length > 0){
				response.data.colores = _.map(response.data.colors, 'name');
			}
			if(response.data && response.data.headerNames && response.data.headerNames.length > 0){
				response.data.encabezados = _.map(response.data.headerNames, 'description');
			}
			if(response.data && response.data.headerValues && response.data.headerValues.length > 0){
				response.data.valores = _.map(response.data.headerValues, 'fieldValue');
			}
			this.pies = response.data;
		}

		this.usuario = $cookies.get('cdUser');
		this.banquero = $cookies.get('banquero');

		if (this.banquero === 'true') {
			this.banquero = true;
		} else {
			this.banquero = false;
		}

		this.codigoTab = null;

		//Portfolios Filter
		this.filterSubjacents = function(sub) {
			this.subyacenteTab = "TODO";
			delete this.subyacenteFilter;

			if (this.visibleResume.length > 0) {
				this.buildLateral = {};
				this.buildLateral.usuario = this.usuario;
				this.buildLateral.idCampo = this.visibleResume[0].code;
				this.buildLateral.cdPortafolio = this.tabCode;
				this.buildLateral.etiqueta = this.visibleResume[0].description;
				this.buildLateral.contrato = this.contrato;
				this.buildLateral.subyacente = this.subyacente;

				investmentPortfolioService
					.getASO(
						{
							module : '/structuredProduct/V01/users/'+this.usuario +'/portfolioGraphicData',
							params: {
								fieldCode: this.visibleResume[0].description,
								portfolioId: this.tabCode,
								queryType: 0,
								underlyingType: this.subyacente,
								contractNumber: this.contrato
							}
					}).then(onGetPieChart.bind(this));

				/*
				investmentPortfolioService
					.getPiecharts(this.buildLateral)
					.then(onGetPieChart.bind(this));
				*/
			}
		};

		// Active Tab Primary
		if (this.banquero) {
			this.activeTab = "banquero";
			this.tabCode = 'B000';
		} else {
			this.activeTab = "default";
			this.tabCode = '0000';
		}
		this.contrato = null;
		this.subyacente = null;

		//Lateral Charts
		this.buildPiechart = function(label, id) {
						
			this.buildPie = {};

			//TODO
			this.historyBack = JSON.parse(window.localStorage.getItem('HistoryBack'));

			if (this.historyBack) {
				this.buildPie.usuario = this.historyBack.tab.usuario;
				this.buildPie.cdPortafolio = this.historyBack.tab.codigo;
			} else {
				this.buildPie.usuario = this.usuario;
				this.buildPie.cdPortafolio = this.tabCode;
			}

			this.buildPie.idCampo = id;
			this.buildPie.etiqueta = label;
			this.buildPie.contrato = this.contrato;
			this.buildPie.subyacente = this.subyacente;

			investmentPortfolioService
				.getASO({
					module : '/structuredProduct/V01/users/'+this.usuario +'/portfolioGraphicData',
					params: {
						fieldCode: label,
						portfolioId: this.tabCode,
						queryType: 0,
						underlyingType: this.subyacente,
						contractNumber: this.contrato
					}
				}).then(onGetPieChart.bind(this));

		};

		//update Lateral by subyacente or contrat
		this.updateLateral = function updateLateral() {

			if (this.contrato === undefined || this.contrato === "-") {
				this.contrato = null;
			}

			if (this.visibleResume.length > 0) {
				this.buildLateral = {};
				this.buildLateral.usuario = this.usuario;
				this.buildLateral.idCampo = this.visibleResume[0].code;
				this.buildLateral.cdPortafolio = this.tabCode;
				this.buildLateral.etiqueta = this.visibleResume[0].description;
				this.buildLateral.contrato = this.contrato;
				this.buildLateral.subyacente = this.subyacente;

				investmentPortfolioService
					.getASO({
						module : '/structuredProduct/V01/users/'+this.usuario +'/portfolioGraphicData',
						params: {
							fieldCode: this.visibleResume[0].description,
							portfolioId: this.tabCode,
							queryType: 0,
							underlyingType: this.subyacente,
							contractNumber: this.contrato
						}
					}).then(onGetPieChart.bind(this));
			}
		};

		//update content by contrato
		this.updateContrat = function updateContrat(value) {

			if (value !== null) {

				investmentPortfolioService
					.getASO({
						module : '/structuredProduct/V01/users/'+this.usuario +'/portfolio',
						params: {
							portfolioId: this.tabCode,
							queryType: 0,
							underlyingType: this.subyacente,
							contractNumber: this.contrato,
							paginationKey: 0
						}
					}).then(onGetPortfolioUpdate.bind(this));

			}
		};

		//Long to date function
		this.longToDate = function(long) {
			var date = new Date(long);
			return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
		};

		// Calcular fechas de vencimiento
		this.calculateDays = function calculateDays(date) {
			var days = DatesHelper.daysBetween(date);

			if (days >= 0 && days <= 15) {
				this.expirateDay = true;
				return days + ' d\u00edas';
			} else {
				this.expirateDay = false;
				return date;
			}
		};

		this.clonePortfolio = function clonePortfolio(cdPortfolio) {
			this.clone = {};
			this.clone.cdUsuario = this.usuario;
			this.clone.cdPortafolio = cdPortfolio;

			investmentPortfolioService
				.clonePortfolio(this.clone)
				.then($route.reload());
		};

		//Chart simple setupfgo
		this.datasetOverride = [{
			yAxisID: 'y-axis-1'
		}];

		//Detail Portafolio
		this.detail = function detail(id, name) {

			//TODO
			if(this.querytype !== undefined){
				this.briefcase = {
					"tab": {
						"usuario": this.usuario,
						"tipoconsulta": this.querytype,
						"codigo": this.tabCode,
						"activetab": this.activeTab
					},
					"lateral": {
						"etiqueta": this.visibleResume[0].description,
						"id": this.visibleResume[0].code
					}
				};
				window.localStorage.setItem("HistoryBack", JSON.stringify(this.briefcase));
			}

			$location.path('/portafolios-inversion/detalle/' + name + '/' + id);
		};

		this.goEdition = function goEdition(code) {
			$location.path('/portafolios-inversion/editar-portafolio/' + code);
		};

		this.goNew = function goNew() {
			$location.path('/portafolios-inversion/nuevo-portafolio');
		};

		this.removePortfolio = function removePortfolio() {
			this.deleteP = {};
			this.deleteP.cdUsuario = this.usuario;
			this.deleteP.cdPortafolio = this.codigoTab;

			investmentPortfolioService
				.deletePortfolio(this.deleteP)
				.then($timeout($route.reload, 1200));
		};

		//Upload traffclight
		this.lightUploadFile = function lightUploadFile() {
			if (this.lightfile) {
				this.lightfile.categoria = "semaforo";
				this.lightfile.cdUsuario = $cookies.get('cdUser');
				this.lightfile.id = 0;

				investmentPortfolioService
					.uploadRecord(this.lightfile)
					.then(this.uploadTrafficLight.close());
				$route.reload();
			}
		};

		this.options = {
			scales: {
				xAxes: [{
					gridLines: {
						display: false
					},
					ticks: {
						display: false
					}
				}],
				yAxes: [{
					id: 'y-axis-1',
					type: 'linear',
					display: true,
					position: 'left',
					gridLines: {
						display: false
					}
				}]
			},
			layout: {
				padding: {
					left: 15,
					right: 5,
					top: 0,
					bottom: 1
				}
			}
		};

		this.lateralOps = {
			layout: {
				padding: {
					left: 32,
					right: 40,
					top: 0,
					bottom: 1
				}
			}
		};

		//portafolio tab default
		this.portafolioDefault = function portafolioDefault() {
			this.querytype = 0;

			//TODO
			this.briefcase = {
				"tab": {
					"usuario": this.usuario,
					"tipoconsulta": 0,
					"codigo": this.tabCode,
					"activetab": this.activeTab
				},
				"lateral": {
					"etiqueta": this.visibleResume[0].description,
					"id": this.visibleResume[0].code
				}
			};

			window.localStorage.setItem("HistoryBack", JSON.stringify(this.briefcase));

			investmentPortfolioService
				.getASO({
					module : '/structuredProduct/V01/users/'+this.usuario +'/portfolio',
					params: {
						portfolioId: this.tabCode,
						queryType: 0,
						underlyingType: this.subyacente,
						contractNumber: this.contrato,
						paginationKey: 0
					}
				}).then(onGetPortfolioTab.bind(this));
		};

		//portafolio tab bank
		this.portafolioBanker = function portafolioBanker() {

			this.querytype = 0;

			//TODO
			this.briefcase = {
				"tab": {
					"usuario": this.usuario,
					"tipoconsulta": 0,
					"codigo": this.tabCode,
					"activetab": this.activeTab
				},
				"lateral": {
					"etiqueta": this.visibleResume[0].description,
					"id": this.visibleResume[0].code
				}
			};

			window.localStorage.setItem("HistoryBack", JSON.stringify(this.briefcase));

			investmentPortfolioService
				.getASO({
					module : '/structuredProduct/V01/users/'+this.usuario +'/portfolio',
					params: {
						portfolioId: this.tabCode,
						queryType: 0,
						underlyingType: this.subyacente,
						contractNumber: this.contrato,
						paginationKey: 0
					}
				}).then(onGetPortfolioTab.bind(this));

		};

		// portfolio configuration
		this.portafolioST = function portafolioST() {
			investmentPortfolioService
				.getPortfolioST({
					params: {
						usuario: this.usuario
					}
				})
				.then(onGetPortfolioST.bind(this));
		};

		// portfolio tab @request
		this.portafolioTab = function portafolioTab(code) {
			this.querytype = 1;

			//TODO
			this.briefcase = {
				"tab": {
					"usuario": this.usuario,
					"tipoconsulta": 1,
					"codigo": code,
					"activetab": this.activeTab
				},
				"lateral": {
					"etiqueta": this.visibleResume[0].description,
					"id": this.visibleResume[0].code
				}
			};

			window.localStorage.setItem("HistoryBack", JSON.stringify(this.briefcase));

			investmentPortfolioService
				.getASO({
					module : '/structuredProduct/V01/users/'+this.usuario +'/portfolio',
					params: {
						portfolioId: code,
						queryType: 1,
						underlyingType: this.subyacente,
						contractNumber: this.contrato,
					}
				}).then(onGetPortfolioTab.bind(this));
		};

		// Guardar Personalizar Vista
		this.saveCustomize = function saveCustomize() {
			
			debugger;

			this.customize = {};
			this.customize.encabezado = this.report.encabezados;
			this.customize.nuInterfaz = 12;
			this.customize.usuario = this.usuario;
			
			console.log(this.report);
			
			investmentPortfolioService
				.saveCustomNavs(this.customize)
				.then($route.reload());
		};

		this.series = ['Precio'];

		// Ir a página de impresión
		this.viewPrint = function viewPrint(idTab) {
			$location.path('/portafolios-inversion/exportar-pdf/' + idTab + "/" + this.contrato + "/" + this.subyacente);
		};

		//TODO REFACTOR
		if (this.banquero) {

			this.historyBack = JSON.parse(window.localStorage.getItem('HistoryBack'));

			if (this.historyBack) {

				investmentPortfolioService
					.getASO({
						module : '/structuredProduct/V01/users/'+this.historyBack.tab.usuario+'/portfolio',
						params: {
							portfolioId: this.historyBack.tab.codigo,
							queryType: this.historyBack.tab.tipoconsulta,
							underlyingType: this.subyacente,
							contractNumber: this.contrato,
							paginationKey: 0
						}
					}).then(onGetPortfolio.bind(this));

				this.activeTab = this.historyBack.tab.activetab;

				//callback to lateral charts
				this.buildPiechart(this.historyBack.lateral.etiqueta, this.historyBack.lateral.id);

			} else {

				investmentPortfolioService
					.getASO({
						module : '/structuredProduct/V01/users/'+this.usuario+'/portfolio',
						params: {
							portfolioId: this.tabCode,
							queryType: 1,
							underlyingType: this.subyacente,
							contractNumber: this.contrato,
							paginationKey: 0
						}
					}).then(onGetPortfolio.bind(this));

			}

		} else {

			//TODO
			this.historyBack = JSON.parse(window.localStorage.getItem('HistoryBack'));

			if (this.historyBack) {
				investmentPortfolioService
					.getPortfolio({
						params: {
							usuario: this.historyBack.tab.usuario,
							tipoconsulta: this.historyBack.tab.tipoconsulta,
							codigo: this.historyBack.tab.codigo
						}
					})
					.then(onGetPortfolio.bind(this));
				this.activeTab = this.historyBack.tab.activetab;

				//callback to lateral charts
				this.buildPiechart(this.historyBack.lateral.etiqueta, this.historyBack.lateral.id);

			} else {
				investmentPortfolioService
					.getPortfolio({
						params: {
							usuario: this.usuario,
							tipoconsulta: 0
						}
					})
					.then(onGetPortfolio.bind(this));
			}

		}

		//TODO
		investmentPortfolioService
			.getASO({
				module : '/structuredProduct/V01/graphicComponent',
				params: {
					templateId: 12,
					userId: this.usuario
				}
			}).then(onGetReport.bind(this));

		investmentPortfolioService
			.getLights()
			.then(onGetLights.bind(this));

	}

	InvestmentPortfolioController.prototype = {
		checkVisibility: function checkVisibility(report) {
			
			debugger;
			console.log(report);
			
			if (!report.visibleUsuario) {
				for (var i = 0; i < this.visibleResume.length; i++) {
					if (report.code === this.visibleResume[i].code) {
						this.visibleResume.splice(i, 1);
					}
				}
			} else {
				this.visibleResume.push(report);
			}
		}
	};

})();
