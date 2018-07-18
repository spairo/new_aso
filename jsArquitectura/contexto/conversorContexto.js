//********************************* DEFINICION ESTRUCTURA OBJETOS JAVASCRIPT *********************************//


//******************************************************************************** OBJETO PPAL: CONTEXTO
function Contexto() {

	var tipoAutenticacion;
	this.getTipoautenticacion = function() {
		return this.tipoAutenticacion;
	};

	this.setTipoAutenticacion = function(tipoAutenticacion) {
		this.tipoAutenticacion = tipoAutenticacion;
	};

	var codigoCliente;
	this.getCodigoCliente = function() {
		return this.codigoCliente;
	};

	this.setCodigoCliente = function(codigoCliente) {
		this.codigoCliente = codigoCliente;
	};

	// OBJETO - VER function Puesto()
	var puesto;
	this.getPuesto = function() {
		return this.puesto;
	};

	this.setPuesto = function(puesto) {
		this.puesto = puesto;
	};

	// OBJETO - VER function Transaccion()
	var transacciones;
	this.getTransacciones = function() {
		return this.transacciones;
	};

	this.setTransacciones = function(transacciones) {
		this.transacciones = transacciones;
	};

	// OBJETO - VER function DatosTecnicos()
	var datosTecnicos;
	this.getDatosTecnicos = function() {
		return this.datosTecnicos;
	};
	this.setDatosTecnicos = function(datosTecnicos) {
		this.datosTecnicos = datosTecnicos;
	};
	
	// OBJETO - VER function TecnicosArq()
	var tecnicosArq;
	this.getTecnicosArq = function() {
		return this.tecnicosArq;
	};
	this.setTecnicosArq = function(tecnicosArq) {
		this.tecnicosArq = tecnicosArq;
	};


} // Fin objeto CONTEXTO


//**********************************************************PUESTO

function Puesto() {

	var info; // OBJETO - VER function info()
	this.getInfo = function() {
		return this.info;
	};
	this.setInfo = function(info) {
		this.info = info;
	};			

	var disp;// OBJETO - VER function disp()
	this.getDisp = function() {
		return this.disp;
	};
	this.setDisp = function(disp) {
		this.disp = disp;
	};			
	
	var puestoLogico;
	this.getPuestoLogico = function() {
		return this.puestoLogico;
	};
	this.setPuestoLogico = function(puestoLogico) {
		this.puestoLogico = puestoLogico;
	};
}
//************************************************************** PUESTO.INFO
function Info(){
	
	var bancoFisico;
	this.getBancoFisico = function() {
		return this.bancoFisico;
	};
	this.setBancoFisico = function(bancoFisico) {
		this.bancoFisico = bancoFisico;
	};
	
	var oficinaFisica;
	this.getOficinaFisica = function() {
		return this.oficinaFisica;
	};
	this.setOficinaFisica = function(oficinaFisica) {
		this.oficinaFisica = oficinaFisica;
	};
	
	var nombreOficina;
	this.getNombreOficina = function() {
		return this.nombreOficina;
	};
	this.setNombreOficina = function(nombreOficina) {
		this.nombreOficina = nombreOficina;
	};
	
	var puestoFisicoEscritorio;
	this.getPuestoFisicoEscritorio = function() {
		return this.puestoFisicoEscritorio;
	};
	this.setPuestoFisicoEscritorio = function(puestoFisicoEscritorio) {
		this.puestoFisicoEscritorio = puestoFisicoEscritorio;
	};
	
	var puestoLogicoEscritorio;
	this.getPuestoLogicoEscritorio = function() {
		return this.puestoLogicoEscritorio;
	};
	this.setPuestoLogicoEscritorio = function(puestoLogicoEscritorio) {
		this.puestoLogicoEscritorio = puestoLogicoEscritorio;
	};
	
	var controlador;
	this.getControlador = function() {
		return this.controlador;
	};
	this.setControlador = function(controlador) {
		this.controlador = controlador;
	};
	
	var ampliacionPuesto;
	this.getAmpliacionPuesto = function() {
		return this.ampliacionPuesto;
	};
	this.setAmpliacionPuesto = function(ampliacionPuesto) {
		this.ampliacionPuesto = ampliacionPuesto;
	};
	
	// TODO: CUIDADO, EN SU JSON LLEGA COMO 'idomaAlt', NO 'idiomaAlt'
	var idiomaAlt;
	this.getIdiomaAlt = function() {
		return this.idiomaAlt;
	};
	this.setIdiomaAlt = function(idiomaAlt) {
		this.idiomaAlt = idiomaAlt;
	};
	
	var estacionTrabajo;
	this.getEstacionTrabajo = function() {
		return this.estacionTrabajo;
	};
	this.setEstacionTrabajo = function(estacionTrabajo) {
		this.estacionTrabajo = estacionTrabajo;
	};
	
	var codVistaEscritorio;
	this.getCodVistaEscritorio = function() {
		return this.codVistaEscritorio;
	};
	this.setCodVistaEscritorio = function(codVistaEscritorio) {
		this.codVistaEscritorio = codVistaEscritorio;
	};
	
	var movilidad;
	this.getMovilidad = function() {
		return this.movilidad;
	};
	this.setMovilidad = function(movilidad) {
		this.movilidad = movilidad;
	};

}

