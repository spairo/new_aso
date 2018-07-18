(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('GlobalController', GlobalController);

	function GlobalController(globalService, Messages, patterns, $cookies, $location, $route, $window, $rootScope, $templateCache, $scope, $timeout) {
		// Copia modelo al editar (modal)
		this.copy = angular.copy;

		// Mensajes de error
		this.Messages = Messages;

		// Patterns validaciones
		this.patterns = patterns;

		// Recargar página
		this.reload = $route.reload;

		// serverConfig
		this.server = $window.serverConfig.dynPath;

		// User
		const profile = $window.architecture.iv_user.split('mx.').join("").toUpperCase();
		$cookies.put('cdUser', profile);

		//profile
		$cookies.put('banquero', true);

		// Fecha Actual
		this.today = new Date();

		// System Disclaimer
		this.sysDisclaimer = 	window.localStorage.getItem("sysDisclaimer");


		// Session
		this.session = $cookies.get('cdUser');
		this.name = "-";//$cookies.get('txNombre');
		this.session_banker = $cookies.get('banquero');



		if(angular.isUndefined(this.session)) {
			$location.path('/login');
		}

		function onGettsec(response){
			$window.architecture.tsec = response.headers('tsec');
			window.localStorage.setItem("tsec", JSON.stringify(response.headers('tsec')));
			console.log($window.architecture.tsec);
			$timeout($route.reload, 800);
		}

		// Logout
		this.logout = function logout(){
			$window.close();
		};
		
		var iv_user = $window.architecture.iv_user;
		var iv_ticketservice = $window.architecture.iv_ticketservice;

		this.ivdata = {
			"authentication":{
				"userID": iv_user,
				"consumerID":"10000078",
				"authenticationType":"00",
				"authenticationData":[{
					 "idAuthenticationData":"iv_ticketService",
					 "authenticationData": [iv_ticketservice]
				}]
			},
			"backendUserRequest":{
				"userId":"",
				"accessCode":"",
				"dialogId":""
			}
		};
		
		
		globalService
			.postASO(this.ivdata)
			.then(onGettsec.bind(this));
			//.then($route.reload());
		
		
		//Empty cache global
		$rootScope.$on('$viewContentLoaded', function(){
			//$templateCache.removeAll();
		});
	}
})();
