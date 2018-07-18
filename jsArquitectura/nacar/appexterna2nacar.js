  //Variables para la comunicación con el servidorWebLocal
  var puertoSWL = null;
  var ipSWL = null;
  var clave_seguridadSWL = null;
  var escritorioSWL = null;
  
  // Variables adicionales obtenidas del portal
  var nombreFramePortalCD = null;
  var urlTopPortalCd = null;


  /**
   * Devuelve true si estamos ejecutandonos en el portal
   */  
  function ejecucionEnPortal(){
    //Se comprueba que se haya informado el Servidor Web Local 
    if(puertoSWL != null && puertoSWL != undefined){
      return false;
    }
    return true;
  }


////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES DE COMUNICACIÓN RPC              /////////////////////////
////////////////////////////////////////////////////////////////////////////////
  /*
  * Inicia la conexion de la ventana contenedora con el portal
  */
  function inicializaRPCHijo2Padre(urlPadre){	
   	gadgets.rpc.setupReceiver('..',urlPadre);
  }
   /*
   * Indica al portal que inicia su conexion con la ventana contenedora
   */ 
  function inicializarConexionPadre2Hijo(id, url){
    gadgets.rpc.call(null,'inicializarConexionPadre2Hijo',null, id, url);
  }

////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES DE INICIALIZACIÓN               //////////////////////////
////////////////////////////////////////////////////////////////////////////////


  /**
   * Inicializa las conexiones bien a pesados o al Portal 
   */  
  function inicializarAppExterna2NACAR(){
    //Se inicializan las variables de pesados
    inicializarComunicacionSWL();
    //En caso de no estar en pesados, sino en el Portal, se inicializan las variables del portal
    if(ejecucionEnPortal()){
      inicializarConexionesPadreCrossDomain();
    }		
  }

  /**
   * Se inicializan las variables para la comunicación con el servidorWebLocal	
  */	 
  function inicializarComunicacionSWL(){
  	  
    //Puerto
    var href = document.location.href.toLowerCase();
    var idx = href.indexOf("puerto=");
    if (idx>=0) {
     	//buscamos siguiente &
     	var fin=href.indexOf("&",idx);
     	if (fin<0) {
     		fin=href.length;
     	}
     	value=href.substring(idx+"puerto=".length,fin);
     	puertoSWL=value;
    }
      
    //IP del Servidor Web Local
    var idx = href.indexOf("ip=")
    if (idx>=0) {
     	//buscamos siguiente &
     	var fin=href.indexOf("&",idx);
     	if (fin<0) {
     		fin=href.length;
     	}
     	value=href.substring(idx+"ip=".length,fin);
     	ipSWL=value;
    }
      
    //Clave de seguridad
    var idx = href.indexOf("clave_seguridad=")
    if (idx>=0) {
     	//buscamos siguiente &
     	var fin=href.indexOf("&",idx);
     	if (fin<0) {
     		fin=href.length;
     	}
     	value=href.substring(idx+"clave_seguridad=".length,fin);
     	clave_seguridadSWL=value;	
    }
      
    //Si es escritorio pesado o ligero
    var idx = href.indexOf("escritorio=")
    if (idx>=0) {
    	//buscamos siguiente &
     	var fin=href.indexOf("&",idx);
     	if (fin<0) {
     		fin=href.length;
     	}
     	value=href.substring(idx+"escritorio=".length,fin);
     	escritorioSWL=value;
    }
    
    try{
    
    
	    if ((puertoSWL==null || puertoSWL=="") && 
	    	typeof(contextoJS.getTecnicosArq().getOrigen().getModo())!="undefined" &&
	    	contextoJS.getTecnicosArq().getOrigen().getOrigen()!=null &&
	    	contextoJS.getTecnicosArq().getOrigen().getOrigen()=="ajax")
	    {

	        clave_seguridadSWL = contextoJS.getTecnicosArq().getOrigen().getClave();
	        urlservidor = contextoJS.getTecnicosArq().getOrigen().getUrl();
	        ipSWL = urlservidor.substring(0,urlservidor.indexOf(":"));
	        puertoSWL = urlservidor.substring(urlservidor.indexOf(":")+1,urlservidor.length);
			if(puertoSWL.indexOf("/")!=-1)
		        puertoSWL = puertoSWL.substring(0,puertoSWL.indexOf("/"));
	        escritorioSWL = "pesado";
	   	 }
    }catch (e) {
		// TODO: handle exception
	}
    
  }




  /**
   *  Recupera los parámetros del elemento parametrosPortalCD
   */    
  function recuperaParametrosPortalCD(){
  //Si es escritorio pesado o ligero
      var valor="";
      var idx = document.location.href.indexOf("parametrosPortalCD=")
      if (idx>=0) {
      	//buscamos siguiente &
      	var fin=document.location.href.indexOf("&",idx);
      	if (fin<0) {
      		fin=document.location.href.length;
      	}
      	valor=document.location.href.substring(idx+"parametrosPortalCD=".length,fin);
      }
    return valor;    
  }


  /*
  * Recupera los datos enviados por el portal y los almacena
  */
  function inicializarCtesPortalCD(){            
    var parametros = null;
    //var cadenaParametros = document.forms[0].parametrosPortalCD.value;/
    var cadenaParametros = recuperaParametrosPortalCD();
    try{
	    if(cadenaParametros != undefined && cadenaParametros != null && cadenaParametros != "null" && cadenaParametros!=""){
	      cadenaParametros = cadenaParametros.replace(/'/g, '\"'); 
	      cadenaParametros = cadenaParametros.replace(/%27/g, '\"'); 
	      parametros = JSON.parse(cadenaParametros);
	      nombreFramePortalCD = parametros[0];
		  urlTopPortalCd = parametros[1];   
		}
	
	   
	    if ((nombreFramePortalCD==null || nombreFramePortalCD=="")  && 
		    typeof(contextoJS.getTecnicosArq().getOrigen().getModo())!="undefined" &&
		    contextoJS.getTecnicosArq().getOrigen().getOrigen()!=null &&
		    contextoJS.getTecnicosArq().getOrigen().getOrigen()=="rpc")
		    {
	    		nombreFramePortalCD = contextoJS.getTecnicosArq().getOrigen().getID();
	    		urlTopPortalCd = contextoJS.getTecnicosArq().getOrigen().getUrl();
		   	 }
    }catch (e) {
		// TODO: handle exception
	}
    //Se almacena el nombre del frame como name de la ventana
    if(window.name == ""){
      window.name = nombreFramePortalCD;
    }
  }


  /**
  * Inicializa las conexiones rpc entre la ventana contenedora y el portal
  */ 
  function inicializarConexionesPadreCrossDomain(){
  
    // Recupera las constantes enviadas por el portal
    inicializarCtesPortalCD();

    // Inicia la comunicacion de la ventana contenedora con el portal
    inicializaRPCHijo2Padre(urlTopPortalCd);

    // Inicia la comunicación del portal con la ventana hija.
    inicializarConexionPadre2Hijo(nombreFramePortalCD, location.href);
    
    // Registra las funciones que se llamarán desde el portal
    registrarFuncionesCallback();
    
  }


////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES INTERNAS                  ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  /* 
   * Activa el escenario pasado por parámetro
   */
  function appExterna2Pesados_activarEscenario(codEscenario){
    //parámetros -> opNACAR, parametros, escenario, tipoEjecucion,descripcion,puerto,entorno,parametrosAdicionales,servlet,ip,claveseguridad
   	appExterna2NACAR_ejecutarOperacionNACAREscenario(null,null,codEscenario,null,null,puertoSWL,escritorioSWL,null,null,ipSWL,clave_seguridadSWL,appExterna2NACAR_respuestaResultadoCambioEscenario);
  }
  
  /* 
   * Ejecuta la operación pasada por parámetro
   */
  function appExterna2Pesados_ejecutarOperacion(codOperacion,parametros,codEscenario,descripcion){
    //parámetros -> opNACAR, parametros, escenario, tipoEjecucion,descripcion,puerto,entorno,parametrosAdicionales,servlet,ip,claveseguridad
    appExterna2NACAR_ejecutarOperacionNACAREscenario(codOperacion,parametros,codEscenario,null,descripcion,puertoSWL,escritorioSWL,null,null,ipSWL,clave_seguridadSWL,appExterna2NACAR_respuestaResultadoOperacion)
  }
  /*
   *	Función que se encarga de enviar la petición AJAX para ejecutar una operación cuando se utiliza como medio de comunicacion el servidorWeb
   *  Parámetros -> opNACAR, parametros, escenario, tipoEjecucion,descripcion,puerto,entorno,parametrosAdicionales,servlet,ip,claveseguridad, funcionRespuesta
   */
  function appExterna2NACAR_ejecutarOperacionNACAREscenario(opNACAR, parametros, escenario, tipoEjecucion,descripcion,puerto,entorno,parametrosAdicionales,servlet,ip,claveseguridad, funcionRespuesta) {
      if(entorno == null || entorno =="" || entorno=="null")
      {
        entorno= "pesado";
      }
    	else
    	{
    		var	entorno = entorno.toLowerCase();
    	}	
  	
   		var archivoTXT="";
  		if(parametros != null && parametros!="null") 
  		{
  			archivoTXT += "&"+parametros;
  		}
  		if(escenario != null && escenario!="null") {
    				archivoTXT += "&escenario="+escenario;
  		}
  		if(tipoEjecucion != null && tipoEjecucion!="null") {
    				archivoTXT += "&tipoEjecucion="+tipoEjecucion;
  		}
  		if(descripcion != null && descripcion!="null") {
    				archivoTXT += "&descripcion="+descripcion;
  		}
  		if(opNACAR != null && opNACAR !="" && opNACAR!="null") {
  			
  			archivoTXT += "&operacion="+opNACAR;
  		}
  		if (claveseguridad!=null && claveseguridad!=undefined){
         			archivoTXT += "&claveseguridad="+claveseguridad;
  		}
  		archivoTXT ="cabecera=CTE_OPERACIONES_EJECUCION_OPERACION_CONTENEDOR"+archivoTXT;
  		var	url="";
  		if(ip!=null && ip!=undefined && ip!="null"){
  			url="http://"+ip+":"+puerto;
  		}else{
  			url="http://localhost:"+puerto;
  		}
  		var url_base=url+"/";
    	if ((servlet==null)||(servlet==undefined)){
  		  url_base+="comunicacion";
  		}else{
  		  url_base+=servlet;
  		}

  		//Llamada a la función que lanza la petición AJAX
  		ajaxAppExterna2NACAR_ejecutarPeticionAJAX(url_base,funcionRespuesta,"null","true",appExterna2NACAR_funcionError,archivoTXT);
    };
  
  
  /* 
   * Sube datos al objeto de negocio  
   */
  function appExterna2Pesados_subirObjetosNegocio(claves, valores){
    var resultado = "";
  
    var archivoTXT="&mensaje=";
  		// EL formato serà clave1=*=valor1*+*clave2=*=valor2 ...
  		var j=0;
  		for(var i=0;i<claves.length;i++) 
  		{
  			if (j>0)
  			{
  				archivoTXT = archivoTXT +"+*+";
  			}
  
  			archivoTXT = archivoTXT + claves[i] + "=*=" + valores[i];
  			j++;
  		}
  		
  		var url_base="";
  		if (clave_seguridadSWL!=null && clave_seguridadSWL!=undefined){
        archivoTXT+="&claveseguridad="+clave_seguridadSWL;
      }
      
  		// Usamos el conector de comunicaciones para transmitir la peticion
  		archivoTXT ="cabecera=CTE_SUBIDA_OBJETOS_NEGOCIO"+archivoTXT;
  		
  		var	url="";
  		if(ipSWL!=null && ipSWL!=undefined && ipSWL!="null"){
  			url="http://"+ipSWL+":"+puertoSWL;
  		}else{
  			url="http://localhost:"+puertoSWL;
  		}
  		
      url_base= url +"/comunicacion";
  		
      archivoTXT=archivoTXT.replace(/\+/g,"%2B");

      ajaxAppExterna2NACAR_ejecutarPeticionAJAX(url_base,appExterna2NACAR_respuestaSubirObjetosNegocio,null,true,appExterna2NACAR_funcionError,archivoTXT);
  		
    return resultado;
  }
  
  /* 
   * Funcion que captura la pulsacion de la tecla F5 y solicita la bajada de datos del objeto de negocio
   */
  function appExterna2Pesados_tratarF5(){
  	archivoTXT="";
  	archivoTXT ="cabecera=CTE_BAJADA_OBJETOS_NEGOCIO";
  	var url="";
  	if(ipSWL!=null && ipSWL!=undefined && ipSWL!="null"){
  		url="http://"+ipSWL+":"+puertoSWL;
  	}else{
  		url="http://localhost:"+puertoSWL;
  	}
  	var url_base=url+"/comunicacion";
  	if (clave_seguridadSWL!=null && clave_seguridadSWL!=undefined){
  		archivoTXT+="&claveseguridad="+clave_seguridadSWL;
  	}
  	
  	archivoTXT=archivoTXT.replace(/\+/g,"%2B");
  	
    ajaxAppExterna2NACAR_ejecutarPeticionAJAX(url_base,appExterna2NACAR_respuestaTratarF5,"null","true",appExterna2NACAR_funcionError,archivoTXT);
  				
  	return false;
  	
  }


  /**
   * Activar Escenario
   * Activa el escenario que se le pase por parámetro
   */  
  function atpn_gt_activarEscenarioRPCExterna(escenario){
    
    gadgets.rpc.call(null,'atpn_gt_activarEscenarioRPCPortalExterna',null,escenario);
  }

  /**
   *  Ejecutar una operación NACAR
   */ 
  function atpn_gt_crearTareaConDescripcionEscenarioRPCExterna(escenario,opNACAR, descripcion, cadenaParam, cadenaFuncion){
    gadgets.rpc.call(null,'atpn_gt_crearTareaConDescripcionEscenarioRPCPortalExterna',null,escenario,opNACAR, descripcion, cadenaParam, cadenaFuncion);
  }

  /**
   *  Subir datos al Objeto de Negocio
   */    
  function atpn_gt_subirObjetosNegocioRPCExterna(claves,valores){
    gadgets.rpc.call(null,'atpn_gt_subirObjetosNegocioRPCPortalExterna',null,claves,valores);

  }

  /**
   *  Obtener Datos objeto de Objeto de Negocio
   */   
  function atpn_gt_tratarF5RPCExterna(){
    gadgets.rpc.call(null,'atpn_gt_tratarF5RPCPortalExterna',null);

  }


  /**
   *  Obtener número de tareas abiertas
   *  portal.atpn_gt_get_numero_tareas_abiertas();   
   */    
  function atpn_gt_get_numero_tareas_abiertasRPCExterna(){
    gadgets.rpc.call(null,'atpn_gt_get_numero_tareas_abiertasRPCExterna',null);

  }

  /**
   *  Ejecutar tarea Objeto de Negocio
   *  portal.atpn_gt_ejecutarTareaObjetoNegocio(nombre_tarea,url,urlDesconexion,tipo_tarea,objCliente);   
   */    
  function atpn_gt_ejecutarTareaObjetoNegocioRPCExterna(nombre_tarea,url,urlDesconexion,tipo_tarea,objCliente){
    gadgets.rpc.call(null,'atpn_gt_ejecutarTareaObjetoNegocioRPCExterna',null,nombre_tarea,url,urlDesconexion,tipo_tarea,objCliente);

  }

  /**
   *  Activar Tarea
   *  portal.atpn_gt_activarTarea(idTarea,argumentos);   
   */    
  function atpn_gt_activarTareaRPCExterna(idTarea,argumentos){
    gadgets.rpc.call(null,'atpn_gt_activarTareaRPCExterna',null,idTarea,argumentos);

  }

  /**
   *  Modificar Descripción Aplicativa
   *  portal.atpn_gt_modificarDescripcionAplicativa(idTarea,descripcion,argumentos);   
   */    
  function atpn_gt_modificarDescripcionAplicativaRPCExterna(idTarea,descripcion,argumentos){
    gadgets.rpc.call(null,'atpn_gt_modificarDescripcionAplicativaRPCExterna',null,idTarea,descripcion,argumentos);

  }

  /**
   *  Obtener identificador de la tarea activa
   *  portal.atpn_gt_getIDTareaActiva(argumentos);   
   */    
  function atpn_gt_getIDTareaActivaRPCExterna(argumentos){
    gadgets.rpc.call(null,'atpn_gt_getIDTareaActivaRPCExterna',null,argumentos);

  }


////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES INTERFAZ                  ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

	/**
   * Activar Escenario
   * Activa el escenario que se le pase por parámetro
   */  
  function appExterna2NACAR_activarEscenario(codEscenario){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_activarEscenarioRPCExterna'
      atpn_gt_activarEscenarioRPCExterna(codEscenario);
    }
    else{
      appExterna2Pesados_activarEscenario(codEscenario);
    }
  }
  
  /**
   *  Ejecutar una operación NACAR
   */    
	function appExterna2NACAR_ejecutarOperacionEscenario(opNACAR,parametros,escenario,cadenaFuncion,descripcion){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_crearTareaConDescripcionEscenarioRPCExterna'
      atpn_gt_crearTareaConDescripcionEscenarioRPCExterna(escenario,opNACAR, descripcion, parametros, cadenaFuncion);
    }
    else{
      appExterna2Pesados_ejecutarOperacion(opNACAR,parametros,escenario,descripcion);
    }
  }
	
  /**
   *  Subir datos al Objeto de Negocio
   */ 
	function appExterna2NACAR_subirObjetosNegocio(claves,valores){
    var dev = null;
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_subirObjetosNegocioRPCExterna'
      atpn_gt_subirObjetosNegocioRPCExterna(claves,valores);
    }
    else{
      dev = appExterna2Pesados_subirObjetosNegocio(claves,valores);
    }
    return dev;
  }
  
	/**
   *  Obtener Datos objeto de Objeto de Negocio
   */ 
	function appExterna2NACAR_tratarF5(){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_tratarF5RPCExterna'
      atpn_gt_tratarF5RPCExterna();
    }
    else{
      appExterna2Pesados_tratarF5();    
    } 
  }
	
	
  /**
   *  Obtener número de tareas abiertas
   */    
  function appExterna2NACAR_getNumeroTareasAbiertas(){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_get_numero_tareas_abiertasRPCExterna'
      atpn_gt_get_numero_tareas_abiertasRPCExterna();
    }
  }

  /**
   *  Activar Tarea
   */    
  function appExterna2NACAR_activarTarea(idTarea,argumentos){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_activarTareaRPCExterna'
      atpn_gt_activarTareaRPCExterna(idTarea,argumentos);
    }
  }

  /**
   *  Modificar Descripción Aplicativa
   */    
  function appExterna2NACAR_modificarDescripcionAplicativa(idTarea,descripcion,argumentos){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_modificarDescripcionAplicativaRPCExterna'
      atpn_gt_modificarDescripcionAplicativaRPCExterna(idTarea,descripcion,argumentos);
    }
  }

  /**
   *  Obtener identificador de la tarea activa
   */    
  function appExterna2NACAR_getIDTareaActiva(argumentos){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_getIDTareaActivaRPCExterna'
      atpn_gt_getIDTareaActivaRPCExterna(argumentos);
    }
  }

	/**
   *  Ejecutar tarea Objeto de Negocio
   */    
  function appExterna2NACAR_ejecutarTareaObjetoNegocio(nombre_tarea,url,urlDesconexion,tipo_tarea,objCliente){
    if(ejecucionEnPortal()){
      //Invoca a la función del portal 'atpn_gt_ejecutarTareaObjetoNegocioRPCExterna'
      atpn_gt_ejecutarTareaObjetoNegocioRPCExterna(nombre_tarea,url,urlDesconexion,tipo_tarea,objCliente);
    }
  }

