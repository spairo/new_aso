/**
 * Librería cliente de interacción con Escritorio v1.0
 *
 */
var comApp2Esc = comApp2Esc || {}; 
// Utilidades comunes
comApp2Esc.util = function(){
	
	var T_COMU_RPC = "rpc";
	var T_COMU_AJAX = "ajax";
	var COD_ERROR_DATOS_CONEXION="000000001";

	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var handlersCallback=[];
	var numfuncCallback=0;
	
	// Inicializa las variables globales
	function finicializarValores(){
		handlersCallback=[];
		numfuncCallback=0;
	}
	
	// Maneja las funciones de callback asociadas a la operación, es decir, se invoca a la función de callback asociada.
	function fcallbackHandler(parametros){
		try{
			fcallback = parametros["callback"];
			if (fcallback!=undefined && fcallback!=null && fcallback!="null" && fcallback!=""){
				for (i = 0; i<handlersCallback.length; i++){
					if (handlersCallback[i].name==fcallback && handlersCallback[i].func!=undefined && handlersCallback[i].func!=null && typeof handlersCallback[i].func =="function"){
						datosRetorno = ((typeof parametros["info"]) == 'string' && parametros["info"]!="") ? eval(' (' + parametros["info"] + ') ') : parametros["info"];	
						funcionRetorno = handlersCallback[i].func;
						setTimeout(function () {
							funcionRetorno(datosRetorno);
						},0);						
						handlersCallback.splice(i,1);
					}
				}
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			
		}
	}
	
	// Añade una nueva función de callback al manejador
	function fanadirCallback(parametros){

		fcallback = parametros["callback"];
		if (fcallback!=undefined && fcallback!=null && typeof(fcallback) === "function" ){
			nameCallback = numfuncCallback + "-" +fcallback.name;
			funcionCallback = {"name":nameCallback, "func":fcallback};
			handlersCallback.push(funcionCallback); 
			parametros["callback"] = nameCallback;
			numfuncCallback++;
		}
	}
	
	
	// Realiza el tratamiento del error, invocando a la función de error asociada por parámetro
	function ftratarError(parametros,mensaje){
		try{
			if (typeof(parametros["error"])!=="undefined" && parametros["error"]!=null && parametros["error"]!="null" && parametros["error"]!="" && typeof(parametros["error"])=== "function"){
				ferror=parametros["error"];
				var paramError={
					"mensaje" : mensaje
				};
				ferror(paramError);							
			}
		}catch (e) {

		}
	}
	
	
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		T_COMU_RPC: T_COMU_RPC,
		T_COMU_AJAX: T_COMU_AJAX,
		COD_ERROR_DATOS_CONEXION: COD_ERROR_DATOS_CONEXION,
	
		callbackHandler : function(parametros){
			fcallbackHandler(parametros);
				
		},
		anadirCallback: function(parametros){
			fanadirCallback(parametros);
		},
		tratarError: function(parametros,mensaje){
			ftratarError(parametros,mensaje);
		},
		inicializarValores: function(){
			finicializarValores();
		}
	};
	
}(); 


