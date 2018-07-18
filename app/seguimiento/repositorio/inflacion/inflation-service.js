(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('inflationService', inflationServiceFactory);

	function inflationServiceFactory(apiBuilder) {
		var service = {
			getInflation: {
				method: 'get',
				url: '/inflacion/consulta'
			},
			uploadPerform: {
				method: 'multipart',
				url: '/cargaArchivo'
			},
			actualizaGat: {
				method: 'get',
				url: '/blotter/actualizaGat'
			}
		};

		return apiBuilder(service);
	}
})();
