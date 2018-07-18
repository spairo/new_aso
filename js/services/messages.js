(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.service('Messages', MessagesService);

	function MessagesService() { }

	MessagesService.prototype = {
		broadcast: function broadcast(message) {

			if(message["error-code"] === '50'){
				console.log(message);
			}else{
				delete this.message;
				this.message = message;
				this.ui.open();
			}
		}
	};
})();
