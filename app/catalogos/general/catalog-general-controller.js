(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('CatalogGeneralController', CatalogGeneralController);

	function CatalogGeneralController(catalogGeneralService, $cookies, $route) {
		// Level 1
		function onGetLevel1(response) {
			this.level1 = response.data;
		}

		// Level 2
		function onGetLevel2(response) {
			this.level2 = response.data;

			// Obtener nombre catálogo 2
			for (var i= 0; i < response.data.length; i++) {
				this.nameCatalog2 = response.data[i].cdCatalogo;
			}
		}

		// Level 3
		function onGetLevel3(response) {
			this.level3 = response.data;

			// Obtener nombre catálogo 3
			for (var i= 0; i < response.data.length; i++) {
				this.nameCatalog3 = response.data[i].cdCatalogo;
			}
		}

		// Level 4
		function onGetLevel4(response) {
			this.level4 = response.data;

			// Obtener nombre catálogo 4
			for (var i= 0; i < response.data.length; i++) {
				this.nameCatalog4 = response.data[i].cdCatalogo;
			}
		}

		// Level 5
		function onGetCharacteristics(response) {
			this.char = response.data;

			// Obtener nombre caracteristicas
			for (var i= 0; i < response.data.length; i++) {
				this.nameChar = response.data[i].cdCatalogo;
			}
		}

		function onoGetComplexity(response) {
			this.complex = response.data;
		}

		function onGetGeography(response) {
			this.geo = response.data;

			for (var i= 0; i < response.data.length; i++) {
				this.nameGeog = response.data[i].cdCatalogo;
			}
		}

		function onGetLevel5(response) {
			this.level5 = response.data;
		}

		function onGetFile(response) {
			this.docPayoff = response.data;
		}

		function onGetPayoffDocs(response) {
			this.payoff = response.data;
		}

		function onGetPayoffType(response) {
			this.type = response.data;

			for (var i= 0; i < response.data.length; i++) {
				this.nameType = response.data[i].cdCatalogo;
			}
		}

		function onGetProtection(response) {
			this.protection = response.data;

			// Obtener nombre caracteristicas
			for (var i= 0; i < response.data.length; i++) {
				this.nameProt = response.data[i].cdCatalogo;
			}
		}

		function onGetTypeOptions(response) {
			this.options = response.data;

			for (var i= 0; i < response.data.length; i++) {
				this.nameOption = response.data[i].cdCatalogo;
			}
		}

		// Activar Tab de Catálogo de propiedades
		this.activeCatalog = "PAY-OFF";

		// Agregar Catálogos
		this.addCatalog = function addCatalog(catalog, level, model, error) {
			this.request = {};
			this.request.cdCatalogo = catalog;
			this.request.txCatalogo = this[model];
			this.request.stActivo = true;
			this.request.nuNivel = level;

			if (this.request.txCatalogo === undefined || this.request.txCatalogo === "") {
				this[error] = true;
			} else {
				this.reqCatalog = {};
				this.reqCatalog.update = 0;
				this.reqCatalog.usuario = this.usuario;
				this.reqCatalog.request = this.request;

				if (this.calendariosOn) {
					// Agregar Calendarios
					catalogGeneralService
						.postCalendars(this.reqCatalog)
						.then($route.reload());
				} else if (this.showModal && this.characteristicsOn) {
					// Agregar Características
					catalogGeneralService
						.postCharacteristics(this.reqCatalog)
						.then($route.reload());
				} else if (!this.subyacenteOn && this.customersOn) {
					this.reqCatalog.nodoA = this.idSalesArea;
					this.reqCatalog.nodoB = this.idSalesGroup;

					// Agregar Clientes
					catalogGeneralService
						.postCustomers(this.reqCatalog)
						.then($route.reload());
				} else if (this.eventosOn) {
					// Agregar Eventos
					catalogGeneralService
						.postEvents(this.reqCatalog)
						.then($route.reload());
				} else if (this.showModal && this.geographyOn) {
					// Agregar Geografía
					catalogGeneralService
						.postGeography(this.reqCatalog)
						.then($route.reload());
				} else if (this.subyacenteOn && this.catalog === 'payoff' && !this.showModal) {
					this.reqCatalog.nodoA = this.idSubyacente;

					// Agregar Payoff
					catalogGeneralService
						.postPayoffNew(this.reqCatalog)
						.then($route.reload());
				} else if (this.showModal && this.typePayOffOn) {
					// Agregar Tipo de Payoff
					catalogGeneralService
						.postPayoffType(this.reqCatalog)
						.then($route.reload());
				} else if (this.showModal && this.protectionOn) {
					// Agregar Protección
					catalogGeneralService
						.postProtection(this.reqCatalog)
						.then($route.reload());
				} else if (this.subyacenteOn && this.catalog === 'activo') {
					this.reqCatalog.nodoA = this.idSubyacente;

					// Agregar Activos de Referencia
					catalogGeneralService
						.postReference(this.reqCatalog)
						.then($route.reload());
				} else if (!this.subyacenteOn && this.salesAreaOn && this.areaFlag) {
					// Agregar Área de Ventas
					catalogGeneralService
						.postSalesArea(this.reqCatalog)
						.then($route.reload());
				} else if (this.groupsOn) {
					this.reqCatalog.nodoA = this.idSalesArea;

					// Agregar Grupo de Ventas
					catalogGeneralService
						.postSalesGroup(this.reqCatalog)
						.then($route.reload());
				} else if (!this.subyacenteOn && this.catalog === null && this.mesasOn) {
					// Agregar Mesas
					catalogGeneralService
						.postTables(this.reqCatalog)
						.then($route.reload());
				} else if (this.showModal && this.optionsOn) {
					// Agregar Tipo de Opciones Payoff
					catalogGeneralService
						.postTypeOptionsPo(this.reqCatalog)
						.then($route.reload());
				} else if (!this.showModal && this.subyacenteOn && this.salesAreaOn) {
					// Agregar Subyacente
					catalogGeneralService
						.postSubyacente(this.reqCatalog)
						.then($route.reload());
				} else {
					// Agregar Catálogo
					catalogGeneralService
						.postCatalog(this.reqCatalog)
						.then($route.reload());
				}
			}
		};

		// Eliminar Catálogos
		this.deleteCatalogs = function deleteCatalogs(id, catalog) {
			if (this.calendariosOn) {
				// Eliminar Calendarios
				catalogGeneralService
					.deleteCalendars({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.showModal && this.characteristicsOn) {
				// Eliminar Características
				catalogGeneralService
					.deleteCharacteristics({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (!this.subyacenteOn && this.customersOn) {
				// Eliminar Clientes
				catalogGeneralService
					.deleteCustomers({ params : {id: id, usuario: this.usuario, nodoA: this.idSalesArea, nodoB: this.idSalesGroup} })
					.then($route.reload());
			} else if (this.eventosOn) {
				// Eliminar Eventos
				catalogGeneralService
					.deleteEvents({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.showModal && this.geographyOn) {
				// Eliminar Geografía
				catalogGeneralService
					.deleteGeography({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.subyacenteOn && this.catalog === 'payoff') {
				// Eliminar Payoff
				catalogGeneralService
					.deletePayoffNew({ params : {id: id, usuario: this.usuario, nodoA: this.idSubyacente} })
					.then($route.reload());
			} else if (this.showModal && this.typePayOffOn) {
				// Eliminar Tipo de Payoff
				catalogGeneralService
					.deletePayoffType({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.showModal && this.protectionOn) {
				// Eliminar Protección
				catalogGeneralService
					.deleteProtection({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.subyacenteOn && this.catalog === 'activo') {
				// Eliminar Activos de Referencia
				catalogGeneralService
					.deleteReference({ params : {id: id, usuario: this.usuario, nodoA: this.idSubyacente} })
					.then($route.reload());
			} else if (!this.subyacenteOn && this.salesAreaOn && this.areaFlag) {
				// Eliminar Área de Ventas
				catalogGeneralService
					.deleteSalesArea({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.groupsOn) {
				// Eliminar Área de Grupos
				catalogGeneralService
					.deleteSalesGroup({ params : {id: id, usuario: this.usuario, nodoA: this.idSalesArea} })
					.then($route.reload());
			} else if (!this.subyacenteOn && this.catalog === null && this.mesasOn) {
				// Eliminar Mesas
				catalogGeneralService
					.deleteTables({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.showModal && this.optionsOn) {
				// Eliminar Tipo de Opciones Payoff
				catalogGeneralService
					.deleteTypeOptionsPo({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else if (this.subyacenteOn && this.salesAreaOn) {
				// Eliminar Subyacente
				catalogGeneralService
					.deleteSubyacente({ params : {id: id, usuario: this.usuario} })
					.then($route.reload());
			} else {
				// Eliminar Catálogo
				catalogGeneralService
					.deleteCatalog({ params : {codigo: catalog, id: id, usuario: this.usuario} })
					.then($route.reload());
			}
		};

		// Editar Catálogos
		this.editCatalogs = function editCatalogs(item) {
			this.item = {};
			this.item.request = item;
			this.item.update = 1;
			this.item.usuario = this.usuario;

			if (this.calendariosOn) {
				// Editar Calendarios
				catalogGeneralService
					.postCalendars(this.item)
					.then($route.reload());
			} else if (this.showModal && this.characteristicsOn) {
				// Editar Característicar
				catalogGeneralService
					.postCharacteristics(this.item)
					.then($route.reload());
			} else if (!this.subyacenteOn && this.customersOn) {
				this.item.nodoA = this.idSalesArea;
				this.item.nodoB = this.idSalesGroup;

				// Editar Clientes
				catalogGeneralService
					.postCustomers(this.item)
					.then($route.reload());
			} else if (this.eventosOn) {
				// Editar Eventos
				catalogGeneralService
					.postEvents(this.item)
					.then($route.reload());
			} else if (this.showModal && this.geographyOn) {
				// Editar Geografía
				catalogGeneralService
					.postGeography(this.item)
					.then($route.reload());
			} else if (this.subyacenteOn && this.catalog === 'payoff' && this.payoffOn && !this.showModal) {
				this.item.nodoA = this.idSubyacente;

				// Editar Payoff
				catalogGeneralService
					.postPayoffNew(this.item)
					.then($route.reload());
			} else if (this.showModal && this.typePayOffOn) {
				// Editar Tipo de Payoff
				catalogGeneralService
					.postPayoffType(this.item)
					.then($route.reload());
			} else if (this.showModal && this.protectionOn) {
				// Editar Protección
				catalogGeneralService
					.postProtection(this.item)
					.then($route.reload());
			} else if (this.subyacenteOn && this.catalog === 'activo' && this.activeOn) {
				this.item.nodoA = this.idSubyacente;

				// Editar Activos de Referencia
				catalogGeneralService
					.postReference(this.item)
					.then($route.reload());
			} else if (!this.subyacenteOn && this.salesAreaOn && this.areaFlag) {
				// Editar Área de Ventas
				catalogGeneralService
					.postSalesArea(this.item)
					.then($route.reload());
			} else if (this.groupsOn) {
				this.item.nodoA = this.idSalesArea;

				// Editar Área de Grupos
				catalogGeneralService
					.postSalesGroup(this.item)
					.then($route.reload());
			} else if (!this.subyacenteOn && this.catalog === null && this.mesasOn) {
				// Editar Mesas
				catalogGeneralService
					.postTables(this.item)
					.then($route.reload());
			} else if (this.showModal && this.optionsOn) {
				// Editar Tipo de Opciones Payoff
				catalogGeneralService
					.postTypeOptionsPo(this.item)
					.then($route.reload());
			} else if (!this.showModal && this.subyacenteOn && this.salesAreaOn) {
				// Editar Subyacente
				catalogGeneralService
					.postSubyacente(this.item)
					.then($route.reload());
			} else {
				// Editar Catálogo
				catalogGeneralService
					.postCatalog(this.item)
					.then($route.reload());
			}
		};

		// Mostrar Catálogos
		this.onGetCatalog = function onGetCatalog(id, cdCatalogo) {
			this.addLevel2 = false; //- Ocultar input add nivel 2
			this.addLevel3 = false; //- Ocultar input add nivel 3
			this.addLevel4 = false; //- Ocultar input add nivel 4
			this.error2 = false; //- Regresar error vacío input add nivel 2
			this.error3 = false; //- Regresar error vacío input add nivel 3
			this.error4 = false; //- Regresar error vacío input add nivel 4
			this.searchLevel2 = ""; //- Limpiar buscador nivel 2
			this.searchLevel3 = ""; //- Limpiar buscador nivel 3
			this.searchLevel4 = ""; //- Limpiar buscador nivel 4
			this.textLevel2 = ""; //- Limpiar input agregar nivel 2
			this.textLevel3 = ""; //- Limpiar input agregar nivel 3
			this.textLevel4 = ""; //- Limpiar input agregar nivel 4
			this.activeOn = false; //- Desactivar bandera edicion activos
			this.customersOn = false; //- Desactivar bandera edicion clientes
			this.groupsOn = false; //- Desactivar bandera edicion grupo de ventas
			this.payoffOn = false; //- Desactivar bandera edicion payoff
			this.salesAreaOn = false; //- Desactivar bandera edicion área de ventas
			this.showLevel5 = false; // Desactivar editar y botón nivel 5

			if (cdCatalogo === 'NEW_MENU_CATALOGOS') { //- Payoff / Activos Referencia
				this.calendariosOn = false; //- Desactivar bandera edicion calendarios
				this.eventosOn = false; //- Desactivar bandera edicion eventos
				this.mesasOn = false; //- Desactivar bandera edicion mesas
				this.showLevel3 = false; // Desactivar nivel 3
				this.stopPropagation = false; //- Estilos para continuar click nivel 4
				this.subyacenteOn = false; //- Desactivar bandera edicion subyacente

				if (id === 65) { //- Divisas
					catalogGeneralService
						.getCurrency({ params : {catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 66) { //- Divisas de Liquidación
					catalogGeneralService
						.getLiquidationCurrency({ params : {catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 67) { //- Calendarios
					this.calendariosOn = true; //- Activar bandera edicion calendarios

					catalogGeneralService
						.getCalendars()
						.then(onGetLevel2.bind(this));
				}

				if (id === 68) { //- Área de ventas
					this.areaFlag = true;
					this.salesAreaOn = true; //- Activar bandera edicion area ventas
					this.showLevel3 = true; // Activar nivel 3

					catalogGeneralService
						.getSalesArea({ params : {usuario: this.usuario, catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 69) { //- Subyacente
					this.showLevel3 = true; // Activar nivel 3
					this.subyacenteOn = true; //- Activar bandera edicion subyacente

					catalogGeneralService
						.getSubyacente({ params : {usuario: this.usuario, catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 70) { // Pay off
					this.catalog = 'payoff'; // Bandera para identificar que servicio mostrar en nivel 5
					this.payoffOn = true;
					this.showLevel3 = true; // Activar nivel 3
					this.subyacenteOn = true;

					catalogGeneralService
						.getPayoffNew({ params : {id: this.idSubyacente } })
						.then(onGetLevel4.bind(this));
				}

				if (id === 71) { // Activo de Referencia
					this.activeOn = true;
					this.catalog = 'activo'; // Bandera para identificar que servicio mostrar en nivel 5
					this.showLevel3 = true; // Activar nivel 3
					this.subyacenteOn = true;

					catalogGeneralService
						.getReference({ params : {id: this.idSubyacente } })
						.then(onGetLevel4.bind(this));
				}

				if (id === 72) { //- Mesas
					this.mesasOn = true; //- Activar bandera edicion mesas

					catalogGeneralService
						.getTables()
						.then(onGetLevel2.bind(this));
				}

				if (id === 73) { //- Comercialización
					catalogGeneralService
						.getComercialization({ params : {catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 74) { //- Negocio
					catalogGeneralService
						.getBusiness({ params : {catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}

				if (id === 77) { //- Eventos de activos
					this.eventosOn = true; //- Activar bandera edicion eventos

					catalogGeneralService
						.getEvents({ params : {catalogo: 1} })
						.then(onGetLevel2.bind(this));
				}
			}

			if (cdCatalogo === 'TGRM019_REA') { //- Grupo de ventas
				this.calendariosOn = false; //- Desactivar bandera edicion calendarios
				this.eventosOn = false; //- Desactivar bandera edicion eventos
				this.groupsOn = true; // Activar grupo de ventas
				this.idSalesArea = id; // Nodo A
				this.mesasOn = false; //- Desactivar bandera edicion mesas
				this.salesGroup = true; // Activar grupo de ventas
				this.subyacenteOn = false; //- Desactivar bandera edicion subyacente

				catalogGeneralService
					.getSalesGroup({ params : {catalogo: 1, id: id} })
					.then(onGetLevel3.bind(this));
			}

			if (cdCatalogo === 'TGRM021_GRUPO') { //- Clientes
				this.calendariosOn = false; //- Desactivar bandera edicion calendarios
				this.eventosOn = false; //- Desactivar bandera edicion eventos
				this.customersOn = true; // Activar grupo de ventas
				this.idSalesGroup = id; // Id Grupo de Ventas
				this.mesasOn = false; //- Desactivar bandera edicion mesas
				this.stopPropagation = true; //- Estilos para bloquear click nivel 4
				this.subyacenteOn = false; //- Desactivar bandera edicion subyacente
				this.groupsOn = true; //- Activa bandera Grupos

				catalogGeneralService
					.getCustomers({ params : {catalogo: 1, id: id} })
					.then(onGetLevel4.bind(this));
			}

			if (cdCatalogo === 'TGRM005_SUBYACENTE') { //- Subyacente
				this.calendariosOn = false; //- Desactivar bandera edicion calendarios
				this.eventosOn = false; //- Desactivar bandera edicion eventos
				this.idSubyacente = id;
				this.mesasOn = false; //- Desactivar bandera edicion mesas
				this.subyacenteOn = true; //- Desactivar bandera edicion subyacente

				catalogGeneralService
					.getCatalogs({ params : {catalogo: 1, id: id} })
					.then(onGetLevel3.bind(this));
			}
		};

		// Obtener Detalle Level 5
		this.onGetDetail = function onGetDetail(id) {
			this.idPayoff = id;
			this.showLevel5 = true; //- mostrar nivel 5

			if (this.catalog === 'payoff') {
				catalogGeneralService
					.getPayoffDetail({params: {subyacente: this.idSubyacente, id: id } })
					.then(onGetLevel5.bind(this));

				// Pay off Docs
				catalogGeneralService
					.getPayoffDocs({ params: {id: id }})
					.then(onGetPayoffDocs.bind(this));
			}

			if (this.catalog === 'activo') {
				catalogGeneralService
					.getReferenceDetail({params: { id: id } })
					.then(onGetLevel5.bind(this));
			}

			catalogGeneralService
				.reviewRecord({params: { id: this.idPayoff} })
				.then(onGetFile.bind(this));
		};

		// Enviar configuración payoff y detalles
		this.submitOptions = function submitOptions() {
			this.level5.cdUsuario = $cookies.get('cdUser');
			this.level5.nodoA = this.idSubyacente;

			if (this.catalog === 'payoff') {
				catalogGeneralService
					.postPayoffDetail(this.level5)
					.then($route.reload());
			}

			if (this.catalog === 'activo') {
				catalogGeneralService
					.postReferenceDetail(this.level5)
					.then($route.reload());
			}

			if (this.file !== undefined && this.file.file) {
				this.file.id = this.idPayoff;
				this.file.categoria = 'documentoPayOff';
				this.file.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
				this.file.cdUsuario = $cookies.get('cdUser');
				this.file.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');

				catalogGeneralService
					.uploadRecord(this.file)
					.then($route.reload());
			}

		};

		// Usuario
		this.usuario = $cookies.get('cdUser');

		// Services
		catalogGeneralService
			.getCatalogs()
			.then(onGetLevel1.bind(this));
		catalogGeneralService // Características
			.getCharacteristics()
			.then(onGetCharacteristics.bind(this));
		catalogGeneralService // Complejidad
			.getComplexity()
			.then(onoGetComplexity.bind(this));
		catalogGeneralService // Geografía
			.getGeography()
			.then(onGetGeography.bind(this));
		catalogGeneralService // Protección
			.getProtection()
			.then(onGetProtection.bind(this));
		catalogGeneralService // Tipo de opciones
			.getTypeOptionsPo()
			.then(onGetTypeOptions.bind(this));
		catalogGeneralService // Tipo de Payoff
			.getPayoffType()
			.then(onGetPayoffType.bind(this));


	}

	CatalogGeneralController.prototype = {
		checkDetail: function checkDetail(item, property) {
			// Verificar si el catalogo principal es igual al detalle (columna 5)
			var match = false;

			var levelData = this.level5[property];

			if (levelData !== undefined) {
				var levelDataAll = levelData.actuales;

				levelDataAll.forEach(function findMatch(current) {
					if (angular.equals(item, current)) {
						match = true;

						if (match) { // Colocar status a true
							current.stActivo = true;
							item.stActivo = true;
						}

					}
				});
			}
			return match;
		},
		updateProperty: function updateProperty(item, property) {
			var levelData = this.level5[property],
					matchAt = null;

			if (levelData !== undefined) {
				var levelDataAll = levelData.actuales,
						levelDataNew = levelData.nuevos;

				if (this.payoffOn) {
					levelDataAll.forEach(function findMatch(current) {
						// se verifica que en actuales ya exista el objeto
						if (item.nuCatalogo === current.nuCatalogo) {
							matchAt = true;
							if (current.stActivo) { // si si, cambia estatus
								current.stActivo = false;
							} else {
								current.stActivo = true;
							}
						}
					});

					if (!matchAt) { //- si no existe en el objeto
						if (levelDataNew.length) {
							levelDataNew.forEach(function findMatchNuevo(current, index) {
								if (angular.equals(item, current)) { // quita objeto a nuevo
									levelDataNew.splice(index, 1);
								} else { // agrega objeto a nuevo
									levelDataNew.push(item);
								}
							});
						} else { // agrega objeto a nuevo
							levelDataNew.push(item);
						}
					}
				}

				if (this.activeOn) {
					if (levelDataNew.length) {
						levelDataNew = [];
						levelDataNew.push(item);
					} else {
						levelDataNew.push(item);
					}
				}
			}
		}
	};

})();
