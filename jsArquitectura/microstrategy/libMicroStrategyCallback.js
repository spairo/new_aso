/**
 * Funci�n de respuesta de una ejecuci�n correcta.
 * @param respuesta
 * @returns 
 * Se recibe la respuesta en formato JSON, que tendr�a la siguiente estructura:
 * {"estado":"00","retorno":"<retorno>"}
 * Revisar la gu�a de usuario para mayor detalle.
 */
function funcionOK(respuesta){
	return respuesta;
}

/**
 * Funci�n de respuesta de una ejecuci�n err�nea.
 * @param respuesta
 * @returns
 * Se recibe la respuesta en formato JSON, que tendr�a la siguiente estructura:
 * {"estado":"10","statusCode":"<statusCode>","taskErrorCode":"<taskErrorCode>","errorMsg":"<errorMsg>"}
 * Revisar la gu�a de usuario para mayor detalle.
 */
function funcionERROR(respuesta){
	return respuesta;
}