//********************************************************** PUESTO.DISP
function Disp() {
	
	var dispEscaneo;
	this.getDispEscaneo = function() {
		return this.dispEscaneo;
	};
	this.setDispEscaneo = function(dispEscaneo) {
		this.dispEscaneo = dispEscaneo;
	};
	
	var dispFirmas;
	this.getDispFirmas = function() {
		return this.dispFirmas;
	};
	this.setDispFirmas = function(dispFirmas) {
		this.dispFirmas = dispFirmas;
	};
	
	var dispCheques;
	this.getDispCheques = function() {
		return this.dispCheques;
	};
	this.setDispCheques = function(dispCheques) {
		this.dispCheques = dispCheques;
	};
	
	var imagen;
	this.getImagen = function() {
		return this.imagen;
	};
	this.setImagen = function(imagen) {
		this.imagen = imagen;
	};
	
	var escaner;
	this.getEscaner = function() {
		return this.escaner;
	};
	this.setEscaner = function(escaner) {
		this.escaner = escaner;
	};
	
	var modoTransferencia;
	this.getModoTransferencia = function() {
		return this.modoTransferencia;
	};
	this.setModoTransferencia = function(modoTransferencia) {
		this.modoTransferencia = modoTransferencia;
	};
}									
	

//************************************************************ TECNICOSARQ
function TecnicosArq() {
	var edma;
	this.getEdma = function() {
		return this.edma;
	};
	this.setEdma = function(edma) {
		this.edma = edma;
	};
	var origen;
	this.getOrigen = function() {
		return this.origen;
	};
	this.setOrigen = function(origen) {
		this.origen = origen;
	};

}

//**************************************** TECNICOSARQ.EDMA
function Edma() {
	var codOperacion;
	this.getCodOperacion = function() {
		return this.codOperacion;
	};
	this.setCodOperacion = function(codOperacion) {
		this.codOperacion = codOperacion;
	};
	
	var UUID;
	this.getUUID = function() {
		return this.UUID;
	};
	this.setUUID = function(UUID) {
		this.UUID = UUID;
	};

}
//**************************************** TECNICOSARQ.ORIGEN
function Origen() {
	var url;
	this.getUrl = function() {
		return this.url;
	};
	this.setUrl = function(url) {
		this.url = url;
	};
	
	var clave;
	this.getClave = function() {
		return this.clave;
	};
	this.setClave = function(clave) {
		this.clave = clave;
	};
	
	var origen;
	this.getOrigen = function() {
		return this.origen;
	};
	this.setOrigen = function(origen) {
		this.origen = origen;
	};
	
	var modo;
	this.getModo = function() {
		return this.modo;
	};
	this.setModo = function(modo) {
		this.modo = modo;
	};
	
	var ID;
	this.getID = function() {
		return this.ID;
	};
	this.setID = function(ID) {
		this.ID = ID;
	};
	
	var urlEscritorio;
	this.getUrlEscritorio = function() {
		return this.urlEscritorio;
	};
	this.setUrlEscritorio = function(urlEscritorio) {
		this.urlEscritorio = urlEscritorio;
	};
	
	var IDEscritorio;
	this.getIDEscritorio = function() {
		return this.IDEscritorio;
	};
	this.setIDEscritorio = function(IDEscritorio) {
		this.IDEscritorio = IDEscritorio;
	};

}

