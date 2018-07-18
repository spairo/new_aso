/******************************************************************
 *  CONSTANTES                                                     *  
 *******************************************************************/ 
var cte_NombreLibreriaAPI = "libMicroStrategy.js";

//Constante para el metodoEnvio por defecto
var cte_GET = "GET";
var cte_POST = "POST";

//Correctos
var cte_ESTADO_LOGIN_OK = "00";
var cte_ESTADO_LOGOUT_OK = "01";
var cte_ESTADO_URL_OK = "02";
//Errores de Micro.
var cte_ESTADO_MST_ERROR = "10";
//Errores genéricos
var cte_ESTADO_PARAMS_ERROR = "20";
var cte_ESTADO_CONEXION_ERROR = "21";

var cte_CABECERA_HTTP = "http://";
var cte_CABECERA_HTTPS = "https://";
var cte_SCRIPT="SCRIPT";

//Constantes para el parseo de las respuestas de MST
var cte_MAX_STATE_INI="<max-state>";
var cte_MAX_STATE_FIN="</max-state>";

//Constantes para los mensajes de salida JSON
var cte_ESTADO="estado";
var cte_RETORNO="retorno";
var cte_MENSAJE="mensaje";
var cte_STATUS_CODE="statusCode";
var cte_ERROR_MSG="errorMsg";
var cte_TASK_ERROR_CODE="taskErrorCode";

var cte_STATUS_CODE_IGUAL="statusCode=\"";
var cte_ERROR_MSG_IGUAL="errorMsg=\"";
var cte_TASK_ERROR_CODE_IGUAL="taskErrorCode=\"";

var cte_STATUS_CODE_200="statusCode=\"200\"";


//Mensajes de salida
var cte_MENSAJE_NO_USUARIO = "Es necesario especificar un código de usuario";
var cte_MENSAJE_NO_PROYECTO = "Es necesario especificar un código de proyecto de MicroStrategy";
var cte_MENSAJE_NO_SERVETMST = "Es necesario especificar Intelligence Server de MicroStrategy";
var cte_MENSAJE_NO_HOST = "Es necesario especificar un host para la petición";
var cte_MENSAJE_NO_PUERTO = "Es necesario especificar un puerto para la petición";
var cte_MENSAJE_NO_APLICACION = "Es necesario especificar la aplicación donde se encuentra el servlet de MicroStategy";
var cte_MENSAJE_NO_PARAMETROS = "Es necesario especificar los parámetros del informe";

var cte_MENSAJE_LOGOUT_OK = "El proceso de logout ha funcionado correctamente";
var cte_MENSAJE_LOGOUT_KO_SESION = "No se puede hacer logout porque no existe sesion";
var cte_MENSAJE_INFORME_NO_SESION = "No hay sesión de de MicroStrategy Definida. Se recomienda hacer login";
var cte_MENSAJE_ERROR_AJAX = "Error en la petición. ";

/******************************************************************
 *  Se comprueba el navegador                                      *  
 *******************************************************************/ 
//Internet Explorer
var ie=false;
var n=navigator.appName;
if(n=='Microsoft Internet Explorer'){
	ie=true;
}


/******************************************************************
 *  MANTENIMIENTO DE SESION                                        *  
 *******************************************************************/ 
var api_sesionActual = null;

/******************************************************************
 *  DATOS DE CONEXION                                              *  
 *******************************************************************/ 
//api_proyecto: Un proyecto de MicroStrategy que estará informado como parámetro de entrada en todas las operaciones y es obligatorio que este informado
var api_proyecto = null;

//api_servidorMST: Nombre del servidor donde se encuentra el informe, dentro de MicroStrategy. 
var api_servidorMST = null;

//api_usuario: Usuario. El usuario se informará en el iv-user de la cabecera de la request. 
var api_usuario = null;

//api_host: Servidor donde se encuentra el servidor de aplicaciones. 
var api_host = null;

//api_puerto: Puerto. 
var api_puerto = null;

//api_aplicación. Aplicación de la junction. 
var api_aplicacion = null;

var mensajeErrorGlobal = null;

/******************************
 * Interfaz de las funciones  *                                                         *  
 ******************************/
