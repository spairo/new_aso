(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.factory('apiBuilder', apiBuilderFactory);

	function apiBuilderFactory($http, $window) {
		function factory(map) {

			var api = { };

			function buildApi(options, name) {

	
				if (options.method === 'mock' || serverConfig.forceMocks) {
					options.method = 'get';
					options.url += '.json';
				}
				

				options.url = serverConfig.dynPath + options.url;

				api[name] = function callToApi(data, config) {

					if (options.method.match(/^(post|patch|put|multipart)$/)) {
						config = config || { }; config.apiBuilder = true;
					} else {
						data = data || { }; data.apiBuilder = true;
					}
					
					if(data && data.authentication){
						
						options.method = 'post'
						options.url = $window.architecture.grantingTicket;
						
						return $http[options.method](options.url, data, config);
					}
					
					if(data && data.module){
				
						//var iv_user = $window.architecture.iv_user;
						//var iv_ticketservice = $window.architecture.iv_ticketservice;
						//var grantingTicket = $window.architecture.grantingTicket;
						//var aso = $window.architecture.aso;

						//var aso = serverConfig.dynPath;
						options.method = 'get'
						options.url = $window.architecture.aso + data.module;
						//console.log(options.url);
						//options.url += '.json';

						/*
						var grantingTicket = {
							method: 'POST',
							url: grantingTicket,
							headers: {
								'Content-Type': 'application/json'
							},
							data: {
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
							}
						};
						*/
						
						/*
						 $http(grantingTicket).then(function successCallback(response) {
							
							$window.architecture.tsec = response.headers('tsec');
							window.localStorage.setItem("tsec", JSON.stringify(response.headers('tsec')));
					
							
						}, function errorCallback(response) {
							console.log("grantingTicket failed 2");
						});
						*/
						

						return $http[options.method](options.url, data, config);

					} else {
						return $http[options.method](options.url, data, config);
					}
				};
			}

			angular.forEach(map, buildApi);

			return api;
		}

		return factory;
	}
})();
