(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('ExportPdfController', ExportPdfController);

	function ExportPdfController(exportPDFService, DatesHelper, $cookies, $routeParams) {

		this.banquero = $cookies.get('banquero');
		if (this.banquero === "false") {
			this.banquero = false;
		}
		else if(this.banquero === "true"){
			this.banquero = true;
		}

		function onGetGraphic(response){
			if(response.data[4].encabezados.length > 0){
				for (var i = 0; i < response.data[4].encabezados.length; i++) {
					if(response.data[4].encabezados[i] === "_Multi_"){
						response.data[4].encabezados[i] = "Multiregion";
					}
				}
			}
			this.graphics = response.data;
			this.disclaimer = this.graphics[0].disclaimer;
		}

		function onGetPortfolio(response) {
			this.portfolio = response.data.portafolios;
		}

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

		// idTab, contrato, subyancente
		this.idTabPortfolio = $routeParams.idTab;
		this.contrato = $routeParams.contrato;
		this.subyacente = $routeParams.subyacente;

		if(this.subyacente === null){
			this.subyacente = "";
		}

			this.printPdf = function printPdf() {
				$('head').append('<link rel="stylesheet" href="/styles/printH.css" type="text/css" />');
				setTimeout(function(){
					window.onafterprint = function(e){
						$('link[href*="printH"]').remove();
					};
				 window.print();
				setTimeout(function(){
					$(window.onafterprint);
				}, 1);
				}, 150);
			};

		this.usuario = $cookies.get('cdUser');

		if (this.idTabPortfolio === '0000') {
			exportPDFService
				.getTablePortfolio({ params: { usuario: this.usuario, tipoconsulta: 0 } })
				.then(onGetPortfolio.bind(this));
		} else {
			if (this.banquero) {
				exportPDFService
					.getTablePortfolio({ params: { usuario: this.usuario, tipoconsulta: 1, codigo: this.idTabPortfolio, contrato: this.contrato } })
					.then(onGetPortfolio.bind(this));
			}
			else{
				exportPDFService
					.getTablePortfolio({ params: { usuario: this.usuario, tipoconsulta: 1, codigo: this.idTabPortfolio } })
					.then(onGetPortfolio.bind(this));
			}
		}

		this.buildPie = {};
		this.buildPie.cdPortafolio = this.idTabPortfolio;
		this.buildPie.etiqueta = "ALL";
		this.buildPie.idCampo = 0;
		this.buildPie.usuario = this.usuario;
		this.buildPie.contrato = this.contrato;
		this.buildPie.subyacente = this.subyacente;

		exportPDFService
			.getGraphic(this.buildPie)
			.then(onGetGraphic.bind(this));
	}

	ExportPdfController.prototype = {
		getActivosConcat: function getActivosConcat(list) {
			if (list) {
				return list
					.map(function getName(item) {
						return item.nbActivo;
					})
					.join(', ');
			}
		}
	};
})();