/**
 * Interfaz para la ejecución del login
 * - proyecto nombre del proyecto
 * - funcionRespuestaOK función de callback de respuesta OK
 * - funcionRespuestaERROR función de callback de respuesta ERROR
 */
function apiMicroStrategyLogin(proyecto,funcionRespuestaOK,funcionRespuestaERROR){
	return apiMicroStrategy_login(usuario,proyecto,servidorMST,host,puerto,aplicacion,metodoEnvio,funcionRespuestaOK,funcionRespuestaERROR);
}

/**
 * Interfaz para la ejecución del login
 * - funcionRespuestaOK función de callback de respuesta OK
 * - funcionRespuestaERROR función de callback de respuesta ERROR
 */
function apiMicroStrategyLogout(sessionState,funcionRespuestaOK,funcionRespuestaERROR){
	return apiMicroStrategy_logout(host,puerto,aplicacion,metodoEnvio,sessionState,funcionRespuestaOK,funcionRespuestaERROR);
}

/**
 * Interfaz para la obtención de la URL del informe
 * - proyecto nombre del proyecto
 * - sessionState identificador de sesión
 * - funcionRespuestaOK función de callback de respuesta OK
 * - funcionRespuestaERROR función de callback de respuesta ERROR
 */
function apiMicroStrategyObtenerURLInforme(proyecto,sessionState,parametros,funcionRespuestaOK,funcionRespuestaERROR){
	var esHTTPS = false;
	return apiMicroStrategy_obtenerURLInforme(proyecto,servidorMST,host,puerto,aplicacion,sessionState,esHTTPS,parametros,funcionRespuestaOK,funcionRespuestaERROR);
}

/**
 * Interfaz para la obtención de la URL del informe
 * - proyecto nombre del proyecto
 * - sessionState identificador de sesión
 * - host hacia donde apuntará la petición
 * - funcionRespuestaOK función de callback de respuesta OK
 * - funcionRespuestaERROR función de callback de respuesta ERROR
 */
function apiMicroStrategyObtenerURLInformeHTTPS(proyecto,sessionState,host,parametros,funcionRespuestaOK,funcionRespuestaERROR){
	var esHTTPS = true;
	return apiMicroStrategy_obtenerURLInforme(proyecto,servidorMST,host,puerto,aplicacion,sessionState,esHTTPS,parametros,funcionRespuestaOK,funcionRespuestaERROR);
}

/******************************************************************
 *  JSON                                                           *  
 *******************************************************************/
/**
 * Construye la cadena JSON con el mensaje de OK.
 *  - estado: tipo de mensaje de OK
 *  - retorno: valor de retorno
 */
function crearJSONOK(estado,retorno){
	var valores = new Object();
	valores.estado = estado;
	valores.retorno = retorno;

	var claves = new Array();
	claves[0] = cte_ESTADO;
	claves[1] = cte_RETORNO;
	var jsonText = JSON.stringify(valores, claves);

	return jsonText;
}

/**
 * Construye la cadena JSON con el mensaje de error propio de MicroStategy.
 *  - statusCode: valor del estado devuelto por MicroStrategy
 *  - taskErrorCode: valor del código de error de la tarea devuelto por MicroStrategy
 *  - errorMsg: valor del mensaje devuelto por MicroStrategy  
 */  
function crearJSONErrorMicro(statusCode,taskErrorCode,errorMsg){

	var valores = new Object();
	valores.estado = cte_ESTADO_MST_ERROR;
	valores.statusCode = statusCode;
	valores.taskErrorCode = taskErrorCode;
	valores.errorMsg = errorMsg;

	var claves = new Array();
	claves[0] = cte_ESTADO;
	claves[1] = cte_STATUS_CODE;
	claves[2] = cte_TASK_ERROR_CODE;
	claves[3] = cte_ERROR_MSG;
	var jsonText = JSON.stringify(valores, claves);

	return jsonText;
}

/**
 * Construye la cadena JSON con el mensaje de error.
 *  - estado: tipo de mensaje de Error
 *  - mensaje: mensaje descriptivo del error.
 */  
