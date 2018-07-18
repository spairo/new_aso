(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('calendarsService', calendarsServiceFactory);

	function calendarsServiceFactory(apiBuilder) {
		var service = {
			uploadRecord: {
				method: 'multipart',
				url: '/cargaArchivo'
			},
			getCalendaries: {
				method: 'get',
				url: '/getCalendarioDiasInhabiles'
			},
			getInfoCal: {
				method: 'post',
				url: '/getDiasInhabiles'
			},
			addDateCal: {
				method: 'post',
				url: '/agregarFechaInhabil'
			}
		};

		return apiBuilder(service);
	}
})();
