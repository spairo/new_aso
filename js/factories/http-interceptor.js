(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.factory('httpInterceptor', httpInterceptorFactory);

	function httpInterceptorFactory(Messages, $q, $window) {
		var factory = {
			request: function (config) {
				
				config.headers['Content-Type'] = 'application/json';
				
				if($window.architecture && $window.architecture.tsec){
					
					config.headers['tsec'] = $window.architecture.tsec
					console.log("paso por window");
					
				}else if(window.localStorage.getItem('tsec')){
					
					console.log("paso por localstorage");
					config.headers['tsec'] = window.localStorage.getItem('tsec');
				
				}else{
					console.log("no trae tsec");
				}
				
				return config;
			},
			response: function response(promise) {

				if (promise.config.apiBuilder && (promise.data.code || promise.data.listaErrores)) {
					Messages.broadcast(promise.data);
				}

				return promise;
			},
			responseError: function responseError(rejection) {

				Messages.broadcast(rejection.data);

				// Termina promesa http
				return $q.reject(rejection);
			}
		};

		return factory;
	}
})();