function crearJSONErrorGenerico(estado,mensaje){

	var valores = new Object();
	valores.estado = estado;
	valores.mensaje = mensaje;

	var claves = new Array();
	claves[0] = cte_ESTADO;
	claves[1] = cte_MENSAJE;
	var jsonText = JSON.stringify(valores, claves);

	return jsonText;
}

/**
 * Se informan los datos recibidos a los valores de conexión de la librería. Sólo si informan los valores que tienen valor
 * Si el dato no tiene valor se deja el que estuviera definido. 
 *  - usuario 
 *  - proyecto
 *  - servidorMST
 *  - host
 *  - puerto
 *  - aplicacion
 */
function establecerVariablesConexion(usuario,proyecto,servidorMST,host,puerto,aplicacion){

	//usuario
	if(usuario != null && typeof(usuario)!="undefined"){
		api_usuario = usuario;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_USUARIO);
	}

	//proyecto
	if(proyecto != null && typeof(proyecto)!="undefined"){
		api_proyecto = proyecto;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_PROYECTO);
	}
	if(api_proyecto != null && typeof(api_proyecto)!="undefined"){
		api_proyecto = escape(api_proyecto);
	}

	//servidorMST
	if(servidorMST != null && typeof(servidorMST)!="undefined"){
		api_servidorMST = servidorMST;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_SERVETMST);
	}

	//host
	if(host != null && typeof(host)!="undefined"){
		api_host = host;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_HOST);
	}

	//puerto
	if(puerto != null && typeof(puerto)!="undefined"){
		api_puerto = puerto;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_PUERTO);
	}

	//aplicacion
	if(aplicacion != null && typeof(aplicacion)!="undefined"){  
		api_aplicacion = aplicacion;
	}
	else{
		return crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_APLICACION);
	}

	return null;

}

/**
 * Ejecuta la petición de Login a MicroStrategy.
 *  - usuario 
 *  - proyecto
 *  - servidorMST
 *  - host
 *  - puerto
 *  - aplicacion
 *  - metodoEnvio
 *  - funcionRespuestaOK()
 *  - funcionRespuestaERROR()   
 */ 
function apiMicroStrategy_login(usuario,proyecto,servidorMST,host,puerto,aplicacion,metodoEnvio,funcionRespuestaOK,funcionRespuestaERROR){

	var retorno = null;

	var error_json = establecerVariablesConexion(usuario,proyecto,servidorMST,host,puerto,aplicacion);

	if(error_json){
		//Error de comunicación
		if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
			funcionRespuestaERROR(error_json);
		}
	}
	else{
		//Se comprueba que el método de envío tiene un valor correcto.
		//En caso negativo, se pondrá el valor 
		if(metodoEnvio != null && typeof(metodoEnvio)!="undefined"){
			if(metodoEnvio != cte_GET && metodoEnvio!=cte_POST){
				metodoEnvio = cte_GET;
			}
		}
		else{
			metodoEnvio = cte_GET;
		}

		//Se construye la url
		var cabeceraServlet = "?taskId=getSessionState&taskEnv=xml&taskContentType=xml&server=";
		var cabeceraProyecto = "&project=";
		var modoAutenticacion = "&authMode=64";

		//http://<api_host>:<api_puerto>/<api_aplicacion>/servlet/taskProc?taskId=getSessionState&taskEnv=xml&taskContentType=xml&server=<api_servidorMST>&project=<api_proyecto>&authMode=64
		var url = cte_CABECERA_HTTP + api_host + ":" + api_puerto + "/" + api_aplicacion + "/servlet/taskProc" + cabeceraServlet + api_servidorMST + cabeceraProyecto + api_proyecto + modoAutenticacion; 

		retorno = ejecutarPeticionAJAX_MicroStrategy(url,true,metodoEnvio);

		//Se recupera el sessionState que viene en la etiqueta <max-state> 
		if(retorno != null && retorno != undefined){
			var posInicio =  retorno.indexOf(cte_MAX_STATE_INI)+cte_MAX_STATE_INI.length;
			var posFin = retorno.indexOf(cte_MAX_STATE_FIN);
			if(posInicio != -1 && posFin != -1){
				retorno = retorno.substring(posInicio,posFin);
				//Se almacena la sesión actual
				api_sesionActual = retorno;
				if(funcionRespuestaOK != null && typeof(funcionRespuestaOK)!="undefined" ){
					var json = crearJSONOK(cte_ESTADO_LOGIN_OK,retorno);
					funcionRespuestaOK(json);
				}
			}
			else{

				//Se verifica el tipo de error
				var json = obtenerErrorMST(retorno);
				//Si json es la cadena vacía, el error no es MST, sino de comunicación
				if(json != ""){
					retorno = null;
					if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
						funcionRespuestaERROR(json);
					}
				}
				else{
					//Error de comunicación
					if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
						var json = crearJSONErrorGenerico(cte_ESTADO_CONEXION_ERROR,retorno);
						mensajeErrorGlobal = null;
						funcionRespuestaERROR(json);
					}
				}
			}
		}
		else{
			//Error de comunicación
			if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
				var json = crearJSONErrorGenerico(cte_ESTADO_CONEXION_ERROR,mensajeErrorGlobal);
				mensajeErrorGlobal = null;
				funcionRespuestaERROR(json);
			}
		}
	}  
	return retorno;
}

