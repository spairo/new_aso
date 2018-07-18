/**
 * Función de respuesta de una ejecución correcta.
 * @param respuesta
 * @returns 
 * Se recibe la respuesta en formato JSON, que tendría la siguiente estructura:
 * {"estado":"00","retorno":"<retorno>"}
 * Revisar la guía de usuario para mayor detalle.
 */
function funcionOK(respuesta){
	return respuesta;
}

/**
 * Función de respuesta de una ejecución errónea.
 * @param respuesta
 * @returns
 * Se recibe la respuesta en formato JSON, que tendría la siguiente estructura:
 * {"estado":"10","statusCode":"<statusCode>","taskErrorCode":"<taskErrorCode>","errorMsg":"<errorMsg>"}
 * Revisar la guía de usuario para mayor detalle.
 */
function funcionERROR(respuesta){
	return respuesta;
}
