(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('DetailBlotterNotesController', DetailBlotterNotesController);

	function DetailBlotterNotesController(detailBlotterNotesService, $cookies, $location, $route, $routeParams, $timeout) {
		// Functions
		function onDeleteEmission() {
			$location.path('/blotter-notas-estructuradas/consulta');
		}

		function onGetAvailableDocs(response) {
			this.docs = response.data;
		}

		function onGetBusiness(response) {
			this[25] = response.data;
		}

		function onGetCalendars(response) {
			var calendarDataLength = 0;

			this.calendar = response.data;

			for (var key in response.data.datos) {
				if (response.data.datos[key].length > calendarDataLength) {
					calendarDataLength = response.data.datos[key].length;
					this.calendarDataRange = key;
				}
			}
		}

		function onGetComercialization(response) {
			this[42] = response.data;
		}

		function onoGetComplexity(response) {
			this[82] = response.data;
		}

		function onGetCurrencies(response) {
			this[11] = response.data;
		}

		function onGetCustomers(response) {
			this[17] = response.data;
		}

		function onGetDetail(response) {
			this.details = response.data;

			detailBlotterNotesService
			.getStatus({ id: response.data.datos[39].nuCatalogo })
			.then(onGetStatus.bind(this));

			// Si es Pipeline, entrar directo a la edición
			if (this.tipo === '2') {
				this.request.datos = angular.copy(this.details.datos);
				this.request.activos = angular.copy(this.details.activos);
				this.request.franquicias = angular.copy(this.details.franquicias);
				this.request.vendedor = angular.copy(this.details.vendedor);

				this.edit = true;
				this.iconPipeline = false;
			} else {
				this.iconPipeline = true;
			}
		}

		function onGetDocTS(response) {
			if(response.data.nuDocumento === 53){
				this.docts = response.data;
			}

			if(response.data.nuDocumento === 51){
				this.DocFacXml = response.data;
				this.DocFacXml.flag = true;
			}
			if(response.data.nuDocumento === 52){
				this.DocFacPdf = response.data;
				this.DocFacPdf.flag = true;
			}

			if(this.DocFacXml && this.DocFacPdf && this.DocFacXml.flag && this.DocFacPdf.flag){
				this.successUpload = true;
			}
		}

		function onGetHistoricalStatus(response){
			this.historico = response.data;
		}

		function onGetIconsBPP(response) {
			this[86] = response.data;
		}

		function onGetLiquidationCurrency(response){
			this[63] = response.data;
		}

		function onGetPayoffDocs(response){
			this[69] = response.data;
		}

		function onGetPayoffNew(response){
			this[44] = response.data;
		}

		function onGetReference(response){
			this[32] = response.data;
		}

		function onGetReferenceIndice(response){
			this[95] = response.data;
		}

		function onGetReview(response){
			this.review = response.data;
		}

		function onGetSalesArea(response){
			this[18] = response.data;
		}

		function onGetSalesGroup(response){
			this[40] = response.data;
		}

		function onGetSections(response) {
			this.sections = response.data;
		}

		function onGetStatus(response) {
			this[39] = response.data;
		}

		function onGetSubyacentes(response){
			this[14] = response.data;
		}

		function onGetVehicles(response){
			this[19] = response.data;
		}

		function onPaymentOrder() {
			this.successUpload = true;
			this.activeBill = 'Comprobante';
		}

		function onStatusModal() {

			if(this.details.datos[39].nuCatalogo !== this.request.datos[39].nuCatalogo){
				this.openModalStatus = true;
			}else{
				this.openModalStatus = false;
			}

			this.textCatalogStatus = this.request.datos[39].txCatalogo;

			switch (this.textCatalogStatus) {
				case 'Amortizado':
				this.nameButtonStatus = 'Amortizar';
				break;
				case 'Cancelado':
				this.nameButtonStatus = 'Cancelar';
				break;
				case 'Switcheado':
				this.nameButtonStatus = 'Switchear';
				break;
				case 'Vencido':
				this.nameButtonStatus = 'Vencer';
				break;
				default:
				this.nameButtonStatus = 'Guardar';
				break;
			}
		}

		function onSubmitEmission() {
			if ($routeParams.tipo === '2') {
				$location.path('/blotter-notas-estructuradas/consulta');
			} else {
				$route.reload();
			}
		}

		function onSubmitClone(resp){
			if(resp.data.id){
				$location.path('/blotter-notas-estructuradas/detalle-emision/1/' + resp.data.id);
			}
		}

		// Tab
		this.activeBill = 'Facturas';
		this.activeDoc = 'NEW';
		this.activeTab = 'NEGOCIACI\u00d3N';

		// Modal Clone
		this.activeClone = 'Fechas';
		this.activeStep = 0;
		this.nextStep = 1;
		this.checkHide = true;

		// Vista Review Modal
		this.currentFrame = 0;

		this.checkboxModel = {
			cal : true
		};

		// Clonar calendarios
		this.cloneCal = function cloneCal(item) {
			if (!item) {
				this.clone.estrategiaOriginal.calendario = 0;
			} else {
				this.clone.estrategiaOriginal.calendario = 1;
			}
		};

		// Empty field to clone
		this.emptyClone = function emptyClone(id, status, tipo) {
			if (!status) {
				if (tipo === "SELECT") {
					this.clone.datos[id] = undefined;
				} else {
					this.clone.datos[id] = null;
				}
			} else {
				this.clone.datos[id] = this.details.datos[id];
			}
		};

		// Mixed fields cloned
		this.mixed = function mixed(id, status){
			if(status){
				for(var i = 0; i < this.clone.encabezados.length; i++) {
					// Activo de referencia => subyacente
					if(id === 32){
						if(this.clone.encabezados[i].id === 14){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 32){
							this.clone.encabezados[i].clone = false;
						}
					}
					//Payoff => subyacente
					if(id === 44){
						if(this.clone.encabezados[i].id === 14){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 44){
							this.clone.encabezados[i].clone = false;
						}
					}
					//subyacente => Payoff => Activo de referencia
					if(id === 14){
						if(this.clone.encabezados[i].id === 14){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 32){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 44){
							this.clone.encabezados[i].clone = false;
						}
					}
					//Area  => grupo => cliente
					if((id === 17) || (id === 18) || id === 40){
						if(this.clone.encabezados[i].id === 17){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 18){
							this.clone.encabezados[i].clone = false;
						}
						if(this.clone.encabezados[i].id === 40){
							this.clone.encabezados[i].clone = false;
						}
					}
				}
			}else{
				for(var e = 0; e < this.clone.encabezados.length; e++) {
					//subyacente <= Payoff <= Activo de referencia
					if(id === 14){
						if(this.clone.encabezados[e].id === 14){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 32){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 44){
							this.clone.encabezados[e].clone = true;
						}
					}
					// Activo de referencia => subyacente
					if(id === 32){
						if(this.clone.encabezados[e].id === 14){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 32){
							this.clone.encabezados[e].clone = true;
						}
					}
					//Payoff => subyacente
					if(id === 44){
						if(this.clone.encabezados[e].id === 14){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 44){
							this.clone.encabezados[e].clone = true;
						}
					}
					//Area <= grupo <= cliente
					if((id === 17) || (id === 18) || id === 40){
						if(this.clone.encabezados[e].id === 17){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 18){
							this.clone.encabezados[e].clone = true;
						}
						if(this.clone.encabezados[e].id === 40){
							this.clone.encabezados[e].clone = true;
						}
					}
				}
			}
		};

		// Clone Deal Default
		this.cloneDefault =  function cloneDefault(objt) {
			objt.estrategiaOriginal = {};
			objt.estrategiaOriginal.calendario = 0;

			objt.datos[2] = "";
			objt.datos[3] = "";
			objt.datos[4] = "";
			objt.datos[10] = null;
			objt.datos[13] = null;
			objt.datos[14] = undefined;
			objt.datos[17] = undefined;
			objt.datos[18] = undefined;
			objt.datos[20] = 0;
			objt.datos[21] = 0;
			objt.datos[23] = "";
			objt.datos[29] = 100;
			objt.datos[40] = undefined;
			objt.datos[42] = undefined;
			objt.datos[43] = 0;
			objt.datos[44] = undefined;
			objt.datos[53] = "";
			objt.datos[63] = undefined;

			for(var i = 0; i < objt.encabezados.length; i++) {
				if (objt.encabezados[i].id === 10 || objt.encabezados[i].id === 13 ||
					objt.encabezados[i].id === 14 || objt.encabezados[i].id === 17 ||
					objt.encabezados[i].id === 18 || objt.encabezados[i].id === 23 ||
					objt.encabezados[i].id === 29 || objt.encabezados[i].id === 40 ||
					objt.encabezados[i].id === 42 || objt.encabezados[i].id === 44 ||
					objt.encabezados[i].id === 63) {
						objt.encabezados[i].clone = true;
					}
				}
			};

			// Eliminar emisi+on
			this.deleteEmissionDetail = function deleteEmissionDetail() {
				detailBlotterNotesService
				.deleteDetail({ params: { id: this.id , nuPermisoUsuario: this.nuPermisoUsuario} })
				.then(onDeleteEmission);
			};

			// Select Estatus
			this.estatusEmission = function estatusEmission(id) {
				detailBlotterNotesService
				.getStatus({ id: id })
				.then(onStatusModal.bind(this));
			};

			// Generar orden de pago
			this.generatePayment = function generatePayment() {
				this.file.categoria = "51-52";
				this.file.cdPermisoUsuario = this.cdPermisoUsuario;
				this.file.cdUsuario = this.usuario;
				this.file.id = this.id;
				this.file.nuPermisoUsuario = this.nuPermisoUsuario;

				detailBlotterNotesService
				.uploadRecord(this.file)
				.then(onPaymentOrder.bind(this));
				$timeout($route.reload, 700);
			};

			// Generar comprobante de pago
			this.generateReceipt = function generateReceipt() {
				if(this.arch.xls) {
					this.arch.categoria = 54;
					this.arch.cdPermisoUsuario = this.cdPermisoUsuario;
					this.arch.cdUsuario = this.usuario;
					this.arch.id = this.id;
					this.arch.nuPermisoUsuario = this.nuPermisoUsuario;

					detailBlotterNotesService
					.uploadRecord(this.arch)
					.then(this.receiptPayment.success.bind(this.receiptPayment));
					$timeout($route.reload, 700);
				}
			};

			// Histórico estatus
			this.historicalStatusEmission = function historicalStatusEmission(id) {
				detailBlotterNotesService
				.getHistoricalStatus({ params: { idEstrategia: id } })
				.then(onGetHistoricalStatus.bind(this));
			};

			// Id
			this.id = $routeParams.id;

			// Modales Etiquetas Personalizadas
			this.modalMeta = {
				reviewDetail: {
					tag: 'blotter-notas-estructuradas'
				}
			};

			// Select Payoff News
			this.payoffSelected = function payoffSelected(id) {
				if (id >= 0) {
					detailBlotterNotesService
					.getPayoffDocs({ params: { id: id } })
					.then(onGetPayoffDocs.bind(this));
				}
			};


			//TODO Refactor Double
			this.referenceSelected = function referenceSelected() {
				$timeout((function constructor() {
					detailBlotterNotesService
					.getReference({ params: { id: this.request.datos[14].nuCatalogo } })
					.then(onGetReference.bind(this));
				}).bind(this));
			};


			// Variables for handle Sub calls
			var showedA = false;
			var showedB = false;
			var showedC = false;
			var showedD = false;

			//Sub calls
			this.subcalls = function subcalls(call) {
				// Payoff
				if (this.edit && call === 44 && !showedA) {

					detailBlotterNotesService
					.getPayoffNew({params: {id: this.request.datos[14].nuCatalogo}})
					.then(onGetPayoffNew.bind(this));

					$timeout((function constructor() {
						this.request.datos[44] = this.details.datos[44];
						showedA = true;
						showedB = false;
					}).bind(this), 400);
				}
				//Payoff DOCS
				else if (this.edit && call === 69 && !showedB) {
					detailBlotterNotesService
					.getPayoffDocs({params: {id: this.request.datos[44].nuCatalogo}})
					.then(onGetPayoffDocs.bind(this));

					$timeout((function constructor() {
						this.request.datos[69] = this.details.datos[69];
						showedB = true;
						showedA = false;
					}).bind(this), 400);
				}
				// Grupo Ventas
				else if (this.edit && call === 40 && !showedC) {
					detailBlotterNotesService
					.getSalesGroup({params: {id: this.request.datos[18].nuCatalogo}})
					.then(onGetSalesGroup.bind(this));

					$timeout((function constructor() {
						this.request.datos[40] = this.details.datos[40];
						showedC = true;
						showedD = false;
					}).bind(this), 400);
				}
				//Cliente
				else if (this.edit && call === 17 && !showedD) {
					detailBlotterNotesService
					.getCustomers({params: {id: this.request.datos[40].nuCatalogo}})
					.then(onGetCustomers.bind(this));

					$timeout((function constructor() {
						this.request.datos[17] = this.details.datos[17];
						showedD = true;
						showedC = false;
					}).bind(this), 400);
				}
			};

			this.referenceSelected = function referenceSelected(id) {
				$timeout((function constructor() {
					detailBlotterNotesService
					.getReference({ params: { id: this.request.datos[14].nuCatalogo } })
					.then(onGetReference.bind(this));
				}).bind(this));
			};

			//Refresh Selected
			this.refreshSelected = function refreshSelected(){
				if(this.edit){
					this.salesAreaSelected(this.request.datos[18].nuCatalogo);
				}
			};

			this.referenceCloneSelected = function referenceCloneSelected() {
				$timeout((function constructor() {
					detailBlotterNotesService
					.getReference({ params: { id: this.clone.datos[14].nuCatalogo } })
					.then(onGetReference.bind(this));
				}).bind(this));
			};

			//  Desactiva boton Comp Pago
			this.deactButton = function deactButton(){
				$('#comprobanteBtn').attr('disabled', function(index, attr){
					return attr === 'disabled' ? null : 'disabled';
				});
			};

			// Resumen
			this.reviewEmission = function reviewEmission(estrategia, area) {
				this.reviewDetail.open();

				detailBlotterNotesService
				.getReview({ estrategia: estrategia, area: area  })
				.then(onGetReview.bind(this));
			};

			// Select Área Ventas
			this.salesAreaSelected = function salesAreaSelected(id) {
				if (id >= 0) {
					detailBlotterNotesService
					.getSalesGroup({ params: { id: id } })
					.then(onGetSalesGroup.bind(this));
				}
			};

			// Select Área Grupos
			this.salesGroupSelected = function salesGroupSelected(id) {
				if (id >= 0) {
					detailBlotterNotesService
					.getCustomers({ params: { id: id } })
					.then(onGetCustomers.bind(this));
				}
			};

			// Steps Wizard (2 paso)
			this.stepActive = function stepActive(step) {
				this.activeStep = step;
			};

			this.stepWizard = function stepWizard(step) {
				this.nextStep = step;
			};

			// Sube Calendario
			this.submitCalendar = function submitCalendar(){
				if(this.cal){
					this.cal.categoria = 'calendarioEvento';
					this.cal.cdPermisoUsuario = this.cdPermisoUsuario;
					this.cal.cdUsuario = this.usuario;
					this.cal.id = this.id;
					this.cal.nuPermisoUsuario = this.nuPermisoUsuario;

					detailBlotterNotesService
					.uploadRecord(this.cal);
					$timeout($route.reload, 1500);
					detailBlotterNotesService
					.getCalendars({ params : { id: this.id } })
					.then(onGetCalendars.bind(this));
				}
			};

			// Submit clone Deal
			this.submitClone = function submitClone(){
				this.clone.usuario = this.usuario;
				this.clone.tipo = 2;

				detailBlotterNotesService
				.saveDeal(this.clone)
				.then(onSubmitClone);
			};

			// Enviar actualización
			this.submitEmission = function submitEmission() {
				this.request.accion = 2;
				this.request.cdPermisoUsuario = this.cdPermisoUsuario;
				this.request.nuPermisoUsuario = this.nuPermisoUsuario;
				this.request.tipo = this.tipo;
				this.request.usuario = this.usuario;

				// Se elimina estatus si no se cierra Deal
				if (!this.closeDeal) {
					delete this.request.estatus;
				}

				// Carga de TS
				if(this.ts){
					this.ts.categoria = 53;
					this.ts.cdPermisoUsuario = this.cdPermisoUsuario;
					this.ts.id = this.id;
					this.ts.nuPermisoUsuario = this.nuPermisoUsuario;
					this.ts.cdUsuario = this.usuario;

					detailBlotterNotesService
					.uploadRecord(this.ts)
					.then(onSubmitEmission);
				}

				if (this.openModalStatus) {
					this.changeStatus.open();

					// Si se entro al modal de historico
					if (this.estatus) {
						this.estatus.cdPermisoUsuario = this.cdPermisoUsuario;
						this.estatus.cdUsuario = this.usuario;
						this.estatus.dtCambioEstatus = '';
						this.estatus.nuEstatusFinal = this.request.datos[39].nuCatalogo;
						this.estatus.nuEstrategia = this.request.datos[1];
						this.estatus.nuPermisoUsuario = this.nuPermisoUsuario;

						detailBlotterNotesService
						.saveHistoricalStatus(this.estatus)
						.then(onSubmitEmission);

						detailBlotterNotesService
						.editDeal(this.request)
						.then(onSubmitEmission);
					}
				} else {
					detailBlotterNotesService
					.editDeal(this.request)
					.then(onSubmitEmission);
				}
			};

			// Sube Franquicia
			this.submitFranch = function submitFranch(){
				if(this.franchis){
					this.franchis.categoria = 'franquicia';
					this.franchis.cdPermisoUsuario = this.cdPermisoUsuario;
					this.franchis.cdUsuario = this.usuario;
					this.franchis.nuPermisoUsuario = this.nuPermisoUsuario;
					this.franchis.id = this.id;

					detailBlotterNotesService
					.uploadRecord(this.franchis)
					.then(onGetDetail.bind(this));

					$route.reload();
				}
			};

			// Select Subyacente
			this.subyacenteSelected = function subyacenteSelected(id) {
				if (id >= 0) {
					detailBlotterNotesService
					.getPayoffNew({ params: { id: id } })
					.then(onGetPayoffNew.bind(this));
				}
			};

			// Semaforo Validacion
			this.successUpload = false;

			// Blotter o Payoff
			this.tipo = $routeParams.tipo;

			// Usuario
			this.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.usuario = $cookies.get('cdUser');

			// Servicios
			detailBlotterNotesService
			.getAvailableDocs({ params : { id: this.id } })
			.then(onGetAvailableDocs.bind(this));
			detailBlotterNotesService
			.getBusiness()
			.then(onGetBusiness.bind(this));
			detailBlotterNotesService
			.getCalendars({ params : { id: this.id } })
			.then(onGetCalendars.bind(this));
			detailBlotterNotesService
			.getComercialization()
			.then(onGetComercialization.bind(this));
			detailBlotterNotesService // Complejidad
			.getComplexity()
			.then(onoGetComplexity.bind(this));
			detailBlotterNotesService
			.getCurrencies()
			.then(onGetCurrencies.bind(this));
			detailBlotterNotesService
			.getDetail({ params : { tipo: this.tipo, id: this.id, usuario: this.usuario } })
			.then(onGetDetail.bind(this));
			detailBlotterNotesService
			.getDocumentTs({ params : { id: this.id, idDocumento: 51 } })
			.then(onGetDocTS.bind(this));
			detailBlotterNotesService
			.getDocumentTs({ params : { id: this.id, idDocumento: 52 } })
			.then(onGetDocTS.bind(this));
			detailBlotterNotesService
			.getDocumentTs({ params : { id: this.id, idDocumento: 53 } })
			.then(onGetDocTS.bind(this));
			detailBlotterNotesService
			.getIconsBPP()
			.then(onGetIconsBPP.bind(this));
			detailBlotterNotesService
			.getLiquidationCurrency()
			.then(onGetLiquidationCurrency.bind(this));
			detailBlotterNotesService
			.getSalesArea({ params: { usuario: this.usuario } })
			.then(onGetSalesArea.bind(this));
			detailBlotterNotesService
			.getSections()
			.then(onGetSections.bind(this));
			detailBlotterNotesService
			.getSubyacentes({ params: { usuario: this.usuario } })
			.then(onGetSubyacentes.bind(this));
			detailBlotterNotesService
			.getVehicles()
			.then(onGetVehicles.bind(this));
			detailBlotterNotesService
			.getReference({ params: { id: 3 } })
			.then(onGetReferenceIndice.bind(this));
		}

		DetailBlotterNotesController.prototype = {
			sumMap: function sumMap(map) { // Suma de franquicias
				if(this.edit) {
					var total = 0;

					for (var key in map) {
						total += map[key];
					}

					return total;
				}
			}
		};

	})();