/**
 * Ejecuta la petición de Logout a MicroStrategy
 * - host donde se encuentra el servidor de aplicaciones. Parámetro opcional
 * - Puerto. Parámetro opcional
 * - Aplicación. Parámetro opcional
 * - Tipo de petición HTTP (POST o GET). Parámetro opcional, por defecto GET
 * - Identificador de sesión obtenido en el proceso de Login (si se dispone de él).
 */ 
function apiMicroStrategy_logout(host,puerto,aplicacion,metodoEnvio,sessionState,funcionRespuestaOK,funcionRespuestaERROR){

	if(host == null || typeof(host)=="undefined"){
		host = api_host;
	}

	if(puerto == null || typeof(puerto)=="undefined"){
		puerto = api_puerto;
	}

	if(aplicacion == null || typeof(aplicacion)=="undefined"){
		aplicacion = api_aplicacion;
	}

	//Se comprueba que el método de envío tiene un valor correcto.
	//En caso negativo, se pondrá el valor 
	if(metodoEnvio != null && typeof(metodoEnvio)!="undefined"){
		if(metodoEnvio != cte_GET && metodoEnvio!=cte_POST){
			metodoEnvio = cte_GET;
		}
	}
	else{
		metodoEnvio = cte_GET;
	}

	if(sessionState == null || typeof(sessionState)=="undefined"){
		sessionState = api_sesionActual;
	}
	//Se codifica el id de sesion
	if(sessionState != null && typeof(sessionState)!="undefined"){
		sessionState =escape(sessionState);

		//Se forma la URL
		var cabeceraServlet = "?taskId=logout&taskEnv=xml&taskContentType=xml&sessionState=";

		//http://<host>:<puerto>/<aplicacion>/servlet/taskProc?taskId=logout&taskEnv=xml&taskContentType=xml&sessionState=<sessionState>
		var url = cte_CABECERA_HTTP + host + ":" + puerto + "/" + aplicacion + "/servlet/taskProc" + cabeceraServlet + sessionState; 

		var retorno = ejecutarPeticionAJAX_MicroStrategy(url,false,metodoEnvio);

		//Se recupera el sessionState que viene en la etiqueta petición OK
		if(retorno != null && retorno != undefined){
			if(retorno.indexOf(cte_STATUS_CODE_200)!=-1){
				//Se limpia el sessionState actual
				api_sesionActual = null;
				if(funcionRespuestaOK != null && typeof(funcionRespuestaOK)!="undefined" ){
					var json = crearJSONOK(cte_ESTADO_LOGOUT_OK,cte_MENSAJE_LOGOUT_OK);
					funcionRespuestaOK(json);
				}
			}
			else{
				//Se verifica el tipo de error
				var json = obtenerErrorMST(retorno);
				//Si json es la cadena vacía, el error no es MST, sino de comunicación
				if(json != ""){
					retorno = null;
					if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
						funcionRespuestaERROR(json);
					}
				}
				else{
					//Error de comunicación
					if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
						var json = crearJSONErrorGenerico(cte_ESTADO_CONEXION_ERROR,retorno);
						mensajeErrorGlobal = null;
						funcionRespuestaERROR(json);
					}
				}
			}
		}
		else{
			//Error de comunicación
			if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
				var json = crearJSONErrorGenerico(cte_ESTADO_CONEXION_ERROR,mensajeErrorGlobal);
				mensajeErrorGlobal = null;
				funcionRespuestaERROR(json);
			}
		}
	}
	else{
		funcionRespuestaERROR(cte_MENSAJE_LOGOUT_KO_SESION);
	}  
	return;

}