//*********************************************TRANSACCIONES
function Transacciones() {
	
	//TODO: CANAL LAMANTE
	
	var canalLlamante;
	this.getCanalLlamante = function() {
		return this.canalLlamante;
	};
	this.setCanalLlamante = function(canalLlamante) {
		this.canalLlamante = canalLlamante;
	};
	
	var medioAcceso;
	this.getMedioAcceso = function() {
		return this.medioAcceso;
	};
	this.setMedioAcceso = function(medioAcceso) {
		this.medioAcceso = medioAcceso;
	};
	
	var servicioProducto;
	this.getServicioProducto = function() {
		return this.servicioProducto;
	};
	this.setServicioProducto = function(servicioProducto) {
		this.servicioProducto = servicioProducto;
	};
	
	var secuencia;
	this.getSecuencia = function() {
		return this.secuencia;
	};
	this.setSecuencia = function(secuencia) {
		this.secuencia = secuencia;
	};
	
	var banco;
	this.getBanco = function() {
		return this.banco;
	};
	this.setBanco = function(banco) {
		this.banco = banco;
	};
	
	var oficina;
	this.getOficina = function() {
		return this.oficina;
	};
	this.setOficina = function(oficina) {
		this.oficina = oficina;
	};
	
	var modoProceso;
	this.getModoProceso = function() {
		return this.modoProceso;
	};
	this.setModoProceso = function(modoProceso) {
		this.modoProceso = modoProceso;
	};
	
	var autorizacion;
	this.getAutorizacion = function() {
		return this.autorizacion;
	};
	this.setAutorizacion = function(autorizacion) {
		this.autorizacion = autorizacion;
	};
	
	var origenFisico;
	this.getOrigenFisico = function() {
		return this.origenFisico;
	};
	this.setOrigenFisico = function(origenFisico) {
		this.origenFisico = origenFisico;
	};

}

//****************************************************** DATOS TÉCNICOS
function DatosTecnicos() {
	var idContacto;
	this.getIdContacto = function() {
		return this.idContacto;
	};
	this.setIdContacto = function(idContacto) {
		this.idContacto = idContacto;
	};
	
	var idOperacion;
	this.getIdOperacion = function() {
		return this.idOperacion;
	};
	this.setIdOperacion = function(idOperacion) {
		this.idOperacion = idOperacion;
	};
	
	var idPeticion;
	this.getIdPeticion = function() {
		return this.idPeticion;
	};
	this.setIdPeticion = function(idPeticion) {
		this.idPeticion = idPeticion;
	};
	
	var UUAARemitente;
	this.getUUAARemitente = function() {
		return this.UUAARemitente;
	};
	this.setUUAARemitente = function(UUAARemitente) {
		this.UUAARemitente = UUAARemitente;
	};
	
	var usuarioLogico;
	this.getUsuarioLogico = function() {
		return this.usuarioLogico;
	};
	this.setUsuarioLogico = function(usuarioLogico) {
		this.usuarioLogico = usuarioLogico;
	};
	
/*	var cabecerasHttp;
	this.getCabecerasHttp = function() {
		return this.cabecerasHttp;
	};
	this.setCabecerasHttp = function(cabecerasHttp) {
		this.cabecerasHttp = cabecerasHttp;
	};*/
	
	var tipoIdentificacionCliente;
	this.getTipoIdentificacionCliente = function() {
		return this.tipoIdentificacionCliente;
	};
	this.setTipoIdentificacionCliente = function(tipoIdentificacionCliente) {
		this.tipoIdentificacionCliente = tipoIdentificacionCliente;
	};
	
	var identificacionCliente;
	this.getIdentificacionCliente = function() {
		return this.identificacionCliente;
	};
	this.setIdentificacionCliente = function(identificacionCliente) {
		this.identificacionCliente = identificacionCliente;
	};
}						

