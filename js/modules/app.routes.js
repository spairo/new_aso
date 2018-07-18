(function wrapper() {
	'use strict';

	angular
		.module('app.routes', ['ngRoute'])
		.config(routes);

	function routes(RouteHelperProvider) {
		var routes = {
			/*
			'/': {
				deps: [
					'app/home/home-controller.js',
					'app/home/home-service.js'
				],
				templateUrl: 'app/home/main.html'
			},
			'/blotter-notas-estructuradas/alta-emision': {
				deps: [
					'app/blotter/blotter-notas-estructuradas/alta-emision/blotter-structured-notes-controller.js',
					'app/blotter/blotter-notas-estructuradas/alta-emision/blotter-structured-notes-service.js'
				],
				templateUrl: 'app/blotter/blotter-notas-estructuradas/alta-emision/main.html'
			},
			'/blotter-notas-estructuradas/consulta': {
				deps: [
					'app/blotter/blotter-notas-estructuradas/consulta/blotter-structured-notes-controller.js',
					'app/blotter/blotter-notas-estructuradas/consulta/blotter-structured-notes-service.js'
				],
				templateUrl: 'app/blotter/blotter-notas-estructuradas/consulta/main.html'
			},
			'/blotter-notas-estructuradas/detalle-emision/:tipo/:id': {
				deps: [
					'app/blotter/blotter-notas-estructuradas/detalle-emision/blotter-structured-notes-controller.js',
					'app/blotter/blotter-notas-estructuradas/detalle-emision/blotter-structured-notes-service.js'
				],
				templateUrl: 'app/blotter/blotter-notas-estructuradas/detalle-emision/main.html'
			},
			'/blotter-warrants/alta-emision': {
				deps: [
					'app/blotter/blotter-warrants/alta-emision/blotter-warrants-controller.js',
					'app/blotter/blotter-warrants/alta-emision/blotter-warrants-service.js'
				],
				templateUrl: 'app/blotter/blotter-warrants/alta-emision/main.html'
			},
			'/blotter-warrants/consulta': {
				deps: [
					'app/blotter/blotter-warrants/consulta/blotter-warrants-controller.js',
					'app/blotter/blotter-warrants/consulta/blotter-warrants-service.js'
				],
				templateUrl: 'app/blotter/blotter-warrants/consulta/main.html'
			},
			'/blotter-warrants/detalle-emision/:tipo/:id': {
				deps: [
					'app/blotter/blotter-warrants/detalle-emision/blotter-warrants-controller.js',
					'app/blotter/blotter-warrants/detalle-emision/blotter-warrants-service.js'
				],
				templateUrl: 'app/blotter/blotter-warrants/detalle-emision/main.html'
			},
			'/calendarios': {
				deps: [
					'app/catalogos/calendarios/calendars-controller.js',
					'app/catalogos/calendarios/calendars-service.js'
				],
				templateUrl: 'app/catalogos/calendarios/main.html'
			},
			'/catalogo-general': {
				deps: [
					'app/catalogos/general/catalog-general-controller.js',
					'app/catalogos/general/catalog-general-service.js'
				],
				templateUrl: 'app/catalogos/general/main.html'
			},
			'/cupones': {
				deps: [
					'app/seguimiento/repositorio/cupones/coupons-controller.js',
					'app/seguimiento/repositorio/cupones/coupons-service.js'
				],
				templateUrl: 'app/seguimiento/repositorio/cupones/main.html'
			},
			'/eventos-activo-referencia': {
				deps: [
					'app/ajustes/activo-referencia/consulta/reference-active-controller.js',
					'app/ajustes/activo-referencia/consulta/reference-active-service.js'
				],
				templateUrl: 'app/ajustes/activo-referencia/consulta/main.html'
			},
			'/eventos-activo-referencia/detalle-evento/:id/:activo/:evento': {
				deps: [
					'app/ajustes/activo-referencia/detalle-evento/reference-active-controller.js',
					'app/ajustes/activo-referencia/detalle-evento/reference-active-service.js'
				],
				templateUrl: 'app/ajustes/activo-referencia/detalle-evento/main.html'
			},
			'/usuarios-internos': {
				deps: [
					'app/ajustes/usuarios-internos/internal-users-controller.js',
					'app/ajustes/usuarios-internos/internal-users-service.js'
				],
				templateUrl: 'app/ajustes/usuarios-internos/main.html'
			},
			'/usuarios-internos/detalle-usuarios/:area': {
				deps: [
					'app/ajustes/usuarios-internos/detalle-usuarios/user-detail-controller.js',
					'app/ajustes/usuarios-internos/detalle-usuarios/user-detail-service.js'
				],
				templateUrl: 'app/ajustes/usuarios-internos/detalle-usuarios/main.html'
			},*/
			'/login': {
				deps: [
					'app/login/login-controller.js',
					'app/login/login-service.js'
				],
				templateUrl: 'app/login/main.html'
			},/*
			'/precios-indicativos': {
				deps: [
					'app/seguimiento/amortizaciones/precios/indicative-prices-controller.js',
					'app/seguimiento/amortizaciones/precios/indicative-prices-service.js'
				],
				templateUrl: 'app/seguimiento/amortizaciones/precios/main.html'
			},
			'/detalle-amortizaciones': {
				deps: [
					'app/seguimiento/amortizaciones/detalle/amortization-detail-controller.js',
					'app/seguimiento/amortizaciones/detalle/amortization-detail-service.js'
				],
				templateUrl: 'app/seguimiento/amortizaciones/detalle/main.html'
			},*/
			'/portafolios-inversion': {
				deps: [
					'app/seguimiento/portafolios-inversion/investment-portfolio-controller.js',
					'app/seguimiento/portafolios-inversion/investment-portfolio-service.js'
				],
				otherwise: true,
				templateUrl: 'app/seguimiento/portafolios-inversion/main.html'
			},
			'/portafolios-inversion/exportar-pdf/:idTab/:contrato/:subyacente': {
				deps: [
					'app/seguimiento/portafolios-inversion/exportar-pdf/export-pdf-controller.js',
					'app/seguimiento/portafolios-inversion/exportar-pdf/export-pdf-service.js'
				],
				templateUrl: 'app/seguimiento/portafolios-inversion/exportar-pdf/main.html'
			},
			'/portafolios-inversion/detalle/:serie/:id': {
				deps: [
					'app/seguimiento/portafolios-inversion/detalle-portafolio/detail-portafolio-controller.js',
					'app/seguimiento/portafolios-inversion/detalle-portafolio/detail-portafolio-service.js'
				],
				templateUrl: 'app/seguimiento/portafolios-inversion/detalle-portafolio/main.html'
			},
			'/portafolios-inversion/detalle/pdf/:serie/:id': {
				deps: [
					'app/seguimiento/portafolios-inversion/detalle-pdf/detail-pdf-controller.js',
					'app/seguimiento/portafolios-inversion/detalle-pdf/detail-pdf-service.js'
				],
				templateUrl: 'app/seguimiento/portafolios-inversion/detalle-pdf/main.html'
			},
			'/portafolios-inversion/editar-portafolio/:idPortfolio': {
				deps: [
					'app/seguimiento/portafolios-inversion/editar-portafolio/edit-portfolio-controller.js',
					'app/seguimiento/portafolios-inversion/editar-portafolio/edit-portfolio-service.js'
				],
				templateUrl: 'app/seguimiento/portafolios-inversion/editar-portafolio/main.html'
			},/*
			'/portafolios-inversion/nuevo-portafolio': {
				deps: [
					'app/seguimiento/portafolios-inversion/nuevo-portafolio/new-portfolio-controller.js',
					'app/seguimiento/portafolios-inversion/nuevo-portafolio/new-portfolio-service.js'
				],
				templateUrl: 'app/seguimiento/portafolios-inversion/nuevo-portafolio/main.html'
			},
			'/precios-bancomer-valmer': {
				deps: [
					'app/seguimiento/repositorio/precios-bancomer-valmer/prices-controller.js',
					'app/seguimiento/repositorio/precios-bancomer-valmer/prices-service.js'
				],
				templateUrl: 'app/seguimiento/repositorio/precios-bancomer-valmer/main.html'
			},
			'/registro-programas': {
				deps: [
					'app/seguimiento/registro-programas/recording-programs-controller.js',
					'app/seguimiento/registro-programas/recording-programs-service.js'
				],
				templateUrl: 'app/seguimiento/registro-programas/main.html'
			},
			'/rendimientos': {
				deps: [
					'app/seguimiento/repositorio/rendimientos/performance-controller.js',
					'app/seguimiento/repositorio/rendimientos/performance-service.js'
				],
				templateUrl: 'app/seguimiento/repositorio/rendimientos/main.html'
			},
			'/inflacion': {
				deps: [
					'app/seguimiento/repositorio/inflacion/inflation-controller.js',
					'app/seguimiento/repositorio/inflacion/inflation-service.js'
				],
				templateUrl: 'app/seguimiento/repositorio/inflacion/main.html'
			},*/
		};

		RouteHelperProvider.createRoutes(routes);
	}
})();