/**
 * Construye la URL del informe.
 *  - proyecto
 *  - servidorMST
 *  - host
 *  - puerto
 *  - aplicacion
 *  - sessionState
 *  - esHTTPS 
 *  - parametros
 *  - funcionRespuestaOK()
 *  - funcionRespuestaERROR()   
 */ 
function apiMicroStrategy_obtenerURLInforme(proyecto,servidorMST,host,puerto,aplicacion,sessionState,esHTTPS,parametros,funcionRespuestaOK,funcionRespuestaERROR){

	//Verificación de "parametros"
	//aplicacion
	if(parametros == null || typeof(parametros)=="undefined"){
		//Error de parámetros
		if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
			var json = crearJSONErrorGenerico(cte_ESTADO_PARAMS_ERROR,cte_MENSAJE_NO_PARAMETROS);
			funcionRespuestaERROR(json);
		}  
		return "";
	}

	// VERIFICACIÓN DEL SESSIONSTATE
	//Se recupera el sessionState almacenado en la navegación.
	var sessionStateLocal = api_sesionActual;

	//El sessionState recibido existe, se toma el recibido por parámetro
	if(sessionState != null && typeof(sessionState)!="undefined"){
		sessionStateLocal = sessionState
	}

	var url = "";
	//Se verifica si el sessionState sigue activo.
	//Si es HTTPS se utilizan los datos almacenados en el proceso de login para el host y para el puerto
	var hostLocal = host;
	var puertoLocal = puerto;
	if(esHTTPS != null && typeof(esHTTPS)!="undefined" && esHTTPS==true){
		hostLocal = api_host;
		puertoLocal = api_puerto;
	}

	//Se recupera la sesión
	sessionStateLocal = recuperarSessionStateActivo(proyecto,servidorMST,hostLocal,puertoLocal,aplicacion,sessionStateLocal);

	if(sessionStateLocal == null){
		//Error de comunicación
		if(funcionRespuestaERROR != null && typeof(funcionRespuestaERROR)!="undefined" ){
			var json = crearJSONErrorGenerico(cte_ESTADO_CONEXION_ERROR,mensajeErrorGlobal);
			mensajeErrorGlobal = null;
			funcionRespuestaERROR(json);
		}
	}
	else{

		//El sessionState recibido no es el almancenado en la librería, se actualiza.
		if(sessionStateLocal != api_sesionActual){
			api_sesionActual = sessionStateLocal;
		}
		//Se codifica el id de sesion
		if(sessionStateLocal != null && typeof(sessionStateLocal)!="undefined"){
			sessionStateLocal = escape(sessionStateLocal);
		}

		//Proyecto, si no está informado se toma el almacenado en el API
		var proyectoLocal = proyecto;
		if(proyectoLocal == null || typeof(proyectoLocal)=="undefined"){
			proyectoLocal = api_proyecto;
		}
		else{
			proyectoLocal = escape(proyectoLocal);
		}

		//servidorMST, si no está informado se toma el almacenado en el API
		var servidorMSTLocal = servidorMST;
		if(servidorMSTLocal == null || typeof(servidorMSTLocal)=="undefined"){
			servidorMSTLocal = api_servidorMST;
		}

		//host, si no está informado se toma el almacenado en el API
		var hostLocal = host;
		if(hostLocal == null || typeof(hostLocal)=="undefined"){
			hostLocal = api_host;
		}

		//puerto, si no está informado se toma el almacenado en el API
		var puertoLocal = puerto;
		if(puertoLocal == null || typeof(puertoLocal)=="undefined"){
			puertoLocal = api_puerto;
		}

		//aplicacion, si no está informado se toma el almacenado en el API
		var aplicacionLocal = aplicacion;
		if(aplicacionLocal == null || typeof(aplicacionLocal)=="undefined"){
			aplicacionLocal = api_aplicacion;
		}
		//esHTTP, por defecto http
		if(esHTTPS == null || typeof(esHTTPS)=="undefined"){
			esHTTPS = false;
		}

		//parametros, si no está informado se toma el almacenado en el API
		var parametrosLocal = parametros;
		if(parametrosLocal == null || typeof(parametrosLocal)=="undefined" || parametrosLocal.length==0){
			parametrosLocal = "";
		}
		else{
			parametrosLocal = "&"+parametrosLocal;
		}

		//Se forma la URL
		var cabeceraSesion = "&usrSmgr=";

		if(esHTTPS){
			url = cte_CABECERA_HTTPS + hostLocal;
		}
		else{
			url = cte_CABECERA_HTTP + hostLocal + ":" + puertoLocal;
		}

		//http://<hostLocal>:<puertoLocal>/<aplicacionLocal>/servlet/mstrWeb?server=<servidorMSTLocal>&Project=<proyectoLocal>&<parametrosLocal>&sessionState=<sessionStateLocal>
		url = url + "/" + aplicacionLocal + "/servlet/mstrWeb?server="+servidorMSTLocal+"&Project="+proyectoLocal + parametrosLocal + cabeceraSesion + sessionStateLocal; 

		if(funcionRespuestaOK != null && typeof(funcionRespuestaOK)!="undefined" ){
			var json = crearJSONOK(cte_ESTADO_URL_OK,url);
			funcionRespuestaOK(json);
		}

	}

	return url;

}

