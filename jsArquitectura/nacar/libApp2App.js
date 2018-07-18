/**
 * Librería cliente de interacción entre aplicaciones
 *
 */
 
var appPublico = function(){

	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	/**
	* Realiza el cierre de la ventana
	*/
	function fcerrarVentana(datos){
		var modoComunicacion = app2app.utils.funcionGetModoComunicacion();
		var origenComunicacion = app2app.utils.funcionGetOrigenComunicacion();
		if (modoComunicacion!=null && modoComunicacion!="" && origenComunicacion!=null && origenComunicacion!=""){

			if (modoComunicacion==app2app.utils.T_COMU_RPC && origenComunicacion===app2app.utils.T_COMU_ORIGEN_APLICACION){
				//Se establece el receptor de datos
				var entrada = {
					"frame":""		
				};
				app2app.comu.rpc.establecerReceptor(entrada);

				//Se invoca la funcion de cierre
				var parametrosOp = {
					"idfuncion":"cerrar",
					"datos":datos
				};		
				app2app.comu.rpc.invocarFuncion(parametrosOp);
			}else if ((modoComunicacion==app2app.utils.T_COMU_AJAX && origenComunicacion===app2app.utils.T_COMU_ORIGEN_NACAR20)
					|| (modoComunicacion==app2app.utils.T_COMU_RPC && origenComunicacion===app2app.utils.T_COMU_ORIGEN_ESCENIA)){
				if (typeof(app2esc)!=undefined && app2esc!=null){
					try {
						app2esc.cerrarTarea(datos);			
					}catch(e) {
						throw e;
					}
				}
			}

		}
		else {
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_CONTEXTOJS, 
				"desError": app2app.utils.DES_ERROR_CONTEXTOJS
			};
			app2app.utils.funcionError(parametrosError);
		}
		
	
	}
	
	/**
	* Realiza la ejecucion de la operacion que se realizara en el app2app.logica
	*/
	function flanzaOperacion(datos){
		app2app.logica.lanzarOperacion(datos);		
	}
	
	/**
	* Realiza la ejecucion de la operacion que se realizara en el app2app.logica
	*/
	function fLlamarFuncion(parametros){
		var parametrosOp = {
			"idfuncion":"ejecutarFuncion",
			"datos":parametros,
			"frame":parametros["frame"]
		};		
		app2app.comu.rpc.invocarFuncion(parametrosOp);		
	}
	
	/**
	* Realiza la ejecucion de la operacion que se realizara en el app2app.logica
	*/
	function finiciarComunicacion(){
		app2app.logica.iniciarComunicacion();		
	}
	
