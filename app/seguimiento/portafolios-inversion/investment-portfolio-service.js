(function wrapper() {
    'use strict';

    angular
        .module('app')
        .factory('investmentPortfolioService', investmentPortfolioServiceFactory);

    function investmentPortfolioServiceFactory(apiBuilder) {
        var service = {
            clonePortfolio: {
                method: 'post',
                url: '/portafolio/clonar'
            },
						deletePortfolio: {
							method: 'post',
							url: '/portafolio/eliminarPortafolio'
						},
						getASO:{
							method: 'get',
							url: ''
						},
            getPortfolio: {
                method: 'get',
                url: '/portafolio/consulta'
            },
            getPortfolioST: {
                method: 'get',
                url: '/portafolio/consulta/portafoliosUsuario'
            },
            getReport: {
                method: 'get',
                url: '/portafolio/consulta/reporte/encabezado'
            },
            getPiecharts:{
                method: 'post',
                url: '/portafolio/consulta/reporte/contenido'
            },
            getLights: {
                method: 'get',
                url: '/portafolio/consulta/semaforos'
            },
            saveCustomNavs: {
                method: 'post',
                url: '/encabezadoBlotter/guardar'
            },
            uploadRecord: {
                method: 'multipart',
                url: '/cargaArchivo'
            }
        };

        return apiBuilder(service);
    }
})();
