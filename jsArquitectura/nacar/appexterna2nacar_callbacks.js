/////////////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES DE CALLBACK  (Editable por la aplicación)  - PORTAL    ////////////
/////////////////////////////////////////////////////////////////////////////////////////
   
  /**
   *   Activar Escenario Callback
   */      
  function appExterna2NACAR_activarEscenario_callback(resultado){
    return resultado;
  }
  
  /**
   * Ejecutar Operacion Escenario Callback
   */
  function appExterna2NACAR_ejecutarOperacionEscenario_callback(resultado){
    return resultado;
  }
  
  /**
   *   Subir datos al objeto de negocio
   */      
  function appExterna2NACAR_subirObjetosNegocio_callback(resultado){
    return resultado;
  }
  
  /**
   * Obtener datos del objeto de negocio
   */
  function appExterna2NACAR_tratarF5_callback(resultado){
    return resultado;
  }


  /**
   *  Obtener número de tareas abiertas
   */    
  function appExterna2NACAR_getNumeroTareasAbiertas_callback(resultado){
    return resultado;
  }

  /**
   *  Activar Tarea
   */    
  function appExterna2NACAR_activarTarea_callback(resultado){
    return resultado;
  }

  /**
   *  Modificar Descripción Aplicativa
   */    
  function appExterna2NACAR_modificarDescripcionAplicativa_callback(resultado){
    return resultado;
  }

  /**
   *  Obtener identificador de la tarea activa
   */    
  function appExterna2NACAR_getIDTareaActiva_callback(resultado){
    return resultado;
  }

  /**
   *  Ejecutar tarea Objeto de Negocio
   */    
  function appExterna2NACAR_ejecutarTareaObjetoNegocio_callback(resultado){
    return resultado;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// FUNCIONES DE CALLBACK  (Editable por la aplicación)  - ESCRITORIO PESADO    ////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
  
  /**
   *   Activar Escenario Respuesta
   */      
  function appExterna2NACAR_respuestaResultadoCambioEscenario(control,resultado){
    return resultado;
  }
  
  /**
   * Ejecutar Operacion Escenario Respuesta
   */
  function appExterna2NACAR_respuestaResultadoOperacion(control,resultado){
    return resultado;
  }
  
  /**
   *   Subir datos al objeto de negocio Respuesta
   */      
  function appExterna2NACAR_respuestaSubirObjetosNegocio(control,resultado){
    return resultado;
  }
  
  /**
   * Obtener datos del objeto de negocio Respuesta
   */
  function appExterna2NACAR_respuestaTratarF5(control,resultado){
    return resultado;
  }

  /* FUNCIONES DE RESPUESTA DE ERROR EN PESADOS*/
  appExterna2NACAR_funcionError=function(control,respuesta,es404){
    var respue = respuesta;
    if(es404){
      respue = "Es error de comunicaciones"
    }
    return respue;
  }