return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/
		 
		/**
		 * Funcion que realiza el cierre de la ventana
		 * @datos parametros: objeto con los parámetros de entrada (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		rc: Indica si ha teminado correctamente (rc='0') o si ha finalizado por error (rc='2').
		 * 		datos: Indica los datos que se propagan a la funcion de callback
		 */ 
		cerrarVentana : function(datos){
			try{
				fcerrarVentana(datos);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Crea una ventana modal por capas 
		 * @parametros parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		operacion: Operacion que se desea ejecutar en la ventana.
		 *		presentacion: Indica el tipo de ventana que se quiere mostrar
		 *		datosEntrada: Parámetros de entrada de la operación.
		 * 		properties: Caracteristicas de presentacion de la ventana
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la ventana.
		 *		ferror: Función de error aplicativa que se invocará ante un error en la ventana.
		 */
		 
		lanzarOperacion : function(parametros){
			try{
				flanzaOperacion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		llamarFuncion : function (parametros){
			try{
				fLlamarFuncion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		iniciarComunicacion : function (){
			try{
				finiciarComunicacion();
			}catch (e) {
				throw e;
			}
		}
	};

}
 
var app2app = new appPublico(); 
 
//Utilidades comunes
 app2app.utils = function(){
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	
	var T_COMU_RPC = "rpc";
	var T_COMU_AJAX = "ajax";
	var T_COMU_ORIGEN_ESCENIA = "2";
	var T_COMU_ORIGEN_NACAR20 = "0";
	var T_COMU_ORIGEN_APLICACION = "1";


	//Id de la peticion periodica de mantenimiento de sesion
	var idAlive=null;
	
	//Url de desconexion
	var urlDesconexion="";
	
	//Funcion de callback
	var callback="";
	
	//URL de la ventana a invocar
	var urlVentana="";
	
	// Identificador del frame aplicativo
	var frameAplicativo="";
	
	//Datos que se enviaran por POST en app2app.html
	var CONTEXTO = "";
	var DatosEntrada = "";
	var idTareaSpring = "";
	
	//variable que indica el tipo de ventana que se va a mostrar
	var tipoVentana=-1;
	
	//Variables que indican el navegador donde se ejecuta la operacion
	var ns=false;
	var ie=false;
	
	//Funcion de error
	var ferror="";
	
	//Constantes
	var VENTANA_MODAL = 0;
	var VENTANA_COMPLETA= 1;
	var VENTANA_APLICATIVA = 2;
	var VENTANA_EXTERNA= 3;
	var FRAME_VENTANA="frameVentana";
	var TIEMPO_REFRESCO = 540000;//Se envia una peticion cada 9 minutos
	var RECURSO_INTERMEDIO="?url=";
	
	//Mensajes de error
	var MSJ_ERROR_CONFIGURACION="ERROR DE CONFIGURACION DE LA APLICACION";
	
	//Codigos de error y descripciones asociadas
	var COD_ERROR_GENERICO = 218590746;
	var DES_ERROR_GENERICO = "Error no especificado";
	
	var COD_ERROR_PARAMETROS_ENTRADA = 218590747;
	var DES_ERROR_PARAMETROS_ENTRADA = "Error en los parametros de entrada";
	
	var COD_ERROR_RESPUESTA_SERVLET = 218590748;
	var DES_ERROR_RESPUESTA_SERVLET = "Error: El servlet no ha devuelto respuesta";
	
	var COD_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA = 218590749;
	var DES_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA = "Error: El servlet no ha informado la URL que se debe lanzar";
	
	var COD_ERROR_VENTANA_COMPLETA = 218590750;
	var DES_ERROR_VENTANA_COMPLETA = "Error al construir la ventana a tamano completo";
	
	var COD_ERROR_VENTANA_MODAL = 218590751;
	var DES_ERROR_VENTANA_MODAL = "Error al construir la ventana modal";
	
	var COD_ERROR_VENTANA_APLICATIVA = 218590754;
	var DES_ERROR_VENTANA_APLICATIVA = "Error al identificar el frame aplicativo";
	
	var COD_ERROR_VENTANA_EXTERNA = 218590755;
	var DES_ERROR_VENTANA_EXTERNA = "Error al lanzar la operación en ventana externa";
	
	var COD_ERROR_RPC = 218590752;
	var DES_ERROR_RPC = "ERROR TECNICO EN LIBRERIA RPC";
		
	var COD_ERROR_CONTEXTOJS = 218590753;
	var DES_ERROR_CONTEXTOJS = "ERROR DE CONFIGURACION DE LA APLICACION";
	
	var COD_ERROR_RECURSO_HTML_INTERMEDIO = 218590757;
	var DES_ERROR_RECURSO_HTML_INTERMEDIO = "ERROR EN LA DEFINICION DEL RECURSO HTML INTERMEDIO POR LA APLICACION";
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	
	/**
	* Comprueba el navegador en el que se ejecuta la operacion
	*/
	function fcompruebaNavegador(){
		var n=navigator.appName;
		if (n=='Netscape'){
			app2app.utils.ns=true;
		}else if(n=='Microsoft Internet Explorer'){
			app2app.utils.ie=true;
		}
	}
	
	
	function fcheckNavegador() {
    var ua= navigator.userAgent, 
    N= navigator.appName, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i) || [];
    M= M[2]? [M[1], M[2]]:[N, navigator.appVersion, '-?'];
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	return M.join(' ');
	}
	
	/**
	* Funcion que comprueba si estoy en firefox 2 o en otro navegador
	*/
	function fisNavegadorFirefox2(){
	
		if(window.isNavegadorFF2=="undefined" || window.isNavegadorFF2==undefined || window.isNavegadorFF2=="null" || window.isNavegadorFF2==null){
			var agente=navigator.userAgent;
			if(agente.indexOf("Firefox/")!=-1){
				var version=agente.substring(agente.indexOf("Firefox/")+"Firefox/".length,agente.indexOf("Firefox/")+"Firefox/".length+1);
				if(version!=null && version!=undefined && version=='2'){
					window.isNavegadorFF2=true;
					return true;
				}else{
					window.isNavegadorFF2=false;
					return false;
				}
			}else{
				if(agente.indexOf("BonEcho/")!=-1){
					var versionLinux=agente.substring(agente.indexOf("BonEcho/")+"BonEcho/".length,agente.indexOf("BonEcho/")+"BonEcho/".length+1);
					if(versionLinux!=null && versionLinux!=undefined && versionLinux=='2'){
						window.isNavegadorFF2=true;
						return true;
					}else{
						window.isNavegadorFF2=false;
						return false;
					}
				}else{
					if(agente.indexOf("rv:")!=-1){
						var versionWindows=agente.substring(agente.indexOf("rv:")+"rv:".length,agente.indexOf("rv:")+"rv:".length+3);
						if(versionWindows!=null && versionWindows!=undefined && versionWindows=='1.8'){
							window.isNavegadorFF2=true;
							return true;
						}else{
							window.isNavegadorFF2=false;
							return false;
						}
					}else{
						window.isNavegadorFF2=false;
						return false;
					}
				}
			}
		}else{
			if(window.isNavegadorFF2==true)
			{
				return true;
			}else{
				return false;
			}
		}
	}
	
	function fgetInternetExplorerVersion(){
		// Returns the version of Internet Explorer or a -1
		// (indicating the use of another browser).

		var rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer'){
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
				rv = parseFloat( RegExp.$1 );
		}
		return rv;
	}
	
	/**
	* Funcion que comprueba si la ventana modal tiene datos para enviar al cerrarse
	*/
	function fcerrarVentana(datos){
		
		//Desactiva las peticiones periodicas de mantenimiento de sesion
		clearInterval(app2app.utils.idAlive);
		
		enviaUrlDesconexion();
		
		//Se recupera el frame que invocó a la ventana Modal (en caso de existir)
		if (app2app.utils.frameAplicativo=="" || app2app.utils.frameAplicativo==undefined || app2app.utils.frameAplicativo==null){
			cerrarCapas();
					
			if (typeof(document.getElementById('divcontenedor'))==undefined || document.getElementById('divcontenedor')==null){
				document.body.style.overflow = "";
			}
		}	
		//Se invoca la funcion de callback en caso que se haya indicado en los parametros de entrada
		if (app2app.utils.callback!=null && typeof(app2app.utils.callback)=="function" && app2app.utils.callback!=""){
			app2app.utils.callback(datos);
		}		
		try {
			ProxyApp2Esc.liberar();
		}catch (e) {
		}
		app2app.utils.frameAplicativo="";
		app2app.utils.callback="";
	}
	
	/**
	* Funcion que oculta las capas que forman la ventana
	*/
	function cerrarCapas() {

		// Devolvemos el foco al padre y eliminamos el evento que enfoca a la modal
		if (app2app.utils.ie==true){
			document.body.onfocusin=null;
			document.body.firstChild.parentNode.focus();
			document.body.firstChild.parentNode.onresize=null;
		}
		
		//Ocultamos la capa bloqueadora
		var ventanaEmergente= document.getElementById("divcontenedor");
		ventanaEmergente.style.zIndex=0;
		ventanaEmergente.style.overflow="hidden";

		var frameinterno= document.getElementById('frameinterno');
		
		if (frameinterno!=null && frameinterno!=undefined){
			frameinterno.src="about:blank";
		}
		//Hacemos invisible la ventana emergente
		ventanaEmergente.style.display='none';
		var capaOculta= document.getElementById("McapaOculta");
		
		if (capaOculta!=null && capaOculta!=undefined){
			capaOculta.style.display="none";
		}
		//Se recupera el objeto body, bien directamente del document o del Formulario
		var objetoBody = null;
		if(document.body != null && document.body != undefined){
			objetoBody = document.body;
		}
		else if(document.forms[0] != null && document.forms[0]!= undefined){
			objetoBody = document.forms[0].parentNode;
		}
		document.body.style.overflow = "auto";
		document.body.style.overflowX = "auto";
		document.body.style.overflowY = "auto";
		
		document.documentElement.style.overflow = "auto";
		document.documentElement.style.overflowX = "auto";
		document.documentElement.style.overflowY = "auto";
				
		// En IE6 se tiene que ocultar el scroll del padre.
		if (app2app.utils.getInternetExplorerVersion() == "6"){
			document.body.parentNode.style.overflow="auto";
		}
		
		//Se elimina el html generado para crear la ventana modal
		if (ventanaEmergente!=undefined && ventanaEmergente!=null)
		{
			if (frameinterno!=undefined && frameinterno!=null)
			{
				ventanaEmergente.removeChild(frameinterno);
			}
		if (capaOculta!=undefined && capaOculta!=null)
		{
				  ventanaEmergente.removeChild(capaOculta);
			}
			if(objetoBody != null){
			  objetoBody.removeChild(ventanaEmergente);		
			}
		}
	}
	
	/**
	* Función encargada de crear la capa que oculta la ventana invocante
	*/
	function fgestionaFocoVentanaModal(iframe){
		// Se inserta el evento onFocus en la ventana padre. La función despacharFocoAVentanaModal() será
		//la primera que se ejecuta en el momento que la ventana padre obtenga el foco
		if (this.addEventListener) { // Mozilla, Netscape, Firefox
			this.addEventListener("focus", function(){despacharFocoAVentanaModal(iframe)}, true);
		}else { //IE
			document.body.onfocusin = function(){despacharFocoAVentanaModal(iframe)};
		}
		  
		// El frame interno reclama el foco y se le asigna
		var frameInt = document.getElementById(iframe);
		if(frameInt != null && frameInt != undefined){
			if(frameInt.contentWindow != null && frameInt.contentWindow != undefined){
				//La ventana contenida en el frame Interno reclama el foco
				frameInt.contentWindow.focus();
			}else{
				//el frame Interno reclama el foco
				frameInt.focus();
			}
		}
	}
	
	/**
	* Función que despacha el foco a la ventana modal.
	*/
	function despacharFocoAVentanaModal(iframe){
	  //Se recupera el IFRAME que contiene la ventana modal y se le asigna el foco
	  var iframeInt = document.getElementById(iframe);
	  if(iframeInt!=null && iframeInt!=undefined){
		if(iframeInt.contentWindow != null && iframeInt.contentWindow != undefined){
		   setTimeout(function(){
				iframeInt.contentWindow.focus();
			}
			,10);
		}
		else{
			setTimeout(function(){
			iframeInt.focus();
			}
			,10);
		}
	  }
	}	
	
	/**
	* Función que añade un manejador al evento 'onresize' para Internet Explorer.
	*/
	function fgestionaRedimensionamiento(div){
		// Se inserta el evento onResize en la ventana padre
		if (app2app.utils.ie) {
			document.body.onresize = function() {redimensionaDivContenedor(div)};
		}
	}
	
	/**
	* Función que redimensiona tanto la ventana completa como la capa oculta de la modal.
	*/
	function redimensionaDivContenedor(div){
		
		var objDIVContenedor = document.getElementById(div);	
		var dim = app2app.utils.getBox();	
		
		dim.x = dim.x + "px";
		dim.y = dim.y + "px";
		dim.h = dim.h + "px";
		dim.w = dim.w + "px";

		objDIVContenedor.style.zIndex=101;	
		objDIVContenedor.style.overflow="hidden";
		objDIVContenedor.style.overflowX="hidden";
		objDIVContenedor.style.overflowY="hidden";
		objDIVContenedor.style.width=dim.w;
		
		// La altura para el caso de la capa oculta la redimensiona de manera automática
		if (div == "divcontenedor") {
			objDIVContenedor.style.height=dim.h;
		}
		objDIVContenedor.style.position="absolute";
		objDIVContenedor.style.top=dim.y;
		objDIVContenedor.style.left=dim.x;			
		objDIVContenedor.style.display="block";
		objDIVContenedor.setAttribute("frameborder","0");
		objDIVContenedor.setAttribute("height",dim.h);
		objDIVContenedor.setAttribute("width",dim.w);
		
	}

	/**
	* Envia la url de desconexion
	*/
	function enviaUrlDesconexion(){
		if (app2app.utils.urlDesconexion!=null && app2app.utils.urlDesconexion!=""){
			if (app2app.utils.frameAplicativo!=null && app2app.utils.frameAplicativo!="" && app2app.utils.frameAplicativo!=undefined){
				var objFrameAplicativo = document.getElementById(app2app.utils.frameAplicativo);
				objFrameAplicativo.setAttribute("src",app2app.utils.urlDesconexion);
			}else{
				//Se recupera el div donde esta contenido el iframe invocado
				var div = document.getElementById("divcontenedor").innerHTML;
				
				//Se recupera la url invocada y se sustituyen los caracteres conflictivos a HTML
				UrlAntiguaCodificadaHtml=codificaHtml(app2app.utils.urlVentana);
				
				//Se sustitute la url antigua por la url de desconexion
				div=app2app.utils.replaceTexto(div,UrlAntiguaCodificadaHtml,app2app.utils.urlDesconexion);
				
				//Se envia la url de desconexion
				document.getElementById("divcontenedor").innerHTML = div;
			}
		}
	}
	
	/**
	* Codifica un string en codificacion HTML (Transforma los caracteres &, <, >, ", ' y espacio en blanco por sus correspondientes en HTML)
	*/
	function codificaHtml(texto){
		var textoHtml="";
		if (texto!=null && texto!=undefined && texto!=""){
			textoHtml=texto.replace(/&/g,'&amp;');
			textoHtml=textoHtml.replace(/</g,"&lt;");
			textoHtml=textoHtml.replace(/>/g,"&gt;");
			textoHtml=textoHtml.replace(/"/g,"&quot;");
			textoHtml=textoHtml.replace(/ /g,"&nbsp;");
			textoHtml=textoHtml.replace(/'/g,"&apos;");
		}		
		return textoHtml;
	}
	
	/**
	* Envia las peticiones periodicas para mantenimiento de sesion
	*/
	function fmantenimientoSesion(){
		app2app.utils.idAlive=setInterval("app2app.ajax.peticionSimple()",TIEMPO_REFRESCO);
	}
	
	/**
	*  Reemplaza la cadena "s1" por "s2" en la cadena "texto"
	*/
	function freplaceTexto(texto,s1,s2){
		return texto.split(s1).join(s2);
	}
	
	/**
	*  Funcion error que llama a la funcion de error recibida como parametro o a la función error por defecto
	*/
	function ffuncionError(parametrosError){
	
		//Si no viene informado el codigo de error se asigna el codigo error generico
		if (parametrosError['codError']==null || parametrosError['codError']==undefined || parametrosError['codError']==""){
			parametrosError['codError']=COD_ERROR_GENERICO;
			parametrosError['desError']=DES_ERROR_GENERICO;
		}
		
		if (app2app.utils.ferror==""){
			//No viene la funcion de error informada asi que se llama a la funcion de error por defecto
			funcionErrorDefecto(parametrosError);
		}else{
			//Se llama a la funcion de error informada en los parametros de entrada
			app2app.utils.ferror(parametrosError);
		}
	}
	
	/**
	*  Funcion error por defecto que lanza una excepcion
	*/
	function funcionErrorDefecto(parametrosError){
	
		throw new Error("Se ha producido un error. Codigo de error: "+parametrosError['codError']+"; Descripcion: "+parametrosError['desError']);
	}
	
	/**
	*  Asigna los estilos al elemento html indicado
	*/
	function f_setStyle(element, declaration) {        
	   if (declaration.charAt(declaration.length-1)==';')
		 declaration = declaration.slice(0, -1);
	   var k, v;
	   var splitted = declaration.split(';');
	   for (var i=0, len=splitted.length; i<len; i++) {
		  k = rzCC(splitted[i].split(':')[0]);
		  v = splitted[i].split(':')[1];
		  eval("element.style."+k+"='"+v+"'");
	   }
	}
	
	function rzCC(s){
	   for(var exp=/-([a-z])/; 
		   exp.test(s); 
		   s=s.replace(exp,RegExp.$1.toUpperCase()));
	   return s;
	}
	
	// Determina el modo de comunicación con el origen
	function fgetModoComunicacion(){
		var modoComunicacion = "";
		if (typeof(contextoJS)!=undefined && contextoJS!=null && 
			typeof(contextoJS.getTecnicosArq())!=undefined && contextoJS.getTecnicosArq()!=null &&
			typeof(contextoJS.getTecnicosArq().getOrigen())!=undefined && contextoJS.getTecnicosArq().getOrigen()!=null &&
			typeof(contextoJS.getTecnicosArq().getOrigen().getModo())!=undefined && contextoJS.getTecnicosArq().getOrigen().getOrigen()!=null){
				modoComunicacion = contextoJS.getTecnicosArq().getOrigen().getOrigen();
			}
		return modoComunicacion;
	}
	
	// Determina el modo de comunicación con el origen
	function fgetOrigenComunicacion(){
		var origenComunicacion = "";
		if (typeof(contextoJS)!=undefined && contextoJS!=null && 
			typeof(contextoJS.getTecnicosArq())!=undefined && contextoJS.getTecnicosArq()!=null &&
			typeof(contextoJS.getTecnicosArq().getOrigen())!=undefined && contextoJS.getTecnicosArq().getOrigen()!=null &&
			typeof(contextoJS.getTecnicosArq().getOrigen().getOrigen())!=undefined && contextoJS.getTecnicosArq().getOrigen().getModo()!=null){
				origenComunicacion = contextoJS.getTecnicosArq().getOrigen().getModo();
			}
		return origenComunicacion;
	}
	
	    // always return 1, except at non-default zoom levels in IE before version 8
    function getZoomFactor () {
        var factor = 1;
        if (document.body.getBoundingClientRect) {
			// rect is only in physical pixel size in IE before version 8 
			var rect = document.body.getBoundingClientRect ();
			var physicalW = rect.right - rect.left;
			var logicalW = document.body.offsetWidth;
            // the zoom level is always an integer percent value
            factor = Math.round ((physicalW / logicalW) * 100) / 100;
        }
        return factor;
    }

	// Calcula el tamaño de la ventana completa para IE
	function fgetBox(object) {
		
		var div = document.body.parentNode;				
		if (typeof(object)!='undefined' && object!=null)
		{
			div = object;
		}
						
		if (navigator.appName.toLowerCase () == "microsoft internet explorer") {
			var rect = div.getBoundingClientRect ();
			x = rect.left;
            y = rect.top;
            w = rect.right - rect.left;
            h = rect.bottom - rect.top;

            if (navigator.appName.toLowerCase () == "microsoft internet explorer") {
				// the bounding rectangle include the top and left borders of the client area
				x -= document.documentElement.clientLeft;
                y -= document.documentElement.clientTop;

                var zoomFactor = getZoomFactor ();
                if (zoomFactor != 1) {  // IE 7 at non-default zoom level
					x = Math.round (x / zoomFactor);
					y = Math.round (y / zoomFactor);
					w = Math.round (w / zoomFactor);
					h = Math.round (h / zoomFactor);
				}
			}
		}
		return {'x':x , 'y':y , 'w':w, 'h':h};
	}	
	
	return{
		
		/************************************************************************************************************************
		* Atributos publicos
		************************************************************************************************************************/ 
		T_COMU_RPC: T_COMU_RPC,
		T_COMU_AJAX: T_COMU_AJAX,		
		T_COMU_ORIGEN_ESCENIA: T_COMU_ORIGEN_ESCENIA,
		T_COMU_ORIGEN_NACAR20: T_COMU_ORIGEN_NACAR20,
		T_COMU_ORIGEN_APLICACION:T_COMU_ORIGEN_APLICACION,
		idAlive:idAlive,
		urlDesconexion:urlDesconexion,
		callback:callback,
		urlVentana:urlVentana,
		CONTEXTO:CONTEXTO,
		DatosEntrada:DatosEntrada,
		idTareaSpring:idTareaSpring,
		tipoVentana:tipoVentana,
		ns:ns,
		ie:ie,
		ferror:ferror,
		VENTANA_MODAL: VENTANA_MODAL,
		VENTANA_COMPLETA: VENTANA_COMPLETA,
		VENTANA_APLICATIVA:VENTANA_APLICATIVA,
		VENTANA_EXTERNA:VENTANA_EXTERNA,
		RECURSO_INTERMEDIO:RECURSO_INTERMEDIO,
		FRAME_VENTANA: FRAME_VENTANA,
		COD_ERROR_PARAMETROS_ENTRADA:COD_ERROR_PARAMETROS_ENTRADA,
		DES_ERROR_PARAMETROS_ENTRADA:DES_ERROR_PARAMETROS_ENTRADA,
		COD_ERROR_RESPUESTA_SERVLET:COD_ERROR_RESPUESTA_SERVLET,
		DES_ERROR_RESPUESTA_SERVLET:DES_ERROR_RESPUESTA_SERVLET,
		COD_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA:COD_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA,
		DES_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA:DES_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA,
		COD_ERROR_VENTANA_COMPLETA:COD_ERROR_VENTANA_COMPLETA,
		DES_ERROR_VENTANA_COMPLETA:DES_ERROR_VENTANA_COMPLETA,
		COD_ERROR_VENTANA_MODAL:COD_ERROR_VENTANA_MODAL,
		DES_ERROR_VENTANA_MODAL:DES_ERROR_VENTANA_MODAL,
		COD_ERROR_VENTANA_APLICATIVA:COD_ERROR_VENTANA_APLICATIVA,
		DES_ERROR_VENTANA_APLICATIVA:DES_ERROR_VENTANA_APLICATIVA,
		COD_ERROR_VENTANA_EXTERNA:COD_ERROR_VENTANA_EXTERNA,
		DES_ERROR_VENTANA_EXTERNA:DES_ERROR_VENTANA_EXTERNA,		
		COD_ERROR_RPC:COD_ERROR_RPC,
		DES_ERROR_RPC:DES_ERROR_RPC,
		COD_ERROR_CONTEXTOJS:COD_ERROR_CONTEXTOJS,
		DES_ERROR_CONTEXTOJS:DES_ERROR_CONTEXTOJS,
		COD_ERROR_RECURSO_HTML_INTERMEDIO:COD_ERROR_RECURSO_HTML_INTERMEDIO,
		DES_ERROR_RECURSO_HTML_INTERMEDIO:DES_ERROR_RECURSO_HTML_INTERMEDIO,
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		
		compruebaNavegador : function(){
			try{
				fcompruebaNavegador();
			}catch (e) {
				throw e;
			}
		},

		cerrarVentana : function(datos){
			try{
				fcerrarVentana(datos);
			}catch (e) {
				throw e;
			}
		},
		
		gestionaFocoVentanaModal: function(iframe){
			try{
				fgestionaFocoVentanaModal(iframe);
			}catch (e) {
				throw e;
			}
		},
		
		gestionaRedimensionamiento: function(div){
			try{
				fgestionaRedimensionamiento(div);
			}catch (e) {
				throw e;
			}
		},
		
		mantenimientoSesion: function(){
			try{
				fmantenimientoSesion();
			}catch (e) {
				throw e;
			}
		},
		
		peticionAjax: function(){
			try{
				fpeticionAjax();
			}catch (e) {
				throw e;
			}
		},
		
		respuestaAjax: function(){
			try{
				frespuestaAjax();
			}catch (e) {
				throw e;
			}
		},
		
		replaceTexto: function(texto,s1,s2){
			try{
				return freplaceTexto(texto,s1,s2);
			}catch (e) {
				throw e;
			}
		},
		
		_setStyle: function (element, declaration) { 
			try{
				return f_setStyle(element, declaration);
			}catch (e) {
				throw e;
			}
		
		},
		
		isNavegadorFirefox2: function () { 
			try{
				return fisNavegadorFirefox2();
			}catch (e) {
				throw e;
			}
		
		},
		
		getInternetExplorerVersion: function () { 
			try{
				return fgetInternetExplorerVersion();
			}catch (e) {
				throw e;
			}
		
		},
		
		/**
		 * Funcion de error 
		 * @param parametrosError: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		codError: codigo de error
		 * 		desError: Descripcion del error asociado
		 */
		funcionError: function(parametrosError){
			try{
				ffuncionError(parametrosError);
			}catch (e) {
				throw e;
			}
		},
		
		
		/**
		 * Retorna el modo de comunicación con el origen: RPC o AJAX. En caso de retornar el valor "" se considerará que se debe a un error. 
		 */
		funcionGetModoComunicacion: function(){
			try{
				return fgetModoComunicacion();
			}catch (e) {
				throw e;
			}
		},
		
		
		/**
		 * Retorna el origen de comunicación con el origen: Portal, Escritorio o Aplicacion. En caso de retornar el valor "" se considerará que se debe a un error. 
		 */
		funcionGetOrigenComunicacion: function(){
			try{
				return fgetOrigenComunicacion();
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Retorna posición y dimensiones de la ventana padre
		 */
		getBox: function(object){
			try{
				return fgetBox(object);
			}catch (e) {
				throw e;
			}
		}
	};
	
}(); 
 
//Objeto de presentacion
app2app.pres = app2app.pres || {}; 
 
//Implementa la ventana modal
 app2app.pres.VM = function(){
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var propiedadAncho="dialogWidth";
	var propiedadAlto="dialogHeight";
	var propiedadScroll="scrolling";
	var propiedadTop="dialogTop";
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	
	/**
	* Crea el iframe que se mostrara
	*/
	function fcrearVentanaModal(parametros){
		
		var newAncho="0";
		var newAlto="0";
		var newTop="0";
		var newScroll="true";
		if (parametros['properties']!=null && parametros['properties']!=undefined){
			
			newAncho=trataPropiedadVentana(parametros['properties'],propiedadAncho);
			newAlto=trataPropiedadVentana(parametros['properties'],propiedadAlto);
			newTop=trataPropiedadVentana(parametros['properties'],propiedadTop);
			newScroll=trataPropiedadVentana(parametros['properties'],propiedadScroll);
		}
		
		try{			
			creaActivaVentanaModal(newScroll,parametros['url'],newAncho,newAlto,newTop);	  	
		}catch(error){
	    	//Se ha producido un error en la construccion de la ventana
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_VENTANA_MODAL, 
				"desError": app2app.utils.DES_ERROR_VENTANA_MODAL
			};
			app2app.utils.funcionError(parametrosError);
		}
	}
	
	/**
	* Crea la estructura y muestra la ventana
	*/
	function creaActivaVentanaModal(scrollCapas,url,newAncho,newAlto,newTop){
	
		//Se recupera el objeto body, bien directamente del document o del Formulario
		var objetoBody = null;
		if(document.body != null && document.body != undefined){
			objetoBody = document.body;
		}
		else if(document.forms[0] != null && document.forms[0]!= undefined){
			objetoBody = document.forms[0].parentNode;
		} 
				
		//Ancho
		var ancho = (screen.width)/3;
		if (newAncho!=undefined && newAncho!=null && newAncho!=0 && newAncho!="0"){
			ancho=newAncho;
		}
		//Alto
		var alto = (screen.height)/4;
		var factorCorreccion = 0;
		if (newAlto!=undefined && newAlto!=null && newAlto!=0 && newAlto!="0"){
			alto=newAlto;
		}
		else{
		  //Si no se han definido un alto, se añaden 2 píxeles para centrar la ventana
			factorCorreccion = 2;
		}
		
		//Top
		var topD=0;
		if (newTop!=undefined && newTop!=null && newTop!=0 && newTop!="0"){
			topD=newTop;
		}
		
		//Se calcula el tamaño del frame interno. En el alto, se descuenta el tamaño de la cabecera.
		var altoFrameInterno=alto+factorCorreccion;
		var anchoFrameInterno=ancho;
		// Se ajusta el ancho del contenido de la ventana para IE
		if (app2app.utils.ie==true){//
			anchoFrameInterno=ancho-4;
		}
		
		//Posicion de ancho
		var scrollWidth = 0;
		if(objetoBody != null && objetoBody != undefined){
			scrollWidth = objetoBody.scrollWidth / 2;
		}
		else{
			scrollWidth = screen.width / 2;
		}
		
		var posicionLeft=0;
		if (scrollWidth > (ancho/2)){
			posicionLeft=scrollWidth-(ancho/2);
		}
		
		creaEstructura(objetoBody,altoFrameInterno,anchoFrameInterno,scrollCapas,ancho,topD,posicionLeft,url);
	}
	
	/**
	* Crea la estructura de capas de la ventana
	*/
	function creaEstructura(objetoBody,altoFrameInterno,anchoFrameInterno,scrollCapas,ancho,topD,posicionLeft,url){
		
		
		var alturaTemp1=objetoBody.parentNode.scrollHeight;
		var alturaTemp2=objetoBody.scrollHeight;
		var alto=((alturaTemp1>alturaTemp2) ? alturaTemp1:alturaTemp2);
		//IE6
		alturaTemp1=objetoBody.parentNode.offsetHeight;
		alturaTemp2=((alturaTemp1>alto) ? alturaTemp1:alto);
		
		// Se usa para Firefox, Chrome y Safari
		var width1=objetoBody.parentNode.scrollWidth;
		var width2=objetoBody.scrollWidth;
		var widthPse=((width1>width2) ? width1:width2);
		width2=objetoBody.parentNode.offsetWidth;
		width=((width2>widthPse) ? width2:widthPse);
		
		var dim;
		if (app2app.utils.ie){
			dim = app2app.utils.getBox(document.body.parentNode);		
			dim.x = dim.x + "px";
			dim.y = dim.y + "px";			
			dim.h = alturaTemp2 + "px";
			dim.w = widthPse + "px";
			dim.x = "0px";
			dim.y = "0px";
		}
		else {
			dim ={'x':'0px', 'y':'0px', 'w':width + "px", 'h':alto + "px"}
		}
				
		// Se crea el DIV contenedor
		var objDIVContenedor = document.createElement('div');
		objDIVContenedor.setAttribute("id","divcontenedor");
		
		objDIVContenedor.style.border = "0px";
		objDIVContenedor.style.padding = "0px";
		objDIVContenedor.style.overflow="hidden";
		objDIVContenedor.style.overflowX="hidden";
		objDIVContenedor.style.overflowY="hidden";
		objDIVContenedor.style.width=dim.w;
		objDIVContenedor.style.height=dim.h;
		objDIVContenedor.style.position="absolute";
		objDIVContenedor.style.top=dim.y;
		objDIVContenedor.style.left=dim.x;
		objDIVContenedor.style.display="block";
		objDIVContenedor.setAttribute("frameborder","0");
		objDIVContenedor.setAttribute("height",dim.h);
		objDIVContenedor.setAttribute("width",dim.w);
		
		var alturaTemp1=objetoBody.parentNode.scrollHeight;
		var alturaTemp2=objetoBody.scrollHeight;
		var alto=((alturaTemp1>alturaTemp2) ? alturaTemp1:alturaTemp2);
		//IE6
		alturaTemp1=objetoBody.parentNode.offsetHeight;
		alturaTemp2=((alturaTemp1>alto) ? alturaTemp1:alto);
		
		// Se usa para Firefox, Chrome y Safari
		var width1=objetoBody.parentNode.scrollWidth;
		var width2=objetoBody.scrollWidth;
		var widthPse=((width1>width2) ? width1:width2);
		width2=objetoBody.parentNode.offsetWidth;
		width=((width2>widthPse) ? width2:widthPse);
		
		// Se crea el frame contenedor
		var objDIVInterno = document.createElement('div');
		objDIVInterno.setAttribute("id","divInterno");
	
		objDIVInterno.style.border = "2px solid #036EFF";
		objDIVInterno.style.overflow="hidden";
		objDIVInterno.style.overflowX="hidden";
		objDIVInterno.style.overflowY="hidden";
		objDIVInterno.style.width=anchoFrameInterno + "px";
		objDIVInterno.style.height=altoFrameInterno + "px";
		objDIVInterno.style.position="absolute";
		objDIVInterno.style.top=dim.y;
		objDIVInterno.style.left=posicionLeft + "px";			
		objDIVInterno.style.display="none";
		objDIVInterno.setAttribute("height",altoFrameInterno + "px");
		objDIVInterno.setAttribute("width",anchoFrameInterno + "px");
	
	  	var objIFRAMEInterno = document.createElement('iframe');
		objIFRAMEInterno.setAttribute("name", app2app.utils.FRAME_VENTANA);
		objIFRAMEInterno.setAttribute("id", app2app.utils.FRAME_VENTANA);
		objIFRAMEInterno.setAttribute("src", "javascript:\'\';");
		objIFRAMEInterno.style.position="absolute";
		objIFRAMEInterno.setAttribute("frameborder","0");
		objIFRAMEInterno.setAttribute("height","100%");
		objIFRAMEInterno.setAttribute("width","100%");
	
		if (scrollCapas=="no")
		{
			objIFRAMEInterno.setAttribute("scrolling", "no");
		}
		
		var objDIVFrameCapaOculta = document.createElement('div');
		objDIVFrameCapaOculta.setAttribute("id","McapaOculta");	
		
		objDIVFrameCapaOculta.style.overflow="hidden";
		objDIVFrameCapaOculta.style.overflowX="hidden";
		objDIVFrameCapaOculta.style.overflowX="hidden";		
		objDIVFrameCapaOculta.style.position="absolute";
		objDIVFrameCapaOculta.style.left="0px";
		objDIVFrameCapaOculta.style.height="100%";
		objDIVFrameCapaOculta.style.width="100%";
		objDIVFrameCapaOculta.style.display="none";
		objDIVFrameCapaOculta.style.backgroundColor="#000000";
		objDIVFrameCapaOculta.style.opacity="0.4";
		objDIVFrameCapaOculta.style.filter="alpha(opacity=40)";
		
		objDIVFrameCapaOculta.setAttribute("frameborder","0");
		objDIVFrameCapaOculta.setAttribute("height","100%");
		objDIVFrameCapaOculta.setAttribute("width","100%");
		
		objDIVInterno.appendChild(objIFRAMEInterno);
		objDIVContenedor.appendChild(objDIVFrameCapaOculta);
		app2app.utils.gestionaRedimensionamiento("McapaOculta");
		objDIVContenedor.appendChild(objDIVInterno);		
		
		if (document.body.firstChild){
			document.body.insertBefore(objDIVContenedor, document.body.firstChild);
		} else {
			document.body.appendChild(objDIVContenedor);
		}
		
		var urlHtml=urlRelativaRecursoIntermedio+app2app.utils.RECURSO_INTERMEDIO+url;
		var innerHTMLFrameConvencional = document.getElementById("divInterno").innerHTML;
		innerHTMLFrameConvencional=app2app.utils.replaceTexto(innerHTMLFrameConvencional,"javascript:\'\';",urlHtml);
		document.getElementById("divInterno").innerHTML=innerHTMLFrameConvencional;
		
		if (app2app.utils.ie){
			dim = app2app.utils.getBox(document.body);		
			dim.x = dim.x + "px";
			dim.y = dim.y + "px";
			dim = app2app.utils.getBox(document.body.parentNode);		
			dim.x = dim.x + "px";
			dim.y = dim.y + "px";		
		
			var alturaTemp1=objetoBody.parentNode.scrollHeight;
			var alturaTemp2=objetoBody.scrollHeight;
			var alto=((alturaTemp1>alturaTemp2) ? alturaTemp1:alturaTemp2);
			//IE6
			alturaTemp1=objetoBody.parentNode.offsetHeight;
			alturaTemp2=((alturaTemp1>alto) ? alturaTemp1:alto);
			
			// Se usa para Firefox, Chrome y Safari
			var width1=objetoBody.parentNode.scrollWidth;
			var width2=objetoBody.scrollWidth;
			var widthPse=((width1>width2) ? width1:width2);
			width2=objetoBody.parentNode.offsetWidth;
			width=((width2>widthPse) ? width2:widthPse);
		}

		document.getElementById("McapaOculta").style.zIndex=101;
		document.getElementById("McapaOculta").style.display="block";
		document.getElementById("divInterno").style.zIndex=102;
		document.getElementById("divInterno").style.display="block";
		document.getElementById(app2app.utils.FRAME_VENTANA).style.zIndex=102;
		document.getElementById(app2app.utils.FRAME_VENTANA).style.display="block";
		
		// Gestión del Foco en ventanas modales
		app2app.utils.gestionaFocoVentanaModal(app2app.utils.FRAME_VENTANA);
	}
	
	/**
	* Función encargada de obtener el dato que indica el ancho de la ventana modal
	*/
	function trataPropiedadVentana(propiedades,clave){
		var propiedadIndividual;
		propiedadIndividual=buscarPropiedad(clave,propiedades);
		if(propiedadIndividual=="")
		{
			if (clave==propiedadScroll){
				//Por defecto la ventana tiene scroll
				propiedadIndividual="true";
			}else{
				propiedadIndividual=0;
			}
		}
		return propiedadIndividual;
	}
	
	/**
	* Función encargada de comprobar si existe la propiedad "textoProp" en la cadena "cadenaPropiedades" 
	* y en caso afirmativo devolver la cadena '"valorSustitucion"=valor'
	*/
	function buscarPropiedad(textoProp,cadenaPropiedades){
		var traduccion="";
		if(cadenaPropiedades.indexOf(textoProp)!=-1)
		{
			//la propiedad existe
			var longitudCadena=cadenaPropiedades.length;
			var propiedad=cadenaPropiedades;
			var posPropiedad=propiedad.indexOf(textoProp)+textoProp.length;
			var textoRestante=propiedad.substring(posPropiedad,cadenaPropiedades.length);
			if(textoRestante.indexOf(";")!=-1)
			{
				traduccion=textoRestante.substring(1,textoRestante.indexOf(";")).toLowerCase();
			}else{
				traduccion=textoRestante.substring(1,textoRestante.length).toLowerCase();
			}
			if (textoProp==propiedadScroll){
				return traduccion;	
			}else{
				return parseInt(traduccion);
			}
		}
		return traduccion;
	}
	
	return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/

		/**
		 * Crea una ventana modal por capas 
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		url: URL a mostrar en la ventana modal.
		 * 		properties: Caracteristicas de presentacion de la ventana
		 */
		 
		crearVentanaModal : function(parametros){
			try{
				app2app.utils.compruebaNavegador();
				fcrearVentanaModal(parametros);
				app2app.utils.mantenimientoSesion();
			}catch (e) {
				throw e;
			}
		}
	};
	
}();

//Implementa la ventana completa
 app2app.pres.completo = function(){
 
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	/**
	* Metodo principal que se encarga de leer los parametros de entrada y lanzar la ventana
	*/
	function fcrearVentanaCompleta(parametros){
		try{
			var version = fcheckNavegador();
			// IE8
			if (version=="MSIE 8.0") {				
				if(document.forms[0] == null || document.forms[0]== undefined){
					document.body.parentNode.scrollIntoView(true);						
				}
			}
			
			document.body.style.overflow = "hidden";
			document.body.style.overflowX = "hidden";
			document.body.style.overflowY = "hidden";
			
			if (app2app.utils.ie){
				// IE7
				document.body.parentNode.style.overflowX="hidden";
				document.body.parentNode.style.overflowY="hidden";
			}
			
			
			var dim;
			if (app2app.utils.ie){
				dim = app2app.utils.getBox();		
				dim.x = dim.x + "px";
				dim.y = dim.y + "px";
				dim.h = '100%';
				dim.w = '100%';
				dim.h = document.documentElement.offsetHeight;
				dim.w = document.documentElement.offsetWidth;
				dim.x = document.body.scrollLeft + "px";
				dim.y = "0px";
			}
			else {
				dim ={'x':'0px', 'y':'0px', 'w':'100%', 'h':'100%'}
			}
			
			// Se crea el DIV contenedor
			var objDIVContenedor = document.createElement('div');
			objDIVContenedor.setAttribute("id","divcontenedor");
					
			objDIVContenedor.style.zIndex=100;	
			objDIVContenedor.style.overflow="hidden";
			objDIVContenedor.style.overflowX="hidden";
			objDIVContenedor.style.overflowY="hidden";
			objDIVContenedor.style.width=dim.w;
			objDIVContenedor.style.height=dim.h;
			objDIVContenedor.style.position="absolute";
			objDIVContenedor.style.top=dim.y;
			objDIVContenedor.style.left=dim.x;			
			objDIVContenedor.style.display="none";
			objDIVContenedor.setAttribute("frameborder","0");
			objDIVContenedor.setAttribute("height",dim.h);
			objDIVContenedor.setAttribute("width",dim.w);
			
			// Se crea el frame contenedor
			var objIFRAMEInterno = document.createElement('iframe');
			objIFRAMEInterno.setAttribute("name", app2app.utils.FRAME_VENTANA);
			objIFRAMEInterno.setAttribute("id", app2app.utils.FRAME_VENTANA);
			objIFRAMEInterno.setAttribute("src", "javascript:\'\';");
			objIFRAMEInterno.style.zIndex=101;	
			objIFRAMEInterno.style.position="absolute";
			objIFRAMEInterno.setAttribute("frameborder","0");
			objIFRAMEInterno.setAttribute("height","100%");
			objIFRAMEInterno.setAttribute("width","100%");
			
			objDIVContenedor.appendChild(objIFRAMEInterno);
			document.body.appendChild(objDIVContenedor);
			
			var urlHtml=urlRelativaRecursoIntermedio+app2app.utils.RECURSO_INTERMEDIO+parametros["url"];
			var innerHTMLFrameConvencional = document.getElementById("divcontenedor").innerHTML;
			innerHTMLFrameConvencional=app2app.utils.replaceTexto(innerHTMLFrameConvencional,"javascript:\'\';",urlHtml);
			document.getElementById("divcontenedor").innerHTML=innerHTMLFrameConvencional;
			document.getElementById("divcontenedor").style.zIndex=101;
			document.getElementById("divcontenedor").style.display="block";
			document.getElementById(app2app.utils.FRAME_VENTANA).style.display="block";
			if (version!="MSIE 8.0"){// && version!="MSIE 6.0") {
				document.getElementById("divcontenedor").scrollIntoView(true);
			}
			
			// Gestión del Foco en ventanas a tamano completo
			app2app.utils.gestionaFocoVentanaModal(app2app.utils.FRAME_VENTANA);
			app2app.utils.gestionaRedimensionamiento("divcontenedor");
		}catch(error){
			//Se ha producido un error en la construccion de la ventana
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_VENTANA_COMPLETA, 
				"desError": app2app.utils.DES_ERROR_VENTANA_COMPLETA
			};
			app2app.utils.funcionError(parametrosError);
		}

	}	
	
	function fcheckNavegador() {
		var ua= navigator.userAgent, 
		N= navigator.appName, tem, 
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i) || [];
		M= M[2]? [M[1], M[2]]:[N, navigator.appVersion, '-?'];
		if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
		return M.join(' ');
	}

	
	
	return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/
	
		/**
		 * Crea una ventana a tamaño completo 
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		url: URL a mostrar en la ventana.
		 */
		 
		crearVentanaCompleta : function(parametros){
			try{
				app2app.utils.mantenimientoSesion();
				app2app.utils.compruebaNavegador();
				fcrearVentanaCompleta(parametros);
			}catch (e) {
				throw e;
			}
		}	
	};
	
}();

//Presentación proporcionada por la aplicación (iframe aplicativo)
 app2app.pres.iframe = function(){
 
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	/**
	* Metodo principal que se encarga de leer los parametros de entrada y lanzar la ventana
	*/
	function fmostrarOperacion(parametros){	
		try {
			if (parametros["iframe"]!=null &&  parametros["iframe"]!=""){
				var objFrameAplicativo = document.getElementById(parametros["iframe"]);
				url = parametros['url'];
				if (objFrameAplicativo!=null && typeof(objFrameAplicativo) != 'undefined' && typeof(objFrameAplicativo)=="object" ){
					//Se forma la url para llamar al app2app.html y asi mandar parametros por POST
					//Se crea la URL para llamar al html app2app.html
					var urlHtml=urlRelativaRecursoIntermedio+app2app.utils.RECURSO_INTERMEDIO+url;
					objFrameAplicativo.setAttribute("src",urlHtml);						
					// Registra la función de recepción de peticiones de ejecución de funciones.
					var entrada = {
						"frame":parametros["iframe"],
						"url": url
					};
					app2app.comu.rpc.establecerReceptor(entrada);
					
					var parametrosRegistro = {
						"idfuncion":"ejecutarFuncion",
						"funcion":app2app.logica.ejecutarFuncion
					}
					app2app.comu.rpc.registrarFuncion(parametrosRegistro);
				}else
					throw new Error("Objeto Inválido");
			
			}else
				throw new Error("Objeto no identificado");
			
		}catch(error){
			var parametrosError = {
			"codError": app2app.utils.COD_ERROR_VENTANA_APLICATIVA, 
			"desError": app2app.utils.DES_ERROR_VENTANA_APLICATIVA
			};
			app2app.utils.funcionError(parametrosError);
		}
	}
	
	return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/
		
		/**
		 * Muestra una oepración en un iframe aplicativo 
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		url: URL de la operación a mostrar
		 *		iframe: Identificador del iframe aplicativo
		 */
		 
		mostrarOperacion : function(parametros){
			try{
				app2app.utils.mantenimientoSesion();
				app2app.utils.compruebaNavegador();
				fmostrarOperacion(parametros);
			}catch (e) {
				throw e;
			}
		}	
	};
	
}();