/**
 * Método que verifica si la sesión es correcta, en caso de no serla, realiza un login 
 */ 
function recuperarSessionStateActivo(proyecto,servidorMST,host,puerto,aplicacion,sessionState){

	//El sessionState recibido existe, se toma el recibido por parámetro
	if(sessionState != null && typeof(sessionState)!="undefined"){
		sessionStateLocal = escape(sessionState);
	}
	else{
		mensajeErrorGlobal = cte_MENSAJE_INFORME_NO_SESION;
		return null;
	}

	//Proyecto, si no está informado se toma el almacenado en el API
	var proyectoLocal = proyecto;
	if(proyectoLocal == null || typeof(proyectoLocal)=="undefined"){
		proyectoLocal = api_proyecto;
	}
	else{
		proyectoLocal = escape(proyectoLocal);
	}

	//servidorMST, si no está informado se toma el almacenado en el API
	var servidorMSTLocal = servidorMST;
	if(servidorMSTLocal == null || typeof(servidorMSTLocal)=="undefined"){
		servidorMSTLocal = api_servidorMST;
	}

	//host, si no está informado se toma el almacenado en el API
	var hostLocal = host;
	if(hostLocal == null || typeof(hostLocal)=="undefined"){
		hostLocal = api_host;
	}

	//puerto, si no está informado se toma el almacenado en el API
	var puertoLocal = puerto;
	if(puertoLocal == null || typeof(puertoLocal)=="undefined"){
		puertoLocal = api_puerto;
	}

	//aplicacion, si no está informado se toma el almacenado en el API
	var aplicacionLocal = aplicacion;
	if(aplicacionLocal == null || typeof(aplicacionLocal)=="undefined"){
		aplicacionLocal = api_aplicacion;
	}

	var cabeceraServlet = "?taskId=checkUserPrivileges&privilegeTypes=1";
	var cabeceraSessionState = "&sessionState=";

	//http://<hostLocal>:<puertoLocal>/<aplicacionLocal>/servlet/taskProc?taskId=checkUserPrivileges&privilegeTypes=1&sessionState=<sessionStateLocal>
	var url = cte_CABECERA_HTTP + hostLocal + ":" + puertoLocal + "/" + aplicacionLocal + "/servlet/taskProc" + cabeceraServlet + cabeceraSessionState + sessionStateLocal; 

	var retorno = ejecutarPeticionAJAX_MicroStrategy(url,false,metodoEnvio);

	//Se recupera la información <privileges>, esto sirve para saber si la sesión sigue activa 
	if(retorno != null && typeof(retorno)!="undefined"){
		// Si se ha devuelto OK, se devuelve la sesión 
		if(retorno.indexOf("<privileges>")!=-1){
			retorno = sessionState;
		}
		//si se obtienen cualquier otro resultado, se vuelve a hacer login
		else{
			retorno = null;
		}
	}

	//Si se ha devuelto error de sesion, se vuelve a hacer login
	if(retorno == null || typeof(retorno)=="undefined"){
		//parámetros: usuario,proyecto,servidorMST,host,puerto,aplicacion,metodoEnvio,funcionRespuestaOK,funcionRespuestaERROR)
		retorno = apiMicroStrategy_login(api_usuario,proyecto,servidorMST,host,puerto,aplicacion,cte_GET,null,null);
		//Si retorno es null o undefined, se muestra un mensaje de error
		if(retorno == null || typeof(retorno)=="undefined"){
			mensajeErrorGlobal = cte_MENSAJE_INFORME_NO_SESION;
		}
	}

	return retorno;

}

