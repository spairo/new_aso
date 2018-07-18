  //Debe estar en ajax.js o similar
  function ajaxAppExterna2NACAR_ejecutarPeticionAJAX(url,funcionRespuesta,parametros,sincAsinc,funcionError,archivoTXT){
  
     	//Obtener el objeto AJAX
     	var req=ajaxAppExterna2NACAR_getHTTPObject();
      	
     	try{
      		
     		if(sincAsinc==null){
     			//si el parámetro no viene informado, por defecto asincrono
     			sincAsinc=true;
     		}
      		
     		if ((funcionRespuesta==null)|| (funcionRespuesta==undefined)){	
     			//Si no se ha definido una funcion de respuesta se tratará una petición sincrona en la que se devuelva directamente el resultado
     			sincAsinc=false;
     		}
     		if (sincAsinc){
     		    //Si la peticion es asíncrona
        			req.onreadystatechange=ajaxAppExterna2NACAR_getReadyStateHandler(req,parametros,funcionRespuesta,funcionError);
     		}
          
          
     	req.open("POST",url,sincAsinc);
      	
     	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      req.setRequestHeader("Pragma", "no-cache");
      req.setRequestHeader("Cache-Control", "no-cache");	
      	
     	var valores=archivoTXT+ "&hash="+Math.random();
      	
     	req.send(valores);
      	
      //Si la petición es sincrona devolvemos el resultado en el responseText de la request
      if (!sincAsinc){
        return req.responseText;
      }
    }catch (e){
      funcionError("Se ha producido el siguiente error: " + e.message);
      return;
    }
  }


// -------------------------------------------------------------------
// Función que devuelve un objeto de tipo XMLHttpRequest (objeto AJAX)//
// -------------------------------------------------------------------
function ajaxAppExterna2NACAR_getHTTPObject() {

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


// -------------------------------------------------------------------------
// Función que se llama cuando se recibe el evento de respuesta del servidor//
// -------------------------------------------------------------------------
function ajaxAppExterna2NACAR_getReadyStateHandler(req,control,funcionRespuesta,funcionError){
//Devuelve una funcion anónima que escucha a la instancia XMLHttpRequest
	return function (){
	  //Si el estado de la petición es COMPLETO
		if (req.readyState == 4){
			//Se comprueba que se ha recibido una respuesta correcta
			if (req.status == 200){	
				
				if (funcionRespuesta==null){
					//Si la función no ha sido informada
					alert("No hay función de respuesta, la petición es síncrona");
				}else{
					//Si se ha informado la función
					funcionRespuesta(control,req.responseText);
				}
			} else {
	  			  if ((req.status==404)||(req.status==12029)){
			              funcionError(control,req.responseText,true);
			          }else	if (req.responseText!=""){
    					funcionError(control,req.responseText,false);
				}
			}			
			req.onreadystatechange=function(){}//null produce un error de tipos en explorer 6
			req.abort();
			req=null;
	   }
  }
}