//Presentación proporcionada por la aplicación (iframe aplicativo)
app2app.pres.externa = function(){
 
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	/**
	* Metodo principal que se encarga de leer los parametros de entrada y lanzar la ventana
	*/
	function fmostrarOperacion(parametros){
	
		try{
			var urlDesplegable=urlRelativaRecursoIntermedio+app2app.utils.RECURSO_INTERMEDIO+parametros['url'];
			my2Window = window.open(urlDesplegable);			
		}catch(error){
			//Se ha producido un error en la construccion de la ventana
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_VENTANA_APLICATIVA, 
				"desError": app2app.utils.DES_ERROR_VENTANA_APLICATIVA
				};
			app2app.utils.funcionError(parametrosError);
		}

	}
	
	return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/
		
		/**
		 * Crea una ventana a tamaño completo 
		 * @param parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		url: URL a mostrar en la ventana.
		 */
		 
		mostrarOperacion : function(parametros){
			try{
				app2app.utils.mantenimientoSesion();
				app2app.utils.compruebaNavegador();
				fmostrarOperacion(parametros);
			}catch (e) {
				throw e;
			}
		}	
	};
	
}();



//Objeto de comunicacion
app2app.comu = app2app.comu || {}; 

//Gestiona la comunicacion Ajax
app2app.comu.ajax = function(){

	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	/**
	* Realiza una invocación ajax según los parametros indicados.
	*/
	function fcall(parametrosAjax){
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
	          	
				var valores = "";
				if ((datos!=null) && (datos!=undefined) && (datos!="")){
					valores= datos+ "&hash="+Math.random();
				}else{
					valores="hash="+Math.random();
				}
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
				throw (e);		
		    }
		}
		else {
			throw (e);
		}
	}	
	
	/**
	* Genera el objeto HttpObject
	*/
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
	
	/**
	*	Función invocada para manejar el estado del servidor.
	*/
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
								parametros['ferror']("Comunicacion no inicializada");
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