/**
 * Método que recibe el mensaje XML devuelto en la petición a MicroStrategy y busca si 
 * es un error enviado por MicroStrategy. Para ello se deben haber recibido los tags statusCode, taskErrorCode y errorMsg.
 * Si es han recibo estos tags, se devuelve el objeto JSON usando la función crearJSONErrorMicro()
 * En caso contrario el método devuelve la cadena vacía.  
 */ 
function obtenerErrorMST(cadena){

	var statusCode ="";
	var taskErrorCode = "";
	var errorMsg = "";

	//status code

	var cadenaAux = cadena;
	var posInicio =  cadenaAux.indexOf(cte_STATUS_CODE_IGUAL)+cte_STATUS_CODE_IGUAL.length;
	cadenaAux = cadenaAux.substring(posInicio);
	var posFin = cadenaAux.indexOf("\"");
	if(posInicio != -1 && posFin != -1){
		statusCode = cadenaAux.substring(0,posFin);
	}
	//task error code
	cadenaAux = cadena;
	posInicio =  cadenaAux.indexOf(cte_TASK_ERROR_CODE_IGUAL)+cte_TASK_ERROR_CODE_IGUAL.length;
	cadenaAux = cadenaAux.substring(posInicio);
	posFin = cadenaAux.indexOf("\"");
	if(posInicio != -1 && posFin != -1){
		taskErrorCode = cadenaAux.substring(0,posFin);
	}
	//error msg
	cadenaAux = cadena;
	posInicio =  cadenaAux.indexOf(cte_ERROR_MSG_IGUAL)+cte_ERROR_MSG_IGUAL.length;
	cadenaAux = cadenaAux.substring(posInicio);
	posFin = cadenaAux.indexOf("\"");
	if(posInicio != -1 && posFin != -1){
		errorMsg = cadenaAux.substring(0,posFin);
	}

	//Si los tres tienen valor, es un error de microStrategy
	var json = "";
	if(statusCode != "" && taskErrorCode != "" && errorMsg != ""){
		json = crearJSONErrorMicro(statusCode,taskErrorCode,errorMsg);
	}

	return json;

}

/******************************************************************
 *  COMUNICACION AJAX                                              *  
 *******************************************************************/  
/**
 * Devuelve la ruta donde se encuentra la librería JSP que hace las peticiones a MST
 */ 