//******************************** FIN DEFINICION ESTRUCTURA OBJETOS JAVASCRIPT ***********************************//
	// SI DEJAMOS ESTO EN EL JS FALLA!!! POR ESO LO HE CAMBIADO A UNA FUNCION

	  
function mapeaContexto(ctxJS){
	    var contextoJS = new Contexto();
	 	    
	    
	    if(ctxJS.contexto.tipoAutenticacion){ contextoJS.setTipoAutenticacion(ctxJS.contexto.tipoAutenticacion);}
	    
	    if(ctxJS.contexto.codigoCliente){ contextoJS.setCodigoCliente(ctxJS.contexto.codigoCliente);}
	    
	    
	  //****************************************************************** PUESTO
	    if(ctxJS.contexto.puesto){
		    var pueJS = ctxJS.contexto.puesto;
		    
		    var puesto = new Puesto();
		    
		    if (pueJS.puestoLogico) {puesto.setPuestoLogico(pueJS.puestoLogico);}
		   
		    //************************************************************** PUESTO.INFO
		    if(pueJS.info){
		    	var infoJS = pueJS.info;
		    	
		    	var info = new Info();
		    	
		    	if (infoJS.ampliacionPuesto) {info.setAmpliacionPuesto(infoJS.ampliacionPuesto);}
		    	if (infoJS.bancoFisico) {info.setBancoFisico(infoJS.bancoFisico);}
		    	if (infoJS.codVistaEscritorio) {info.setCodVistaEscritorio(infoJS.codVistaEscritorio);}
		    	if (infoJS.controlador) {info.setControlador(infoJS.controlador);}
		    	if (infoJS.estacionTrabajo) {info.setEstacionTrabajo(infoJS.estacionTrabajo);}
		    	if (infoJS.idomaAlt) {info.setIdiomaAlt(infoJS.idomaAlt);}
		    	if (infoJS.movilidad) {info.setMovilidad(infoJS.movilidad);}
		    	if (infoJS.nombreOficina) {info.setNombreOficina(infoJS.nombreOficina);}
		    	if (infoJS.oficinaFisica) {info.setOficinaFisica(infoJS.oficinaFisica);}
		    	if (infoJS.puestoFisicoEscritorio) {info.setPuestoFisicoEscritorio(infoJS.puestoFisicoEscritorio);}
		    	if (infoJS.puestoLogicoEscritorio) {info.setPuestoLogicoEscritorio(infoJS.puestoLogicoEscritorio);}
		    	
		    	puesto.setInfo(info);

		    }
		    
		    //************************************************************** PUESTO.DISP
		    if(pueJS.disp){
		    	var dispJS = pueJS.disp;
		    	
		    	var disp = new Disp();
		    	
		    	if (dispJS.dispCheques) {disp.setDispCheques(dispJS.dispCheques);}
		    	if (dispJS.dispEscaneo) {disp.setDispEscaneo(dispJS.dispEscaneo);}
		    	if (dispJS.dispFirmas) {disp.setDispFirmas(dispJS.dispFirmas);}
		    	if (dispJS.escaner) {disp.setEscaner(dispJS.escaner);}
		    	if (dispJS.imagen) {disp.setImagen(dispJS.imagen);}
		    	if (dispJS.modoTransferencia) {disp.setModoTransferencia(dispJS.modoTransferencia);}
				
		    	puesto.setDisp(disp);
		    }
		    
		    contextoJS.setPuesto(puesto);
	    }
	    
	  //********************************************************************TRANSACCIONES
	    if( ctxJS.contexto.transacciones){
	    	var trxJS = ctxJS.contexto.transacciones;
	    	
	    	var transacciones = new Transacciones();
	    	
	    	if (trxJS.autorizacion) {transacciones.setAutorizacion(trxJS.autorizacion);}
	    	if (trxJS.banco) {transacciones.setBanco(trxJS.banco);}
	    	if (trxJS.canalLlamante) {transacciones.setCanalLlamante(trxJS.canalLlamante);}
	    	if (trxJS.medioAcceso) {transacciones.setMedioAcceso(trxJS.medioAcceso);}
	    	if (trxJS.modoProceso) {transacciones.setModoProceso(trxJS.modoProceso);}
	    	if (trxJS.oficina) {transacciones.setOficina(trxJS.oficina);}
	    	if (trxJS.origenFisico) {transacciones.setOrigenFisico(trxJS.origenFisico);}
	    	if (trxJS.secuencia) {transacciones.setSecuencia(trxJS.secuencia);}
	    	if (trxJS.servicioProducto) {transacciones.setServicioProducto(trxJS.servicioProducto);}
	    	
			contextoJS.setTransacciones(transacciones);
	    }
	    
	    //******************************************************************** DATOS TÉCNICOS
	    if( ctxJS.contexto.datosTecnicos){
		    var dtJS = ctxJS.contexto.datosTecnicos;
		    
		    var datosTecnicos = new DatosTecnicos();
		    
		    if (dtJS.idContacto) {datosTecnicos.setIdContacto(dtJS.idContacto);}
		    if (dtJS.identificacionCliente) {datosTecnicos.setIdentificacionCliente(dtJS.identificacionCliente);}
		    if (dtJS.idOperacion) {datosTecnicos.setIdOperacion(dtJS.idOperacion);}
		    if (dtJS.idPeticion) {datosTecnicos.setIdPeticion(dtJS.idPeticion);}
		    if (dtJS.tipoIdentificacionCliente) {datosTecnicos.setTipoIdentificacionCliente(dtJS.tipoIdentificacionCliente);}
		    if (dtJS.usuarioLogico) {datosTecnicos.setUsuarioLogico(dtJS.usuarioLogico);}
		    if (dtJS.UUAARemitente) {datosTecnicos.setUUAARemitente(dtJS.UUAARemitente);}
		   	
			contextoJS.setDatosTecnicos(datosTecnicos);
	    }
	 
	  //************************************************************ TECNICOSARQ
	    if( ctxJS.contexto.tecnicosArq){
	    	var tecArqJS = ctxJS.contexto.tecnicosArq;
	    	
	    	var tecnicosArq = new TecnicosArq();
	    	
	    	//****************************************************** TECNICOSARQ.EDMA
	    	if(tecArqJS.edma){
	    		var edmaJS =tecArqJS.edma;
	    		var edma = new Edma();
	    		if(edmaJS.codOperacion) {edma.setCodOperacion(edmaJS.codOperacion)};
	    		if(edmaJS.UUID) {edma.setUUID(edmaJS.UUID)};
	    		
	    		tecnicosArq.setEdma(edma);
	    	}
	    	
	    	
	    	//******************************************************* TECNICOSARQ.ORIGEN
	    	if(tecArqJS.origen){
	    		
	    		var origenJS =tecArqJS.origen;
	    		var origen = new Origen();
	    		
	    		if(origenJS.clave){	origen.setClave(origenJS.clave);}
	    		if(origenJS.origen){ origen.setOrigen(origenJS.origen);}
	    		if(origenJS.url){ origen.setUrl(origenJS.url);}
	    		if(origenJS.ID){ origen.setID(origenJS.ID);}
	    		if(origenJS.modo){ origen.setModo(origenJS.modo);}
	    		if(origenJS.urlEscritorio){origen.setUrlEscritorio(origenJS.urlEscritorio)};
	    		if(origenJS.IDEscritorio){origen.setIDEscritorio(origenJS.IDEscritorio)};
	    		
	    		tecnicosArq.setOrigen(origen);
	    	}
	    	
	    	
	    	contextoJS.setTecnicosArq(tecnicosArq);
	    }
	    
	    return contextoJS; 
}