// Gestiona la comunicación con rpc
comApp2Esc.rpc = function(){
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var iniciadaComunicacion = false;
	var funcionespublicasEscritorio = ["finiciarcomunicacion",
					"flanzarOperacion",
					"fcerrarTarea",
					"fgetTipoOperaciones",
					"fgetDatosObjetoNegocio",
					"fsetDatosObjetoNegocio",
					"fgetDatosPaletaTelefonica",
					"fsetDatosPaletaTelefonica",
					"fgetOficinaOpPlus",
					"fgetIsOperacionPermitida",
					"fgetIsOperacionDefinida",
					"fgetIsPaletaTelefonicaActiva"];
	var funcionespublicasAplicacion = ["fcallbackhandlers", "fconfirmarconexion"];
	var fCallbackIniciarComunicacion = "";
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	// Inicializa la comunicación con el escritorio y establece las funciones receptoras de los mensajes del escritorio a la aplicación.
	function fconstructor(parametrosConexion, parametros){
		try{
			if (!iniciadaComunicacion){
				if (typeof(window.name)=="undefined" || window.name==""){
					window.name=parametrosConexion['iframeEscritorio'];
				}else{
					if(parametrosConexion['iframeEscritorio']!=window.name)
						parametrosConexion['iframeEscritorio']=window.name;
				}
				//Establece la recepcion de peticiones desde el Escritorio a la aplicación.
				gadgets.rpc.setupReceiver('..',parametrosConexion['urlEscritorio']);
				//Registra la función de manejo de callback
				gadgets.rpc.register(funcionespublicasAplicacion[0], comApp2Esc.rpc.callbackHandler);
				//Registra la función de confirmación de conexion con el Escritorio.
				gadgets.rpc.register(funcionespublicasAplicacion[1], fconfirmarConexion);
				//Se solicita al Escritorio que inicie la comunicación con la Aplicacion
				gadgets.rpc.call(null,funcionespublicasEscritorio[0],null, parametrosConexion);
				if (typeof(parametros) != undefined && parametros!=null && parametros!="")
					fCallbackIniciarComunicacion = parametros["callback"];
			}
		}catch (e) {			// Se propaga la excepción a la aplicación.
			throw e;
		}
	}
	
	
	// Obtiene la confirmación de que se ha establecido la comunicación con el escritorio.
	function fconfirmarConexion(){
		iniciadaComunicacion=true;
		if (typeof(fCallbackIniciarComunicacion) != undefined && fCallbackIniciarComunicacion!=null && fCallbackIniciarComunicacion!="" && typeof(fCallbackIniciarComunicacion)=== "function"){
				fCallbackIniciarComunicacion();
		}
	}

	// Añade una nueva función de callback al manejador
	function fanadirCallback(parametros){
		fcallback = parametros["callback"];
		
		var callback;
		if (fcallback==undefined || fcallback==null || typeof(fcallback) != "function" ){
			callback =app2esc.callbackLanzarOperacion; 
		}
		else {
			callback = fcallback;
		}
		parametros["callback"]=callback;
		comApp2Esc.util.anadirCallback(parametros);
	}
	
	// Realiza la petición al escritorio de ejecución de tarea.
	function flanzarOperacion(parametros){
		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				gadgets.rpc.call(null,funcionespublicasEscritorio[1],null, parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio de cierre de tarea.
	function fcerrarTarea(parametros){
		try{
			if (iniciadaComunicacion){
				gadgets.rpc.call(null,funcionespublicasEscritorio[2],null, parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para obtener el tipo de las operaciones informadas por parámetro
	function fgetTipoOperaciones(parametros,fretorno){
		try{
			if (iniciadaComunicacion){
				parametros["callback"]=function (value){
					try{
						var resultado="";
						if (typeof(value)!="undefined" && value!=null && value!="" && value!="null"){
							resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;						
						}
						fretorno(resultado);
					}catch(e){
						fretorno("");
					}
				};
				gadgets.rpc.register("fcallbackGetTipoOperaciones", fretorno);
				gadgets.rpc.call(null,funcionespublicasEscritorio[3],parametros["callback"],parametros);
			}else{
				//throw new Error("Comunicacion no inicializada");
				setTimeout(function () {
					resultado = '{"operaciones":['; 
					for (x in parametros.operaciones){
						resultado = resultado + '{"op":"'+parametros.operaciones[x].op+'","tipo":"1"}';
						if (x<(parametros.operaciones.length-1)){
							resultado = resultado +",";
						}
					}
					resultado = resultado + ']}';
					resultado = JSON.parse(resultado);
					fretorno(resultado);					
				},0);
				
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para obtener el tipo de oficina según el perfilado del usuario
	function fgetOficinaOpPlus(parametros,fretorno){
		try{
			if (iniciadaComunicacion){
				parametros["callback"]=function (value){
					try{
						var resultado="";
						if (typeof(value)!="undefined" && value!=null && value!="" && value!="null"){
							resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;						
						}
						fretorno(resultado);
					}catch(e){
						throw e;
					}
				};
				gadgets.rpc.register("fcallbackGetOficinaOpPlus", fretorno);
				gadgets.rpc.call(null,funcionespublicasEscritorio[8],parametros["callback"],parametros);
			}else{
				throw new Error("Comunicacion no inicializada");			
			}
		}catch (e) {
			throw e;
		}
	}
	// Realiza la petición al escritorio para comprobar si la operación está permitida
	function fgetIsOperacionPermitida(parametros,fretorno){
		try{
			if (iniciadaComunicacion){
				parametros["callback"]=function (value){
					try{
						var resultado="";
						if (typeof(value)!="undefined" && value!=null && value!="" && value!="null"){
							resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;						
						}
						fretorno(resultado);
					}catch(e){
						fretorno("");
					}
				};
				gadgets.rpc.register("fcallbackGetIsOperacionPermitida", fretorno);
				gadgets.rpc.call(null,funcionespublicasEscritorio[9],parametros["callback"],parametros);
			}else{
				//throw new Error("Comunicacion no inicializada");
				setTimeout(function () {
					resultado = '{"operaciones":['; 
					for (x in parametros.operaciones){
						resultado = resultado + '{"op":"'+parametros.operaciones[x].op+'","permitida":false}';
						if (x<(parametros.operaciones.length-1)){
							resultado = resultado +",";
						}
					}
					resultado = resultado + ']}';
					resultado = JSON.parse(resultado);
					fretorno(resultado);					
				},0);
				
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	// Realiza la petición al escritorio para comprobar si la operación está definida
	function fgetIsOperacionDefinida(parametros,fretorno){
		try{
			if (iniciadaComunicacion){
				parametros["callback"]=function (value){
					try{
						var resultado="";
						if (typeof(value)!="undefined" && value!=null && value!="" && value!="null"){
							resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;						
						}
						fretorno(resultado);
					}catch(e){
						fretorno("");
					}
				};
				gadgets.rpc.register("fcallbackGetIsOperacionDefinida", fretorno);
				gadgets.rpc.call(null,funcionespublicasEscritorio[10],parametros["callback"],parametros);
			}else{
				//throw new Error("Comunicacion no inicializada");
				setTimeout(function () {
					resultado = '{"operaciones":['; 
					for (x in parametros.operaciones){
						resultado = resultado + '{"op":"'+parametros.operaciones[x].op+'","definida":false}';
						if (x<(parametros.operaciones.length-1)){
							resultado = resultado +",";
						}
					}
					resultado = resultado + ']}';
					resultado = JSON.parse(resultado);
					fretorno(resultado);					
				},0);
				
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para obtener los datos del objeto de negocio
	function fgetDatosObjetoNegocio(parametros){
		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				gadgets.rpc.call(null,funcionespublicasEscritorio[4],null,parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para la subida de datos al objeto de negocio.
	function fsetDatosObjetoNegocio(parametros){
		try{
			if (iniciadaComunicacion){
				gadgets.rpc.call(null,funcionespublicasEscritorio[5],null, parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para obtener los datos de la paleta telefónica
	function fgetDatosPaletaTelefonica(parametros){
		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				gadgets.rpc.call(null,funcionespublicasEscritorio[6],null,parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para la subida de datos a la paleta telefónica
	function fsetDatosPaletaTelefonica(parametros){
		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				gadgets.rpc.call(null,funcionespublicasEscritorio[7],null, parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para obtener los datos de la paleta telefónica
	function fgetIsPaletaTelefonicaActiva(parametros){
		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				gadgets.rpc.call(null,funcionespublicasEscritorio[11],null,parametros);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
		
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
	
		
		/**
		 * Inicia los mecanismos de comunicación con el escritorio en ejecución.  
		 */
		iniciarComunicacion : function(parametrosConexion, parametros){
			try{
				fconstructor(parametrosConexion, parametros);
			}catch (e) {
				throw e;
			}
		},
	
		/**
		 * Realiza la petición de ejecución de operación sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		operacion: Obligatorio. Código de operación a ejecutar.
		 * 		descripcion: Descripción asociada a la tarea asociada a la operación.
		 * 		parametros: Parámetros de entrada de la operación.
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la petición.
		 *		error: Función de error aplicativa que se invocará ante un error en la ejecución de la operación.
		 */
		lanzarOperacion : function(parametros){
			try{
				flanzarOperacion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Realiza la petición de ejecución de operación sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		operacion: Obligatorio. Código de operación a ejecutar.
		 * 		descripcion: Descripción asociada a la tarea asociada a la operación.
		 * 		parametros: Parámetros de entrada de la operación.
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la petición.
		 *		error: Función de error aplicativa que se invocará ante un error en la ejecución de la operación.
		 */
		callbackHandler : function(parametros){
			try {
				comApp2Esc.util.callbackHandler(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		
		/**
		 * Realiza la notificación al escritorio para que realice el cierre de la tarea, permitiendo el retorno de datos a la tarea invocante.
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		fin: indicador de la finalización de la ejecución. Los posibles valores para este campo son: 
		*			- 0, si la ejecución ha sido correcta; 
		*			- 1, si la ejecución de la operación ha finalizado con error; 
		*			- 2, si la finalización se ha realizado pero no se puede considerar correcta (se correspondería con el evento de fin aviso NACAR).
		*		datos: estructura json con los datos de salida de la ejecución
		 */
		
		cerrarTarea : function(parametros){
			try{
				fcerrarTarea(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio el tipo de las operaciones informamdas por parámetro
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		*/
		getTipoOperaciones: function(parametros,fretorno){
			try{
				fgetTipoOperaciones(parametros, fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Pregunta al escritorio si las operaciones informadas están permitidas
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","permitida":"P"},{"op":"op2","permitida":"S"},...]}
		*/
		getIsOperacionPermitida: function(parametros,fretorno){
			try{
				fgetIsOperacionPermitida(parametros, fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Pregunta al escritorio si las operaciones informadas están definidas
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","definida":"P"},{"op":"op2","definida":"S"},...]}
		*/
		getIsOperacionDefinida: function(parametros,fretorno){
			try{
				fgetIsOperacionDefinida(parametros, fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio la obteción de los datos del objeto de negocio
		* @param parametros: 
		*/
		getDatosObjetoNegocio: function(parametros){
			try{
				fgetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}
		},

		/**
		 * Realiza la petición de subida de datos del objeto de negocio sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (JSON)
		 * parametros={"datos":[{"clave":"A","valor":"rojo"},{"clave":"B","valor":"verde"},{"clave":"C","valor":"azul"}]}
		 */
		setDatosObjetoNegocio : function(parametros){
			try{
				fsetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio la obteción de los datos de la paleta telefónica
		* @param parametros: 
		*/
		getDatosPaletaTelefonica: function(parametros){
			try{
				fgetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}
		},

		/**
		 * Realiza la petición de subida de datos de paleta telefónica sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (JSON).
		 * parametros={"datos":[{"clave":"A","valor":"rojo"},{"clave":"B","valor":"verde"},{"clave":"C","valor":"azul"}]}
		 */
		setDatosPaletaTelefonica : function(parametros){
			try{
				fsetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio el tipo de las operaciones informamdas por parámetro
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		*/
		getOficinaOpPlus: function(parametros,fretorno){
			try{
				fgetOficinaOpPlus(parametros, fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Pregunta al Escritorio si está activa la paleta telefónica
		* @param parametros: "callback":funciondecallback
		*/
		getIsPaletaTelefonicaActiva: function(parametros){
			try{
				fgetIsPaletaTelefonicaActiva(parametros);
			}catch (e) {
				throw e;
			}
		}
	};
}();


comApp2Esc.comu = comApp2Esc.comu || {};
comApp2Esc.comu.ajax = function(){

	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	// Realiza una invocación ajax según los parametros indicados.
	function fcall(parametrosAjax)
	{
		if (parametrosAjax!=undefined && parametrosAjax!=null){
			//Obtener el objeto AJAX
	     	var req=fgetHttpObject();
	      	
	     	try{
	     		var asinc = parametrosAjax['asincrono'];
	     		var url =parametrosAjax['url'];
	     		var datos = parametrosAjax['datos'];
	     		
	      		if(asinc==undefined || asinc==null){
					//Por defecto se considerará la petición como asíncrona
	      			asinc=true;
	     		}
	      		
	     		if (parametrosAjax['fcallback']==undefined || parametrosAjax['fcallback']==null || parametrosAjax['fcallback']==""){	
	     			// Si no se ha definido función de respuesta se considerará una petición sincrona.
	     			asinc=false;
	     		}
	     		if (asinc){
	     		    //Si la peticion es asíncrona se maneja el estado de la request.
	     			req.onreadystatechange=fgetReadyStateHandler(req,parametrosAjax);
	     		}
	          
				//Se abre la comunicación, y los datos se enviarán por POST
	     		req.open("POST",url,asinc);
		      	
	     		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	     		req.setRequestHeader("Pragma", "no-cache");
	     		req.setRequestHeader("Cache-Control", "no-cache");	
	          			      	
		     	var valores= datos+ "&hash="+Math.random();
		      	// Se realiza el envío por POST.
		     	req.send(valores);
		      	
		     	//Si la petición es sincrona se llama a la función de callback al finalizar la petición.
		     	if (!parametrosAjax['asincrono'] && parametrosAjax['fcallback']!=undefined && parametrosAjax['fcallback']!=null && parametrosAjax['fcallback']!=""){
		     		parametrosAjax['fcallback'](req.responseText);
		     	}// Si la petición es síncrona y no se ha informado función de callback se retorna la salida
		     	else if (!parametrosAjax['asincrono']){
		     		return req.responseText;
		     	}
			}catch (e){
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

		    }
		    
		}
		else {
			throw new Error("Parametros incorrectos");
		}
	}	
	
	
	// Genera el objeto HttpObject
	function fgetHttpObject() {

		var xmlhttp=false;

		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}

		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
		
	}
	
	//Función invocada para manejar el estado del servidor.
	function fgetReadyStateHandler(req,parametros){
			return function (){
			  //Si el estado de la petición es COMPLETO
				if (req.readyState == 4){
					//Se comprueba que se ha recibido una respuesta correcta para llamar a la función de callback
					if (req.status == 200){	
						
						if (parametros['fcallback']!= undefined && parametros['fcallback']!=null){
							parametros['fcallback'](req.responseText);
						}
						
					} else {
						if (parametros['ferror']!= undefined && parametros['ferror']!=null){
							if ((req.status==404)||(req.status==12029)){
								parametros['ferror']("");
							}else	if (req.responseText!=null && req.responseText!=""){
								parametros['ferror'](req.responseText);
							}
						}
					}			
					req.onreadystatechange=function(){}//null produce un error de tipos en explorer 6
					req.abort();
					req=null;
			   }
		  }
	}
	
return{
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
	/**
	 * Realiza una petición ajax según los parametros indicados
	 */
	call : function(parametros){
		try{
			return fcall(parametros);
		}catch (e) {
			throw e;
		}
	}

};

}(); 


comApp2Esc.ajax = function(){
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var iniciadaComunicacion = false;
	var MSJ_LANZAROPERACION = "CTE_EJECUCION_OPERACION";
	var MSJ_CERRARTAREA = "CTE_CERRAR_TAREA";
	var MSJ_OBTENERTIPOOPERACION = "CTE_OBTENER_TIPO_OPERACION"
	var MSJ_ESOPERACIONPERMITIDA = "CTE_ES_OPERACION_PERMITIDA"
	var MSJ_ESOPERACIONDEFINIDA = "CTE_ES_OPERACION_DEFINIDA"
	var MSJ_BAJADAOBJETONEGOCIO = "CTE_BAJADA_OBJETOS_NEGOCIO"
	var MSJ_SUBIDAOBJETONEGOCIO = "CTE_SUBIDA_OBJETOS_NEGOCIO"
	var MSJ_MANTENERCOMUNICACION = "CTE_MANTENIMIENTO_COMUNICACION";
	var MSJ_CALLBACKCIERREOPERACION = "CTE_CALLBACKCIERREOPERACION";
	var MSJ_CALLBACKSUBIDAPALETA = "CTE_CALLBACKSUBIDAPALETA";
	var MSJ_CONFIRMARCOMUNICACION = "CTE_CONFIRMARCOMUNICACION";
	var MSJ_BAJADAPALETATELEFONICA = "CTE_BAJADA_PALETA_TELEFONICA"
	var MSJ_SUBIDAPALETATELEFONICA = "CTE_SUBIDA_PALETA_TELEFONICA"
	var MSJ_OBTENEROFICINAOPPLUS = "CTE_OBTENER_OFICINA_OPPLUS";
	var MSJ_ESPALETATELEFONICAACTIVA = "CTE_ES_PALETA_TELEFONICA_ACTIVA"
	
	var ID_ORIGEN="libApp2Escritorio";
	// Establece el identificador de la tarea para obtener la información de esta.
	var identificadorTarea = "";
	var callbackSubidaPaleta = null;
	var fCallbackIniciarComunicacion = "";
	var pararComunicacion = false;
	
// listado de parámetros de la función ejecutarOperacion
	var parametrosPeticionAjax = {
			"url":"",
			"fcallback":"",
			"ferror":"",
			"asincrono":true,
			"datos":""
	};
	
	var datosConexionEscritorio={
		"urlEscritorio":"",
		"claveSeguridad": ""
	}
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	// Inicializa la comunicación con el escritorio y establece las funciones receptoras de los mensajes del escritorio a la aplicación.
	function fconstructor(parametrosConexion, parametros){
		try{
			if (!iniciadaComunicacion){
				if (parametrosConexion['urlEscritorio']!=undefined && parametrosConexion['urlEscritorio']!=null){
					if (parametrosConexion['urlEscritorio'].indexOf('/')== -1) {
						datosConexionEscritorio['urlEscritorio']= "http://" + parametrosConexion['urlEscritorio'] + "/" + parametrosConexion['iframeEscritorio'];
					}else{
						datosConexionEscritorio['urlEscritorio']= "http://" + parametrosConexion['urlEscritorio'];
					}
					datosConexionEscritorio['claveSeguridad']= parametrosConexion['claveSeguridad'];					
					if (typeof(parametros) != undefined && parametros!=null && parametros!=""){
						fCallbackIniciarComunicacion = parametros["callback"];
					}
					fEstablecerComunicacion();
				}
				else {
					throw new Error("Parametros comunicación no resueltos");
				}
			}
		}catch (e) {			// TODO: handle exception
			throw e;
		}
	}
	
	// Inicia el canal de comunicación con el escritorio
	function fEstablecerComunicacion(){
		if (!pararComunicacion) {
			setTimeout(function(){
				parametrosPeticionComunicacion = {
							"url":datosConexionEscritorio['urlEscritorio'],
							"fcallback":fRespuestaEscritorio,
							"ferror":fRespuestaEscritorio,
							"asincrono":true,
							//"datos":"CABECERA=" + MSJ_CALLBACKLANZAROPERACION + "&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
							"datos":"CABECERA=" + MSJ_MANTENERCOMUNICACION + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&IDTAREA="+ identificadorTarea
				};
				comApp2Esc.comu.ajax.call(parametrosPeticionComunicacion);
			},1000);
		}
	}
	// Trata los mensajes recibidos desde el navegador.
	function fRespuestaEscritorio(parametros){
		try{	
			mensaje = ((typeof parametros) == 'string' && parametros!="") ? eval(' (' + parametros + ') ') : parametros;
		
			if (typeof (mensaje["cabecera"])!=undefined && mensaje["cabecera"]!=null && mensaje["cabecera"]!=""){
				cabecera = mensaje["cabecera"];
				switch(cabecera){
					case MSJ_CONFIRMARCOMUNICACION:
						fconfirmarConexion(mensaje);
						break;
					case MSJ_CALLBACKCIERREOPERACION:
						fcallbackCierreOperacion(mensaje);
						break;
					case MSJ_CALLBACKSUBIDAPALETA:
						fcallbackSubidaPaleta(mensaje);
						break;
					default: 
						fEstablecerComunicacion();
						break;
				}
			}
			else {
				fEstablecerComunicacion();
			}
		}catch(e){
			try{
				fEstablecerComunicacion();
			}catch(ex){}
			throw e;
		}
	
	}
	
	function fpararComunicacion(){
		pararComunicacion=true;
	}
	
	function factivarComunicacion(){
		fEstablecerComunicacion();
		pararComunicacion=false;
	}
	
	
	// Confirma la comunicación con el escritorio
	function fconfirmarConexion(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null){
			iniciadaComunicacion=true;
			identificadorTarea = mensaje["idTarea"];
			if (typeof(fCallbackIniciarComunicacion) != undefined && fCallbackIniciarComunicacion!=null && fCallbackIniciarComunicacion!="" && typeof(fCallbackIniciarComunicacion)=== "function"){
				fCallbackIniciarComunicacion();
			}
			fEstablecerComunicacion();
		}
		
	}
	
	// Confirma el cierre de otra operacion
	function fcallbackCierreOperacion(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null && typeof(identificadorTarea) != undefined && mensaje["idTarea"]===identificadorTarea){
			comApp2Esc.util.callbackHandler(mensaje);
			fEstablecerComunicacion();
		}
		
	}
	
	
	// Callback de vuelta de la subida de datos a la paleta
	function fcallbackSubidaPaleta(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null && typeof(identificadorTarea) != undefined && mensaje["idTarea"]===identificadorTarea){
		
			datosRetorno = ((typeof mensaje["info"]) == 'string' && mensaje["info"]!="") ? eval(' (' + mensaje["info"] + ') ') : mensaje["info"];	
						
			callbackSubidaPaleta(mensaje["info"]);
			fEstablecerComunicacion();
		}
		
	}
	
	// Añade una nueva función de callback al manejador
	function fanadirCallback(parametros){
		fcallback = parametros["callback"];
		
		var callback;
		if (fcallback==undefined || fcallback==null || typeof(fcallback) != "function" ){
			callback =app2esc.callbackLanzarOperacion; 
		}
		else {
			callback = fcallback;
		}
		parametros["callback"]=callback;
		comApp2Esc.util.anadirCallback(parametros);
	}
	
	// Realiza la petición al escritorio de ejecución de tarea.
	function flanzarOperacion(parametros){

		try{
			if (iniciadaComunicacion){
				fanadirCallback(parametros);
				
				cadenaJSON = '{"datosOperacion":'
						+'{"operacion":"'
						+parametros['operacion']
						+'"';
						if(parametros['descripcion'] != null && parametros['descripcion']!="null") {
							cadenaJSON +=',"descripcion":"'+parametros['descripcion']+'"';
						}
						if(parametros['parametros'] != null && parametros['parametros']!="null") {

            var temp = typeof (parametros['parametros']);
            if (temp != null  &&   temp == "object" ) {
                  
              parametros['parametros'] = JSON.stringify(parametros['parametros']);
  
           } 
							parametros['parametros'] = parametros['parametros'].split('"').join("'");
							cadenaJSON +=',"parametros":"'+parametros['parametros']+'"';
						}
						if(parametros['callback'] != null && parametros['callback']!="null") {
							cadenaJSON +=',"callback":"'+parametros['callback']+'"';
						}
				cadenaJSON += '}}';
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":true,
						"datos":"CABECERA=" + MSJ_LANZAROPERACION + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio de cierre de tarea.
	function fcerrarTarea(parametros){
		try{
			if (iniciadaComunicacion){
				
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
					"url":datosConexionEscritorio['urlEscritorio'],
					"fcallback":"",
					"ferror":"",
					"asincrono":true,
					"datos":"CABECERA=" + MSJ_CERRARTAREA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
				iniciadaComunicacion=false;
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	// Realiza la petición al escritorio de cierre de tarea.
	function fgetTipoOperaciones(parametros, fretorno){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_OBTENERTIPOOPERACION + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	// Realiza la petición al escritorio del valor de la oficina OpPlus
	function fgetOficinaOpPlus(parametros, fretorno){
		try{
			if (iniciadaComunicacion){
				//cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				setTimeout(function(){
					parametrosPeticionAjax = {
							"url":datosConexionEscritorio['urlEscritorio'],
							"fcallback":"",
							"ferror":"",
							"asincrono":false,
							"datos":"CABECERA=" + MSJ_OBTENEROFICINAOPPLUS + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
					};
					try{
							var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
							if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
								resultado = "";
							else
								resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
							fretorno(resultado);					
					}catch (e) {
							fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	// Pregunta al Escritorio si la operación está permitida
	function fgetIsOperacionPermitida(parametros, fretorno){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESOPERACIONPERMITIDA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}	
	
	// Pregunta al Escritorio si la operación está definida
	function fgetIsOperacionDefinida(parametros, fretorno){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESOPERACIONDEFINIDA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
		
		
	// Realiza la petición al escritorio de obtención de datos del objeto de negocio
	function fgetDatosObjetoNegocio(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_BAJADAOBJETONEGOCIO + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio de subida de datos del objeto de negocio
	function fsetDatosObjetoNegocio(parametros){
		try{
			if (iniciadaComunicacion){
				
				cadenaJSON = (typeof parametros['datos']) == 'object' ? JSON.stringify(parametros['datos']) : parametros['datos'];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":true,
						"datos":"CABECERA=" + MSJ_SUBIDAOBJETONEGOCIO + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio de obtención de datos de la paleta telefónica
	function fgetDatosPaletaTelefonica(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros['datos']) == 'object' ? JSON.stringify(parametros['datos']) : parametros['datos'];
				
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_BAJADAPALETATELEFONICA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+"&DATOS="+cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio de subida de datos de la paleta telefónica
	function fsetDatosPaletaTelefonica(parametros){
		try{
			
			if (iniciadaComunicacion){
				callbackSubidaPaleta = parametros["callback"];
				cadenaJSON = (typeof parametros['datos']) == 'object' ? JSON.stringify(parametros['datos']) : parametros['datos'];
							
				cadenaJSON = '{"datosPaleta":'
						+'{"datos":'
						+cadenaJSON
				cadenaJSON += '}}';
				
				parametrosPeticionAjax = {
					"url":datosConexionEscritorio['urlEscritorio'],
					"fcallback":"",
					"ferror":"",
					"asincrono":true,
					"datos":"CABECERA=" + MSJ_SUBIDAPALETATELEFONICA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
				
			}else{
				throw new Error("Comunicacion no inicializada");
			}		
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al escritorio para saber si está activa la paleta telefónica
	function fgetIsPaletaTelefonicaActiva(parametros){
		try{
			if (iniciadaComunicacion){
								
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESPALETATELEFONICAACTIVA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						fretorno(resultado);					
					}catch (e) {
						fretorno("");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		
		/**
		 * Inicia los mecanismos de comunicación con el escritorio en ejecución.  
		 */
		iniciarComunicacion : function(parametrosConexion, parametros){
			try{
				fconstructor(parametrosConexion, parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Para la escucha de la comunicación con el Escritorio
		 */
		pararComunicacion : function(parametrosConexion, parametros){
			try{
				fpararComunicacion();
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Activa la escucha de peticiones desde el Escritorio.
		 */
		activarComunicacion : function(parametrosConexion, parametros){
			try{
				factivarComunicacion();
			}catch (e) {
				throw e;
			}
		},
		

		/**
		 * Realiza la petición de ejecución de operación sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		operacion: Obligatorio. Código de operación a ejecutar.
		 * 		descripcion: Descripción asociada a la tarea asociada a la operación.
		 * 		parametros: Parámetros de entrada de la operación.
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la petición.
		 *		error: Función de error aplicativa que se invocará ante un error en la ejecución de la operación.
		 */
		lanzarOperacion : function(parametros){
			try{
				flanzarOperacion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Realiza la petición de ejecución de operación sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		operacion: Obligatorio. Código de operación a ejecutar.
		 * 		descripcion: Descripción asociada a la tarea asociada a la operación.
		 * 		parametros: Parámetros de entrada de la operación.
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la petición.
		 *		error: Función de error aplicativa que se invocará ante un error en la ejecución de la operación.
		 */
		callbackHandler : function(parametros){
			try {
				comApp2Esc.util.callbackHandler(parametros);
			}catch (e) {
				throw e;
			}
		},
			
		/**
		 * Realiza la notificación al escritorio para que realice el cierre de la tarea, permitiendo el retorno de datos a la tarea invocante.
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		fin: indicador de la finalización de la ejecución. Los posibles valores para este campo son: 
		*			- 0, si la ejecución ha sido correcta; 
		*			- 1, si la ejecución de la operación ha finalizado con error; 
		*			- 2, si la finalización se ha realizado pero no se puede considerar correcta (se correspondería con el evento de fin aviso NACAR).
		*		datos: estructura json con los datos de salida de la ejecución
		 */
		
		cerrarTarea : function(parametros){
			try{
				fcerrarTarea(parametros);
			}catch (e) {
				throw e;
			}
		},

		/**
		* Solicita al Escritorio el tipo de las operaciones informamdas por parámetro
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		*/
		getTipoOperaciones: function(parametros, fretorno){
			try{
				fgetTipoOperaciones(parametros,fretorno);
			}catch (e) {
				throw e;
			}
		},
		

		/**
		* Pregunta al escritorio si la operación está permitida
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","permitida":"P"},{"op":"op2","permitida":"S"},...]}
		*/
		getIsOperacionPermitida: function(parametros, fretorno){
			try{
				fgetIsOperacionPermitida(parametros,fretorno);
			}catch (e) {
				throw e;
			}
		},
		

		/**
		* Pregunta al escritorio si la operación está definida
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","definida":"P"},{"op":"op2","definida":"S"},...]}
		*/
		getIsOperacionDefinida: function(parametros, fretorno){
			try{
				fgetIsOperacionDefinida(parametros,fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio los datos del objeto de negocio
		* @param parametros: 
		*/
		getDatosObjetoNegocio: function(parametros){
			try{
				fgetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio la subida de de los datos del objeto de negocio
		* @param parametros: 
		*/
		setDatosObjetoNegocio: function(parametros){
			try{
				fsetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}
		},
		
				/**
		* Solicita al Escritorio los datos de la paleta telefónica
		* @param parametros: 
		*/
		getDatosPaletaTelefonica: function(parametros){
			try{
				fgetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio la subida de los datos de la paleta telefónica
		* @param parametros: 
		*/
		setDatosPaletaTelefonica: function(parametros){
			try{
				fsetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio el valor de la pertenencia del usuario a una oficina OpPlus
		* @param fretorno: funcion a ejecutar para tratar el retorno
		* @return parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"oficinaOpPlus":"op"}
		*/
		getOficinaOpPlus: function(parametros, fretorno){
			try{
				fgetOficinaOpPlus(parametros, fretorno);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Pregunta al escritorio si la Paleta Telefónica está activa
		* @param parametros: JSON con la función de callback parametros={"callback":funciondecallback}
		* @return parametros: JSON con la respuesta {"activa":"true"}
		*/
		getIsPaletaTelefonicaActiva: function(parametros){
			try{
				fgetIsPaletaTelefonicaActiva(parametros);
			}catch (e) {
				throw e;
			}
		}

	};
	
}(); 



var app2esc = function(){
	
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var iniciadaComunicacion = false;
		
	// listado de parámetros de la función ejecutarOperacion
	var parametrosEjecutarOperacion = {
			"operacion":"",
			"descripcion":"",
			"parametros":"",
			"callback":"",
			"error":""
	};
	
	// listado de parametros de conexion
	var parametrosConexion = {
			"tipoConexion":"",
			"urlEscritorio":"",
			"iframeEscritorio":"",
			"urlAplicacion":location.href,
			"claveSeguridad":""
	};
	
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	function fconstructor(parametros){
		finicializarVariables();
		if (!iniciadaComunicacion){
			try{
				frecuperarDatosConexion();
				if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
					comApp2Esc.rpc.iniciarComunicacion(parametrosConexion, parametros);
				}
				else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
					comApp2Esc.ajax.iniciarComunicacion(parametrosConexion, parametros);
				}
				iniciadaComunicacion=true;
			}catch (e) {
				throw e;			
			}
		}
	}

	// Obtiene la información de conexión con el escritorio
	function frecuperarDatosConexion(){
		try{
			parametrosConexion["tipoConexion"]=contextoJS.getTecnicosArq().getOrigen().getOrigen();
			parametrosConexion["urlEscritorio"]=contextoJS.getTecnicosArq().getOrigen().getUrl();
			parametrosConexion["iframeEscritorio"]=contextoJS.getTecnicosArq().getOrigen().getID();
			parametrosConexion["claveSeguridad"]= contextoJS.getTecnicosArq().getOrigen().getClave();
			parametrosConexion["urlAplicacion"]=location.href;
		}catch(e){
			throw e;			

		}
		
	}
	
	// Obtiene la información de conexión con el escritorio
	function finicializarVariables(){
		comApp2Esc.util.inicializarValores();
		iniciadaComunicacion=false;
	}
	
	
	//Realiza el lanzamiento de la operación según el tipo de conexión.
	function flanzarOperacion(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comApp2Esc.rpc.lanzarOperacion(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comApp2Esc.ajax.lanzarOperacion(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;			
		}
	}
	
	//Realiza el cierre de las tareas.
	function fcerrarTarea(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comApp2Esc.rpc.cerrarTarea(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comApp2Esc.ajax.cerrarTarea(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;			

		}
	}
	
	// Realiza el tratamiento del error, invocando a la función de error asociada por parámetro
	function ftratarError(parametros,mensaje){
		var error=app2esc.errorLanzarOperacion;
		if (parametros["error"]!=undefined && parametros["error"]!=null && parametros["error"]!="null" && parametros["error"]!="" && typeof parametros["error"] == "function"){
			error=parametros["error"];
		}
		parametros["error"]=error;
		comApp2Esc.util.tratarError(parametros,mensaje);
	}
	
	// Realiza la petición del tipo de operaciones.
	function fgetTipoOperaciones(parametros){

		if (typeof(parametros)!=="undefined" && typeof(parametros["callback"])!=="undefined" && parametros["callback"]!=null && parametros["callback"]!="null" && parametros["callback"]!="" && typeof parametros["callback"] == "function"){
			fretorno = parametros["callback"];
		}else{
			fretorno = app2esc.callbackGetTipoOperaciones;
		}				
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getTipoOperaciones(parametros["datos"],fretorno);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getTipoOperaciones(parametros["datos"], fretorno);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	
	// Pregunta al escritorio si la operación está permitida.
	function fgetIsOperacionPermitida(parametros){

		if (typeof(parametros)!=="undefined" && typeof(parametros["callback"])!=="undefined" && parametros["callback"]!=null && parametros["callback"]!="null" && parametros["callback"]!="" && typeof parametros["callback"] == "function"){
			fretorno = parametros["callback"];
		}else{
			fretorno = app2esc.callbackGetIsOperacionPermitida;
		}				
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getIsOperacionPermitida(parametros["datos"],fretorno);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getIsOperacionPermitida(parametros["datos"], fretorno);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	// Realiza la petición del tipo de operaciones.
	function fgetOficinaOpPlus(parametros){

		if (typeof(parametros)!=="undefined" && typeof(parametros["callback"])!=="undefined" && parametros["callback"]!=null && parametros["callback"]!="null" && parametros["callback"]!="" && typeof parametros["callback"] == "function"){
			fretorno = parametros["callback"];
		}else{
			fretorno = app2esc.callbackGetOficinaOpPlus;
		}
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getOficinaOpPlus(parametros,fretorno);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getOficinaOpPlus(parametros["datos"], fretorno);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	// Pregunta al escritorio si la operación está definida.
	function fgetIsOperacionDefinida(parametros){

		if (typeof(parametros)!=="undefined" && typeof(parametros["callback"])!=="undefined" && parametros["callback"]!=null && parametros["callback"]!="null" && parametros["callback"]!="" && typeof parametros["callback"] == "function"){
			fretorno = parametros["callback"];
		}else{
			fretorno = app2esc.callbackGetIsOperacionDefinida;
		}				
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getIsOperacionDefinida(parametros["datos"],fretorno);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getIsOperacionDefinida(parametros["datos"], fretorno);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	
	// Realiza la petición de los datos del objeto de negocio según el tipo de conexión
	function fgetDatosObjetoNegocio(parametros){
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getDatosObjetoNegocio(parametros);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getDatosObjetoNegocio(parametros);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	
	
	//Realiza la subida de datos al objeto de negocio según el tipo de conexión.
	function fsetDatosObjetoNegocio(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comApp2Esc.rpc.setDatosObjetoNegocio(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comApp2Esc.ajax.setDatosObjetoNegocio(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
		// Realiza la petición de los datos de la paleta telefónica según el tipo de conexión.
	function fgetDatosPaletaTelefonica(parametros){
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getDatosPaletaTelefonica(parametros);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getDatosPaletaTelefonica(parametros);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	
	
	//Realiza la subida de datos a la paleta telefónica según el tipo de conexión.
	function fsetDatosPaletaTelefonica(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comApp2Esc.rpc.setDatosPaletaTelefonica(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comApp2Esc.ajax.setDatosPaletaTelefonica(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición al Escritorio según el tipo de conexión
	function fgetIsPaletaTelefonicaActiva(parametros){
		
		if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
			comApp2Esc.rpc.getIsPaletaTelefonicaActiva(parametros);
		}
		else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
			comApp2Esc.ajax.getIsPaletaTelefonicaActiva(parametros);
		}
		else{
			throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
		}
	}
	
	return{
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
			
		/**
		 * Inicia los mecanismos de comunicación con el escritorio en ejecución.  
		 */
		iniciarComunicacion : function(parametros){
			try{
				fconstructor(parametros);
			}catch (e) {
				// TODO: handle exception
			}
		},

		/**
		 * Realiza la petición de ejecución de operación sobre el escritorio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		operacion: Obligatorio. Código de operación a ejecutar.
		 * 		descripcion: Descripción asociada a la tarea asociada a la operación.
		 * 		parametros: Parámetros de entrada de la operación.
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la petición.
		 *		error: Función de error aplicativa que se invocará ante un error en la ejecución de la operación.
		 */
		lanzarOperacion : function(parametros){
			try{
				flanzarOperacion(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}
			}			
		},
		
		/**
		* Plantilla de la función de callback para implementar desde el cliente web de la aplicación.
		* @param parametros: objeto con los parámetros de salida de la ejecución, con los datos:
		* 		fin: indicador de la finalización de la ejecución. Los posibles valores para este campo son: 
		*			- 0, si la ejecución ha sido correcta; 
		*			- 1, si la ejecución de la operación ha finalizado con error; 
		*			- 2, si la finalización se ha realizado pero no se puede considerar correcta (se correspondería con el evento de fin aviso NACAR).
		*		datos: estructura json con los datos de salida de la ejecución
		*/
		callbackLanzarOperacion: function(parametros){

		},
		
		/**
		* Plantilla de la función de callback para implementar desde el cliente web de la aplicación.
		* @param parametros: objeto con los datos de salida por error en la ejecución, que contiene lo siguiente:
		* 		mensaje: cadena con el mensaje de error asociado a la imposibilidad de la ejecución de la operación.
		*/
		errorLanzarOperacion: function(parametros){
			throw new Error(parametros["mensaje"]);
		},
		
		/**
		 * Realiza la notificación al escritorio para que realice el cierre de la tarea, permitiendo el retorno de datos a la tarea invocante.
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 * 		fin: indicador de la finalización de la ejecución. Los posibles valores para este campo son: 
		*			- 0, si la ejecución ha sido correcta; 
		*			- 1, si la ejecución de la operación ha finalizado con error; 
		*			- 2, si la finalización se ha realizado pero no se puede considerar correcta (se correspondería con el evento de fin aviso NACAR).
		*		datos: estructura json con los datos de salida de la ejecución
		 */
		
		cerrarTarea : function(parametros){
			try{
				fcerrarTarea(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		* Solicita al Escritorio el tipo de las operaciones informamdas por parámetro
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* 
		*/
		getTipoOperaciones: function(parametros){
			try{
				fgetTipoOperaciones(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar el retorno de los tipos de operaciones.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		 */
		callbackGetTipoOperaciones: function (parametros){
			return resultado;					
		},
		
		
		/**
		* Solicita al Escritorio saber si la operación está permitida
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* 
		*/
		getIsOperacionPermitida: function(parametros){
			try{
				fgetIsOperacionPermitida(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar el retorno de obtención de getIsOperacionPermitida().
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","permitida":"P"},{"op":"op2","permitida":"S"},...]}
		 */
		callbackGetIsOperacionPermitida: function (parametros){
			return resultado;					
		},
		
		
		/**
		* Solicita al Escritorio saber si la operación está definida
		* @param parametros: JSON con el conjunto de operaciones a informar, con el formato: {"operaciones":[{"op":"op1"},{"op":"op2"},...]}
		* 
		*/
		getIsOperacionDefinida: function(parametros){
			try{
				fgetIsOperacionDefinida(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar de obtención de getIsOperacionDefinida().
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","definida":"P"},{"op":"op2","definida":"S"},...]}
		 */
		callbackGetIsOperacionDefinida: function (parametros){
			return resultado;					
		},
		
		/**
		* Solicita al Escritorio los datos del objeto de negocio
		* @param parametros: JSON con el 
		* 
		*/
		getDatosObjetoNegocio: function(parametros){
			try{
				fgetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar el retorno de los datos del objeto de negocio.
		 * @param parametros: 
		 */
		callbackGetDatosObjetoNegocio: function(parametros){
			return parametros;					
		},
		
		/**
		 * Realiza la petición de subida de datos al objeto de negocio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato JSON )
		 */
		setDatosObjetoNegocio : function(parametros){
			try{
				fsetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		* Solicita al Escritorio los datos de la paleta telefónica
		* @param parametros: JSON con el 
		* 
		*/
		getDatosPaletaTelefonica: function(parametros){
			try{
				fgetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar el retorno de los datos de la paleta telefónica.
		 * @param parametros: 
		 */
		callbackGetDatosPaletaTelefonica: function(parametros){
			return parametros;					
		},
		
		/**
		 * Realiza la petición de subida de datos a la paleta telefónica.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato JSON ).
		 */
		setDatosPaletaTelefonica : function(parametros){
			try{
				fsetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		* Solicita al Escritorio la pertenencia a una oficina OPPLUS
		* @param parametros: JSON con el dato de pertenencia a una oficina OPPLUS, con el formato: {"oficinaOpPlus":"x"}
		* 
		*/
		getOficinaOpPlus: function(parametros){
			try{
				fgetOficinaOpPlus(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Plantilla de la función de callback para implementar desde el cliente web de la aplicación para gestionar el retorno del valor de pertenencia del usuario a oficina OpPlus.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"oficinaOpPlus":"x"}
		 */
		callbackGetOficinaOpPlus: function (parametros){
			return parametros;					
		},
				
		/**
		* Pregunta al escritorio si la Paleta Telefónica está activa
		* @param parametros: JSON con la función de callback parametros={"callback":funciondecallback}
		* @return parametros: JSON con la respuesta {"activa":"true"}
		*/
		getIsPaletaTelefonicaActiva: function(parametros){
			try{
				fgetIsPaletaTelefonicaActiva(parametros);
			}catch (e) {
				throw e;
			}			
		}		

	};
	
}(); 


var comProxyApp2Esc = comProxyApp2Esc || {};
 
comProxyApp2Esc.rpc = function() {

	var iniciadaComunicacion = false;
	var funcionespublicasEscritorio = ["finiciarcomunicacion",
					"flanzarOperacion",
					"fcerrarTarea",
					"fgetTipoOperaciones",
					"fgetDatosObjetoNegocio",
					"fsetDatosObjetoNegocio",
					"fgetDatosPaletaTelefonica",
					"fsetDatosPaletaTelefonica",
					"fgetOficinaOpPlus",
					"fgetIsOperacionPermitida",
					"fgetIsOperacionDefinida",
					"fgetIsPaletaTelefonicaActiva"];
	var funcionespublicasAplicacion = ["fcallbackhandlers","fconfirmarconexion"];
	
	function finicializar(parametrosConexion){
		try{
			
			if(!iniciadaComunicacion){
				if (typeof(window.name)=="undefined" || window.name==""){
					window.name=parametrosConexion["iframeContenedor"];
				}else{
					if(parametrosConexion["iframeContenedor"]!=window.name)
						parametrosConexion["iframeContenedor"]=window.name;
				}

				// Se registran las funciones.
				gadgets.rpc.register(funcionespublicasEscritorio[0], ProxyApp2Esc.iniciarComunicacion);
				gadgets.rpc.register(funcionespublicasEscritorio[1], ProxyApp2Esc.lanzarOperacion);
				gadgets.rpc.register(funcionespublicasEscritorio[2], ProxyApp2Esc.cerrarTarea);
				gadgets.rpc.register(funcionespublicasEscritorio[3], ProxyApp2Esc.getTipoOperaciones);
				gadgets.rpc.register(funcionespublicasEscritorio[4], ProxyApp2Esc.getDatosObjetoNegocio);
				gadgets.rpc.register(funcionespublicasEscritorio[5], ProxyApp2Esc.setDatosObjetoNegocio);
				gadgets.rpc.register(funcionespublicasEscritorio[6], ProxyApp2Esc.getDatosPaletaTelefonica);
				gadgets.rpc.register(funcionespublicasEscritorio[7], ProxyApp2Esc.setDatosPaletaTelefonica);
				gadgets.rpc.register(funcionespublicasEscritorio[8], ProxyApp2Esc.getOficinaOpPlus);
				gadgets.rpc.register(funcionespublicasEscritorio[9], ProxyApp2Esc.getIsOperacionPermitida);
				gadgets.rpc.register(funcionespublicasEscritorio[10], ProxyApp2Esc.getIsOperacionDefinida);
				gadgets.rpc.register(funcionespublicasAplicacion[0], ProxyApp2Esc.callbackProxy);
				gadgets.rpc.register(funcionespublicasAplicacion[1], ProxyApp2Esc.confirmarConexion);
				gadgets.rpc.register(funcionespublicasAplicacion[11], ProxyApp2Esc.getIsPaletaTelefonicaActiva);

				// Se identifica el frame padre
				gadgets.rpc.setupReceiver('..',parametrosConexion["urlContenedor"]);
					
				var parametros = {
					"urlEscritorio" : parametrosConexion["urlContenedor"],
					"iframeEscritorio" : parametrosConexion["iframeContenedor"],
					"urlAplicacion" : parametrosConexion["urlPaginaProxy"]
				};
			
				gadgets.rpc.call(null,funcionespublicasEscritorio[0],null,parametros);
			}
			
		}catch(exception) {
			throw exception;
		}
	}


	function finiciarcomunicacion(parametrosConexion){
		try{
			gadgets.rpc.removeReceiver(parametrosConexion["iframeAplicacion"]);
			gadgets.rpc.setupReceiver(parametrosConexion["iframeAplicacion"], parametrosConexion["urlAplicacion"]);	
			gadgets.rpc.call(parametrosConexion["iframeAplicacion"],funcionespublicasAplicacion[1],null, parametrosConexion);
		}catch(exception) {
			throw exception;
		}
	}
	
	function flanzarOperacion(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[1],null, parametros);
	}
	function fcerrarTarea(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[2],null, parametros);
	}
	function fgetTipoOperaciones(parametrosConexion,parametros){
		gadgets.rpc.register("fcallbackGetTipoOperaciones", parametros["callback"]);
		parametros["callback"]=function(value){
			var resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;
			gadgets.rpc.call(parametrosConexion["iframeAplicacion"],"fcallbackGetTipoOperaciones",null, resultado);
		};
		gadgets.rpc.call(null,funcionespublicasEscritorio[3],parametros["callback"],parametros);
	}
	
	function fgetOficinaOpPlus(parametrosConexion,parametros){
		gadgets.rpc.register("fcallbackGetOficinaOpPlus", parametros["callback"]);
		parametros["callback"]=function(value){
			var resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;
			gadgets.rpc.call(parametrosConexion["iframeAplicacion"],"fcallbackGetOficinaOpPlus",null, resultado);
		};
		gadgets.rpc.call(null,funcionespublicasEscritorio[8],parametros["callback"],parametros);
	}
	function fgetIsOperacionPermitida(parametrosConexion,parametros){
		gadgets.rpc.register("fcallbackGetIsOperacionPermitida", parametros["callback"]);
		parametros["callback"]=function(value){
			var resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;
			gadgets.rpc.call(parametrosConexion["iframeAplicacion"],"fcallbackGetIsOperacionPermitida",null, resultado);
		};
		gadgets.rpc.call(null,funcionespublicasEscritorio[9],parametros["callback"],parametros);
	}
	function fgetIsOperacionDefinida(parametrosConexion,parametros){
		gadgets.rpc.register("fcallbackGetIsOperacionDefinida", parametros["callback"]);
		parametros["callback"]=function(value){
			var resultado = (typeof value) == 'string' ? eval(' (' + value + ') ') : value;
			gadgets.rpc.call(parametrosConexion["iframeAplicacion"],"fcallbackGetIsOperacionDefinida",null, resultado);
		};
		gadgets.rpc.call(null,funcionespublicasEscritorio[10],parametros["callback"],parametros);
	}
	function finvocarFuncionCallback(parametrosConexion,parametros){
		gadgets.rpc.call(parametrosConexion["iframeAplicacion"],funcionespublicasAplicacion[0],null, parametros);
	}
	function fconfirmarConexion(){
		iniciadaComunicacion = true;
	}
	function fgetDatosObjetoNegocio(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[4],null, parametros);
	}
	function fsetDatosObjetoNegocio(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[5],null, parametros);
	}
	function fgetDatosPaletaTelefonica(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[6],null, parametros);
	}
	function fsetDatosPaletaTelefonica(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[7],null, parametros);
	}
	function fgetIsPaletaTelefonicaActiva(parametros){
		gadgets.rpc.call(null,funcionespublicasEscritorio[11],null, parametros);
	}	
	
	return {
		inicializar: function(parametros){
			finicializar(parametros);
		},
		iniciarComunicacion: function(parametros){
			finiciarcomunicacion(parametros);
		},
		lanzarOperacion: function(parametros){
			flanzarOperacion(parametros);
		},
		cerrarTarea : function(parametros){
			fcerrarTarea(parametros);
		},
		getTipoOperaciones : function(parametrosConexion,parametros){
			fgetTipoOperaciones(parametrosConexion,parametros);
		},
		getIsOperacionPermitida : function(parametrosConexion,parametros){
			fgetIsOperacionPermitida(parametrosConexion,parametros);
		},
		getIsOperacionDefinida : function(parametrosConexion,parametros){
			fgetIsOperacionDefinida(parametrosConexion,parametros);
		},
		invocarCallbackOperacion : function(parametrosConexion,parametros){
			finvocarFuncionCallback(parametrosConexion,parametros);
		},
		confirmarConexion: function(){
			fconfirmarConexion();
		},
		getDatosObjetoNegocio: function(parametros){
			fgetDatosObjetoNegocio(parametros);
		},
		setDatosObjetoNegocio: function(parametros){
			fsetDatosObjetoNegocio(parametros);
		},
		getDatosPaletaTelefonica: function(parametros){
			fgetDatosPaletaTelefonica(parametros);
		},
		setDatosPaletaTelefonica: function(parametros){
			fsetDatosPaletaTelefonica(parametros);
		},
		
		getOficinaOpPlus : function(parametrosConexion,parametros){
			fgetOficinaOpPlus(parametrosConexion,parametros);
		},
		getIsPaletaTelefonicaActiva: function(parametros){
			fgetIsPaletaTelefonicaActiva(parametros);
		}
		
	};
}();

comProxyApp2Esc.ajax = function(){
	
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var iniciadaComunicacion = false;
	var funcionespublicasEscritorio = ["finiciarcomunicacion", 
					"flanzarOperacion", 
					"fcerrarTarea", 
					"fgetTipoOperaciones",
					"fgetDatosObjetoNegocio",
					"fsetDatosObjetoNegocio",
					"fgetDatosPaletaTelefonica",
					"fsetDatosPaletaTelefonica",
					"fgetOficinaOpPlus",
					"fgetIsOperacionPermitida",
					"fgetIsOperacionDefinida",
					"fgetIsPaletaTelefonicaActiva"];
	var funcionespublicasAplicacion = ["fcallbackhandlers","fconfirmarconexion"];
	var MSJ_LANZAROPERACION = "CTE_EJECUCION_OPERACION";
	var MSJ_CERRARTAREA = "CTE_CERRAR_TAREA";
	var MSJ_OBTENERTIPOOPERACION = "CTE_OBTENER_TIPO_OPERACION"
	var MSJ_ESOPERACIONPERMITIDA = "CTE_ES_OPERACION_PERMITIDA"
	var MSJ_ESOPERACIONDEFINIDA = "CTE_ES_OPERACION_DEFINIDA"
	var MSJ_BAJADAOBJETONEGOCIO = "CTE_BAJADA_OBJETOS_NEGOCIO"
	var MSJ_SUBIDAOBJETONEGOCIO = "CTE_SUBIDA_OBJETOS_NEGOCIO"
	var MSJ_MANTENERCOMUNICACION = "CTE_MANTENIMIENTO_COMUNICACION";
	var MSJ_CALLBACKCIERREOPERACION = "CTE_CALLBACKCIERREOPERACION";
	var MSJ_CALLBACKSUBIDAPALETA = "CTE_CALLBACKSUBIDAPALETA";
	var MSJ_CONFIRMARCOMUNICACION = "CTE_CONFIRMARCOMUNICACION";
	var MSJ_BAJADAPALETATELEFONICA = "CTE_BAJADA_PALETA_TELEFONICA"
	var MSJ_SUBIDAPALETATELEFONICA = "CTE_SUBIDA_PALETA_TELEFONICA"
	var MSJ_OBTENEROFICINAOPPLUS = "CTE_OBTENER_OFICINA_OPPLUS";
	var MSJ_ESPALETATELEFONICAACTIVA = "CTE_ES_PALETA_TELEFONICA_ACTIVA"
	
	var ID_ORIGEN="libApp2Escritorio";
	// Establece el identificador de la tarea para obtener la información de esta.
	var identificadorTarea = "";
	var callbackSubidaPaleta = null;
	var fCallbackIniciarComunicacion = "";
	var pararComunicacion=false;
// listado de parámetros de la función ejecutarOperacion
	var parametrosPeticionAjax = {
			"url":"",
			"fcallback":"",
			"ferror":"",
			"asincrono":true,
			"datos":""
	};
	
	var datosConexionEscritorio={
		"urlEscritorio":"",
		"claveSeguridad": "",
		"urlAplicacion" : "",
		"iframeAplicacion" :""
	}

	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	function finicializar(parametrosConexion){
		try{
			if(!iniciadaComunicacion){
				if (typeof(window.name)=="undefined" || window.name==""){
					window.name=parametrosConexion["iframeContenedor"];
				}else{
					if(parametrosConexion["iframeContenedor"]!=window.name)
						parametrosConexion["iframeContenedor"]=window.name;
				}

				// Se registran las funciones que podrá llamar la aplicación hija.
				gadgets.rpc.register(funcionespublicasEscritorio[0], ProxyApp2Esc.iniciarComunicacion);
				gadgets.rpc.register(funcionespublicasEscritorio[1], ProxyApp2Esc.lanzarOperacion);
				gadgets.rpc.register(funcionespublicasEscritorio[2], ProxyApp2Esc.cerrarTarea);
				gadgets.rpc.register(funcionespublicasEscritorio[3], ProxyApp2Esc.getTipoOperaciones);
				gadgets.rpc.register(funcionespublicasEscritorio[4], ProxyApp2Esc.getDatosObjetoNegocio);
				gadgets.rpc.register(funcionespublicasEscritorio[5], ProxyApp2Esc.setDatosObjetoNegocio);
				gadgets.rpc.register(funcionespublicasEscritorio[6], ProxyApp2Esc.getDatosPaletaTelefonica);
				gadgets.rpc.register(funcionespublicasEscritorio[7], ProxyApp2Esc.setDatosPaletaTelefonica);
				gadgets.rpc.register(funcionespublicasEscritorio[8], ProxyApp2Esc.getOficinaOpPlus);
				gadgets.rpc.register(funcionespublicasEscritorio[9], ProxyApp2Esc.getIsOperacionPermitida);
				gadgets.rpc.register(funcionespublicasEscritorio[10], ProxyApp2Esc.getIsOperacionDefinida);
				gadgets.rpc.register(funcionespublicasEscritorio[11], ProxyApp2Esc.getIsPaletaTelefonicaActiva);
				
				pararComunicacion=false;
				comApp2Esc.ajax.pararComunicacion();
				identificadorTarea="";
			}
			
		}catch(exception) {
			throw exception;
		}
	
	}
	
	function fpararComunicacion(){
		pararComunicacion=true;
	}
	
	function fliberar(){
		identificadorTarea="";
		fpararComunicacion();
		iniciadaComunicacion=false;
		comApp2Esc.ajax.activarComunicacion();
		
	}
		
	function finiciarcomunicacion(parametrosConexion){
		// Se establecen los datos de comunicación.
				
		if (parametrosConexion['urlContenedor']!=undefined && parametrosConexion['urlContenedor']!=null){
			if (parametrosConexion['urlContenedor'].indexOf('/')== -1) {
				datosConexionEscritorio['urlEscritorio']= "http://" + parametrosConexion['urlContenedor'] + "/" + parametrosConexion['iframeEscritorio'];
			}else{
				datosConexionEscritorio['urlEscritorio']= "http://" + parametrosConexion['urlContenedor'];
			}
			datosConexionEscritorio['claveSeguridad']= parametrosConexion['claveSeguridad'];					
				
			datosConexionEscritorio['urlAplicacion']=parametrosConexion["urlAplicacion"];
			datosConexionEscritorio['iframeAplicacion']=parametrosConexion["iframeAplicacion"];
					
					
			// Se establece el hijo.
			gadgets.rpc.removeReceiver(parametrosConexion["iframeAplicacion"]);
			gadgets.rpc.setupReceiver(parametrosConexion["iframeAplicacion"], parametrosConexion["urlAplicacion"]);	
	
			//Se para la comunicación con el escritorio del objeto app2esc
			comApp2Esc.ajax.pararComunicacion();
			//Se establece la comunicación del proxy.
			identificadorTarea="";
			fEstablecerComunicacion();
							
		}
	}
	
	// Inicia el canal de comunicación con el escritorio
	function fEstablecerComunicacion(){
		if (!pararComunicacion)
		{		
			setTimeout(function(){
				parametrosPeticionComunicacion = {
							"url":datosConexionEscritorio['urlEscritorio'],
							"fcallback":fRespuestaEscritorio,
							"ferror":fRespuestaEscritorio,
							"asincrono":true,
							//"datos":"CABECERA=" + MSJ_CALLBACKLANZAROPERACION + "&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
							"datos":"CABECERA=" + MSJ_MANTENERCOMUNICACION + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&IDTAREA="+ identificadorTarea
				};
				if (!pararComunicacion)
					comApp2Esc.comu.ajax.call(parametrosPeticionComunicacion);
			},1000);
		}
	}
	// Trata los mensajes recibidos desde el navegador.
	function fRespuestaEscritorio(parametros){
		try{	
			mensaje = ((typeof parametros) == 'string' && parametros!="") ? eval(' (' + parametros + ') ') : parametros;
			
			if (!pararComunicacion && typeof (mensaje["cabecera"])!=undefined && mensaje["cabecera"]!=null && mensaje["cabecera"]!=""){
				cabecera = mensaje["cabecera"];
				switch(cabecera){
					case MSJ_CONFIRMARCOMUNICACION:
						fconfirmarConexion(mensaje);
						break;
					case MSJ_CALLBACKCIERREOPERACION:
						fcallbackCierreOperacion(mensaje);
						break;
					case MSJ_CALLBACKSUBIDAPALETA:
						fcallbackSubidaPaleta(mensaje);
						break;
					default: 
						fEstablecerComunicacion();
						break;
				}
			}
			else {
				fEstablecerComunicacion();
			}
		}catch(e){
			try{
				fEstablecerComunicacion();
			}catch(ex){}
			throw e;
		}
	
	}
	// Confirma la comunicación con el escritorio
	function fconfirmarConexion(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null){
			iniciadaComunicacion=true;
			identificadorTarea = mensaje["idTarea"];
			gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[1],null, fCallbackIniciarComunicacion);
			fEstablecerComunicacion();
		}
		
	}
	
	// Confirma el cierre de otra operacion
	function fcallbackCierreOperacion(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null && typeof(identificadorTarea) != undefined && mensaje["idTarea"]===identificadorTarea){
			gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, mensaje);
			fEstablecerComunicacion();
		}
	}
	

	// Confirma el callback de la subida de datos a la paleta telefónica.
	function fcallbackSubidaPaleta(mensaje){
		if (typeof(mensaje["idTarea"]) != undefined && mensaje["idTarea"]!=null && typeof(identificadorTarea) != undefined && mensaje["idTarea"]===identificadorTarea){
			var datosRetorno = ((typeof mensaje["info"]) == 'string' && mensaje["info"]!="") ? eval(' (' + mensaje["info"] + ') ') : mensaje["info"];	
			gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetTipoOperaciones",null, datosRetorno);
			fEstablecerComunicacion();
		}
	}	
	// Realiza la ejecución de la operación sobre el escritorio.
	function flanzarOperacion(parametros){
		app2esc.lanzarOperacion(parametros);
	}
	
	// Realiza el cierre de la tarea.
	function fcerrarTarea(parametros){
		app2esc.cerrarTarea(parametros)
	}
	
	// Solicita al escritorio el conjunto de operaciones.
	function fgetTipoOperaciones(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_OBTENERTIPOOPERACION + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetTipoOperaciones",null,resultado);
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetTipoOperaciones",null,"");
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
		
	}
	
	
	// Solicita al escritorio la oficina de pertenencia del usuario es OPPLUS vía petición AJAX.
	function fgetOficinaOpPlus(parametros){
		try{
			if (iniciadaComunicacion){
				//cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_OBTENEROFICINAOPPLUS + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetOficinaOpPlus",null,resultado);
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetOficinaOpPlus",null,"");
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
		
	}
	
	// Pregunta al escritorio si el conjunto de operaciones están permitidas.
	function fgetIsOperacionPermitida(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESOPERACIONPERMITIDA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetIsOperacionPermitida",null,resultado);
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetIsOperacionPermitida",null,"");
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
		
	}
	
	// Pregunta al escritorio si el conjunto de operaciones están definidas.
	function fgetIsOperacionDefinida(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESOPERACIONDEFINIDA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+ "&DATOS="+ cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
						
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetIsOperacionDefinida",null,resultado);
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],"fcallbackGetIsOperacionDefinida",null,"");
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
		
	}
	//Solicita el conjunto de datos al objeto de negocio.
	function fgetDatosObjetoNegocio(parametros){
	
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros) == 'object' ? JSON.stringify(parametros) : parametros;
				
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_BAJADAOBJETONEGOCIO + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else{
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
							datosRetorno = { 
								"info" : resultado,
								"callback": fretorno
							}
						}
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, datosRetorno);					
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, "");					
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	// Establece los datos de objeto de negocio.
	function fsetDatosObjetoNegocio(parametros){
		app2esc.setDatosObjetoNegocio(parametros);
	}
	
	// Obtiene los datos de la paleta telefónica.
	function fgetDatosPaletaTelefonica(parametros){
		try{
			if (iniciadaComunicacion){
				cadenaJSON = (typeof parametros['datos']) == 'object' ? JSON.stringify(parametros['datos']) : parametros['datos'];
				
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_BAJADAPALETATELEFONICA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']+"&DATOS="+cadenaJSON
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else{
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
							datosRetorno = { 
								"info" : resultado,
								"callback": fretorno
							}
						}
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, datosRetorno);					
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, "");					
		
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	function fsetDatosPaletaTelefonica(parametros){
		app2esc.setDatosPaletaTelefonica(parametros);
	}
	
	// Obtiene los datos de la paleta telefónica.
	function fgetIsPaletaTelefonicaActiva(parametros){
		try{
			if (iniciadaComunicacion){
								
				fretorno = parametros["callback"];
				
				parametrosPeticionAjax = {
						"url":datosConexionEscritorio['urlEscritorio'],
						"fcallback":"",
						"ferror":"",
						"asincrono":false,
						"datos":"CABECERA=" + MSJ_ESPALETATELEFONICAACTIVA + "&ORIGEN="+ ID_ORIGEN +"&claveseguridad="+ datosConexionEscritorio['claveSeguridad']
				};
				
				setTimeout(function () {
					try{
						var resultado = comApp2Esc.comu.ajax.call(parametrosPeticionAjax);
						if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
							resultado = "";
						else{
							resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
							datosRetorno = {
								"callback": fretorno
							}
						}
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, datosRetorno);					
					}catch (e) {
						gadgets.rpc.call(datosConexionEscritorio["iframeAplicacion"],funcionespublicasAplicacion[0],null, "");					
		
					}
				},0);
			}else{
				throw new Error("Comunicacion no inicializada");
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		inicializar: function(parametros){
			finicializar(parametros);
		},
		liberar: function(parametros){
			fliberar(parametros);
		},
		iniciarComunicacion: function(parametros){
			finiciarcomunicacion(parametros);
		},
		lanzarOperacion: function(parametros){
			flanzarOperacion(parametros);
		},
		cerrarTarea : function(parametros){
			fcerrarTarea(parametros);
		},
		getTipoOperaciones : function(parametros){
			fgetTipoOperaciones(parametros);
		},
		getIsOperacionPermitida : function(parametros){
			fgetIsOperacionPermitida(parametros);
		},
		getIsOperacionDefinida : function(parametros){
			fgetIsOperacionDefinida(parametros);
		},
		invocarCallbackOperacion : function(parametrosConexion,parametros){
			finvocarFuncionCallback(parametrosConexion,parametros);
		},
		confirmarConexion: function(){
			fconfirmarConexion();
		},
		getDatosObjetoNegocio: function(parametros){
			fgetDatosObjetoNegocio(parametros);
		},
		setDatosObjetoNegocio: function(parametros){
			fsetDatosObjetoNegocio(parametros);
		},
		getDatosPaletaTelefonica: function(parametros){
			fgetDatosPaletaTelefonica(parametros);
		},
		setDatosPaletaTelefonica: function(parametros){
			fsetDatosPaletaTelefonica(parametros);
		},
		getOficinaOpPlus : function(parametros){
			fgetOficinaOpPlus(parametros);
		},
		getIsPaletaTelefonicaActiva: function(parametros){
			fgetIsPaletaTelefonicaActiva(parametros);
		}
	};
}(); 



ProxyApp2Esc = function(){
		
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var iniciadaComunicacion = false;
	var parametrosConexion = {
				"tipoConexion" : "",
				"urlContenedor" : "",
				"iframeContenedor" : "",
				"urlPaginaProxy" : "",
				"urlAplicacion" : "",
				"iframeAplicacion" :"",
				"claveSeguridad":""
	};
	
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	function finicializar(){
		finicializarVariables();
		if (!iniciadaComunicacion){
			try{
				frecuperarDatosConexion();
				if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
					comProxyApp2Esc.rpc.inicializar(parametrosConexion);
				}
				else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
					comProxyApp2Esc.ajax.inicializar(parametrosConexion);
				}
				iniciadaComunicacion=true;
			}catch (e) {
				throw new Error("Error en la recuperación de los datos de conexion");
			}
		}
	}

	function fliberar(){
			try{
				if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				}
				else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
					comProxyApp2Esc.ajax.liberar();
				}
				iniciadaComunicacion=false;
			}catch (e) {
				throw new Error("Error en la recuperación de los datos de conexion");
			}
		
	}
	
	
	function finicializarComunicacion(parametros){
		if (iniciadaComunicacion){
			try{
				frecuperarDatosConexionHija(parametros);
				if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
					comProxyApp2Esc.rpc.iniciarComunicacion(parametrosConexion);
				}
				else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
					comProxyApp2Esc.ajax.iniciarComunicacion(parametrosConexion);
				}
				//iniciadaComunicacion=true;
			}catch (e) {
				throw new Error("Error en la recuperación de los datos de conexion");
			}
		}
	}

	// Obtiene la información de conexión con el escritorio
	function frecuperarDatosConexion(){
		try{
			parametrosConexion["tipoConexion"] = contextoJS.getTecnicosArq().getOrigen().getOrigen();
			parametrosConexion["urlContenedor"] = contextoJS.getTecnicosArq().getOrigen().getUrl();
			parametrosConexion["iframeContenedor"] = contextoJS.getTecnicosArq().getOrigen().getID();
			parametrosConexion["claveSeguridad"]= contextoJS.getTecnicosArq().getOrigen().getClave();
			parametrosConexion["urlPaginaProxy"]= location.href;		
		}catch (e){
			throw new Error("Error en la recuperación de los datos de conexion");
		}
	}
	
	// Obtiene la información de conexión con la página hija
	function frecuperarDatosConexionHija(parametros){
		parametrosConexion["urlAplicacion"] = parametros["urlAplicacion"];
		parametrosConexion["iframeAplicacion"] = parametros["iframeEscritorio"]
	}
	
	// Inicializa las variables.
	function finicializarVariables(){
		iniciadaComunicacion=false;
	}
	
	//Realiza el lanzamiento de la operación según el tipo de conexión.
	function flanzarOperacion(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.lanzarOperacion(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.lanzarOperacion(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	//Realiza el cierre de las tareas.
	function fcerrarTarea(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.cerrarTarea(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.cerrarTarea(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza el tratamiento del error, invocando a la función de error asociada por parámetro
	function ftratarError(parametros,mensaje){
		
	}
	
	// Realiza la petición del tipo de operaciones.
	function fgetTipoOperaciones(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getTipoOperaciones(parametrosConexion,parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getTipoOperaciones(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza la petición del tipo de operaciones.
	function fgetOficinaOpPlus(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getOficinaOpPlus(parametrosConexion,parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getOficinaOpPlus(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	// Realiza la petición necesaria para saber si el conjunto de operaciones pasados están permitidos.
	function fgetIsOperacionPermitida(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getIsOperacionPermitida(parametrosConexion,parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getIsOperacionPermitida(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza la petición necesaria para saber si el conjunto de operaciones pasados están permitidos.
	function fgetIsOperacionDefinida(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getIsOperacionDefinida(parametrosConexion,parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getIsOperacionDefinida(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza la petición del tipo de operaciones.
	function fcallbackProxy(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.invocarCallbackOperacion(parametrosConexion,parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				//En el caso de ajax la gestión del callback se gestiona desde la implementación específica de AJAX.
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza la invocación de la confirmacion de conexión.
	function fconfirmarConexion(parametros){
		try{
			iniciadaComunicacion=true;
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.confirmarConexion();
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				//En el caso de ajax la gestión del callback se gestiona desde la implementación específica de AJAX.
			}
		}catch (e) {
			if (e.description == null) {
			    ftratarError(parametros,e.message);
			} else {
				ftratarError(parametros,e.description);
			}			

		}
	}
	
	// Realiza la petición de los datos del objeto de negocio según el tipo de conexión
	function fgetDatosObjetoNegocio(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getDatosObjetoNegocio(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getDatosObjetoNegocio(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	//Realiza la subida de datos al objeto de negocio según el tipo de conexión.
	function fsetDatosObjetoNegocio(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.setDatosObjetoNegocio(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.setDatosObjetoNegocio(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
	// Realiza la petición de los datos de la paleta telefónica según el tipo de conexión
	function fgetDatosPaletaTelefonica(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getDatosPaletaTelefonica(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getDatosPaletaTelefonica(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
	
	//Realiza la subida de datos a la paleta telefónica según el tipo de conexión.
	function fsetDatosPaletaTelefonica(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.setDatosPaletaTelefonica(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.setDatosPaletaTelefonica(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
		
	// Realiza la petición de los datos de la paleta telefónica según el tipo de conexión
	function fgetIsPaletaTelefonicaActiva(parametros){
		try{
			if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_RPC){
				comProxyApp2Esc.rpc.getIsPaletaTelefonicaActiva(parametros);
			}
			else if (parametrosConexion["tipoConexion"]== comApp2Esc.util.T_COMU_AJAX){
				comProxyApp2Esc.ajax.getIsPaletaTelefonicaActiva(parametros);
			}
			else{
				throw new Error(comApp2Esc.util.COD_ERROR_DATOS_CONEXION);
			}
		}catch (e) {
			throw e;
		}
	}
	
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
	
		/**
		 * Inicia los mecanismos de comunicación con la página padre( la página que contiene el frame proxy).  
		 */
		inicializar : function(){
			try{
				finicializar();
			}catch (e) {
				// TODO: handle exception
			}
		},
		
		/**
		 * Inicia los mecanismos de comunicación con la página padre( la página que contiene el frame proxy).  
		 */
		liberar : function(){
			try{
				fliberar();
			}catch (e) {
				// TODO: handle exception
			}
		},
		
		/**
		 * Inicia los mecanismos de comunicación con la página hija( la página contenida desde la página proxy).  
		 */
		iniciarComunicacion : function(parametros){
			try{
				finicializarComunicacion(parametros);
			}catch (e) {
				// TODO: handle exception
			}
		},

		/**
		 * Realiza la petición de ejecución de operación sobre la página padre.  
		 * @param parametros: parametros enviados desde la página hija a la página padre.
		 */
		lanzarOperacion : function(parametros){
			try{
				flanzarOperacion(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}
			
		},
		
		/**
		* Realiza la petición de la función de callback del lanzamiento de operación, la subida y la bajada del objeto de negocio
		* y la paleta teléfonica desde la página padre.
		* @param parametros: parametros enviados desde la página padre a la página hija.
		*/
		callbackProxy: function(parametros){
			try{
				fcallbackProxy(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}
		},
		
		
		/**
		 * Realiza la notificación a la página padre para que realice el cierre de la tarea.
		 * @param parametros: parámetros enviados desde la página padre a la página hija.
		 */
		cerrarTarea : function(parametros){
			try{
				fcerrarTarea(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}
		},
		
		/**
		* Solicita a la página padre el tipo de las operaciones informamdas por parámetro
		* @param parametros: parámetros enviados desde la página hija a la página padre
		*/
		getTipoOperaciones: function(parametros){
			try{
				fgetTipoOperaciones(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}			
		},
		
		/**
		 * Realiza la petición de la función de callback de la obtención del tipo de operaciones desde la página padre.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		 */
		callbackGetTipoOperaciones: function (parametros){
			try{
				fcallbackGetTipoOperaciones(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}		
		},
		
		/**
		* Solicita a la página padre la autorización de las operaciones informadas por parámetro
		* @param parametros: parámetros enviados desde la página hija a la página padre
		*/
		getIsOperacionPermitida: function(parametros){
			try{
				fgetIsOperacionPermitida(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}			
		},
		
		/**
		 * Realiza la petición de la función de callback de la obtención de la autorización de operaciones desde la página padre.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		 */
		callbackGetIsOperacionPermitida: function (parametros){
			try{
				fcallbackGetIsOperacionPermitida(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}		
		},
		
		/**
		* Solicita a la página padre la definición de las operaciones informadas por parámetro
		* @param parametros: parámetros enviados desde la página hija a la página padre
		*/
		getIsOperacionDefinida: function(parametros){
			try{
				fgetIsOperacionDefinida(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}			
		},
		
		/**
		 * Realiza la petición de la función de callback de la obtención de la definición de operaciones desde la página padre.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		 */
		callbackGetIsOperacionDefinida: function (parametros){
			try{
				fcallbackGetIsOperacionDefinida(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}		
		},
		
		/**
		* Realiza la petición de confirmación de conexión, además de inicializar los parámetros de conexión.
		*/
		confirmarConexion: function (parametros){
			try{
				fconfirmarConexion(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}		
		},
		
		/**
		* Solicita al Escritorio los datos del objeto de negocio
		* @param parametros: JSON con el 
		* 
		*/
		getDatosObjetoNegocio: function(parametros){
			try{
				fgetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Realiza la petición de subida de datos al objeto de negocio.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato JSON )
		 */
		setDatosObjetoNegocio : function(parametros){
			try{
				fsetDatosObjetoNegocio(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		* Solicita al Escritorio los datos de la paleta telefónica
		* @param parametros: JSON con el 
		* 
		*/
		getDatosPaletaTelefonica: function(parametros){
			try{
				fgetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		 * Realiza la petición de subida de datos a la paleta telefónica.  
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato JSON )
		 */
		setDatosPaletaTelefonica : function(parametros){
			try{
				fsetDatosPaletaTelefonica(parametros);
			}catch (e) {
				throw e;
			}			
		},
		
		/**
		* Solicita a la página padre el tipo de las operaciones informamdas por parámetro
		* @param parametros: parámetros enviados desde la página hija a la página padre
		*/
		getOficinaOpPlus: function(parametros){
			try{
				fgetOficinaOpPlus(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}			
		},
		
		/**
		 * Realiza la petición de la función de callback de la obtención del tipo de operaciones desde la página padre.
		 * @param parametros: JSON con el conjunto de operaciones junto con el tipo de operación, con el formato: {"operaciones":[{"op":"op1","tipo":"P"},{"op":"op2","tipo":"S"},...]}
		 */
		callbackGetOficinaOpPlus: function (parametros){
			try{
				fcallbackGetOficinaOpPlus(parametros);
			}catch (e) {
				if (e.description == null) {
				    ftratarError(parametros,e.message);
				} else {
					ftratarError(parametros,e.description);
				}			

			}		
		},
		
		/**
		* Pregunta al escritorio si la Paleta Telefónica está activa
		* @param parametros: JSON con la función de callback parametros={"callback":funciondecallback}
		* @return parametros: JSON con la respuesta {"activa":"true"}
		*/
		getIsPaletaTelefonicaActiva: function(parametros){
			try{
				fgetIsPaletaTelefonicaActiva(parametros);
			}catch (e) {
				throw e;
			}			
		}


	};
	
}(); 