//Ofrece servicios Ajax
app2app.ajax = function(){
	
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/ 
	var MANTENIMIENTO_SESION="MantSesion";
	var GET_OPERACION="getOperacion";
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	/**
	* Realiza la peticion para recuperar los parametros de una operacion dada
	*/
	function frecuperarParametrosOperacion(parametros){
		
		var resultado="";
		//Se crea un String en formato JSON con los datos de entrada
		var datosEntradaJson = '{"operacion":"'+parametros['operacion'] +'"';
		datosEntradaJson +=',"id":"'+parametros['id']+'"';
		datosEntradaJson +=',"url":"'+parametros['url']+'"';
		datosEntradaJson += '}';
		try{
			//Se parametriza la peticion Ajax
			parametrosPeticionAjax = {
							"url":formaUrlServlet(),//URL del servlet definida en la ventana invocante
							"fcallback": "", 
							"ferror": "",
							"asincrono":false, //Peticion sincrona
							"datos":"ACCION=" + GET_OPERACION + "&DATOS=" + datosEntradaJson //Datos a enviar por GET
			};
			
			var resultado = app2app.comu.ajax.call(parametrosPeticionAjax);
			if((typeof resultado) == 'undefined' || resultado == null || resultado == "" || resultado == "null")
				resultado = "";
			else
				resultado = (typeof resultado) == 'string' ? eval(' (' + resultado + ') ') : resultado;
			
		}catch (e) {
			//El servlet no ha devuelto respuesta
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_RESPUESTA_SERVLET, 
				"desError": app2app.utils.DES_ERROR_RESPUESTA_SERVLET
			};
			app2app.utils.funcionError(parametrosError);
			resultado="";
		}
		
		return resultado;
	}
	
	/**
	* Realiza una peticion sin ningun dato de entrada
	*/
	function fpeticionSimple(parametros){
		
		//Se parametriza la peticion Ajax
		parametrosPeticionAjax = {
						"url":formaUrlServlet(),//URL del servlet definida en la ventana invocante
						"fcallback": "", 
						"ferror": "",
						"asincrono":true, //Peticion asincrona
						"datos":"ACCION=" + MANTENIMIENTO_SESION //Parametro que indica que es una peticion de mantenimiento de sesion
		};
		
		app2app.comu.ajax.call(parametrosPeticionAjax);
	}
	
	/**
	* Comprueba la url del servlet
	*/
	function formaUrlServlet(){
		var url="";
		if (nombreServlet!=null && nombreServlet!=undefined && nombreServlet!=""){
			
			url=nombreServlet;
			
			if (!(nombreServlet.indexOf("/")==0) && !(nombreServlet.indexOf("http")==0)){	
				//Si es ruta relativa se anade "/"
				url="/"+nombreServlet;
			}			
		}
		return url;
	}
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	
	return{
		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		/**
		 * Realiza una peticion al servlet definido en el padre para recuperar los parametros definidos en la ventana padre  
		 */
		recuperarParametrosOperacion : function(parametros){
			try{
				return frecuperarParametrosOperacion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		*	Realiza una peticion simple al servlet definido en la ventana del padre
		*/
		peticionSimple : function(){
			try{
				fpeticionSimple();
			}catch (e) {
				throw e;
			}
		}

	};
	
}(); 

// Gestiona la comunicación con rpc
app2app.comu.rpc = function(){
	
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/
	
	function fregistrar(parametros) {
		try{
			gadgets.rpc.register(parametros['idfuncion'], parametros["funcion"]);
			return 0;
		}catch(e){
			//Excepcion al establecer receptor por RPC
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_RPC, 
				"desError": app2app.utils.DES_ERROR_RPC
			};
			app2app.utils.funcionError(parametrosError);
			return null;
		}
	};
	
	function finvocarFuncion(parametros) {		
		if (typeof(parametros['frame'])!="undefined" && parametros['frame']!=null && parametros['frame']!="")
			gadgets.rpc.call(parametros['frame'],parametros['idfuncion'],null, parametros['datos']);
		else 
			gadgets.rpc.call(null,parametros['idfuncion'],null, parametros['datos']);
	};
	
	function festablecerReceptor(parametros) {	
	
		try{
			if (typeof(contextoJS)!=undefined && contextoJS!=null && 
				typeof(contextoJS.getTecnicosArq())!=undefined && contextoJS.getTecnicosArq()!=null &&
				typeof(contextoJS.getTecnicosArq().getOrigen())!=undefined && contextoJS.getTecnicosArq().getOrigen()!=null &&
				typeof(contextoJS.getTecnicosArq().getOrigen().getUrl())!=undefined && contextoJS.getTecnicosArq().getOrigen().getUrl()!=null){
			
				url = contextoJS.getTecnicosArq().getOrigen().getUrl();
			
				if (typeof(parametros['frame'])!="undefined" && parametros['frame']!=null && parametros['frame']!=""){
					gadgets.rpc.removeReceiver(parametros['frame']);
					gadgets.rpc.setupReceiver(parametros['frame'],url);
				}
				else{ 
					gadgets.rpc.setupReceiver('..',url);
				}
			}
			else if (typeof(parametros['url'])!="undefined" && parametros['url']!=null && typeof(parametros['frame'])!="undefined" && parametros['frame']!=null){
					gadgets.rpc.removeReceiver(parametros['frame']);
					gadgets.rpc.setupReceiver(parametros['frame'],parametros['url']);
			}else{
				//BBVAContext no informado en la ventana 
				var parametrosError = {
					"codError": app2app.utils.COD_ERROR_CONTEXTOJS, 
					"desError": app2app.utils.DES_ERROR_CONTEXTOJS
				};
				app2app.utils.funcionError(parametrosError);
			}
		}catch(e){
			//Excepcion al establecer receptor por RPC
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_RPC, 
				"desError": app2app.utils.DES_ERROR_RPC
			};
			app2app.utils.funcionError(parametrosError);
		}
	};
	
	return{		
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/ 
		registrarFuncion : function (parametros) {
			try{
				return fregistrar(parametros);
			}catch (e) {
				throw e;
			}
		},
		invocarFuncion : function (parametros){
			try {
				finvocarFuncion(parametros);
			}catch (e) {
				throw e;
			}
		},
		establecerReceptor : function (parametros){
			try{
				return festablecerReceptor(parametros);
			}catch (e) {
				throw e;
			}
		}
	};	
}(); 

