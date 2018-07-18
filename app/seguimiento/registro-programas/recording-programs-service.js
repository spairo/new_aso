(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('recordingProgramsService', recordingProgramsServiceFactory);

	function recordingProgramsServiceFactory(apiBuilder) {
		var service = {
			createPrograms: {
				method: 'post',
				url: '/programas/guardar'
			},
			editPrograms: {
				method: 'post',
				url: '/programas/editar'
			},
			getColors:{
				method: 'get',
				url: '/catalog/color'
			},
			getCurrencies: {
				method: 'get',
				url: '/catalog/currency'
			},
			getPrograms: {
				method: 'get',
				url: '/programas'
			},
			getProducts: {
				method: 'get',
				url: '/catalog/product'
			},
			uploadRecord: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