function devolverRutaLibreriaSP(){

	var head = document.getElementsByTagName("head")[0];
	var aplicacionJSP = "/peticion";
	if( typeof(head) !="undefined" && head != null){
		var numElemHijos = head.childNodes.length;
		var salir = false;
		for(var i=0;i<numElemHijos && salir==false;i++){
			var hijo = head.childNodes[i];

			//El nodo es de tipo Script
			if(hijo.nodeName == cte_SCRIPT){
				//Se está incluyendo la librería apiMicroStrategy.js
				if(hijo.src.indexOf(cte_NombreLibreriaAPI)!=-1){
					var aplicacionWAS = "";
					var loc = document.location;
					var hostWAS = "";
					if(typeof loc != "undefined" && loc != null){
						if(typeof(loc.host) != "undefined" && loc.host != null){
							hostWAS = loc.host
						}
						//si  existe el location y existe el campo pathname, se coge este.
						if(typeof(loc.pathname) != "undefined" && loc.pathname != null){
							//recortamos para quedarnos con el nombre de la aplicación
							var array = loc.pathname.split("/");
							if(array.length>1){
								aplicacionWAS = array[0];
								if(array[0]==""){
									aplicacionWAS = array[1];
								}
								aplicacionWAS = "/" + aplicacionWAS;
							}
						}
					}

					var trozos = hijo.src.split("/");
					var lon = trozos.length;
					var empezarACopiar = false;

					//IExplorer
					if(ie){
						for(var j=0;j<lon;j++){
							if(j!=lon-1){
								if(trozos[j]!=""){
									empezarACopiar = true;
								}
								if(empezarACopiar == true){
									aplicacionJSP = "/"+ trozos[j] + aplicacionJSP
								}
							}
						}
					}
					//Firefox 
					else{ 
						for(var j=0;j<lon;j++){
							if(j!=lon-1){
								if(empezarACopiar == true){
									aplicacionJSP = "/"+ trozos[j] + aplicacionJSP
								}
								if(trozos[j]==hostWAS){
									empezarACopiar = true;
								}
							}
						}          
					}
					//Al encontrar un js, salimos        
					salir = true;
				}
			}
		}
	}
	
	//Se componen las dos cadenas.
	aplicacionJSP = aplicacionWAS + aplicacionJSP;

	return aplicacionJSP;
}

/**
 * Función que devuelve un objeto de tipo XMLHttpRequest (objeto AJAX)
 */  
function getHTTPObject() {

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
 * Función que ejecuta la petición AJAX a MicroStrategy
 */  
function ejecutarPeticionAJAX_MicroStrategy(url,peticionLogin,metodoEnvio){

	//Obtener el objeto AJAX
	var req=getHTTPObject();
	var resultado = null;

	var url_mod = devolverRutaLibreriaSP()+'?url='+encodeURIComponent(url);

	//Si el api_usuario no es nulo, se notifica PeticionMicrostrategy.jsp como parámetro.
	//Si el petición de login se inserta el usuario, si no no
	if(peticionLogin){
		if (api_usuario != null && api_usuario != undefined){
			url_mod = url_mod + "&usuario="+api_usuario;
		}
	}

	//Se añade el método de envío.
	if (metodoEnvio != null && metodoEnvio != undefined){
		url_mod = url_mod + "&metodoEnvio="+metodoEnvio;
	}

	try{
		req.open(cte_GET,url_mod+"&hash="+Math.random(),false);
		req.send(null);

		//Si el estado de la peticion es COMPLETO
		if (req.readyState == 4){
			//Se comprueba que se ha recibido una respuesta correcta
			if (req.status == 200){
				resultado = req.responseText;
			}
			else{
				mensajeErrorGlobal = cte_MENSAJE_ERROR_AJAX + req.status + " - " + req.statusText;
			}
		}
	}catch (e){
		mensajeErrorGlobal = e.message;
		resultado = null;
	}

	return resultado;		

}

/**
 * Recupera el valor entrecomillado.
 * @param valor
 * @returns
 */
function recuperarValorComillas(valor){
	var i_antes = valor.indexOf("\"");
	valor = valor.substring(i_antes+1);

	var i_despu = valor.indexOf("\"");
	valor = valor.substring(0,i_despu);

	return valor;
}

/**
 * Realiza el parseo a JSON
 * @param texto
 * @returns JSON
 */
function parsearAJSON (texto){
	var text = texto;
	var resultado = {};

	if (text != null && text.indexOf("{") === 0)
	{
		text=text.replace(/{/g, "");

		//Se quita lo que haya al final de la llave de finalización
		var indi = text.indexOf("}");
		var indiText = text.substring(indi+1);
		text=text.replace(indiText, "");

		text=text.replace(/}/g, "");
		var arrayDatos = text.split(",");
		for (i = 0; i < arrayDatos.length; i++)
		{
			var element = arrayDatos[i]
			var index = element.indexOf(":");
			var key = element.substring (0, index);
			var value = element.substring (index + 1, element.length);

			//Se obtiene únicamente los valores entre comillas
			key = recuperarValorComillas(key);
			value = recuperarValorComillas(value);

			resultado[key] = value;
		}
	}

	return resultado;
}