//Implementa toda la logica
app2app.logica = function(){
 
	/************************************************************************************************************************
	* Atributos privados
	************************************************************************************************************************/
	
	
	var parametrosEntradaServlet = {
			"operacion":"",
			"id": app2app.utils.FRAME_VENTANA, 
			"url": encodeURIComponent(location.href)//Se codifica la URL para recibirla correctamente en el servidor
	};
	
	var parametrosRegistraFuncion = {
			"idfuncion": "", 
			"funcion": ""
	};
	
	var parametrosVentana = {
			"url": "", 
			"properties": ""
	};
	 
	/************************************************************************************************************************
	* Funciones privadas
	************************************************************************************************************************/ 
	 
	/**
	*	Implementa la logica de creacion de la ventana
	*/	
	function flanzarOperacion(parametros){
		
		// Se recoge el id del frame aplicativo si lo hubiera y se almacena.
		if (parametros["iframe"]!=null && parametros["iframe"]!="" && parametros["iframe"]!=undefined){
			app2app.utils.frameAplicativo = parametros["iframe"];
		}
		
		//Se almacena en el utils la funcion de error en caso que venga informada
		if (parametros['ferror']!=null && parametros['ferror']!=undefined && parametros['ferror']!=""){
			app2app.utils.ferror=parametros['ferror'];
		}else{
			app2app.utils.ferror="";
		}
		
		try {
			ProxyApp2Esc.inicializar();
		}catch (e) {
		}
		
		//Se comprueba si vienen informados los parametros obligatorios de entrada
		if (hayErrorParametrosEntrada(parametros)==false){
		
			var url="";
			var urlDesconexion="";
			
			//se almacena la funcion de callback 
			if (parametros["callback"]!=null && parametros["callback"]!="" && typeof(parametros["callback"])=="function"){
				app2app.utils.callback=parametros["callback"];
			}
			
			// Si la presentación es en modo iframe, se modifica el 'id' del frame en los parametros de entrada al servlet
			if (parametros["presentacion"] == app2app.utils.VENTANA_APLICATIVA){
				parametrosEntradaServlet['id']=app2app.utils.frameAplicativo;
			}
			
			//Registrar en el RPC el callback de esta librería al que se tiene que llamar
			parametrosRegistraFuncion["idfuncion"]="cerrar";
			parametrosRegistraFuncion["funcion"]=app2app.utils.cerrarVentana;
			if (app2app.comu.rpc.registrarFuncion(parametrosRegistraFuncion)!=null){
			
				//Se envia peticion al servlet para recuperar los parametros de la operacion
				parametrosEntradaServlet['operacion'] = parametros['operacion'];
				var parametrosOperacion = app2app.ajax.recuperarParametrosOperacion(parametrosEntradaServlet);
				
				if (parametrosOperacion!=null && parametrosOperacion!=undefined && parametrosOperacion!=""){
					 if (parametrosOperacion['rc']!=null && parametrosOperacion['rc']!=undefined && parametrosOperacion['rc']==2){
						//Se ha producido un error en el servlet
						var parametrosError = {
							"codError": parametrosOperacion['codError'], 
							"desError": parametrosOperacion['desError']
						};
						app2app.utils.funcionError(parametrosError);
						
					}else if (parametrosOperacion['rc']!=null && parametrosOperacion['rc']!=undefined && parametrosOperacion['rc']==0){

						if (parametrosOperacion['url']!=null && parametrosOperacion['url']!=undefined && parametrosOperacion['url']!="")
							url=parametrosOperacion['url'];
							
						if (parametrosOperacion['urlDesconexion']!=null && parametrosOperacion['urlDesconexion']!=undefined && parametrosOperacion['urlDesconexion']!=""){
							app2app.utils.urlDesconexion=parametrosOperacion['urlDesconexion'];
						}
							
						//Se guardan en el utils los datos que se enviaran por POST
						if (parametrosOperacion['BBVACONTEXT']!=null && parametrosOperacion['BBVACONTEXT']!=undefined && parametrosOperacion['BBVACONTEXT']!=""){
							//Se almacena el bbvaContext
							app2app.utils.CONTEXTO=parametrosOperacion['BBVACONTEXT'];
						}
						
						if (parametrosOperacion['idTarea']!=null && parametrosOperacion['idTarea']!=undefined && parametrosOperacion['idTarea']!=""){
							//Se almacena el id de Tarea Spring 
							app2app.utils.idTareaSpring=parametrosOperacion['idTarea'];
						}
							
						if (parametros['datosEntrada']!=null && parametros['datosEntrada']!=undefined && parametros['datosEntrada']!=""){
							//Se cogen los datos de entrada de los parametros de entrada y se almacenan en los datos de entrada
							app2app.utils.DatosEntrada=parametros['datosEntrada'];
						}
						
						//Se forman el JSON que se le envia a la ventana
						parametrosVentana['url']=url;
							
						if (url!=null && url!=""){
							if (typeof (urlRelativaRecursoIntermedio)!='undefined' && urlRelativaRecursoIntermedio!=null && urlRelativaRecursoIntermedio!=""){
								if (typeof(parametros["presentacion"])!= 'undefined' && typeof(parametros["presentacion"])== 'number'){
									tipoPres = parametros["presentacion"];
								}	
								else tipoPres = app2app.utils.VENTANA_COMPLETA;	
								switch (tipoPres){
									// Ventana modal sobre la ventana.
									case app2app.utils.VENTANA_MODAL:
										app2app.utils.tipoVentana=app2app.utils.VENTANA_MODAL;
										parametrosVentana['properties']=parametros["properties"];
										app2app.pres.VM.crearVentanaModal(parametrosVentana);
									break;
									// Ventana nueva del navegador.
									case app2app.utils.VENTANA_EXTERNA:
										app2app.pres.externa.mostrarOperacion(parametrosVentana);
									break;
									// Iframe aplicativo.
									case app2app.utils.VENTANA_APLICATIVA:
										parametrosVentana['iframe']=parametros['iframe'];
										app2app.pres.iframe.mostrarOperacion(parametrosVentana);
									break;
									// Por defecto, se muestra en ventana completa.
									case app2app.utils.VENTANA_COMPLETA:
									default:
										app2app.utils.tipoVentana=app2app.utils.VENTANA_COMPLETA;
										app2app.pres.completo.crearVentanaCompleta(parametrosVentana);
								}
							}else{
								//Recurso HTML no definido por la aplicacion
								var parametrosError = {
									"codError": app2app.utils.COD_ERROR_RECURSO_HTML_INTERMEDIO, 
									"desError": app2app.utils.DES_ERROR_RECURSO_HTML_INTERMEDIO
								};
								app2app.utils.funcionError(parametrosError);
							}
						}else{
							//URL no informada por el servlet
							var parametrosError = {
								"codError": app2app.utils.COD_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA, 
								"desError": app2app.utils.DES_ERROR_RESPUESTA_SERVLET_URL_NO_INFORMADA
							};
							app2app.utils.funcionError(parametrosError);
						}
					}
				}
			}
		}else{
			//Error en los parametros de entrada
			var parametrosError = {
				"codError": app2app.utils.COD_ERROR_PARAMETROS_ENTRADA, 
				"desError": app2app.utils.DES_ERROR_PARAMETROS_ENTRADA
			};
			app2app.utils.funcionError(parametrosError);
		}
	}
	
	/**
	*	Comprueba si hay errores en los parametros de entrada
	*/
	function hayErrorParametrosEntrada(parametros){
		
		var error=true;
		
		if (parametros['operacion']!=null && parametros['operacion']!=undefined && parametros['operacion']!=""){
			error=false;
		}
		return error;
	}
	
	
 	/**
	 *	Ejecuta la funcionalidad solicitada desde el padre o el hijo (comunicación entre ambos) 
	*/	
	function fejecutarFuncion(parametros){
		if (parametros['idfuncion']!=null && parametros['idfuncion']!=undefined && parametros['idfuncion']!=""){
			setTimeout(function () {
				eval("(" +parametros['idfuncion'] +")")(parametros['datos']);
			},0);
		}
	}
	
	/**
	*	Inicia la comunicación entre el hijo y el padre
	*/	
	function finiciarComunicacion(){
		var modoComunicacion = app2app.utils.funcionGetModoComunicacion();
		var origenComunicacion = app2app.utils.funcionGetOrigenComunicacion();
		if (modoComunicacion!=null && modoComunicacion!="" && origenComunicacion!=null && origenComunicacion!=""){
			if (modoComunicacion==app2app.utils.T_COMU_RPC && origenComunicacion===app2app.utils.T_COMU_ORIGEN_APLICACION){
				//Se establece el receptor de datos
				var entrada = {
					"frame":""		
				};
				app2app.comu.rpc.establecerReceptor(entrada);
						
				parametrosRegistraFuncion["idfuncion"]="ejecutarFuncion";
				parametrosRegistraFuncion["funcion"]=app2app.logica.ejecutarFuncion;
				app2app.comu.rpc.registrarFuncion(parametrosRegistraFuncion);				
			}
		}
	}
	
	
	return{
	
		/************************************************************************************************************************
		* Funciones públicas
		************************************************************************************************************************/

		/**
		 * Crea una ventana modal por capas 
		 * @parametros parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		operacion: Operacion que se desea ejecutar en la ventana.
		 *		presentacion: Indica el tipo de ventana que se quiere mostrar
		 *		datosEntrada: Parámetros de entrada de la operación.
		 * 		properties: Caracteristicas de presentacion de la ventana
		 * 		callback: Función de callback aplicativa que se invocará ante el cierre de la ventana.
		 *		ferror: Función de error aplicativa que se invocará ante un error en la ventana.
		 */
		 
		lanzarOperacion : function(parametros){
			try{
				flanzarOperacion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Ejecuta la funcionalidad solicitada desde el padre o el hijo (comunicación entre ambos) 
		 * @parametros parametros: objeto con los parámetros de entrada de la petición (formato {prop:valor,prop:valor...} )
		 * Parámetros de entrada a informar:
		 *		idFuncion: Identificador de la función a ejecutar.
		 *		datos: Datos de entrada a propagar
		 */		 
		ejecutarFuncion : function(parametros){
			try{
				fejecutarFuncion(parametros);
			}catch (e) {
				throw e;
			}
		},
		
		/**
		 * Inicia la comunicación entre el hijo y el padre.
		 */
		iniciarComunicacion : function(){
			try{
				finiciarComunicacion();
			}catch (e) {
				throw e;
			}
		}
			
	};
	
}();