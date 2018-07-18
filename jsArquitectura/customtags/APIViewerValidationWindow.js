/*APIViewerValidationWindow.js*/ 
/*INICIO VisorAvanzadoVentana.js*/ 
/**********************************************
**********************************************
	VisorAvanzadoVentana.js
	API Y CONTROL DEL CUSTOMTAG DEL VISOR
**********************************************
**********************************************
cache? thumbnails de la tira
deshabilitar los botones de la barra vertical
****
Configuracion 
**/



//var _va_idDiv='';
var _va_URLServletArchivoWAS = 'ServletVisor';
//var _va_URLServletArchivoWAS = '/qnpl_es_web/servlet/ServletVisor';
var _va_URLServletArchivoWAS_params = '&LOCALE=es_ES';
var _va_URLServletArchivoLocal ='http://localhost:8080/servlet/ServletArchivo';
var _va_URLServletArchivoLocal_params ='';
var _va_iconoPdf = '';
var _va_iconoOther = '';
var _va_TimeOutDesagrupando = 40; // tiempo maximo en segundos
var _va_dpiDesagrupar = 150;

var _va_rutaTemporal = '/tmp/pdftests/';
var _va_PollingInterval = 2000;		// Tiempo de refresco de la tira
var _va_servidor_SeparadorRutasWAS = '/';	// '/' para unix '\\' para windows, aunque java entende bien /, yo no lo tocaría
var _va_servidor_SeparadorRutasLocal = '/';
var _va_ModoBarraPdf = true;				// modo visualizar barra pdf, podría usarse
var _va_anchoToolbarParaPluginAdobe_IE = 40;
var _va_anchoToolbarParaPluginAdobe_Standard = 40;
var _va_insertarCategoriaSiNoExiste = true; // insertar la categoria en la tira si no está insertada ya
var _va_crearCategoriaSiNoExiste = true; // crear la categoria si no existe en va_categorias
var _va_ConectarCategorias = true;	/* poder arrastrar una imagen de una categoria a otra, o false si solo quieres que se puedan reordenar dentro de la misma categoria */
var _va_permitirDescategorizarDocumento = true;		// A true permite pasar un documento de una categoria a "Sin categoria"
var _va_HeredarCategoriaAlDesagrupar = true;
var _va_zoom100por100enCombo = 5;	// depende de la interfaz que hayas pintado en la custom
var _va_distanciaStartDrag = 5;
var _va_retrasarEventos = false;
var _va_OcultarWorkareaAlMostrardialogo = true;
var _va_TamanioImagenesGeneradas = "12.7 KB";
var _va_TamanioNombre = 'Tamaño';
var _va_PasarAEdicionTrasInsertarPagina = true;
var _va_AlDesagruparEliminarOriginales = true;	// desaparecen los documentos originales

// esto a true hace que nada mas inicializar el visor se haga una 
// petición al servlet de desagrupado para que desagrupe un pdf en blanco, y 
// ya tenga inicializado todo el tinglado de qoppa
var _va_inicializarServlet = true;	

// debug:
_va_mostrar_ventana_depuracion = false;
_va_depura = true;
_va_CtrlShiftAbreDepuracion = true;
_va_depuracionAvanzada =true;

/**_va_calculateTimestamp
Funcion que devuelve un trozo de cadena que el servlet unir? al nombre de fichero
para hacer el directorio de desagrupado unico y evitar? problemas de concurrencia.*/
var _va_calculateTimestamp = function (){
	return '' + (new Date()).getTime() + 'r' + Math.floor(Math.random()*999);
};

/** Variables internas **/
var va_visores = [];
var va_documentos = []; // va_documentos[id_visor][posicion_documento]{ id de ellos, url, titulo, DATA, y algunos campos mas...}
var va_categorias = [];
var va_job = [];
var va_jobinfo = [];
var va_jobchanges = [];

//Comprueba que una variable este definida en un tipo concreto y que no sea nula
// variable(any): la variable que se quiere comprobar si es valida
// type(string): el tipo al que debe pertenecer la variable
//Devuelve true si la variable es valida, y false si no lo es
function isValidVariable(variable, type){
	if(typeof variable == type && variable != null){
		return true;
	}
	return false;
}

//Comprueba si un valor existe en una propiedad concreta de cada objeto, dentro de un array de objetos
// value(any): el valor a buscar en el array
// array(object): el array de objetos que recorrera la busqueda
// property(string): la propiedad de cada objeto donde se buscara la coincidencia
//Devuelve el indice de la coincidencia, -1 si no existe o -2 si "property" no es valido
function valueExist(value, array, property){
	var index = -1;
	if(!isValidVariable(property, 'string') || property == ''){
		index = -2;
	}else if(isValidVariable(array, 'object')){
		for(var i=0; i<array.length; i++){
			if(typeof array[i][property] != 'undefined' && array[i][property] != null && array[i][property] == value){
				index = i;
				break;
			}
		}
	}
	return index;
}

//Asegura un objeto global de la estructura interna del API; si no existe, lo inicializa
// viewerID(string): el ID del visor en cuestion
// globalObject(object): el objeto que se comprobara
//Devuelve el objeto global comprobado o inicializado
function ensureGlobalObject(viewerID, globalObject){
	if(!isValidVariable(globalObject, 'object')){
		globalObject = [];
		globalObject[viewerID] = [];
	}else if(!isValidVariable(globalObject[viewerID], 'object')){
		globalObject[viewerID] = [];
	}
	return globalObject;
}

//Lanza mensajes a la consola del navegador web
// txt(string): mensaje a mostrar
function depura(txt){
	if(!_va_depura || typeof txt == 'undefined' || txt == null || txt == ''){
		return;
	}
	if(typeof console != 'undefined'){
		console.log(txt);
	}
	
	var $div_depuracion = $('#div_depuracion');
	if(isValidVariable($div_depuracion, 'object')){
		if($div_depuracion.length == 0){
			$('body').append('<div id="div_depuracion" style="display:none;background:#ccc;border:1px solid black;font-face:Courier New; position:absolute;top:0;left:0;width: 100px; height:80px; overflow:auto;z-index:9999;opacity: 0.99;filter: alpha(opacity = 99);"></div>');
			if(isValidVariable($div_depuracion.draggable, 'function')){
				$div_depuracion.draggable();
			}
			if(isValidVariable($div_depuracion.resizable, 'function')){
				$div_depuracion.resizable();
			}
			if(_va_depuracionAvanzada && $('#campotextodebug1234').length == 0){
				$div_depuracion.append('<input type="text" id="campotextodebug1234" value="'+document.location.href+'">' +	'<input type="button" value="dale!" onclick="document.location.href=document.getElementById(\'campotextodebug1234\').value"><br/>');
			}
		}else{
			$div_depuracion.append(txt+'<br>');
		}
	}
	if(_va_mostrar_ventana_depuracion){
		muestradepuracion();
	}
}

function muestradepuracion(){
	if(!_va_depura){
		return;
	}
	$('#div_depuracion').show().height(500);
}

/** Inicializacion de visores **/
function inicializaVisor(id_visor, opciones){
	depura('inicializaVisor("'+id_visor+'", '+opciones+')');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('inicializaVisor: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion');
	}

	//Inicializa los objetos globales
	va_visores = ensureGlobalObject(id_visor, va_visores);
	va_categorias = ensureGlobalObject(id_visor, va_categorias);
	va_job = ensureGlobalObject(id_visor, va_job);
	va_jobinfo = ensureGlobalObject(id_visor, va_jobinfo);
	va_jobchanges = ensureGlobalObject(id_visor, va_jobchanges);
	va_documentos = ensureGlobalObject(id_visor, va_documentos);

	va_loadOptions(id_visor, opciones);

	depura('\tID visor inicializado: ' + id_visor);
	depura('\tVersion navegador: ' + jQuery.browser.version);
	depura('\tVersion Flash Player: ' + getFlashVersion());
	depura('\tVersion JQuery: ' + jQuery.fn.jquery);
	depura('\tVersion JQueryUI: ' + (jQuery.ui ? jQuery.ui.version : 'No presente'));

	organizaEntradaDocumentos(id_visor);

	inicializaTiraVW(id_visor);

	// Inicializa el tema de los xml
	va_reiniciarJobChanges(id_visor);

	// Si no vienen documentos en el visor, no agrupas nada
	if(va_documentos[id_visor].length == 0){
		va_visores[id_visor].IndicadorAgrupado = false;
	}
	if(va_documentos[id_visor].length == 1){
		// solo un documento
		var urltmp = va_documentos[id_visor][0].Uri;
		if(typeof urltmp == 'undefined' || urltmp == ''){
			urltmp = va_documentos[id_visor][0].Path;
		}
		if(va_getTipoFromUrl(urltmp, va_documentos[id_visor][0].tipo) == 'pdf' || va_getTipoFromUrl(urltmp, va_documentos[id_visor][0].tipo) == 'zip'){
			// es un PDF o un ZIP
			// --> SE MUESTRA AGRUPADO
			va_visores[id_visor].IndicadorAgrupado=true;
			va_visores[id_visor].estadoAgrupado=true;
		}
	}
	if (va_visores[id_visor].IndicadorAgrupado){
		//  INDICADOR DE AGRUPADO = true --> 
		//	se muestra el icono de agrupado, y se ocultan los elementos de la tira.
		va_visores[id_visor].mostradoAgrupado=true;
	}

	var ajusteAlturaTira=0;
	var ajusteAlturaWA=0;
	if(jQuery.browser.msie){
		ajusteAlturaTira=8;
		ajusteAlturaWA=8;
	}
	if($('#' + id_visor + '_toolbar').length!=0){
		ajusteAlturaTira += $('#' + id_visor + '_toolbar').height() + 2;
		ajusteAlturaWA = ajusteAlturaTira;
	}
	if($('#' + id_visor + '_title').length!=0){
		ajusteAlturaTira += $('#' + id_visor + '_title').height() + 2;
		ajusteAlturaWA = ajusteAlturaTira;
	}
	if($('#' + id_visor + '_pestanas').length!=0){
		ajusteAlturaWA += $('#' + id_visor + '_pestanas').height();
	}
	$('#' + id_visor + '_workarea').height($('#' + id_visor).height() - ajusteAlturaWA);
	$('#' + id_visor + '_filmstrip').height($('#' + id_visor).height() - ajusteAlturaTira);
	$('#' + id_visor + '_table').css('width', '100%');
	var tr = $('#' + id_visor + '_table tr').eq(1);
	var tds = tr.children('td');
	tds.eq(0).css('width', '100%').attr('width', '100%');
	tds.eq(0).css('background', '#f4f4f4').attr('background', '#f4f4f4');
	$('#' + id_visor + '_filmstrip').css('width', '100%');
	
	//Tira liquida
	//-----------------------------
	
	var td0 = tds[0];
	var td2 = tds[2];
	var table = $('#' + id_visor + '_table');
	tds[1].onmouseover = function(){
		$(this).css('cursor', 'col-resize');
	};
	
	tds[1].onmousedown = function(){

		var resultWidth;
		var td0Left = td0.offsetLeft;
		var tableWidth = table[0].offsetWidth;
		table.mousemove(function(event){

			resultWidth = event.pageX - td0Left;
			td0.style.width = resultWidth + 'px';
			td0.setAttribute('rel', resultWidth + 'px');
			td2.style.width = (tableWidth - resultWidth) + 'px';
					$('#' + id_visor + '_emptyviewer' ).css('width', td2.style.width).attr('width', td2.style.width);
		});
		$('iframe').hide();
		$('#' + id_visor + '_emptyviewer' ).css('width', '100%').attr('width', '100%');
	};
	table.mouseup(function(){
		table.unbind('mousemove');
		$('iframe').show();
		$('#'+ id_visor + '_emptyviewer' ).css('width', '100%').attr('width', '100%');
	});

	
	$('#'+id_visor+'_toolbar').resize(function(){
		td0.style.width = '1px';
		td0.style.width = '20%';
		$('#' + id_visor + '_emptyviewer' ).css('width', '100%').attr('width', '100%');
	});

	
	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	
	tds.eq(2).css('width','').removeAttr('width');
	$('#' + id_visor + '_workarea').css('width','100%');
	$('#' + id_visor + '_workarea').children().css('width','100%');
	$('#' + id_visor + '_workarea').find('object').css('width','100%').attr('width','100%');
	$('#' + id_visor + '_workarea').find('embed').css('width','100%').attr('width','100%');
	va_visores[id_visor].redimensionaIE = function(){
		var tds = tr.children('td');
		var anchoTira = parseInt(tds.eq(0).attr('rel'));
		var anchoWa = Math.max(1, tr.width() - anchoTira);
		tds.eq(0).css('width', anchoTira + 'px').attr('width', anchoTira);
		tds.eq(2).css('width', anchoWa + 'px').attr('width', anchoWa);
	};
	$(window).resize(va_visores[id_visor].redimensionaIE);
	va_visores[id_visor].redimensionaIE();
	initToolBar(id_visor);

	if(typeof va_documentos[id_visor] != 'undefined' && typeof va_documentos[id_visor][0] != 'undefined' &&	typeof va_documentos[id_visor][0].id != 'undefined'){
		setTimeout(function (){
			av_SelectDocumentByID(id_visor, va_documentos[id_visor][0].id, false);
			av_LoadDocumentByID(id_visor, va_documentos[id_visor][0].id, null, va_documentos[id_visor][0].SourceLocation);
			$("#" + id_visor + "_toolbar input.btnNavigator").val('1');
			if(!(va_visores[id_visor].estadoAgrupado)){
				$('#' + id_visor + ' span.nPages').html('/' + va_documentos[id_visor].length);
			}
		},100);
	}else if(typeof va_job[id_visor] != 'undefined' && typeof va_job[id_visor][0] != 'undefined' &&	typeof va_job[id_visor][0].id != 'undefined' && (typeof va_job[id_visor][0].Uri !='undefined' ||  typeof va_job[id_visor][0].Path !='undefined')){
		setTimeout(function (){
			av_SelectDocumentByID(id_visor, va_job[id_visor][0].id, false);
			av_LoadDocumentByID(id_visor, va_job[id_visor][0].id);
			$("#" + id_visor + "_toolbar input.btnNavigator").val('1');
		},100);
	}

	/* Reajustes visuales **/
	setTimeout(function (){
		if ($('#' + id_visor + '_toolbar').length!=0){
			$('#' + id_visor + '_toolbar .buttonDisabled').css('filter', 'alpha(opacity=40)');
		}
		$('.ImageViewer .FilmStrip ul li')
		.css('padding', '0')
		.css('float', 'none');
		$('.ImageViewer .FilmStrip ul img')
		.css('margin-top','10px');
	},50);

	$('.toolBarButton').not('.inputPage').css('border','1px solid #ebebeb');

	/** Inicializacion del servlet de desagrupacion **/
	if(_va_inicializarServlet){
		setTimeout(function (){inicializarServletDesagrupacion(id_visor);},1000);
	}

	if(!av_IsVisibleTiraImagenes(id_visor)){
		av_setBtnDisabled(id_visor, true, 'btnZip');
		av_setBtnDisabled(id_visor, true, 'btnJoinToPDF');
	}
	
	/** Ventana de depuracion */
	$('#' + id_visor).click(function (e){
		if(_va_CtrlShiftAbreDepuracion && e.ctrlKey && e.shiftKey){
			muestradepuracion();
		}
	});
}

function flash_mouseUp(id_visor){
	$('#' + id_visor[0] + '_table').mouseup();
}

function vaf_getOutputXmlPath(id_visor){
	if(va_visores[id_visor].outputXmlPath){
		return va_visores[id_visor].outputXmlPath;
	}else{
		return '';
	}
}

/**	Carga las opciones pasadas al visor, en la tag y por defecto **/
function va_loadOptions(id_visor, opciones){
	depura('va_loadOptions("'+id_visor+'", '+opciones+')');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('va_loadOptions: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion.');
	}
	
	if(!isValidVariable(va_visores, 'object')){
		va_visores = [];
	}
	va_visores[id_visor]={
		seleccionMultiple: true,
		$tiraimagenes: $('#'+id_visor+'_filmstrip' ).children('ul'), 
		IndicadorAgrupado: false,	// lo que viene del servidor (de la custom)
		estadoAgrupado: false,	// Estado actual real del documento (lo que hay en la tira ahora mismo)
		mostradoAgrupado: false,	// como se muestra en la tira
		categoriasInicializado: false,
		fieldSelected: false,
		validationImageLoaded: false,
		btnFullScreenVisible: false,
		
		// A true permite pasar un documento de una categoria a "Sin categoria" mediante la interfaz (mediante el api simpre permite)
		permitirDescategorizarDocumento: _va_permitirDescategorizarDocumento, 
		modo: '',	// MODO: archivo cargado, puede ser 'pdf', 'img', 'other' o ''  (es igual que el tipo de documento)
		modoEdicion: false,
		modoValidacion: false, 
		ultimoElementoDeLaTiraSeleccionado:-1,
		ultimoIdDocumentoCargado: '', 
		ultimaCapaVisible: -1,
		
		// combo setZoom:
		prev_selzoom_textoPersonalizado: va_literalesValidacion.personalizado,	// Texto "personalizado..:"
		prev_selzoom_index:-1, 	// indice del option del combo donde ahora
		prev_selzoom: "", 			// texto anterior del option del combo donde ahora pone "personalizado"
		prev_selzoom_value: -1,		// valor
		prev_selzoom_restored: true,
		lastSelectedDocument: null, // ID del ultimo documento seleccionado

		// PdfToolBar visible
		showAdobeBar: true, 

		// Rutas:
		rutaTemporalWAS: _va_rutaTemporal,	// Ruta de intercambio para los pdfs
		rutaServletWAS: _va_URLServletArchivoWAS,
		parametrosExtraServletWAS: _va_URLServletArchivoWAS_params,
		separadorRutasWAS: _va_servidor_SeparadorRutasWAS,	// '/' para unix '\\' para windows
		rutaServletLocal: _va_URLServletArchivoWAS,
		parametrosExtraServletLocal: _va_URLServletArchivoWAS_params,
		separadorRutasLocal: _va_servidor_SeparadorRutasLocal,	// '/' para unix '\\' para windows
		
		// control del desagrupado
		heredarCategoriaAlDesagrupar: _va_HeredarCategoriaAlDesagrupar,
		desagrupacion : {}
	};

	// Si las rutas no acaban en / se la anade
	if(va_visores[id_visor].rutaTemporalWAS.substr(va_visores[id_visor].rutaTemporalWAS.length -1, 1) != va_visores[id_visor].separadorRutasWAS){
		va_visores[id_visor].rutaTemporalWAS += va_visores[id_visor].separadorRutasWAS;
	}
	if(va_visores[id_visor].rutaServletLocal.substr(va_visores[id_visor].rutaServletLocal.length -1, 1) != va_visores[id_visor].separadorRutasLocal){
		va_visores[id_visor].rutaServletLocal += va_visores[id_visor].separadorRutasLocal;
	}

	/**	si tienes la capa de edicion no visible **/
	if((($('#'+id_visor+'_pestanas_edicion').is(":visible") == false) ||	($('#'+id_visor+'_pestanas_edicion').is(".ImageViewer_disabledTab")))	&& ($('#'+id_visor+'_pestanas_validacion').is(":visible") == true)){
		va_visores[id_visor].modoValidacion = true;
	}

	if(isValidVariable(opciones, 'object')){
		if(isValidVariable(opciones.temporalPath, 'string') && opciones.temporalPath != ''){
			va_visores[id_visor].rutaTemporalWAS = opciones.temporalPath;
		}
		if(isValidVariable(opciones.multipleSelectionIndicator, 'boolean')){
			va_visores[id_visor].seleccionMultiple = opciones.multipleSelectionIndicator;
		}
		if(isValidVariable(opciones.groupIndicator, 'boolean')){
			va_visores[id_visor].IndicadorAgrupado = opciones.groupIndicator;
		}
		if(_va_ModoBarraPdf == true){
			opciones.showAdobeBar = true;
		}
		if(isValidVariable(opciones.showAdobeBar, 'boolean')){
			if(opciones.showAdobeBar != true){
				va_visores[id_visor].showAdobeBar = opciones.showAdobeBar;
			}
		}
		if(isValidVariable(opciones.outputXmlPath, 'string') && opciones.outputXmlPath != ''){
			va_visores[id_visor].outputXmlPath = opciones.outputXmlPath;
		}
		if(isValidVariable(opciones.btnFullScreenVisible, 'boolean')){
			va_visores[id_visor].btnFullScreenVisible = opciones.btnFullScreenVisible;
		}
	
		// Eventos:
		if(isValidVariable(opciones.onSelectionChanged, 'function')){
			va_pincharEvento(id_visor, 'onSelectionChanged', opciones.onSelectionChanged);
		}
		if(isValidVariable(opciones.onClassifiedDocument, 'function')){
			va_pincharEvento(id_visor, 'onClassifiedDocument', opciones.onClassifiedDocument);
		}
		if(isValidVariable(opciones.onPageMove, 'function')){
			va_pincharEvento(id_visor, 'onPageMove', opciones.onPageMove);
		}
		if(isValidVariable(opciones.onEnterEdit, 'function')){
			va_pincharEvento(id_visor, 'onEnterEdit', opciones.onEnterEdit);
		}
		if(isValidVariable(opciones.onExitEdit, 'function')){
			va_pincharEvento(id_visor, 'onExitEdit', opciones.onExitEdit);
		}
		if(isValidVariable(opciones.onUngroup, 'function')){
			va_pincharEvento(id_visor, 'onUngroup', opciones.onUngroup);
		}
		if(isValidVariable(opciones.onLoadDocument, 'function')){
			va_pincharEvento(id_visor, 'onLoadDocument', opciones.onLoadDocument);
		}
		if(isValidVariable(opciones.onTabChanged, 'function')){
			va_pincharEvento(id_visor, 'onTabChanged', opciones.onTabChanged);
		}
	}else{
		depura('va_loadOptions: el argumento "opciones" es nulo o no es un "object". Se cargan opciones por defecto.');
	}
}

/* Fatima */
// Obtiene la posicion un objeto document de la lista va_documentos
// de la tira, que tenga ese id asignado (si hay ids repetidos obtiene el primero!)
// si no lo encuentra devuelve -1
function va_getPosicionDocumento(id_visor, id){
	for(var i=0; i<va_documentos[id_visor].length; i++){
		if(typeof va_documentos[id_visor][i] !='undefined' && typeof va_documentos[id_visor][i].id !='undefined'){
				if(va_documentos[id_visor][i].id == id){
					return i;
				}
		}else{
			depura('documento incorrecto en la tira:'+id);
		}
	}
	return -1;
}
// Obtiene la posicion un objeto document de la lista va_documentos
// de la tira, que tenga ese id asignado (si hay ids repetidos obtiene el primero!)
// si no lo encuentra devuelve -1
function va_getPosicionGrupo(id_visor, id){
	for(var i=0; i<va_job[id_visor].length; i++){
		if(typeof va_job[id_visor][i] !='undefined' && typeof va_job[id_visor][i].id !='undefined'){
				if(va_job[id_visor][i].id == id){
					return i;
				}
		}else{
			depura('documento incorrecto en la tira:'+id);
		}
	}
	return -1;
}

// Obtiene un objeto document de la lista 
// de la tira, que tenga ese id asignado (si hay ids repetidos obtiene el primero!)
// si no lo encuentra devuelve null
function va_getDocumento(id_visor, id){
	var i = va_getPosicionDocumento(id_visor, id);
	if(i!=-1){
		return va_documentos[id_visor][i];
	}else{
		return null;
	}
}
// Obtiene un objeto documentos de va_job
// de la tira, que tenga ese id asignado (si hay ids repetidos obtiene el primero!)
// si no lo encuentra devuelve null
function va_getGrupoDocumentos(id_visor, id){
	var i = va_getPosicionGrupo(id_visor, id);
	if(i!=-1){
		return va_job[id_visor][i];
	}else{
		return null;
	}
}
// Obtiene un objeto documentos de va_job y si este grupo venia de un pdf o de un zip, lo devuelve. Si no devuelve null
function va_getDocumentoAgrupado(id_visor, id){
	var doc = va_getGrupoDocumentos(id_visor, id);
	if(doc!=null && typeof doc.DocumentoOriginal != 'undefined'){
		return doc.DocumentoOriginal;
	}
	return null;
}
	


// Obtiene el ID de un documento, que est? en el elemento LI pasado:
function va_LiId2DocumentId(id_visor, idLi){
	for(var i=0; i<va_documentos[id_visor].length; i++){
		if(typeof va_documentos[id_visor][i] !='undefined' && typeof va_documentos[id_visor][i].idLi !='undefined'){
			if(va_documentos[id_visor][i].idLi == idLi){
				return va_documentos[id_visor][i].id;
			}
		}else{
			depura('documento incorrecto en la tira');
		}
	}
	return '';
}

/**	PDF **/
function getPDFObject(pdfo){
	depura('getPDFObject("'+pdfo+'")');
	if(window.document[pdfo]){
		return window.document[pdfo];
	}
	if(jQuery.browser.msie){
		if(document.embeds && document.embeds[pdfo]){
			return document.embeds[pdfo]; 
		}
	}else{
		return document.getElementById(pdfo);
	}
}

function setUrlPdfObject(id_visor, url){
	depura('setUrlPdfObject("'+id_visor+'", "'+url+'")');
	var $obj = $('#'+id_visor + '_objetopdf');
	if($obj.length==0){
		generatePDFObject(id_visor, url);
		return;
	}else{
		$obj[0].src=url;
	}
	$obj = $('embed[name="'+id_visor + '_objetopdf"]')
	if($obj.length==0){
		generatePDFObject(id_visor, url);
		return;
	}else{
		$obj[0].src=url;
	}
}

function generatePDFObject(id_visor, urlpdf){
	str = "<object id='" + id_visor + "_objetopdf' class='PDFObject' classid='clsid:CA8A9780-280D-11CF-A24D-444553540000' viewastext src='";
	str += urlpdf +"' width='100%' height='100%' style='width:100%;height:100%;'>";
	str += "<param name='_cx' value='26035'><param name='_cy' value='15663'>";
	str += "<param name='src' value='" + urlpdf + "'><embed swliveconnect='true' width='100%' height='100%' style='width:100%;height:100%;' mayscript='true' AllowScriptAccess='always' ";
	str += "name='" + id_visor + "_objetopdf' src='" + urlpdf + "'></embed></object>";
	document.getElementById(id_visor + '_visorpdf').innerHTML = str;
}

/**	LOAD DOCUMENT **/
/*	Aqui se hace la chicha de esto:
	Argumentos:
		id_visor: visor en el que quieres cargar la url
		url: Ejemplos:
			http://www.google.es/images/logos/ps_logo2.png  (ruta absoluta)
			../qngx_es_web_pub/imagenes/eee.jpg			(ruta relativa)
			aaa.pdf				(pdf en ruta relativa, exactamente igual pdf que jpg)
			/tmp/escaneos/DOC00001.pdf	(ruta en el sistema de archivos del WAS)
			C:/temp/escaneos/DOC00001.pdf	(ruta en el sistema de archivos local).
			
		Si NO le pasas estos par?metros, los obtiene del documento (que normalmente los lleva incorporado).
		Lo suyo es no pasarselos, llamar a av_LoadDocumentByID(id_visor, iddocumento); asi.
		
		
		tipo:	Tipo de archivo
			'pdf'
			'img'	-> imagen	(se carga el visor flash)
			'auto'	-> se intenta sacar de la url, si es undefined se hace esto por defecto.
			'other' -> delega en el navegador pintarlo o no, deberia pintar el enlace al archivo o algo asi... TODO...
		SourceLocation:
			'local' : El archivo se cargar? a trav?s del servlet local 
					(Lo suyo ser?a usar Path del documento, si no est? definido, se coge el Uri,
					sin embargo TIENE QUE SER una ruta absoluta en el sistema de ficheros del cliente)
			'remoto' (por defecto)
					Si est? definido Uri se carga tal cual a trav?s de HTTP, 
					Si no est? definido o es '', por ejemplo porque no tenga una ruta accesible desde fuera a trav?s del was,
					se intenta cargar a trav?s del servlet con el Path.
					
					Se montar? una Url as?: http://%DominioActual%/%RutaServlet%?na=%PathArchivo
*/
function av_LoadDocument(id_visor, documento, tipo, SourceLocation){
	if(!isValidVariable(documento, 'object') && !isValidVariable(documento, 'string')){
		depura('av_LoadDocument("'+id_visor+'", '+documento+', "'+tipo+'", "'+SourceLocation+'")');
		return false;
	}else if(isValidVariable(documento, 'string')){
		depura('av_LoadDocument("'+id_visor+'", "'+documento+'", "'+tipo+'", "'+SourceLocation+'")');
		return av_LoadDocumentUrl2(id_visor, documento, tipo);
	}else if(isValidVariable(documento, 'object')){
		depura('av_LoadDocument("'+id_visor+'", '+documento+', "'+tipo+'", "'+SourceLocation+'")');
		if(typeof documento.Path!='undefined'){
			va_visores[id_visor].PathImagenCargada=documento.Path;
		}else{
			va_visores[id_visor].PathImagenCargada='';
		}
		var objUrl = va_formarURLyTipo(id_visor, documento, tipo, SourceLocation);
		if(typeof objUrl.puedeSacarNumPaginas !='undefined' && objUrl.puedeSacarNumPaginas){
			va_intentaObtenerNumPaginasPDF(id_visor, documento);
		}
		return av_LoadDocumentUrl2(id_visor, objUrl.url, objUrl.tipo);
	}
}

function av_LoadDocumentByID(id_visor, iddocumento, tipo, SourceLocation){
	depura('av_LoadDocumentByID("'+id_visor+'", "'+iddocumento+'", "'+tipo+'", "'+SourceLocation+'")');
	va_visores[id_visor].ultimoIdDocumentoCargado = iddocumento;
	var pos = va_getPosicionDocumento(id_visor, iddocumento);
	var doc = null;
	if(pos>-1){
		$('#'+id_visor+'_toolbar .inputPage').val(pos+1);
		$('#' + id_visor + ' span.nPages').html('/' + va_documentos[id_visor].length);
		 doc = va_documentos[id_visor][pos];
	}else{
		for(var i=0;i<va_job[id_visor].length;i++){	
			if(va_job[id_visor][i].id == iddocumento){
				doc = va_job[id_visor][i];
				break;
			}
		}
	}
	return av_LoadDocument(id_visor, doc, tipo, SourceLocation);
}

function av_LoadDocumentUrl(id_visor, url, tipo){
	depura('av_LoadDocumentUrl("'+id_visor+'", "'+url+'", "'+tipo+'")');
	for(docc in va_documentos[id_visor]){
		if(docc.Url==url){
			av_LoadDocument(id_visor, docc, tipo);
			return;
		}
	}
	av_LoadDocumentUrl2(id_visor, url, tipo);
}

function av_LoadDocumentUrl2(id_visor, url, tipo){
	depura('av_LoadDocumentUrl2("'+id_visor+'", "'+url+'", "'+tipo+'")');
	if(typeof id_visor=='undefined'|| id_visor=='' || typeof url=='undefined'|| url==''){
		depura('\tIntentaste cargar una url en blanco!! (ignorada peticion)');
		return;
	}
	tipo = va_getTipoFromUrl(url, tipo);
	if(typeof tipo!='string'){
		tipo='img';
	}else{
		tipo=tipo.toLowerCase();
		if(tipo!='img' && tipo!='pdf' && tipo!='other' && tipo!='zip'){
			tipo='img';
		}
	}
	tipo=tipo.toLowerCase();
	if(tipo!=''){
		switch(tipo){
			case 'pdf':{
				va_setObjectLayer(id_visor, 0);	// muestra capa PDF

				// Parche para Internet Explorer
				// Misteriosamente, el plugin de acrobat no es capaz de cargar urls relativas en IE, aqui las convierto en absolutas
				if(url.substr(0,4) != "http"){
					// url relativa ...si empieza por / le aniado el dominio
					if(url.substr(0,1) == "/"){
						var prot = (("https:" == document.location.protocol) ? "https://" : "http://");
						if(window.location.port!=""){
							url = prot + document.domain + ":" + window.location.port + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}else{
							url = prot + document.domain + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}
					}else{
						// es relativa a la pagina actual, busco la ultima barra
						var ubicacion = document.location.toString();
						var auxPos = ubicacion.indexOf('?');
						if(auxPos != null && auxPos > 0){
							var pos = ubicacion.substr(0,auxPos).lastIndexOf('/');
						}else{
							var pos = ubicacion.substr(0).lastIndexOf('/');
						}
						if(pos!=-1){
							url = ubicacion.substr(0, pos +1) + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}else{
							url = ubicacion + '/' + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}
					}
				}

				// Selecciona el zoom ajustar a pagina por defecto al cargar un pdf
				if($("#" + id_visor + '_toolbar select[name="btnZoom"]').length>0){
					vaf_quitaOtrosZooms(id_visor);
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq(0).attr('selected','selected');
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel',0);
				}
				setUrlPdfObject(id_visor, url);
				try{
					getPDFObject(id_visor + '_objetopdf').SetShowToolbar(va_visores[id_visor].showAdobeBar);
				}catch(ex){
					depura('\tOcultar PDFToolbar solo esta soportado en Internet Explorer');
					va_visores[id_visor].showAdobeBar=true;
				}
				va_colocaVisorPdfyToolBar(id_visor, va_visores[id_visor].showAdobeBar);
				va_pincharEventoDownloadToolBar(id_visor, url, 'pdf');
				if(va_visores[id_visor].modo!='pdf'){
					va_visores[id_visor].modo='pdf';
					va_toolBarChangeMode(id_visor);
				}
				va_lanzarEvento(id_visor, 'onLoadDocument', url, 'pdf');
				break;
			}
			case 'img':{
				if(va_visores[id_visor].modoValidacion){
					va_setObjectLayer(id_visor, 4);	// muestra capa VALIDACION
				}else{
					va_setObjectLayer(id_visor, 1);	// muestra capa VISOR
				}
				
				// Selecciona el zoom ajustar a pagina por defecto al cargar un jpg
				if($("#" + id_visor + '_toolbar select[name="btnZoom"]').length>0){
					vaf_quitaOtrosZooms(id_visor);
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq(0).attr('selected','selected');
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel',0);
				}
				
				// TODO: id del componente flash
				if(va_visores[id_visor].ultimaCapaVisible != 4){
					ComponenteFlash(id_visor).setUrlImagen(url, 0);
					ComponenteFlashVW(id_visor).setUrlImagen(url, 0);
				}else{
					ComponenteFlashVW(id_visor).setUrlImagen(url, 0);
					ComponenteFlash(id_visor).setUrlImagen(url, 0);
				}
				va_visores[id_visor].modoEdicion=false;
				va_colocaVisorPdfyToolBar(id_visor, false);
				va_pincharEventoDownloadToolBar(id_visor, url, 'img');
				if(va_visores[id_visor].modo!='img'){
					va_visores[id_visor].modo='img';
					va_toolBarChangeMode(id_visor);
				}
				va_lanzarEvento(id_visor, 'onLoadDocument', url, 'img');
				break;
			}
			case 'zip':{
				if(va_visores[id_visor].modoValidacion){
					va_setObjectLayer(id_visor, 4);	// muestra capa VALIDACION
				}else{
					va_setObjectLayer(id_visor, 1);	// muestra capa VISOR
				}

				// Parche para Internet Explorer
				if(url.substr(0,4) != "http"){
					// url relativa ...si empieza por / le aniado el dominio
					if(url.substr(0,1) == "/"){
						var prot = (("https:" == document.location.protocol) ? "https://" : "http://");
						if(window.location.port!=""){
							url = prot + document.domain + ":" + window.location.port + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}else{
							url = prot + document.domain + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}
					}else{
						// es relativa a la pagina actual, busco la ultima barra
						var ubicacion = document.location.toString();
						var auxPos = ubicacion.indexOf('?');
						if(auxPos != null && auxPos > 0){
							var pos = ubicacion.substr(0,auxPos).lastIndexOf('/');
						}else{
							var pos = ubicacion.substr(0).lastIndexOf('/');
						}
						if(pos!=-1){
							url = ubicacion.substr(0, pos +1) + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}else{
							url = ubicacion + '/' + encodeURIComponent(url).replace(/%2F/g,"/").replace(/%26/g,"&").replace(/%3F/g,"?").replace(/%3D/g,"=");
						}
					}
				}

				// Selecciona el zoom ajustar a pagina por defecto al cargar un pdf
				if($("#" + id_visor + '_toolbar select[name="btnZoom"]').length>0){
					vaf_quitaOtrosZooms(id_visor);
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq(0).attr('selected','selected');
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel',0);
				}
				va_pincharEventoDownloadToolBar(id_visor, url, 'zip');
				if(va_visores[id_visor].modo!='zip'){
					va_visores[id_visor].modo='zip';
					va_toolBarChangeMode(id_visor);
				}
				va_lanzarEvento(id_visor, 'onLoadDocument', url, 'zip');
				break;
			}
			case 'other':{
				va_colocaVisorPdfyToolBar(id_visor, false);
				va_setObjectLayer(id_visor, 2);	// muestra capa Emptyviewer
				//if(url.indexOf('.doc')!=-1){
				//	$('#' + id_visor + '_emptyviewer' ).css('padding','0 5px 5px 0').empty().append('<object width="99%" height="99%" data="'+url+'" classid="clsid:00020906-0000-0000-C000-000000000046"></object>');
				//}else{
					$('#' + id_visor + '_emptyviewer' )
						.css('padding','0 5px 5px 0')
						.empty()
						.append('<iframe width="99%" height="99%" border="0" src="'+url+'"></iframe>')
						.css('width', '100%')
						.attr('width', '100%');
				//}
				//$('#' + id_visor + '_emptyviewer' ).css('padding','0 5px 5px 0').empty().append('<iframe width="99%" height="99%" border="0" src="'+url+'"></iframe>');
				
				// selecciona zoom 100%
				if($("#" + id_visor + '_toolbar select[name="btnZoom"]').length>0){
					vaf_quitaOtrosZooms(id_visor);
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq(_va_zoom100por100enCombo).attr('selected','selected');
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel',_va_zoom100por100enCombo);
				}
				va_pincharEventoDownloadToolBar(id_visor, url, 'img');
				if(va_visores[id_visor].modo!='other'){
					va_visores[id_visor].modo='other';
					va_toolBarChangeMode(id_visor);
				}
				va_lanzarEvento(id_visor, 'onLoadDocument', url, 'other');
				break;
			}
			default:{
				depura('\tImposible determinar el tipo de archivo:' + tipo);
			}
		}
	}else{
		depura('\tImposible determinar el tipo de archivo');
		return false;
	}
}

						
function va_getTipoFromExtension(extension){
	var tipo='img';
	extension = extension.toLowerCase();
	if(extension=='pdf'){
		tipo='pdf';
	}else if(extension=='zip'){
		tipo='zip';
	}else if(extension=='jpg' || extension=='jpeg' || extension=='bmp' || extension=='gif' || extension=='png'){
		tipo='img';
	}else if(extension=='txt' || extension=='doc' || extension=='docx' || extension=='ppt' || extension=='pptx' || extension=='pps' || extension=='ppsx' || extension=='xls' || extension=='xlsx' || extension=='xml'){
		tipo='other';
	}
	return tipo;
}

/**	va_getTipoFromUrl(url, tipo)
	Busca el tipo del fichero 'pdf' o 'img' en la url **/
function va_getTipoFromUrl(url, tipo){
	depura('va_getTipoFromUrl("'+url+'", "'+tipo+'")');
	if(isValidVariable(url, 'string') && url != ''){
		var lurl = url.toLowerCase();
		var posUltimoPunto = lurl.lastIndexOf('.');
		if(posUltimoPunto!=-1){
			//saca los caracteres entre el ultimo punto y los parametros GET
			var extension;
			if (lurl.indexOf('&', posUltimoPunto) != -1){
				extension = lurl.substring(posUltimoPunto+1, lurl.indexOf('&', posUltimoPunto));
			}else{
				extension = lurl.substring(posUltimoPunto+1);
			}
			tipo = va_getTipoFromExtension(extension);
		}
	}
	return tipo;
}

/** va_formarURLyTipo
Forma un objeto:{
	url: http.... La direcci?n a cargar
	tipo: 'img' 'pdf' 'other' o undefined
} **/
function va_formarURLyTipo(id_visor, documento, tipo, SourceLocation){
	var url = documento.Uri;

	// Obtener parametros del objeto documento
	if(typeof tipo=='undefined'){
		tipo = documento.tipo;
	}
	if(typeof SourceLocation=='undefined'){
		SourceLocation = documento.SourceLocation;
	}

	// Filtro de sourceLocation, (por si te da por pasar R, L o cosas asi...
	if(typeof SourceLocation == 'undefined' || SourceLocation == '' || SourceLocation == 'r' || SourceLocation == 'R' || SourceLocation == 'servletremoto'){
		SourceLocation = 'remoto';
	}else if(typeof SourceLocation == 'l' || SourceLocation == 'L' || SourceLocation == 'servletlocal'){
		SourceLocation = 'local';
	}
	switch(SourceLocation){
		case 'remoto':
			if(typeof documento.Uri == 'undefined' || documento.Uri == '' && !(typeof documento.Path == 'undefined' || documento.Path == '' )){
				url = escape(documento.Path);
				url = va_visores[id_visor].rutaServletWAS + '?na=' + url + va_visores[id_visor].parametrosExtraServletWAS;		// TODO: CAMBIA ESTO <<<<
			}
			break;
		case 'local':
			url = documento.Path;
			if(typeof documento.Path == 'undefined' || documento.Path == ''){
				url = escape(documento.Uri);
			}else{
				url = escape(url);
			}
			url = va_visores[id_visor].rutaServletLocal + '?na=' + escape(url) + va_visores[id_visor].parametrosExtraServletLocal;
			break;
		default:
			depura('Tipo de SourceLocation no soportado: ' + SourceLocation);
			break;
	}

	// Indica si se podr?a obtener el numero de p?ginas de un pdf (solo PDF, con source remoto, y con el Path indicado
	var puedeSacarNumPaginas=false;
	if(va_getTipoFromUrl(url, tipo)=='pdf' && !(typeof documento.Path == 'undefined' || documento.Path == '')){
		puedeSacarNumPaginas=true;
	}
	return {'url': url, 'tipo':tipo, 'puedeSacarNumPaginas':puedeSacarNumPaginas};
}

function va_iconoFromTipo(tipo){
	switch(tipo){
		case 'pdf':
			// Esto crea un div, con una tabla dentro, con las mismas clases css que tiene la tira, pero no lo inserta en el body
			// lo mantiene en memoria para obtener el fondo que tiene un iconito de PDF. De esta forma, la ruta del fondo vendrá del archivo css
			return $('<div class="ViewerValidationWindow"><table class="tiraTable"><tr class="tira_collapsed"><td><span class="tira_expander">a</span></td></tr></table></div>').children('span').css('background-image');
		case 'other':
			return $('<div class="ViewerValidationWindow"><table class="tiraTable"><tr class="tira_collapsed"><td><span class="tira_expander">a</span></td></tr></table></div>').children('span').css('background-image');
			/* var rule;
			var cssRules;
			var styleSheets = document.styleSheets;
			for(var i=0; i<styleSheets.length; i++){
				try{
					cssRules = styleSheets[i].cssRules;
				}catch(e){
					cssRules = styleSheets[i];
				}
				if(!isValidVariable(cssRules, 'object')){
					cssRules = styleSheets[i].rules;
				}
				for(var j=0; j<cssRules.length; j++){
					rule = cssRules[j];
					if(rule.selectorText == '.ImageViewerFileTXT'){
						var backgroundImage = rule.style.backgroundImage;
						if(backgroundImage.indexOf('url("') != -1){
							backgroundImage = backgroundImage.substring(backgroundImage.indexOf('url("')+5, backgroundImage.lastIndexOf('")'));
						}else if(backgroundImage.indexOf("url('") != -1){
							backgroundImage = backgroundImage.substring(backgroundImage.indexOf("url('")+5, backgroundImage.lastIndexOf("')"));
						}else if(backgroundImage.indexOf('url(') != -1){
							backgroundImage = backgroundImage.substring(backgroundImage.indexOf('url(')+4, backgroundImage.lastIndexOf(')'));
						}
						return backgroundImage;
					}
				}
			}
			break; */
		case 'img':
			return '';
		default:
			return '';
	}
}

/**	va_pdfFullScreen
	Hace que el pdf pase a pantalla completa (de mentira)
	genera un div gordo, lo a?ade al principio del body, crea un objeto pdfobject, 
	igual que el que se est? viendo ahora mismo, y le pone el src igual para que cargue ahi el pdf,
	a?ade la clase hiddenForFullScreen a todos los hijos del body para que se oculten,
	y muestra el div gordo este con un link de cerrar
	el link lo que har? ser? quitar todas las clases hiddenForFullScreen, y quitar el div del body para devolver
	la p?gina a su estado anterior
	Si est?s dentro de un iframe, se motrar? dentro del iframe, no en la ventana!
	TODO:
	Hacerlo para que detecte iframes... (Solo va a ser posible en el mismo dominio)
**/
function va_pdfFullScreen(id_visor){
	$('.pdffullscreen').remove();
	var misrc = getPDFObject(id_visor + '_objetopdf').src;

	// oculta todo lo qe haya ahora mismo en el body
	$(document.getElementsByTagName('body')[0]).contents().each(function (){
		// le a?ade la clase hiddenForFullScreen a todos los hijos del body
		$(this).addClass('hiddenForFullScreen');
	});
	$(document.getElementsByTagName('body')[0])
		.prepend($('<div></div>')
			.addClass('pdffullscreen')
			.addClass('PDFContainer')
			.height($(window).height())
			.empty()
			.html(
				'<a href="javascript:void(0);" onclick="$(\'.pdffullscreen\').remove();$(\'.hiddenForFullScreen\').removeClass(\'hiddenForFullScreen\');">[Cerrar]</a><br/>' + 
				'<object width="100%" height="95%" class="PDFObject" type="application/pdf" classid="clsid:CA8A9780-280D-11CF-A24D-444553540000" viewastext ' +
				'data="'+misrc+'"><param name="_cx" value="26035"><param name="_cy" value="15663">' + 
				'<param name="src" value="'+misrc+'"><embed swliveconnect="true" width="100%" height="95%" mayscript="true" AllowScriptAccess="always" src="'+misrc+'"></embed>' +
				'</object>'
			)
	);
}

/**	API EXTERNA **/
/**	av_SelectDocumentByID
	Pone en azulito el icono del documento que tu le pases por ID
	params:
		id_visor
		id 			ID del documento
		bKeepSel	mantiene la seleccion actual
	ret:
		devuelve true si ha encontrado en la tira un documento con el id que le has pasado
**/
var av_SelectDocumentByID = function(id_visor, id, bKeepSel){
	// DEP
}

var av_SelectDocumentsByID = function(id_visor, arr_ids, bKeepSel){
	if(!bKeepSel){
		bKeepSel=false;
	}
	if(typeof arr_ids!='undefined' && typeof arr_ids.length!='undefined' && arr_ids.length > 0){
		if(!va_visores[id_visor].seleccionMultiple && arr_ids.length > 1){
			depura('Activa la seleccion multiple para poder seleccionar estos elementos...');
		}

		// el primero lo selecciona a parte para guardar o no guardar la seleccion
		av_SelectDocumentByID(id_visor, arr_ids[0], bKeepSel);

		// el resto van todos seguidos pero guardando la seleccion de todos ellos
		for(var i=1; i<arr_ids.length; i++){
			av_SelectDocumentByID(id_visor, arr_ids[i], true);
		}
	}
}

var av_SelectAll = function(id_visor){
	if(!va_visores[id_visor].seleccionMultiple){
		av_DeselectAll(id_visor);
		$('#'+id_visor+'_filmstrip' ).children('ul').children('li').eq(0).addClass('selected');
		depura('Activa la seleccion multiple  poder seleccionar estos elementos');
		return;
	}
	$('#'+id_visor+'_filmstrip' ).children('ul').children('li').addClass('selected');
}

var av_DeselectAll = function(id_visor){
	$('#'+id_visor+'_filmstrip' ).children('ul').children('li').removeClass('selected');
}

/** Devuelve el elemento del dom seleccionado **/
var va_getSelectedItem = function(id_visor, last){
	var ret=null;
	if(last && (va_visores[id_visor].lastSelectedDocument !=null)){
		var doc = va_getDocumento(id_visor, va_visores[id_visor].lastSelectedDocument);
		ret = $('#' + doc.idLi)[0];
	}else{
		$('#'+id_visor+'_filmstrip' ).children('ul').children('li').each(function (){
			if ($(this).hasClass('selected')){
				if (last || ret==null){
					ret = this;
				}
			}
		});
	}
	return ret;
}

function va_getLastSelectedItem(id_visor){
	return va_getSelectedItem(id_visor, true);
}

var va_getSelectedItems = function(id_visor){
	var ret=[];
	$('#'+id_visor+'_filmstrip' ).children('ul').children('li').each(function (){
		if ($(this).hasClass('selected')){
			ret[ret.length] = this;
		}
	});
	return ret;
}

/**	av_GetSelectedDocument(id_visor)
	@arg id del visor
	@returns id del documento seleccionado en la tira o '' 
**/
// SUS: Sobreescrita en visorAvanzadoTira
var av_GetSelectedDocument = function (id_visor){
	depura('No cargado visorAvanzado_tira.js');
}

/**	av_GetSelectedDocuments(id_visor)
	@arg id del visor
	@returns array ids de documentos seleccionados en la tira o []
**/
// SUS: Sobreescrita en visorAvanzadoTira
var av_GetSelectedDocuments = function (id_visor){
	depura('No cargado visorAvanzado_tira.js');
}

/**	av_setMultipleSelectionIndicator(id_visor, booleano)
	indica si se pueden seleccionar varios elementos o no
	si le pasas false, deselecciona todos los elementos
*/
function av_setMultipleSelectionIndicator(id_visor, booleano){
	if(!booleano){
		av_DeselectAll(id_visor);
	}
	va_visores[id_visor].seleccionMultiple=booleano;
}

function av_isMultipleSelectionIndicator(id_visor){
	return va_visores[id_visor].seleccionMultiple;
}

/**  av_isGrouped(id_visor)
	 Estado actual real del documento (lo que hay en la tira ahora mismo)
	 Si el usuario tenia un pdf desde el principio, y solo lo ha visto, devolver? true
	 Si el usuario desagrup? el pdf se devuelve false,
	 Si se ten?an unas cuantas imagenes en la tira, se devolver? false
*/
function av_isGrouped(id_visor){
	return va_visores[id_visor].estadoAgrupado;
}

/**	 av_isShownAsGrouped(id_visor)
	 Estado de la visualizacion, si se est? mostrando agrupado o no, aunque en la tira puede haber cualquier cosa
*/
function av_isShownAsGrouped(id_visor){
	return va_visores[id_visor].mostradoAgrupado;
}

function av_DoEdit(id_visor, id_doc){
	var doc=null;
	if(typeof id_doc !='undefined'){
		av_SelectDocumentByID
		id_doc = av_SetSelectedDocument(id_visor, id);
	}
	ComponenteFlash(id_visor).EditMode(true);
	return true;
}

function av_IsVisibleTiraImagenes(id_visor){
	return $('#' + id_visor + '_filmstrip').is(':visible');
}

function av_SetVisibleTiraImagenes(id_visor, bVisible){
	if(bVisible){
		av_setBtnDisabled(id_visor, false, 'btnZip');
		av_setBtnDisabled(id_visor, false, 'btnJoinToPDF');
		$('#' + id_visor + '_filmstrip').show();
		$('#' + id_visor + '_table tr').eq(1).children('td').eq(0).attr('rel','100%');
		va_visores[id_visor].redimensionaIE();
	}else{
		av_setBtnDisabled(id_visor, true, 'btnZip');
		av_setBtnDisabled(id_visor, true, 'btnJoinToPDF');
		$('#' + id_visor + '_filmstrip').hide();
		$('#' + id_visor + '_table tr').eq(1).children('td').eq(0).attr('rel','1px');
		va_visores[id_visor].redimensionaIE();
	}
}

function av_GetDocuments(id_visor, sorted){
	var res=[];
	for(var i=0;i<va_documentos[id_visor].length;i++){
		res[res.length] = av_GetDocumentByID(id_visor, va_documentos[id_visor][i].id);
	}
	for(var i=0;i<va_job[id_visor].length;i++){
		var doc = av_GetDocumentByID(id_visor, va_job[id_visor][i].id);
		if(doc!=null){
			res[res.length] = doc;
		}
	}
	if(sorted===true){
		res.sort(function (a,b){
			return (a.Position - b.Position);
		});
	}
	return res;
}

function av_GetDocumentPosition(id_visor,iddoc){
	var doc = va_getDocumento(id_visor, iddoc);
	return doc.order +1;
}

function av_GetDocumentByID(id_visor, id){
	var doc=va_getDocumento(id_visor,id);
	if(doc==null){
		doc = va_getDocumentoAgrupado(id_visor,id);
	}
	if(doc==null){return null;}
	return{
		ID:doc.id,
		Title:doc.Title,
		Uri:doc.Uri,
		Path: doc.Path, 
		State:doc.Estado,
		SourceLocation:doc.SourceLocation,
		Category:doc.Categoria,
		DataItem:doc.DataItem,
		Properties:doc.Properties,
		Position:doc.order +1,
		Enabled:doc.enabled,
		idGroup:doc.idDoc,
		isNew:((typeof doc.isNew =='undefined')?false:doc.isNew)
	};
}

var av_InsertDocument = function(id_visor, id, Title, Url, Path, SwitchRL, Estado, IDCategoria, datos, tipo, properties, idDoc){
	depura('av_InsertDocument("'+id_visor+'", "'+id+'", "'+Title+'", "'+Url+'", "'+Path+'", "'+SwitchRL+'", "'+Estado+'", "'+IDCategoria+'", '+datos+', "'+tipo+'", '+properties+', "'+idDoc+'")');
	
	//Comprobacion id_visor
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('\tEl argumento "id_visor" no es un "string", es nulo o esta vacio. Se interrumpe la ejecucion.');
	}
	
	//Comprobacion Url y Path
	if((!isValidVariable(Url, 'string') || Url == '') && (!isValidVariable(Path, 'string') || Path == '')){
		throw new Error('\tDebe definirse al menos uno de los argumentos "Url" o "Path". Se interrumpe la ejecucion.');
	}
	
	//Comprobacion tipo
	if(!isValidVariable(tipo, 'string') || tipo == ''){
		tipo = va_getTipoFromUrl(Url, tipo);
	}
	if(!isValidVariable(tipo, 'string') || tipo == ''){
		tipo = va_getTipoFromUrl(Path, tipo);
	}
	if(!isValidVariable(tipo, 'string') || tipo == ''){
		tipo = 'img';
	}
	
	//Comprobacion idDoc e IDCategoria
	var jobIndex = -1;
	if(isValidVariable(idDoc, 'string') && idDoc != ''){
		jobIndex = valueExist(idDoc, va_job[id_visor], 'id');
		if(jobIndex >= 0){
			IDCategoria = va_job[id_visor][jobIndex].typeId;
		}
	}
	var $tabla = $('#'+id_visor+'_treeTira');
	if(jobIndex < 0){
		if(!isValidVariable(IDCategoria, 'string') || IDCategoria == ''){
			IDCategoria = '-1';
		}
		var cat = va_getCategoria(id_visor, IDCategoria, true);
		var newNode = tira_insertarNuevoDocumentoAutoGenerado($tabla, id_visor, cat.idFilaTT, false, idDoc, Title, tipo);
		idDoc = newNode.idDoc;
	}

	//Comprobacion id
	if(!isValidVariable(id, 'string') || id == ''){
		id = idDoc + '_new' + (new Date()).getTime() + 'r' + Math.floor(Math.random()*100000);
	}
	var pageIndex;
	do{
		pageIndex = valueExist(id, va_documentos[id_visor], 'id');
		if(pageIndex >= 0){
			id = idDoc + "_new" + (new Date()).getTime() + "r" + Math.floor(Math.random()*100000);
		}
	}while(pageIndex >= 0);
	
	//Comprobacion Title
	if(!isValidVariable(Title, 'string') || Title == ''){
		Title = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	}

	//Comprobacion SwitchRL
	if(!isValidVariable(SwitchRL, 'string') || SwitchRL == ''){
		SwitchRL = 'remoto';
	}
	
	//Comprobacion Estado
	if(!isValidVariable(Estado, 'string') || Estado == ''){
		Estado = 'OK';
	}
	
	//Comprobacion datos
	if(!isValidVariable(datos, 'object')){
		datos = null;
	}
	
	//Comprobacion properties
	if(isValidVariable(properties, 'string') && properties != ''){
		properties = eval('('+properties+')');
	}else if(!isValidVariable(properties, 'object')){
		properties = null;
	}

	var nuevoDoc = {
		'enabled':true,
		'id':id,
		'idDoc':idDoc,
		'Title':Title,
		'Uri':Url,
		'Path':Path,
		'Categoria':IDCategoria,
		'SourceLocation': SwitchRL,
		'Estado':Estado,
		'DataItem': datos,
		'tipo': tipo,
		'Properties': properties,
		'_claseIcono': va_iconoFromTipo(tipo)
	};
	if(tipo == 'pdf' || tipo == 'zip'){
		nuevoDoc.id = idDoc;
		nuevoDoc.Title = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		nuevoDoc.idCont = '';
	}else{
		nuevoDoc.idLi = id_visor + '_documento' + va_documentos[id_visor].length;
	}

	// Inserto la nueva pagina en va_job
	jobIndex = valueExist(idDoc, va_job[id_visor], 'id');
	if(jobIndex >= 0){
		nuevoDoc.order = va_job[id_visor][jobIndex].pages.length;
		if(tipo != 'pdf' && tipo != 'zip'){
			va_job[id_visor][jobIndex].pages[va_job[id_visor][jobIndex].pages.length] = nuevoDoc;
		}else{
			va_job[id_visor][jobIndex].Path = Path;
			va_job[id_visor][jobIndex].DocumentoOriginal = nuevoDoc;
		}
	}
	if(jobIndex < 0){
		va_job[id_visor][va_job[id_visor].length] = newNode;
	}
	var encontradoGrupo = false;
	var insertadoEnGrupo = false;
	for(var i=0; i<va_documentos[id_visor].length; i++){
		if(encontradoGrupo == false){
			if(va_documentos[id_visor][i].idDoc == nuevoDoc.idDoc){
				encontradoGrupo=true;	// encontrado grupo, continuar el for hasta el ultimo elemento del grupo
			}
		}else{
			// ya encontrado antes 
			if(va_documentos[id_visor][i].idDoc != nuevoDoc.idDoc){
				insertadoEnGrupo=true;	// encontrado primer elemento del grupo siguiente: insertar
				va_documentos[id_visor].splice(i, 0, nuevoDoc);
				break;
			}
		}
	}
	// si no lo ha insertado, insertar al final
	if(!insertadoEnGrupo && tipo != 'pdf' && tipo != 'zip'){
		va_documentos[id_visor][va_documentos[id_visor].length] = nuevoDoc;
	}
	if(tipo != 'pdf' && tipo != 'zip'){
		insertarDocumentoEnTira(id_visor, nuevoDoc);
		va_jobchanges_nuevaPagina(id_visor, id, nuevoDoc.order, idDoc,  IDCategoria);
	}else{
		var idFilaActual = 1;
		idFilaActual = idsFilas(id_visor)-1;
		if(tipo == 'pdf'){
			$('#'+id_visor+'_fila-'+idFilaActual, $tabla).click(function(ev){
				if(ev.target.className!='tira_expander'){
					$(this).tira_toggleBranch();
					av_LoadDocumentByID(id_visor, idDoc);
				}else{
					if(!isValidVariable(va_visores[id_visor].desagrupacion, 'object') || !isValidVariable(va_visores[id_visor].desagrupacion.terminada, 'boolean')){
						va_clickBotonAgrupado(id_visor, idDoc, this);
					}else if(va_visores[id_visor].desagrupacion.terminada){
						va_clickBotonAgrupado(id_visor, idDoc, this);
					}else{
						$(this).tira_toggleBranch();
					}
				}
			});
		}else{
			$('#'+id_visor+'_fila-'+idFilaActual, $tabla).click(function(ev){
				if(ev.target.className!='tira_expander'){
					$(this).tira_toggleBranch();
					av_LoadDocumentByID(id_visor, idDoc);
				}else{
					if(!isValidVariable(va_visores[id_visor].desagrupacion, 'object') || !isValidVariable(va_visores[id_visor].desagrupacion.terminada, 'boolean')){
						va_clickBotonComprimido(id_visor, idDoc, this);
					}else if(va_visores[id_visor].desagrupacion.terminada){
						va_clickBotonComprimido(id_visor, idDoc, this);
					}else{
						$(this).tira_toggleBranch();
					}
				}
			});
		}
		if(tipo == 'pdf'){
			$('#'+id_visor+'_fila-'+idFilaActual, $tabla).click();
		}else{
			va_clickBotonComprimido(id_visor, idDoc);
		}
	}
}

/**	Titulos de los documentos:
	av_GetDocTitle(id_visor, id_documento) y av_SetDocTitle(id_visor, id_documento, nuevoTitulo)
**/
function av_GetDocTitle(id_visor, id_documento){
	var doc=va_getDocumento(id_visor,id_documento);
	if(doc == null){
		doc=va_getDocumentoAgrupado(id_visor, id_documento);
	}
	if (doc!=null && typeof doc.Title != 'undefined'){
		return doc.Title;
	}else{
		return '';
	}
}
/**
	setDocumentTitle:
		busca el documento y le establece el titulo en memoria, y en la tira
*/
function av_SetDocTitle(id_visor, id_documento, nuevoTitulo){
	var agrupado = false;
	var doc=va_getDocumento(id_visor,id_documento);
	if(doc == null){
		doc=va_getDocumentoAgrupado(id_visor, id_documento);
		agrupado = true;
	}
	if (doc !=null){
		doc.Title = nuevoTitulo;
		if(agrupado){
			$('#' + id_visor + ' span.documentoTira[rel="' + id_documento + '"]').html(nuevoTitulo).attr('title', nuevoTitulo);
		}else{
			$('#' + id_visor + ' span.imagenTira[rel="' + id_documento + '"] label').html(nuevoTitulo);
		}
	}
}

/**	CATEGORIAS **/
/* Fatima */
function av_GetCategoryOfDocument(id_visor, documento){
	var doc;
	if (typeof documento == 'string'){
		doc=va_getDocumento(id_visor,documento);
		if(doc==null){
			doc=va_getDocumentoAgrupado(id_visor,documento);
		}
	}else{
		doc=documento;
	}
	if(doc){
		return doc.Categoria;
	}else{
		return null;
	}
}

function av_GetCategoryOfDocuments(id_visor, idsDocumentos){
	var ret=[];
	if(idsDocumentos.length){
		for(var i=0;i<idsDocumentos.length;i++){
			ret[i]=av_GetCategoryOfDocument(id_visor, idsDocumentos[i].id);
		}
	}
	return ret;
}

/**	av_SetCategoryOfDocument
		id_visor
		documento (puede ser el id del documento o el Objeto interno documento de va_documentos)
		idcat -> id de la categoria que debe estar definido en las categorias
	Pone el id de la categoria al documento en memoria, y mueve el objeto de un UL a otro en el HTML
	devuelve: 0 OK
			-1 No hay categorias
			-2 la categoria no existe!
			-3 el documento no existe
			-4 no se pudo establecer la categoria al documento, o ya estaba establecida
**/
function av_SetCategoryOfDocument(id_visor, documento, idcat, nombreCategoriaSiHaceFaltaCrearla, anexar, idNodo){
	if(typeof nombreCategoriaSiHaceFaltaCrearla!='undefined'){
		av_InsertCategory(id_visor, idcat, nombreCategoriaSiHaceFaltaCrearla)
	}else{
		av_InsertCategory(id_visor, idcat, idcat);
	}
	if(typeof documento=='string'){
		var docu = va_getDocumento(id_visor, documento);
		if(docu==null){
			docu = va_getDocumentoAgrupado(id_visor, documento);
		}
		documento = docu;
	}
	if(documento!=null){
		if(documento.enabled != false){
			if(va_SetCategoriaDelDocumento(id_visor, documento, idcat)!=null){
				if(va_SetCategoriaDelDocumentoEnTira(id_visor, documento, idcat, idNodo, null, anexar)!=-1){
					var $documentosEnTira = $('#' + id_visor + ' .imagenTiraTR');
					var cantidadDocumentos = $documentosEnTira.length;
					var va_documentosBis = [];
					var documentId;
					var pos = -1;
					for(var i=0; i<cantidadDocumentos; i++){
						documentId = $($documentosEnTira[i]).attr('rel');
						va_documentosBis[i] = va_getDocumento(id_visor, documentId);
						if(documentId == documento.id){
							pos = i;
						}
					}
					va_documentos[id_visor] = va_documentosBis;
					$('#'+id_visor+'_toolbar .inputPage').val(pos+1);
					va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado = pos;
					return 0;
				}
			}else{
				return -4;
			}
		}else{
			return -2;
		}
	}
	return -3;
}

function av_SetCategoryOfDocuments(id_visor, idsDocumentos, idcat, nombreCategoriaSiHaceFaltaCrearla, groupAllDocs, anexar, idNodo){
	if(typeof nombreCategoriaSiHaceFaltaCrearla!='undefined'){
		av_InsertCategory(id_visor, idcat, nombreCategoriaSiHaceFaltaCrearla)
	}else{
		av_InsertCategory(id_visor, idcat, idcat);
	}
	if(typeof groupAllDocs =='undefined'){
		groupAllDocs=true;
	}
	var ret=0;
	var doc;
	var grupo = '';
	if(idsDocumentos.length){
		for(var i=0;i<idsDocumentos.length;i++){
			if(idsDocumentos[i].id){
				doc=va_getDocumento(id_visor,idsDocumentos[i].id);
			}else{
				doc=va_getDocumento(id_visor,idsDocumentos[i]);
			}
			if(doc){
				if(doc.enabled != false){
					// set categoria en el json:
					if(va_SetCategoriaDelDocumento(id_visor, doc, idcat)!=null){
						// Si es el primero del array || el anterior no se pudo agrupar aqui || no se agrupo ninguno antes..
						if(i==0 || grupo == -1 || grupo==''){
							// mete la pagina en un documento nuevo. guarda ese documento nuevo en grupo
							grupo = va_SetCategoriaDelDocumentoEnTira(id_visor, doc, idcat, idNodo, null, anexar);
						}else if(groupAllDocs){
							va_SetCategoriaDelDocumentoEnTira(id_visor, doc, idcat, grupo);
						}else{
							grupo = va_SetCategoriaDelDocumentoEnTira(id_visor, doc, idcat);
						}
					}
					var $documentosEnTira = $('#' + id_visor + ' .imagenTiraTR');
					var cantidadDocumentos = $documentosEnTira.length;
					var va_documentosBis = [];
					var documentId;
					var pos = 0;
					for(var j=0; j<cantidadDocumentos; j++){
						documentId = $($documentosEnTira[j]).attr('rel');
						va_documentosBis[j] = va_getDocumento(id_visor, documentId);
						if(documentId == doc.id){
							pos = j;
						}
					}
					va_documentos[id_visor] = va_documentosBis;
					$('#'+id_visor+'_toolbar .inputPage').val(pos+1);
					va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado = pos;
				}else{
					ret = -2;
				}
			}else{
				ret = -1;
			}
		}
	}
	return ret;
}

/** Establece la categoria internamente, en el json:
	puede recibir un objeto documento, o un id de documento
	devuelve el objeto documento con la categoria establecida
	No comprueba si la categoria existe o no, simplemente la establece, 
	si no encuentra el documento devuelve null
	si el documento ya tenia esa categoria tambien devuelve null
**/
var va_SetCategoriaDelDocumento = function(id_visor, documento, idcat){
	var doc;
	if (typeof documento == 'string'){
		doc=va_getDocumento(id_visor,documento);
		if(doc!=null){
			if(doc.Categoria != idcat){
				doc.Categoria = idcat;
			}else{
				return null;
			}
		}else{
			doc=va_getDocumentoAgrupado(id_visor,documento);
		}
	}
	if(documento!=null){
		documento.Categoria = idcat;
		var grupo = va_getGrupoDocumentos(id_visor, documento.id);
		if(grupo!=null){
			grupo.Categoria = idcat;
			grupo.typeId = idcat;
		}
	}
	
	return documento;
};

function av_getCategoryByID(id_visor, id_categoria){
	var cat =va_getCategoria(id_visor, id_categoria);
	if(cat!=null){
		return {
		'ID': cat.id,
		'Title':cat.title,
		'DATA':cat.data};
	}else{
		return null;
	}
}

function va_getCategoria(id_visor, id_categoria, crearSiNoExiste, tituloAlCrear){
	if (typeof va_categorias != 'undefined' && typeof va_categorias[id_visor] != 'undefined' && va_categorias[id_visor].length > 0){
		for(var i=0;i<va_categorias[id_visor].length;i++){
			if (va_categorias[id_visor][i].id == id_categoria){
				return va_categorias[id_visor][i];
			}
		}
	}
	if(crearSiNoExiste){
		va_categorias[id_visor][va_categorias[id_visor].length] = {
			id:id_categoria, 
			title: (tituloAlCrear? tituloAlCrear : id_categoria), // si est? definido el titulo le pone ese, si no, le pone el id como titulo
			data:null,
			defaultcat: false
		};
		return va_categorias[id_visor][va_categorias[id_visor].length -1];
	}
	return null;
}

function av_GetCategories(id_visor){
	var res=[];
	if (typeof va_categorias != 'undefined' && typeof va_categorias[id_visor] != 'undefined' && va_categorias[id_visor].length > 0){
		for(var i=0;i<va_categorias[id_visor].length;i++){
			res[i] = av_getCategoryByID(id_visor, va_categorias[id_visor][i].id);
		}
	}
	return res;
}

/**	av_InsertCategory(id_visor, id_categoria, title, data, cssclass){
	@return  categoria (el objeto categoria recien creado)	
			o false ocurrio un error (por lo general, que la categoria ya existia)
**/
function av_InsertCategory(id_visor, id_categoria, title, data, cssclass){
	if(typeof va_categorias =='undefined'){
		va_categorias = [];
	}
	if(typeof va_categorias[id_visor] =='undefined'){
		va_categorias[id_visor]=[];
	}
	if(va_getCategoria(id_visor, id_categoria, false)!=null){
		return false;
	}
	va_categorias[id_visor][va_categorias[id_visor].length] = {
		'title':title,
		'id':id_categoria,
		'data':data,
		'cssclass': cssclass,
		defaultcat: false
	};
	if(va_InsertarCategoria(id_visor, id_categoria, title,cssclass) >0){
		return va_categorias[id_visor][va_categorias[id_visor].length-1];
	}else{
		return false;
	}
}

/**	PROPIEDADES **/
//devuelve el objeto Properties del documento
function av_GetDocumentProperties(id_visor, idDocumento){
	doc=va_getDocumento(id_visor,idDocumento);
	if(doc==null){
		doc=va_getDocumentoAgrupado(id_visor,idDocumento);
	}
	if(doc!=null && typeof doc.Properties !='undefined'){
		return doc.Properties;
	}else{
		return null;
	}	
}

/**	av_SetDocumentProperties(id_visor, ID DE LA PAGINA, propiedades)
	lo suyo es que properties sea un objeto que tenga
	{
		propiedad: valor,
		propiedad: [valor, tooltip],
		propiedad: valor ....
	}
	@return undefined
*/
function av_SetDocumentProperties(id_visor, idDocumento, propiedades){
	doc=va_getDocumento(id_visor,idDocumento);
	if(doc==null){
		doc=va_getDocumentoAgrupado(id_visor,idDocumento);
	}
	try{
		if(typeof propiedades=='string'){
			propiedades=eval("("+propiedades+")");//F?tima
		}else if(typeof propiedades!='object'){
			propiedades=null;
			depura('Error al evaluar las properties del documento '+idDocumento);
		}
	}catch(ex){
		depura('Excepcion al evaluar las properties del documento '+idDocumento);
	}
	if(doc!=null){
		doc.Properties = propiedades;
		return true;
	}else{
		return false;
	}
}

/**	Estado - visibilidad del VISOR
	value = true <=> visor visible */
function av_setVisible(id_visor, value){
	if (value){
		av_showViewer(id_visor);
	}else{
		av_hideViewer(id_visor);
	}
}

function av_showViewer(id_visor){
	$("#" + id_visor).show();
	try{
		va_visores[id_visor].redimensionaIE();
	}catch(ex){}
}

function av_hideViewer(id_visor){
	$("#" + id_visor).hide();

}

function av_isVisible(id_visor){
	return 	$("#" + id_visor).is(':visible');
}

function av_toggleViewer(id_visor){
	av_setVisible(id_visor, ! av_isVisible(id_visor));
}

/**	EVENTOS **/
/**

Lista de eventos:	(no es sensible a mayusculas, por si acaso...)
va_visores[id_visor].eventos = {

	onSelectionChanged		(idv, idPag)
	onClassifiedDocument	(idv, idDoc, idCategoria_origen, idCategoria_destino)
	onPageMove 				(idv, idPagina, idDoc_origen, idDoc_destino, idCategoria_origen, idCategoria_destino, posicionEnDocumento_inicial, posicionEnDocumento_final)
	onEnterEdit				(idv)
	onExitEdit				(idv)
	onUngroup				(idv, 	(cuando termina de desagrupar correctamente!)
	onLoadDocument			(idv, url, tipodocumento)
	onTabChanged			(idv, tab(1/2))

buscar 
}
**/


function va_pincharEvento(id_visor, evento, callback){
	depura('va_pincharEvento("'+id_visor+'", "'+evento+'", '+callback+')');
	if(!isValidVariable(va_visores, 'object') || !isValidVariable(va_visores[id_visor], 'object')){
		depura('va_pincharEvento: el objeto global "va_visores[id_visor]" no es un "object" o es nulo. Se crea uno por defecto.');
		va_loadOptions(id_visor);
	}
	
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('va_pincharEvento: el argumento "id_visor" no es un "string", es nulo o esta vacio. Se interrumpe la ejecucion.');
	}else if(!isValidVariable(evento, 'string') || evento == ''){
		depura('va_pincharEvento: el argumento "evento" no es un "string", es nulo o esta vacio. Se interrumpe la funcion.');
		return;
	}else if(!isValidVariable(callback, 'function')){
		depura('va_pincharEvento: el argumento "callback" no es un "function" o es nulo. Si existe el evento, se elimina.');
		evento = evento.toLowerCase();
		if(isValidVariable(va_visores[id_visor].eventos, 'object') && isValidVariable(va_visores[id_visor].eventos[evento], 'object')){
			va_visores[id_visor].eventos[evento] = null;
		}
		return;
	}
	
	evento = evento.toLowerCase();
	if(!isValidVariable(va_visores[id_visor].eventos, 'object')){
		va_visores[id_visor].eventos = [];
	}
	if(isValidVariable(va_visores[id_visor].eventos[evento], 'object')){
		// ya habia una funcion a la que llamar, se llamará después
		var fun_Antigua = va_visores[id_visor].eventos[evento];
		va_visores[id_visor].eventos[evento] = function (){
			try{
				if(_va_retrasarEventos){
					setTimeout(function (){
						callback.apply(this, arguments);
					}, 2);
				}else{
					callback.apply(this, arguments);
				}
			}catch(ex){
				depura('va_pincharEvento: error al llamar al callback "'+ evento + '".');
			}
			try{
				if(_va_retrasarEventos){
					setTimeout(function (){
						fun_Antigua.apply(this, arguments);
					},10);
				}else{
					fun_Antigua.apply(this, arguments);
				}
			}catch(ex){
				depura('va_pincharEvento: error al llamar al callback "'+ evento + '".');
			}
		};
	}else{
		va_visores[id_visor].eventos[evento] = function (){
			try{
				if(_va_retrasarEventos){
					setTimeout(function (){
						callback.apply(this, arguments);
					}, 2);
				}else{
					callback.apply(this, arguments);
				}
			}catch(ex){
				depura('va_pincharEvento: error al llamar al callback "'+ evento + '".');
			}
		};
	}
}

function va_lanzarEvento(id_visor, evento){	// resto de argumentos... (puede recibir mas)
	// evento no se usa, ... pero tenerlo ahi le da claridad
	if(typeof va_visores[id_visor] =='undefined'){
		depura('Visor no definido. La llamada a esta funcion debe estar en el $.ready y despu?s del customtag.');
		return;
	}
	if(typeof va_visores[id_visor].eventos =='undefined'){
		va_visores[id_visor].eventos={};
	}
	// Copio el "array" de argumentos con los que llamaste a esta funcion en un array de verdad.
	var args = Array.prototype.slice.call(arguments);
	var ev = args.splice(1, 1);
	ev=""+ev[0];
	// ev == evento siempre
	ev = ev.toLowerCase();
	if(typeof va_visores[id_visor].eventos[ev] == 'function'){
		va_visores[id_visor].eventos[ev].apply(this, args);
	}

}

function av_onSelectionChanged(id_visor, callback){
	va_pincharEvento(id_visor, 'onSelectionChanged', callback);
}
function av_onClassifiedDocument(id_visor, callback){
	va_pincharEvento(id_visor, 'onClassifiedDocument', callback);
}
function av_onClickScan(id_visor, callback){
	$("#" + id_visor + "_toolbar .btnScan").click(function (){
		if(va_botonPulsable(this)){
			callback();
		}
	});
}
function av_onPageMove(id_visor, callback){
	va_pincharEvento(id_visor, 'onPageMove', callback);
}
function av_onEnterEdit(id_visor, callback){
	va_pincharEvento(id_visor, 'onEnterEdit', callback);
}
function av_onExitEdit(id_visor, callback){
	va_pincharEvento(id_visor, 'onExitEdit', callback);
}
function av_onUngroup(id_visor, callback){
	va_pincharEvento(id_visor, 'onUngroup', callback);
}
function av_onLoadDocument(id_visor, callback){
	va_pincharEvento(id_visor, 'onLoadDocument', callback);
}
function av_onTabChanged(id_visor, callback){
	va_pincharEvento(id_visor, 'onTabChanged', callback);
}


/*FIN VisorAvanzadoVentana.js*/ 
/*INICIO VentanaValidacion.js*/ 
/**********************************************
	VentanaValidacion.js
	API Y CONTROL DEL CUSTOMTAG DEL VISOR + FUNCIONES ESPECIFICAS DE LA VENTANA
**********************************************/
// Insertar automaticamente todas las categorias que vengan en el contexto dentro de la tira
var _va_InsertarCategoriasDelContexto = true;	
var _va_UrlServletProcesarRecortes = "../../qngx_es_web/servlet/ServletVisorOcr";
//var _va_UrlServletProcesarRecortes = "http://v0023scd065.bbva.igrupobbva:84/WebServiceBBVA.asmx";
var _va_rutaIconoImagenPequena = 'data:image/gif;base64,R0lGODlhEAAQAPcAAP//////zP//mf//Zv//M///AP/M///MzP/Mmf/MZv/MM//MAP+Z//+ZzP+Zmf+ZZv+ZM/+ZAP9m//9mzP9mmf9mZv9mM/9mAP8z//8zzP8zmf8zZv8zM/8zAP8A//8AzP8Amf8AZv8AM/8AAMz//8z/zMz/mcz/Zsz/M8z/AMzM/8zMzMzMmczMZszMM8zMAMyZ/8yZzMyZmcyZZsyZM8yZAMxm/8xmzMxmmcxmZsxmM8xmAMwz/8wzzMwzmcwzZswzM8wzAMwA/8wAzMwAmcwAZswAM8wAAJn//5n/zJn/mZn/Zpn/M5n/AJnM/5nMzJnMmZnMZpnMM5nMAJmZ/5mZzJmZmZmZZpmZM5mZAJlm/5lmzJlmmZlmZplmM5lmAJkz/5kzzJkzmZkzZpkzM5kzAJkA/5kAzJkAmZkAZpkAM5kAAGb//2b/zGb/mWb/Zmb/M2b/AGbM/2bMzGbMmWbMZmbMM2bMAGaZ/2aZzGaZmWaZZmaZM2aZAGZm/2ZmzGZmmWZmZmZmM2ZmAGYz/2YzzGYzmWYzZmYzM2YzAGYA/2YAzGYAmWYAZmYAM2YAADP//zP/zDP/mTP/ZjP/MzP/ADPM/zPMzDPMmTPMZjPMMzPMADOZ/zOZzDOZmTOZZjOZMzOZADNm/zNmzDNmmTNmZjNmMzNmADMz/zMzzDMzmTMzZjMzMzMzADMA/zMAzDMAmTMAZjMAMzMAAAD//wD/zAD/mQD/ZgD/MwD/AADM/wDMzADMmQDMZgDMMwDMAACZ/wCZzACZmQCZZgCZMwCZAABm/wBmzABmmQBmZgBmMwBmAAAz/wAzzAAzmQAzZgAzMwAzAAAA/wAAzAAAmQAAZgAAMwAAAPf3966yuoep3FdgcVhBRKmOm6mhsY+ArpCSvHaCqpqo1cnL0XqPwqu/8V1ldru/yJWnzfDx87zAx4Sj0WRvgObq8LTR+Heq4pzJ9tXd5fn8/8rl/9zu//L5/9/l6vrfgObFgNiug/CIOd+TWrqGb2k8K9lIIv///yH5BAEAAP8ALAAAAAAQABAAAAjVAP9pG0hQ2zpt7bD9W7hQG4CHEOVpe8cuW7x0DSE+lCePE6dO4dTZa4gtYr1681SUC2dlnEJt2B5YsADhQQJ6ON2xU/cypg59EBIgSPAAnTtz2V6mA4KoDBB//iz4A+duW1KB6fZ58aJPX4Ku66peXdcuX45++/bdu7cvrFWF6+zJ4MeN3wx8+Pi9K/f2Hzl73r796YZvbbe9ff+C+8a4Wz58h/leJRdvnjt4mDE7cSJZYbjK80K7G+2Oc99w4lKjW42uCrjXFRees8Jum+3bts21/BcQADs=';

/**	A esto se le llama en el $.ready cuando metes la custom ValidationWindow en el jps
	- guarda los parametros necesarios en la configuracion va_visores,
	- Hace algunas configuraciones para el manejo de los eventos de teclado
	- sobreescribe la funcion de control de las capas visibles (la que controla si se ve el visor, el pdf o la VW
**/
function inicializaVentanaValidacion(id, opciones){
	va_visores[id].tieneventanaValidacion = true;
	if(opciones){
		if(opciones.outputXmlPath){
			va_visores[id].outputXmlPath = opciones.outputXmlPath;
		}
		if(opciones.widthClassArea){
			va_visores[id].widthClassArea = opciones.widthClassArea;
		}
		if(opciones.widthPreviewArea){
			va_visores[id].widthPreviewArea = opciones.widthPreviewArea;
		}
	}
	setupKeyListener(id);

}

// Sobreescribe la funcion de control de las capas:
/**	CONTROL DE CAPAS DE FLASHES
	va_setObjectLayer(capa)
	Muestra la capa adecuada:
	capa {
		-1: ocultar todas
		-2: restaurar la que estaba antes de ocultar todas (en teoria nunca se va a dar el caso de que te oculte todas restaurando)
		0: PDF
		1: VISOR FLASH
		2: EMPTY VIEWER
		3: DEBUG FLASH.. desactivado
		4: VALIDATION WINDOW
		5: Loading...
	}**/
	
	

function va_setObjectLayer(id_visor, capa, pestana){
	// La funcion que de verdad hace esto es va_setObjectLayerFuncion,
	// Esto es un encapsulado para dejar la llamada a esa funcion pendiente.
	// Esto hace que no se pueda cambiar de pestaÃ±a si el flash no lo permite
	// y la razon para no permitirlo serÃ­a por ejemplo, estar editando una imagen
	var x = function (){
		va_setObjectLayerFuncion(id_visor, capa, pestana);
	}
	var cb = vaf_esperaLlamada(x);
	if(va_visores[id_visor].modoEdicion==true){
		ComponenteFlash(id_visor).EditMode(false, cb);
		return;
	}else{
		vaf_llamadaPendiente(cb);
	}
}
function va_setObjectLayerFuncion(id_visor, capa, pestana){
	if(typeof pestana != 'undefined') {
		if($(pestana).hasClass("ImageViewer_disabledTab")){
			return;
		}
	}
	var hayPestanas =false;
	if($('#'+id_visor+'_pestanas a:visible').length>0){
		$('#'+id_visor+'_pestanas a').removeClass('ImageViewer_activeTab');
		hayPestanas=true;
	}
	if(hayPestanas){
		if(capa==1){	// te hacen mostrar el visor:
			if ((($('#'+id_visor+'_pestanas_edicion').is(":visible") == false) || ($('#'+id_visor+'_pestanas_edicion').is(".ImageViewer_disabledTab")) || ($('#'+id_visor+'_pestanas_validacion').is(".ImageViewer_activeTab")))){
				capa = 4;	// muestro la ventana de validacion
			}
		}
	}
	if(capa == 4){
		for(var i=0; i<va_documentos[id_visor].length; i++){
			$('#'+id_visor+'_statusIcon_'+va_documentos[id_visor][i].idFilaTT).removeClass().addClass('statusImage').addClass('statusImage'+ va_documentos[id_visor][i].Estado_v);
		}
		va_visores[id_visor].modoValidacion = true;
	}else if(capa == 1){
		for(var i=0; i<va_documentos[id_visor].length; i++){
			$('#'+id_visor+'_statusIcon_'+va_documentos[id_visor][i].idFilaTT).removeClass().addClass('statusImage').addClass('statusImage'+ va_documentos[id_visor][i].Estado);
		}
		va_visores[id_visor].modoValidacion = false;
	}
	switch(capa){
		case -2:
			/** restaurar la anterior: **/
			if(va_visores[id_visor].ultimaCapaVisible!=-2){
				va_setObjectLayer(id_visor, va_visores[id_visor].ultimaCapaVisible);
			}
			break;
		case -1:
			/** Ninguna **/
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			break;
		case 0: /** Visor PDF **/
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), true);
			break;
		case 1: /** Visor flash **/
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), true);
			if(hayPestanas){
				$('#'+id_visor+'_pestanas a').eq(0).addClass('ImageViewer_activeTab');
			}
			va_lanzarEvento(id_visor, 'onTabChanged', 1);
			$('#' + id_visor + '_toolbar .btnEdit').removeClass('buttonUnavailable').css('filter', '');
			$('#' + id_visor + '_toolbar .btnRotateView').removeClass('buttonUnavailable').css('filter', '');
			$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
			break;
		case 2: /** Visor Otros **/
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), true);
			break;
		case 3:
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			break;
		case 4: /** Ventana Validacion **/
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), true);
			if(hayPestanas){
				$('#'+id_visor+'_pestanas a').eq(1).addClass('ImageViewer_activeTab');
			}
			va_lanzarEvento(id_visor, 'onTabChanged', 2);
			
			$('#' + id_visor + '_toolbar .btnEdit').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
			$('#' + id_visor + '_toolbar .btnRotateView').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
			if(va_visores[id_visor].fieldSelected){
				$('#' + id_visor + '_toolbar .btnReprocess').removeClass('buttonUnavailable').css('filter', '');
			}else{
				$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
			}
			var flashPlayer = document[id_visor + '_objetovalidacion'] || window[id_visor + '_objetovalidacion'];
			if(flashPlayer){
				try{
					flashPlayer.focus();
				}catch(ex){}
			}
			ComponenteFlashVW(id_visor).updatePreview();
			if(!va_visores[id_visor].fieldSelected){
				ComponenteFlashVW(id_visor).setZoom(parseInt($("#" + id_visor + '_toolbar select[name="btnZoom"]').val()));
			}
			break;
		case 5: /** Cargando... **/
			va_visores[id_visor].ultimaCapaVisible=capa;
			va_setCapaVisible($('#' + id_visor + '_visorpdf' ), false);
			va_setCapaVisible($('#' + id_visor + '_visorflash' ), false);
			va_setCapaVisible($('#' + id_visor + '_validacion' ), false);
			va_setCapaVisible($('#' + id_visor + '_emptyviewer' ), false);
			va_setCapaVisible($('#' + id_visor + '_loading' ), true);
			break;
	}
	va_visores[id_visor].redimensionaIE();
}

function va_setCapaVisible($capa, visible){
	depura('va_setCapaVisible('+$capa+', '+visible+')');
	if(visible){
		var w = $capa.parent('.WorkArea').width();
		w=0; // << retoque para la nueva distribucion liquida
		var h = $capa.parent('.WorkArea').height();
		$capa.show().css('zIndex','');
		if(w==0){
			$capa.css('width',"100%").height(h);
		}else{
			$capa.width(w).height(h);
		}
	}else{
		$capa.show().width(1).height(1).css('zIndex','-1');
	}
}

/**	Reestructura el json de entrada, y prepara el array de documentos **/
function organizaEntradaDocumentos(id_visor){
	depura('organizaEntradaDocumentos("'+id_visor+'")');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('organizaEntradaDocumentos: el argumento "id_vsor" no es un "string", es nulo o esta vacio. Se interrumpe la ejecucion.');
	}

	if(!isValidVariable(va_job, 'object')){
		va_job = [];
		va_job[id_visor] = [];
	}else if(!isValidVariable(va_job[id_visor], 'object')){
		va_job[id_visor] = [];
	}
	if(va_job[id_visor].length == 0){
		return false;
	}
	
	// copio va_job
	var nuevo_va_job = [];
	for(var i=0; i<va_job[id_visor].length; i++){
		// Busco el documento por si ya estaba insertado en nuevo_va_job
		estaba = false;
		for(var j=0;j<nuevo_va_job.length;j++){
			if(nuevo_va_job[j].id == va_job[id_visor][i].id){
				// lo est?, inserto las paginas
				for (var k=0; k<va_job[id_visor][i].pages.length; k++){
					nuevo_va_job[j].pages[nuevo_va_job[j].pages.length] = va_job[id_visor][i].pages[k];
				}
				estaba = true;
				break;
			}
		}
		if(!estaba){
			nuevo_va_job[nuevo_va_job.length] = va_job[id_visor][i];
		}
	}
	va_job[id_visor] = nuevo_va_job;
	var nuevo_va_documentos = [];
	for(var i=0; i<va_job[id_visor].length; i++){
		for(var j=0; j<va_job[id_visor][i].pages.length; j++){
			nuevo_va_documentos[nuevo_va_documentos.length] = va_job[id_visor][i].pages[j];
		}
	}
	
	if(!isValidVariable(va_documentos, 'object')){
		va_documentos = [];
	}
	va_documentos[id_visor] = nuevo_va_documentos;
	return true;
}

//Estas dos funciones (setupKeyListener y detectEvent) evitan que el foco se vaya a los controles de IE al moverse por los campos de la ventana de validacion con el tabulador
//Se llama en inicializaVentanaValidacion
function setupKeyListener(id_visor){
	// Add the event handler detectEvent on the keydown event
	var funcionOnkeyDown = function (e){
		var evt = e || window.event;
		// check for the TAB key
		if (evt.keyCode == 9){
			// call the actionscript function to pass it the SHIFT key pressed
			var objeto = document[id_visor + '_objetovalidacion'] || window[id_visor + '_objetovalidacion'];
			try{
				objeto.handleExternalTabKey(evt.shiftKey);
				return false;
			}catch(e){};
		}else{
			return true;
		}
	};
	document.onkeydown = funcionOnkeyDown;
	if(va_visores[id_visor].ultimaCapaVisible == 4){
		var flashPlayer = document[id_visor + '_objetovalidacion'] || window[id_visor + '_objetovalidacion'];
		flashPlayer.focus();
	}
}

/*	Estados{
		(definidos en el css)
		OK
		ERROR
		REVIEW
		INFO
		EDITED
	}*/
function av_changePageState(id_visor, id_pagina, estado){
	for(var i=0;i<va_documentos[id_visor].length; i++){
		if(va_documentos[id_visor][i].id == id_pagina){
			if(va_visores[id_visor].modoValidacion){
				va_documentos[id_visor][i].Estado_v = estado;
			}else{
				va_documentos[id_visor][i].Estado = estado;
			}
		}
	}
	$('#' + id_visor + ' tr.imagenTiraTR[rel="' + id_pagina + '"] .statusImage')
	.removeClass()
	.addClass('statusImage')
	.addClass('statusImage' + estado);
}

/**	va_cortinillaVisor
	genera una cortinilla que bloquea todo el visor y ventana, tira y toolbar incluidas
	activar = true /false
	@return undefined
**/
function va_cortinillaVisor(id_visor, activar){
	if(activar){
		if($('#'+id_visor+'_cortinilla').length){
			return;
		}
		va_setObjectLayer(id_visor,-1);
		var cortina = $('<div id="'+id_visor+'_cortinilla"></div>')
			.css('position','absolute')
			.css('background','#ccc')
			.css('width', $('#'+id_visor).width())
			.css('height', $('#'+id_visor).height())
			.css('opacity','.7')
			.css('filter','alpha(opacity=70)')
			.css('MsFilter','progid:DXImageTransform.Microsoft.Alpha(Opacity=70)')
			.css('zIndex','100000')
			.append('<span class="ImageViewerWaitingGif"/>')
			.prependTo($('#'+id_visor));
	}else{
		va_setObjectLayer(id_visor,-2);
		$('#'+id_visor+'_cortinilla').remove();
	}
}

/**	PESTANAS VALIDACION - VISUALIZACION/EDICION **/
/*	Interna, esto devuelve el objeto jquery del tab
	si pest no es 0 o 1 devuelve null */
function va_getTab(id_visor, pest){
	var obj=null;
	switch(pest){
		case 0:
			obj = $('#'+id_visor+'_pestanas_edicion');
			break;
		case 1:
			obj = $('#'+id_visor+'_pestanas_validacion');
			break;
	}
	return obj;
}

/**	av_setVisibleTab(id_visor, pest, visible)
	pest = {
		0 -> pesta?a de visualizacion
		1 -> pesta?a de validacion
	}
	visible = true / false
	@return true si todo fue bien, false en caso contrario
**/
function av_setVisibleTab(id_visor, pest, visible){
	var obj=va_getTab(id_visor, pest);
	if(obj!=null){
		if(visible){
			obj.show();
		}else{
			obj.hide();
		}
		return true;
	}
	return false;
}

/**	av_setEnabledTab(id_visor, pest, visible)
	Igual que av_setVisibleTab
	@return true si todo fue bien, false en caso contrario **/
function av_setEnabledTab(id_visor, pest, enabled){
	var obj=va_getTab(id_visor, pest);
	if(obj!=null && obj.length){
		if (enabled){
			obj.removeClass('ImageViewer_disabledTab');
		}else{
			obj.addClass('ImageViewer_disabledTab');
		}
		return true;
	}
	return false;
}

/**	av_setActiveTab(id_visor, pest, visible)
	Igual que av_setVisibleTab
	@return true si todo fue bien, false en caso contrario **/
function av_setActiveTab(id_visor, pest){
	var pestanas = $('#'+id_visor+'_pestanas a');
	if(pestanas.length>0){
		pestanas.removeClass('ImageViewer_activeTab');
		hayPestanas=true;
	}
	switch(pest){
		case 0:
			va_setObjectLayer(id_visor, 1, pestanas[0]);
			//pestanas.eq(pest).addClass('ImageViewer_activeTab');
			break;
		case 1:
			va_setObjectLayer(id_visor, 4, pestanas[1]);
			break;
	}
	return true;
}

/**	te devuelve que tab esta activa:
	0 -> pesta?a de visualizacion
	1 -> pesta?a de validacion
	-1 ninguna de las dos (viendo un pdf, o algo diferente)
**/
function av_getActiveTab(id_visor){
	if($('#' + id_visor + '_visorflash' ).width()!=1){
		return 0;
	}else if($('#' + id_visor + '_validacion' ).width()!=1){
		return 1;
	}else{
		return -1;
	}
}/*FIN VentanaValidacion.js*/ 
/*INICIO VentanaValidacion_tiraTreetable.js*/ 
/**	VentanaValidacion_tiraTreetable.js **/
/* jQuery tiraTable Plugin VERSION
 * http://ludo.cubicphuse.nl/jquery-plugins/tiraTable/doc/
 *
 * Copyright 2011, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses. */
(function($){
  // Helps to make options available to all functions
  // TODO: This gives problems when there are both expandable and non-expandable
  // trees on a page. The options shouldn't be global to all these instances!
  var options;
  var defaultPaddingLeft;
  $.fn.tiraTable = function(opts) {
    options = $.extend({}, $.fn.tiraTable.defaults, opts);
    return this.each(function() {
      $(this).addClass("tiraTable").find("tbody tr").each(function() {
        // Skip initialized nodes.
        if (!$(this).hasClass('initialized')){
          var isRootNode = ($(this)[0].className.search(options.childPrefix) == -1);

          // To optimize performance of indentation, I retrieve the padding-left
          // value of the first root node. This way I only have to call +css+
          // once.
          if (isRootNode && isNaN(defaultPaddingLeft)) {
            defaultPaddingLeft = parseInt($($(this).children("td")[options.treeColumn]).css('padding-left'), 10);
          }

          // Set child nodes to initial state if we're in expandable mode.
          if(!isRootNode && options.expandable && options.initialState == "tira_collapsed") {
            $(this).addClass('ui-helper-hidden');
          }

          // If we're not in expandable mode, initialize all nodes.
          // If we're in expandable mode, only initialize root nodes.
          if(!options.expandable || isRootNode) {
            initialize($(this));
          }
        }
      });
    });
  };
  
	// se hace sobre un TR nuevo
	$.fn.tira_inicializa = function() {
        if(!$(this).hasClass('initialized')){
          var isRootNode = ($(this)[0].className.search(options.childPrefix) == -1);

          // To optimize performance of indentation, I retrieve the padding-left
          // value of the first root node. This way I only have to call +css+
          // once.
          if(isRootNode && isNaN(defaultPaddingLeft)){
            defaultPaddingLeft = parseInt($($(this).children("td")[options.treeColumn]).css('padding-left'), 10);
          }

          // Set child nodes to initial state if we're in expandable mode.
          if(!isRootNode && options.expandable && options.initialState == "tira_collapsed"){
            $(this).addClass('ui-helper-hidden');
          }

          // If we're not in expandable mode, initialize all nodes.
          // If we're in expandable mode, only initialize root nodes.
          if(!options.expandable || isRootNode || true){
            initialize($(this));
          }
        }
	};
	
  $.fn.tiraTable.defaults = {
    childPrefix: "child-of-",
    clickableNodeNames: false,
    expandable: true,
    indent: 19,
    initialState: "tira_collapsed",
    onNodeShow: null,
    onNodeHide: null,
    treeColumn: 0,
    persist: false,
    persistCookiePrefix: 'tiraTable_'
  };

  // Recursively hide all node's children in a tree
  $.fn.tira_collapse = function() {
    $(this).removeClass("tira_expanded").addClass("tira_collapsed");
    childrenOf($(this)).each(function() {
      if(!$(this).hasClass("tira_collapsed")) {
        $(this).tira_collapse();
      }
      $(this).addClass('ui-helper-hidden');
      if($.isFunction(options.onNodeHide)) {
        options.onNodeHide.call();
      }
    });
    return this;
  };

  // Recursively show all node's children in a tree
  $.fn.tira_expand = function() {
    $(this).removeClass("tira_collapsed").addClass("tira_expanded");
    childrenOf($(this)).each(function() {
      initialize($(this));
      if($(this).is(".tira_expanded.parent")) {
        $(this).tira_expand();
      }
      $(this).removeClass('ui-helper-hidden');
      if($.isFunction(options.onNodeShow)) {
        options.onNodeShow.call();
      }
    });
    return this;
  };

  // Reveal a node by expanding all ancestors
  $.fn.tira_reveal = function() {
    $(ancestorsOf($(this)).reverse()).each(function() {
      initialize($(this));
      $(this).tira_expand().show();
    });
    return this;
  };

  // Add an entire branch to +destination+
  $.fn.tira_appendBranchTo = function(destination) {
    var node = $(this);
    var parent = parentOf(node);
    var ancestorNames = $.map(ancestorsOf($(destination)), function(a) { return a.id; });

    // Conditions:
    // 1: +node+ should not be inserted in a location in a branch if this would
    //    result in +node+ being an ancestor of itself.
    // 2: +node+ should not have a parent OR the destination should not be the
    //    same as +node+'s current parent (this last condition prevents +node+
    //    from being moved to the same location where it already is).
    // 3: +node+ should not be inserted as a child of +node+ itself.
    if($.inArray(node[0].id, ancestorNames) == -1 && (!parent || (destination.id != parent[0].id)) && destination.id != node[0].id) {
      indent(node, ancestorsOf(node).length * options.indent * -1); // Remove indentation
      if(parent){
      	node.removeClass(options.childPrefix + parent[0].id);
      }
      node.addClass(options.childPrefix + destination.id);
      move(node, destination); // Recursively move nodes to new location
      indent(node, ancestorsOf(node).length * options.indent);
    }
    return this;
  };

  // Add reverse() function from JS Arrays
  $.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
  };

  // Toggle an entire branch
  $.fn.tira_toggleBranch = function() {
    if($(this).hasClass("tira_collapsed")){
      $(this).tira_expand();
    }else{
      $(this).tira_collapse();
    }
    if(options.persist){
      //Store cookie if this node is expanded, otherwise delete cookie.
      var cookieName = options.persistCookiePrefix + $(this).attr('id');
      $.cookie(cookieName, $(this).hasClass('tira_expanded') ? 'true' : null);
    }
    return this;
  };
  $.fn.getTTParentNode = function(){
	return parentOf(this);
  };
  $.fn.tira_getFirstChild = function(){
	return childrenOf(this).eq(0);
  };

  // === Private functions
  function ancestorsOf(node){
    var ancestors = [];
    while(node = parentOf(node)){
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };

  function childrenOf(node){
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
  };

  function getPaddingLeft(node){
    var paddingLeft = parseInt(node[0].style.paddingLeft, 10);
    return (isNaN(paddingLeft)) ? defaultPaddingLeft : paddingLeft;
  }

  function indent(node, value){
    var cell = $(node.children("td")[options.treeColumn]);
	/*depura(cell);
	depura(cell.length);
	depura(getPaddingLeft(cell));
	depura(value);
	depura(getPaddingLeft(cell) + value + "px");
	if((getPaddingLeft(cell) + value)>0){*/
	try{
		cell[0].style.paddingLeft = getPaddingLeft(cell) + value + "px";
	}catch(ex){}
    childrenOf(node).each(function() {
      indent($(this), value);
    });
  };

  function initialize(node) {
    if(!node.hasClass("initialized")){
      node.addClass("initialized");	//// .css('text-align', 'left');
      var childNodes = childrenOf(node);
      node.addClass("parent");
      if(node.hasClass("parent")){
        var cell = $(node.children("td")[options.treeColumn]);
        var padding = getPaddingLeft(cell) + options.indent;
        childNodes.each(function() {
          $(this).children("td")[options.treeColumn].style.paddingLeft = padding + "px";
        });
        if(options.expandable ||true) {
          cell.prepend('<span style="margin-left: -' + options.indent + 'px; padding-left: ' + options.indent + 'px" class="tira_expander"></span>');
          $(cell[0].firstChild).click(function() { node.tira_toggleBranch(); });
          if(options.clickableNodeNames) {
            cell[0].style.cursor = "pointer";
            $(cell).click(function(e) {
              // Don't double-toggle if the click is on the existing expander icon
              if (e.target.className != 'tira_expander') {
                node.tira_toggleBranch();
              }
            });
          }
          if (options.persist) {
            var cookieName = options.persistCookiePrefix + node.attr('id');
            if ($.cookie(cookieName) == 'true') {
              node.addClass('tira_expanded');
            }
          }
          // Check for a class set explicitly by the user, otherwise set the default class
          if(!(node.hasClass("tira_expanded") || node.hasClass("tira_collapsed"))) {
            node.addClass(options.initialState);
          }
          if(node.hasClass("tira_expanded")) {
            node.tira_expand();
          }
        }
      }
    }
  };

  function move(node, destination) {
    node.insertAfter(destination);
    childrenOf(node).reverse().each(function() { move($(this), node[0]); });
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');
    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }
    return null;
  };
})(jQuery);

/**	TIRA TREETABLE 
	FUNCIONES DEL API DEL VISOR **/

var _va_NimagenesMaximoParaPasarATiraSaturada = -1; //29
var _va_estadoInicialTira = 'tira_expanded';
//var _va_estadoInicialTira = "tira_collapsed";

/*	Cosas que van en el objeto va_visores:
va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado 
ultimoIDDocumentoSeleccionado
ultimoIdDocumentoCargado
Da la posicion dentro del DOM del elemento TR en la tabla 
SE INCLUYEN EN LA CUENTA TODOS LOS TRs, los de categorias, los de documentos...*/
function va_getPosicionTrEnTira(id_visor,idpagina){
	var $tabla = $('#'+id_visor+'_treeTira');
	return $('tr.imagenTiraTR', $tabla).index( $('tr.imagenTiraTR[rel="'+idpagina+'"]', $tabla) );
}

/* Devuelve el elemento del dom seleccionado actualmente (el cargado en el visor y tal..)
ignora last, antes no se usaba... */
va_getSelectedItem = function(id_visor, last){
	if(va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado==-1){
		return null;
	}else{
		var r = $('#'+id_visor+'_treeTira .imagenTiraTR').eq(va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado);
		if(r.length){
			return r[0];
		}else{
			return null;
		}
	}
};
va_getSelectedGroup = function(id_visor, last){
		var r = $('#'+id_visor+'_treeTira .documentoTiraTR.selected')
		if(r.length){
			return r[0];
		}else{
			return null;
		}
};
/* Devuelve los objetos jquery de los trs que hay seleccionados */
va_getSelectedItems = function(id_visor){
	return $('#'+id_visor+'_treeTira TR.imagenTiraTR.selected,#'+id_visor+'_treeTira TR.documentoTiraTR.selected');
};

va_getSelectedItemPos = function(id_visor){
	var it = va_getSelectedItem(id_visor);
	if(it){
		return va_getPosicionTrEnTira($(it).attr('rel'));
	}else{
		return -1;
	}
};

/**	av_SelectDocumentByID
	Pone en azulito el icono del documento que tu le pases por ID
	params:
		id_visor
		id 			ID del documento	(si le pasas null deja todos sin seleccionar)
		bKeepSel	mantiene la seleccion actual
	ret:
		devuelve true si ha encontrado en la tira un documento con el id que le has pasado */
av_SelectDocumentByID = function(id_visor, id, bKeepSel){
	var $tabla = $('#'+id_visor+'_treeTira');
	if(!av_isMultipleSelectionIndicator(id_visor)){
		bKeepSel=false;
	}
	if(id!=null){
		va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado = va_getPosicionTrEnTira(id_visor, id);
		if(!bKeepSel){
			$('.selected',$tabla).removeClass('selected');
		}
		var $tr = $('tr.imagenTiraTR[rel="'+id+'"],tr.documentoTiraTR[rel="'+id+'"]', $tabla);
		if($tr.length){
			$tr.addClass('selected');
			var tablaTop = $tabla.position().top;
			if(tablaTop < 0){
				tablaTop = tablaTop * -1;
			}
			$('#'+id_visor+'_filmstrip').animate({scrollTop:($tr.position().top + tablaTop) - 200},{duration:400});
			va_visores[id_visor].ultimoIDDocumentoSeleccionado = id;
		}
	}else{
		va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado=-1;
		$('.selected',$tabla).removeClass('selected');
	}
	va_lanzarEvento(id_visor, 'onSelectionChanged', id);
};

/**	av_SelectDocumentByID
	Pone en azulito el icono del documento que tu le pases por ID
	params:
		id_visor
		id 			ID del documento
		bKeepSel	mantiene la seleccion actual
	ret:
		devuelve true si ha encontrado en la tira un documento con el id que le has pasado */
function av_SelectDocumentByIDFromFlash(parametros){
	av_SelectDocumentByID(parametros[0], parametros[1], parametros[2]);
	av_LoadDocumentByID(parametros[0], parametros[1]);
}

av_SelectDocumentsByID = function(id_visor, arr_ids, bKeepSel){
	var primero = true;	// el primero qe se selecciona del array va con esto a true, porque para seleccionar varios hay que pasarle bKeepSel a true
	for(id in arr_ids){
		// el primero va con esto = bKeepSel, y los siguientes siempre a true
		av_SelectDocumentByID(id_visor, arr_ids[id], (bKeepSel || !primero));	
		primero = false;
	}
};

av_SelectAll = function(id_visor){
	var docids=[];
	for(var pos in va_documentos[id_visor]){
		docids[docids.length] = va_documentos[id_visor][pos].id;
	}
	av_SelectDocumentsByID(id_visor, docids, false);
};

av_DeselectAll = function(id_visor){
	av_SelectDocumentByID(id_visor, null, false);
};

av_GetSelectedDocument = function (id_visor){
	var d = va_getSelectedItem(id_visor);
	if(d!=null){
		return $(d).attr('rel');
	}else if((d = va_getSelectedGroup(id_visor)) != null){
		return $(d).attr('rel');
	}
};

av_GetSelectedDocuments = function (id_visor){
	var r = [];
	var d = va_getSelectedItems(id_visor);
	$(d.each(function(){
		r[r.length] = $(this).attr('rel');
	}));
	/* if(r.length == 0){
		r[0] = va_visores[id_visor].ultimoIdDocumentoCargado;
	} */
	return r;
};

/**	Elimina la p?gina	
	si NOmeterEnElXML ==true, no se mete la modificacion en el xml de salida **/
function av_removeDocumentById (id_visor, idpag, NOmeterEnElXML){
	va_enablePage(id_visor, idpag, true);
	var doc = va_getDocumento(id_visor, idpag);
	var grupoAlQuePertenecia = doc.idDoc;
	var pos = doc.order;
	if(doc){
		if(doc.idFilaTT){
			$('#'+id_visor+'_fila-'+doc.idFilaTT).remove();
		}else{
			// mas lento, pero mas seguro
			$('#'+id_visor+'_treeTira td[rel="'+idpag+'"]').remove();
		}

		// TODO: PENDIENTE: LO ELIMINO O LO MARCO COMO BORRADO??????????????????
		var nuevosDoc = [];
		for (var j = 0;j<va_documentos[id_visor].length;j++){
			if(va_documentos[id_visor][j].id != idpag){
				nuevosDoc[nuevosDoc.length] = va_documentos[id_visor][j];
				// Orden de la pagina
				if(va_documentos[id_visor][j].idDoc == grupoAlQuePertenecia){
					if(va_documentos[id_visor][j].order > pos){
						va_documentos[id_visor][j].order--;
					}
				}
			}
		}
		va_documentos[id_visor]= nuevosDoc;
		
		// Qitar la pagina de va_job
		for(var i=0;i<va_job[id_visor].length;i++){
			if(va_job[id_visor][i].id==grupoAlQuePertenecia){
				var pagQuitada = va_job[id_visor][i].pages.splice(pos,1);
				break;
			}
		}
		if(!NOmeterEnElXML){
			va_jobchanges_deletePage(id_visor, idpag, grupoAlQuePertenecia);
		}
		return true;
	}else{
		return false;
	}
};

/**	Mueve de categoria una p?gina! en la tira a un documento nuevo dentro de la categoria deseada
	si la categoria no existe en la tira , y _va_insertarCategoriaSiNoExiste=true se crea a partir de 
	la info de va_categorias
	si la categoria no existe en va_categorias se crea si _va_crearCategoriaSiNoExiste y luego se inserta
	si la categoria no existe y no se puede crear devuelve -1
	si la categoria existe, pero no est? en la tira, y _va_insertarCategoriaSiNoExiste devuelve -1 tambien
	si todo ha ido bien, devuelve el id del documento nuevo autogenerado, o documentoDestino, 
	asi se sabe donde se ha insertado la pagina **/
function va_SetCategoriaDelDocumentoEnTira (id_visor, pagina, idcat, documentoDestino, $tabla, anexar){
	if(typeof pagina == 'string'){pagina=va_getDocumento(id_visor, pagina);}
	if(typeof pagina!='object'){return -1;}
	if(pagina.id){
		var grupo=va_getGrupoDocumentos(id_visor, pagina.id);
		// Es un grupo, no una pagina
		if(grupo!=null){
			return va_SetCategoriaDelGrupoEnTira (id_visor, grupo, idcat, $tabla, anexar);
		}
		
	}
	
	// get_categoria se encarga de crearla si no existe si _va_crearCategoriaSiNoExiste==true
	var cat = va_getCategoria(id_visor, idcat, _va_crearCategoriaSiNoExiste);
	if(!$tabla){
		$tabla = $('#'+id_visor+'_treeTira');if(!$tabla || $tabla.length==0){return -1;}
	}
	var posEnDocFinal = 0;
	if(cat){
		var idFilaActual;
		var $documentoPadre;
		if(!cat.insertadaEnTira){
			if(_va_insertarCategoriaSiNoExiste){
			// si no esta insertada y existe la inserto en la tira, con un nuevo idFila
			/*idFilaActual = idsFilas(id_visor);
			cat.idFilaTT = idFilaActual;
			cat.insertadaEnTira = true;
			tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);*/
				if(va_InsertarCategoria (id_visor, cat.id)==-1){
					return -1;
				}
			}else{
				return -1;
			}
		}
		var restmp;
		if(documentoDestino){
			restmp = {'idDoc': documentoDestino};
			$documentoPadre = $('TR.documentoTiraTR[rel="'+documentoDestino+'"]', $tabla);
			posEnDocFinal = $('.child-of-'+$documentoPadre.attr('id')).length;
		}else if(anexar){
			for(var i=0; i<va_job[id_visor].length; i++){
				if(va_job[id_visor][i].typeId == idcat){
					documentoDestino = va_job[id_visor][i].id;
					break;
				}
			}
			if(documentoDestino == null){
				restmp = tira_insertarNuevoDocumentoAutoGenerado($tabla, id_visor, cat.idFilaTT);
				idFilaActual = restmp.idFila;
				
				//inicializa los nuevos nodos con el treetable
				$('#'+id_visor+'_fila-'+cat.idFilaTT, $tabla).tira_inicializa();
				$documentoPadre = $('#'+id_visor+'_fila-'+idFilaActual, $tabla);
				posEnDocFinal = 0;
			}else{
				restmp = {'idDoc': documentoDestino};
				$documentoPadre = $('TR.documentoTiraTR[rel="'+documentoDestino+'"]', $tabla);
				posEnDocFinal = $('.child-of-'+$documentoPadre.attr('id')).length;
			}
		}else{
			restmp = tira_insertarNuevoDocumentoAutoGenerado($tabla, id_visor, cat.idFilaTT);
			idFilaActual = restmp.idFila;
			
			//inicializa los nuevos nodos con el treetable
			$('#'+id_visor+'_fila-'+cat.idFilaTT, $tabla).tira_inicializa();
			$documentoPadre = $('#'+id_visor+'_fila-'+idFilaActual, $tabla);
			posEnDocFinal = 0;
		}
		if(!$documentoPadre || $documentoPadre.length==0){
			return -1;
		}

		// Mueve la pagina al documento
		$('#'+id_visor+'_fila-'+pagina.idFilaTT, $tabla).tira_appendBranchTo(
			$documentoPadre[0]
		);
		var idDocumentoOrig = pagina.idDoc;
		var idDocumentoDest = restmp.idDoc;
		var categoriaOrigen = '?';
		var categoriaDestino = idcat;
		var posEnDocAntes = 0;
		for(var i=0;i<va_job[id_visor].length;i++){
			if(va_job[id_visor][i].id==idDocumentoOrig){
				categoriaOrigen = va_job[id_visor][i].typeId;
				break;
			}
		}
		var idPagina = pagina.id; 
		av_changePageState(id_visor, pagina.id, 'EDITED');
		for (pag in va_documentos[id_visor]){
			if(va_documentos[id_visor][pag].id==idPagina){
				va_documentos[id_visor][pag].idDoc=idDocumentoDest;
				posEnDocAntes=va_documentos[id_visor][pag].order;
				va_documentos[id_visor][pag].order=posEnDocFinal;
				break;
			}
		}
	
		// Recolocacion de ordenes de paginas:
		for (pag in va_documentos[id_visor]){
			var ordenPaginaRecienCambiada = -1;
			if(va_documentos[id_visor][pag].idDoc == idDocumentoOrig	&&	
			  va_documentos[id_visor][pag].id!=idPagina){
				if(va_documentos[id_visor][pag].order > posEnDocAntes){
					va_documentos[id_visor][pag].order--;
					ordenPaginaRecienCambiada=pag;
				}
			}
			if(va_documentos[id_visor][pag].idDoc == idDocumentoDest	&&		
			  va_documentos[id_visor][pag].id!=idPagina){
				if(va_documentos[id_visor][pag].order >= posEnDocFinal){
					va_documentos[id_visor][pag].order++;
				}
			}
		}
	
		// Recolocacion en el array
		var pagQuitada = null;
		for (var i=0;i<va_job[id_visor].length;i++){
			if(va_job[id_visor][i].id == idDocumentoOrig){
				pagQuitada = va_job[id_visor][i].pages.splice(posEnDocAntes,1);
			}
		}
		if(pagQuitada!=null && pagQuitada.length>0){
			for (var i=0;i<va_job[id_visor].length;i++){
				if(va_job[id_visor][i].id == idDocumentoDest){
					va_job[id_visor][i].pages.splice(posEnDocFinal,0,pagQuitada[0]);
				}
			}
		}
		va_jobchanges_movePage(id_visor, idPagina, idDocumentoOrig, idDocumentoDest,  posEnDocAntes, posEnDocFinal, categoriaOrigen, categoriaDestino);
		return restmp.idDoc;
	}
	return -1;
};
function va_SetCategoriaDelGrupoEnTira (id_visor, docu, idcat, $tabla, anexar){
	if(typeof docu== 'string'){pagina=va_getDocumento(id_visor, pagina);}
	if(typeof docu!='object'){
		docu = va_getGrupoDocumentos(id_visor, docu);
	}
	if(typeof docu!='object'){
		return -1;
	}
	var cat = va_getCategoria(id_visor, idcat, _va_crearCategoriaSiNoExiste);
	if(!$tabla){
		$tabla = $('#'+id_visor+'_treeTira');if(!$tabla || $tabla.length==0){return -1;}
	}
	var posEnDocFinal = 0;
	if(cat){
		var idFilaActual;
		var $documentoPadre;
		if(!cat.insertadaEnTira){
			if(_va_insertarCategoriaSiNoExiste){
			// si no esta insertada y existe la inserto en la tira, con un nuevo idFila
			/*idFilaActual = idsFilas(id_visor);
			cat.idFilaTT = idFilaActual;
			cat.insertadaEnTira = true;
			tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);*/
				if(va_InsertarCategoria (id_visor, cat.id)==-1){
					return -1;
				}
			}else{
				return -1;
			}
		}
		// Mueve la pagina al documento
		$('.documentoTiraTR[rel="' + docu.id + '"]', $tabla).tira_appendBranchTo(
			$('.categoriaTiraTR[rel="'+cat.id+'"]', $tabla)[0]
		);
	
	}
}
/**	Genera un documento "Nuevo", inexistente, con id = timestamp+random y que cuelga de la categoria que le pases
	idPadre debe ser un idnodo del treetable
	Devuelve el idFila del documento generado y el id del documento
	de forma {idDoc : ... , idFila: ... } */
function tira_insertarNuevoDocumentoAutoGenerado($tabla, id_visor, idPadre, noInicializarNodosTreeTable, id, titulo, tipo){
	depura('tira_insertarNuevoDocumentoAutoGenerado('+$tabla+', "'+id_visor+'", "'+idPadre+'", '+noInicializarNodosTreeTable+', "'+id+'", "'+titulo+'", "'+tipo+'")');
	if(!isValidVariable(id, 'string') || id == ''){
		id = "doc" + ("" + ((new Date()).getTime())) + "r" + Math.floor(Math.random()*9999);
	}
	if(!isValidVariable(titulo, 'string') || titulo == ''){
		titulo = va_literalesVisor.nuevo;
	}
	if(!isValidVariable(tipo, 'string') || tipo == ''){
		tipo = '';
	}
	// Inserta documento nuevo en categoria
	var idFilaActual = idsFilas(id_visor);
	va_gruposPaginas[id] = idFilaActual;
	tira_insertarDocumento($tabla, id_visor, idFilaActual, idPadre, id, titulo, true);
	if(!noInicializarNodosTreeTable){
		//inicializa los nuevos nodos con el treetable
		$('#'+id_visor+'_fila-'+idFilaActual, $tabla).tira_inicializa();
			
		// no entinedo por QUE! esta mierda no la hace solo el treetable...
		$('#'+id_visor+'_fila-'+idFilaActual+ ' TD', $tabla).css('paddingLeft','7px');

		// Inicializa drag & drop de elementos nuevos:
		//>> arrastra el tr del doc
		//tira_inicializaDraggable($tabla, $('#'+id_visor+'_fila-'+idFilaActual+'', $tabla)[0]);	// documento 

		//>> arrastra el titulo del doc >> 
		tira_inicializaDraggable($tabla, $('#'+id_visor+'_fila-'+idFilaActual+' .documentoTira', $tabla)[0]);	// documento 
		// tira_inicializaDraggable($tabla, $('#'+id_visor+'_fila-'+pagina.idFilaTT, $tabla)[0]); // pagina
		tira_inicializaDropableDocumento($tabla, id_visor, $('#'+id_visor+'_fila-'+idFilaActual+' .documentoTira', $tabla)[0]);
	}

	/** Actualizar va_job **/
	var id_categoria = $('#'+id_visor+'_fila-'+idPadre).attr('rel');
	var nomCategoria = av_getCategoryByID(id_visor, id_categoria);
	if(nomCategoria && nomCategoria.Title) {nomCategoria=nomCategoria.Title};
	va_job[id_visor][va_job[id_visor].length] = {
		'OCRInfo':"",
		'OCRValue':"",
		'PEGAInfo':"",
		'PEGAValue':"",
		'id':id,
		'pages':[],
		'typeId':id_categoria,
		'typeName':nomCategoria
		};
	if(tipo.toLowerCase() == 'pdf'){
		va_job[id_visor][va_job[id_visor].length-1].DOCUMENTO_AUTOGENERADO_PDF = true;
	}else if(tipo.toLowerCase() == 'zip'){
		va_job[id_visor][va_job[id_visor].length-1].DOCUMENTO_AUTOGENERADO_ZIP = true;
	}else{
		va_job[id_visor][va_job[id_visor].length-1].DOCUMENTO_AUTOGENERADO = true;
	}
	va_jobchanges_nuevoDocumentoAutogenerado(id_visor, id, id_categoria);
	return {'idDoc': id, 'idFila': idFilaActual};
}

/**	generador de IDS 
	idsFilas
	guarda en un atributo del tiraTable el id actual para que nunca se repitan */
function idsFilas(id_visor){
	var ret = 1;
	if($('#'+id_visor+'_filmstrip').attr('idsFilas')!=undefined){
		ret = parseInt($('#'+id_visor+'_filmstrip').attr('idsFilas'));
	}
	ret++;
	$('#'+id_visor+'_filmstrip').attr('idsFilas', ret);
	return (ret-1);
}

var va_gruposPaginas = [];
function inicializaTiraVW(id_visor){
	depura('inicializaTiraVW("'+id_visor+'")');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('inicializaTiraVW: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion.');
	}
	// Documento generado para las paginas que no tengan un idDoc asignado, por cada categoria 
	var documentoGeneradoParaImagenesSueltas = [];	
	var idFilaActual = 1;
	$('#'+id_visor+'_filmstrip').empty();
	var $tabla = $('<table id="'+id_visor+'_treeTira" class="treetableTira"></table>');

	/** con categorias **/
	if(_va_InsertarCategoriasDelContexto){
		if(isValidVariable(va_categorias, 'object')){
			va_categorias = [];
			va_categorias[id_visor] = [{title:va_literalesVisor.noClasificado, id:'-1', visible:true, defaultcat:true}];
		}else if(isValidVariable(va_categorias[id_visor], 'object')){
			va_categorias[id_visor] = [{title:va_literalesVisor.noClasificado, id:'-1', visible:true, defaultcat:true}];
		}
		for (var i=0; i<va_categorias[id_visor].length; i++){
			var cat = va_categorias[id_visor][i];
			if(cat.visible!==false){
				idFilaActual = idsFilas(id_visor);
				cat.idFilaTT = idFilaActual;
				cat.insertadaEnTira = true;
				tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);
				if(cat.cssclass && cat.cssclass!='null' && cat.cssclass!='-1'){
					$('#'+id_visor+'_fila-'+idFilaActual, $tabla).addClass(cat.cssclass);
				}
				va_categorias[id_visor][i].idFilaTT = idFilaActual;
			}
		}
	}
	
	if(!isValidVariable(va_documentos, 'object')){
		va_documentos = [];
		va_documentos[id_visor] = [];
	}else if(!isValidVariable(va_documentos[id_visor], 'object')){
		va_documentos[id_visor] = [];
	}
	if(!isValidVariable(va_job, 'object')){
		va_job = [];
		va_job[id_visor] = [];
	}else if(!isValidVariable(va_job[id_visor], 'object')){
		va_job[id_visor] = [];
	}
	for (var i=0; i<va_documentos[id_visor].length; i++){
		var urltmp = va_documentos[id_visor][i].Uri;
		if(typeof urltmp=='undefined' || urltmp==''){
			urltmp = va_documentos[id_visor][i].Path;
		}
		if(va_getTipoFromUrl(urltmp, va_documentos[id_visor][i].tipo) == 'pdf'){
			// Es un pdf,
			var cat = va_getCategoria(id_visor, va_documentos[id_visor][i].Categoria, _va_crearCategoriaSiNoExiste, va_documentos[id_visor][i].CategoriaNombre);
			if(cat){
				if(!cat.insertadaEnTira){
					idFilaActual = idsFilas(id_visor);
					cat.idFilaTT = idFilaActual;
					cat.insertadaEnTira = true;
					tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);
				}

				// Inserta documento DESAGRUPABLE en categoria
				idFilaActual = idsFilas(id_visor);
				va_gruposPaginas[va_documentos[id_visor][i].idDoc] = idFilaActual;
				tira_insertarDocumento($tabla, id_visor, idFilaActual, cat.idFilaTT, va_documentos[id_visor][i].id, va_documentos[id_visor][i].Title, true);
				va_documentos[id_visor][i].idFilaTT = idFilaActual;
				$('tr[rel="'+va_documentos[id_visor][i].id+'"]',$tabla).addClass('tira_collapsed');
				//$('tr[rel="'+va_documentos[id_visor][i].id+'"] td',$tabla).attr('onclick', 'va_clickBotonAgrupado(\''+id_visor+'\',\''+va_documentos[id_visor][i].id+'\');');
				
				//$('tr[rel="'+va_documentos[id_visor][i].id+'"]',$tabla).click(
				
				$('#'+id_visor+'_fila-'+idFilaActual, $tabla).click(function(ev, x){
					if(ev.target.className!='tira_expander'){
						if(_va_AlDesagruparEliminarOriginales){
							if(va_getDocumentoAgrupado(id_visor, $(this).attr('rel'))){
								$(this).tira_toggleBranch();
								av_LoadDocumentByID(id_visor, $(this).attr('rel'));
							}
						}else{
							av_LoadDocumentByID(id_visor, $(this).attr('rel'));
						}
					}else{
						if(!isValidVariable(va_visores[id_visor].desagrupacion, 'object') || !isValidVariable(va_visores[id_visor].desagrupacion.terminada, 'boolean')){
							va_clickBotonAgrupado(id_visor, $(this).attr('rel'), this);
						}else if(va_visores[id_visor].desagrupacion.terminada){
							va_clickBotonAgrupado(id_visor, $(this).attr('rel'), this);
						}else{
							$(this).tira_toggleBranch();
						}
					}
				});
				
				// Es un pdf, esto no deberia estar aqui:
				// me lo llevo a va_job, y lo saco de va_documentos
				var doc = va_documentos[id_visor].splice(i,1);
				doc = doc [0];
				i--;
				
				var cate = va_getCategoria(id_visor, doc.Categoria);
				if(cate){cate = cate.title;}
				if(!cate){cate = doc.CategoriaNombre;} // no pongas un else, esta hecho asi a posta

				va_job[id_visor][va_job[id_visor].length] = {
					'OCRInfo':"",'OCRValue':"",'PEGAInfo':"",'PEGAValue':"",
					'id':doc.id,
					'pages':[],
					'typeId':doc.Categoria,
					'typeName':doc.CategoriaNombre,
					'DOCUMENTO_AUTOGENERADO_PDF':true,
					'Uri':doc.Uri,
					'Path':doc.Path,
					'Categoria': doc.Categoria, 
					'SourceLocation':doc.SourceLocation,
					'Properties':doc.Properties,
					'DocumentoOriginal':doc
				};
			}
		}else if(va_getTipoFromUrl(urltmp, va_documentos[id_visor][i].tipo) == 'zip'){
			// Es un zip
			var cat = va_getCategoria(id_visor, va_documentos[id_visor][i].Categoria, _va_crearCategoriaSiNoExiste, va_documentos[id_visor][i].CategoriaNombre);
			if(cat){
				if(!cat.insertadaEnTira){
					idFilaActual = idsFilas(id_visor);
					cat.idFilaTT = idFilaActual;
					cat.insertadaEnTira = true;
					tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);
				}

				// Inserta documento DESCOMPRIMIBLE en categoria
				idFilaActual = idsFilas(id_visor);
				va_gruposPaginas[va_documentos[id_visor][i].idDoc] = idFilaActual;
				tira_insertarDocumento($tabla, id_visor, idFilaActual, cat.idFilaTT, va_documentos[id_visor][i].id, va_documentos[id_visor][i].Title, true);
				va_documentos[id_visor][i].idFilaTT = idFilaActual;
				$('tr[rel="'+va_documentos[id_visor][i].id+'"]',$tabla).addClass('tira_collapsed');
				//$('tr[rel="'+va_documentos[id_visor][i].id+'"] td',$tabla).attr('onclick', 'va_clickBotonComprimido(\''+id_visor+'\',\''+va_documentos[id_visor][i].id+'\');');
				
				//$('tr[rel="'+va_documentos[id_visor][i].id+'"]',$tabla).click(
				
				$('#'+id_visor+'_fila-'+idFilaActual, $tabla).click(function(ev, x){
					if(ev.target.className!='tira_expander'){
						$(this).tira_toggleBranch();
					}else{
						if(!isValidVariable(va_visores[id_visor].descompresion, 'object') || !isValidVariable(va_visores[id_visor].descompresion.terminada, 'boolean')){
							va_clickBotonComprimido(id_visor, $(this).attr('rel'), this);
						}else if(va_visores[id_visor].descompresion.terminada){
							va_clickBotonComprimido(id_visor, $(this).attr('rel'), this);
						}else{
							$(this).tira_toggleBranch();
						}
					}
				});
				
				// Es un zip, esto no deberia estar aqui:
				// me lo llevo a va_job, y lo saco de va_documentos
				var doc = va_documentos[id_visor].splice(i,1);
				doc = doc [0];
				i--;
				
				var cate = va_getCategoria(id_visor, doc.Categoria);
				if(cate){cate = cate.title;}
				if(!cate){cate = doc.CategoriaNombre;} // no pongas un else, esta hecho asi a posta (...VA-LE!)
				
				va_job[id_visor][ va_job[id_visor].length ] = {
					'OCRInfo':"",'OCRValue':"",'PEGAInfo':"",'PEGAValue':"",
					'id':doc.id,
					'pages':[],
					'typeId':doc.Categoria,
					'typeName':doc.CategoriaNombre,
					'DOCUMENTO_AUTOGENERADO_ZIP':true,
					'Uri':doc.Uri,
					'Path':doc.Path,
					'Categoria': doc.Categoria, 
					'SourceLocation':doc.SourceLocation,
					'Properties':doc.Properties,
					'DocumentoOriginal':doc
				};
			}
		}else{ //IMAGEN:
			// Pertenece a algun documento?
			if(va_documentos[id_visor][i].idDoc){// esta pagina pertenece a al documento idDoc
				if(va_gruposPaginas[va_documentos[id_visor][i].idDoc]){
					//::: Documento ya insertado en la tira
					// Inserta pagina en documento y se olvida de la categoria
					idFilaActual = idsFilas(id_visor);
					tira_insertarPaginaEnTira($tabla, id_visor, idFilaActual, va_gruposPaginas[va_documentos[id_visor][i].idDoc], va_documentos[id_visor][i], true);
					va_documentos[id_visor][i].idFilaTT = idFilaActual;
				}else{
					//la pagina tiene un idDoc que no est? insertado en la tira
					// :: Insertar nuevo documento
					// busca la categoria y la crea si no existe:
					var cat = va_getCategoria(id_visor, va_documentos[id_visor][i].Categoria, _va_crearCategoriaSiNoExiste, va_documentos[id_visor][i].CategoriaNombre);
					if(cat){
						if(!cat.insertadaEnTira){
							idFilaActual = idsFilas(id_visor);
							cat.idFilaTT = idFilaActual;
							cat.insertadaEnTira = true;
							tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);
						}
						
						// Inserta documento en categoria
						idFilaActual = idsFilas(id_visor);
						va_gruposPaginas[va_documentos[id_visor][i].idDoc] = idFilaActual;
						tira_insertarDocumento($tabla, id_visor, idFilaActual, cat.idFilaTT, va_documentos[id_visor][i].idDoc, "", true);

						// Inserta pagina en documento
						idFilaActual = idsFilas(id_visor);
						tira_insertarPaginaEnTira($tabla, id_visor, idFilaActual, va_gruposPaginas[va_documentos[id_visor][i].idDoc], va_documentos[id_visor][i], true);
						va_documentos[id_visor][i].idFilaTT = idFilaActual;
					}
				}
			}else{
				// la pagina NO PERTENECE A NINGUN DOCUMENTO >> me invento uno:
				// Pertenece a alguna categoria???
				var cat = va_getCategoria(id_visor, va_documentos[id_visor][i].Categoria, _va_crearCategoriaSiNoExiste, va_documentos[id_visor][i].CategoriaNombre);
				if(cat){
					if(!cat.insertadaEnTira){
						idFilaActual = idsFilas(id_visor);
						cat.idFilaTT = idFilaActual;
						cat.insertadaEnTira = true;
						tira_insertarCategoria($tabla, id_visor, idFilaActual, cat);
					}
					if(!documentoGeneradoParaImagenesSueltas[cat.id]){
						/* tiene la estructura 
						{idDoc:.., idFila: ... } */
						// Genera el elemento en la tira, 
						documentoGeneradoParaImagenesSueltas[cat.id] = tira_insertarNuevoDocumentoAutoGenerado($tabla, id_visor, cat.idFilaTT, true);
						
						// y luego lo oculta:
						//$('#'+id_visor+ '_fila-' + documentoGeneradoParaImagenesSueltas[cat.id].idFila, $tabla).hide();
					}
					
					// Insertar p?gina al final de este documento que se autogeneró
					idFilaActual = idsFilas(id_visor);
					va_documentos[id_visor][i].idDoc=documentoGeneradoParaImagenesSueltas[cat.id].idDoc;
					for(var jj =0;jj < va_job[id_visor].length; jj++){
						if(va_job[id_visor][jj].id == documentoGeneradoParaImagenesSueltas[cat.id].idDoc){
							va_documentos[id_visor][i].order = va_job[id_visor][jj].pages.length;
							va_job[id_visor][jj].pages[ va_job[id_visor][jj].pages.length ] = va_documentos[id_visor][i];
							break;
						}
					}
					var idFilaPadre = documentoGeneradoParaImagenesSueltas[cat.id].idFila;
					tira_insertarPaginaEnTira($tabla, id_visor, idFilaActual, idFilaPadre, va_documentos[id_visor][i], true);
					va_documentos[id_visor][i].idFilaTT = idFilaActual;
				}
			}
		}
	}
	//tira_insertarCategoria($tabla, id_visor, '0', '-1', 'Sin Clasificar');
	$tabla.width('100%');

	// Lo Convierto en un TT
	$tabla.tiraTable({childPrefix:'child-of-', clickableNodeNames:true, expandable:true, initialState:_va_estadoInicialTira, indent:7});

	// Drag & Drop sobre la tira
	// Imagenes y documentos draggables!
	//>>$('.imagenTira, .documentoTiraTR', $tabla).each(function (){
	$('.imagenTira, .documentoTira', $tabla).each(function (){
		tira_inicializaDraggable($tabla, this);
	});

	// documentos dropables de imagenes
	$('.documentoTira', $tabla).each(function() {
		tira_inicializaDropableDocumento($tabla, id_visor, this);
	});

	// Categorias dropables de documentos
	$('.categoriaTira', $tabla).each(function() {
		tira_inicializaDropableCategoria($tabla, id_visor, this);
	});

	// Paginas: puedes soltar una pagina dentro de otra y se pone a continuacion, 
	// si la pagina destino es de otro documento, se le cambia el documento (desde tira_PaginaDrop)
	$('.imagenTira', $tabla).each(function() {
		tira_inicializaDropablePagina($tabla, id_visor, this);
	});
	
	/** CLICK **/
	// guarda todos los TRs en $elms
	var $elms = $('.imagenTiraTR, .documentoTiraTR', $tabla);
	$elms.click(function (e){
		tira_ClickElemento(id_visor, this, e);
	});
	$tabla.appendTo('#'+id_visor+'_filmstrip');
}

/**	se ejecuta cuando haces click sobre un documento o sobre una pagina
	(el evento para desagrupar va por otro lado, y el expand/collapse de la tira tambi?n!! ) **/
function tira_ClickElemento(id_visor, thsTR, e){
	/* Evento de click en la tira **/
	// thsTR=el elemento tr de la tira que has clickado
	va_visores[id_visor].fieldSelected = false;
	var idPag = -1;
	var idDoc = -1;
	var clickoEnPagina=false;
	var clickoEnDocumento=false;
	var cargarDocumento = false;
	// Donde ha pinchado?
	if($('.imagenTira',thsTR).length>0){
		// pinchaste en una pagina:
		idPag = $('.imagenTira',thsTR).attr('rel');
		var par = $(thsTR).getTTParentNode();
		if(par){
			idDoc = $(par).attr('rel');
		}
		clickoEnPagina=true;
		clickoEnDocumento=false;
	}
	if($('.documentoTira',thsTR).length>0){
		// pinchaste en un documento:
		idDoc = $(thsTR).attr('rel');
		var pag = $(thsTR).tira_getFirstChild();
		if(pag && pag.length){
			idPag = $('.imagenTira',pag).attr('rel');
		}
		var docu = va_getDocumentoAgrupado(id_visor, idDoc);
		if(docu!=null && (va_getTipoFromUrl(docu.Uri) != 'zip' && va_getTipoFromUrl(docu.Path) != 'zip')){	// Solo cargo los documentos agrupados:, con grupos de imagenes paso
			cargarDocumento = true;
		}
		clickoEnPagina=false;
		clickoEnDocumento=true;
	}

	if(clickoEnPagina && idPag != -1){
		var x = function (){
			if(e.ctrlKey){
				av_SelectDocumentByID(id_visor, idPag, true);
			}else if(e.shiftKey){
				var primero=0;
				if(typeof va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado!='undefined' && va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado!=-1){
					primero=va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado;
				}
				var ultimo = va_getPosicionTrEnTira(id_visor, idPag);
				if(ultimo==-1)return;	// error!
				if(primero <= ultimo){
					// seleccionar hacia abajo
					for(var j=primero; j<=ultimo; j++){
						av_SelectDocumentByID(id_visor, $('#' + id_visor + '_treeTira tr.imagenTiraTR').eq(j).attr('rel'), true);
					}
				}else{
					// seleccionar hacia arriba
					for(var j=primero; j>=ultimo; j--){
						av_SelectDocumentByID(id_visor, $('#' + id_visor + '_treeTira tr.imagenTiraTR').eq(j).attr('rel'), true);
					}
				}
			}else{
				av_SelectDocumentByID(id_visor, idPag,false);
			}
			av_LoadDocumentByID(id_visor, idPag);
		};
		var cb = vaf_esperaLlamada(x);
		if(va_visores[id_visor].modoEdicion==true){
			ComponenteFlash(id_visor).EditMode(false, cb);
			return;
		}else{
			vaf_llamadaPendiente(cb);
		}
	}else if(clickoEnDocumento && cargarDocumento){
		var x = function (){
			av_SelectDocumentByID(id_visor, idDoc,false);
			av_LoadDocumentByID(id_visor, idDoc);
		};
		var cb = vaf_esperaLlamada(x);
		if(va_visores[id_visor].modoEdicion==true){
			ComponenteFlash(id_visor).EditMode(false, cb);
			return;
		}else{
			vaf_llamadaPendiente(cb);
		}
	}
}

function enableToolBarButton($button, enable){
	if(enable){
		$button.removeClass("buttonUnavailable").css('filter', '').attr('disabled', '');
	}else{
		$button.addClass("buttonUnavailable").css('filter', 'alpha(opacity = 40)').attr('disabled', 'disabled');
	}
}

/**	Funciones para manejar el DOM de la TIRA **/
/**	ahora ignora css y title, espero que sean los mismos que insertaste en va_categorias...
	@return id de la fila en el treetable, (para hacer '#'+id_visor+'_fila-'+idFila+')
	este id de fila ya se ha introducido en el objeto categorias[...].idFilaTT
	devuelve -1 si ocurre algun error */
function va_InsertarCategoria (id_visor, id_categoria, title, cssclass){
	var $tabla = $('#'+id_visor+'_treeTira');
	var cat = va_getCategoria(id_visor, id_categoria);
	var idFila = idsFilas(id_visor);
	tira_insertarCategoria($tabla, id_visor, idFila, cat);
	var elm = $('#'+id_visor+'_fila-'+idFila+' .categoriaTira',$tabla);
	if(elm.length>0){
		cat.idFilaTT = idFila;
		cat.insertadaEnTira = true;
		tira_inicializaDropableCategoria($tabla, id_visor, elm[0]);
		return idFila;
	}
	return -1;
}

function tira_insertarCategoria($tabla, id_visor, idFila, categoria){
	$tabla.append(
		'<tr id="'+id_visor+'_fila-'+idFila+'" rel="'+categoria.id+'" class="tira_expanded categoriaTiraTR'+
		((categoria.cssclass && categoria.cssclass!=null && 
		categoria.cssclass!='null' && categoria.cssclass.length>0) ? // si tiene definido cssclass
		(' ' + categoria.cssclass) : '') +	// lo inserta a continuacion class="" : si no nada
		'">'+	// y aqui cierra class
		'<td><span class="categoriaTira" title="' + categoria.title + '">' + categoria.title + '</span></td></tr>');
}

function tira_insertarDocumento($tabla, id_visor, idFila, idPadre, idDoc, titulo, buscarPadre){
	if(typeof titulo == 'undefined' || titulo == null || titulo == ''){
		titulo = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	}
	var html = '<tr id="'+id_visor+'_fila-'+idFila+'"'+
		' class="child-of-'+id_visor+'_fila-'+idPadre+' documentoTiraTR"'+
		'rel="'+idDoc+'"'+
		'align="left"><td><span class="documentoTira" rel="'+idDoc+'" title="'+titulo+'">' + 
		titulo + '</span></td></tr>';
	if(buscarPadre){
		var anterior = tira_buscarUltimoHijo($tabla, id_visor, idPadre);
		$(html).insertAfter(anterior);
	}else{
		$tabla.append(html);
	}
}

function tira_setModoSaturado($tabla, modo){
	if(modo){
		if(!$tabla.hasClass('tiraSaturada')){
			$tabla.addClass('tiraSaturada');
			$('.imagenTira img', $tabla).attr('src', _va_rutaIconoImagenPequena);
		}
	}else{
		if($tabla.hasClass('tiraSaturada')){
			$tabla.removeClass('tiraSaturada');
			$('.imagenTira img', $tabla).each(function (){
				$(this).attr('src', $(this).attr('rel'))
			});
		}
	}
}

function tira_insertarPaginaEnTira($tabla, id_visor, idFila, idPadre, objDocumento, buscarPadre){
	var urlIcono;
	var urlImagen = va_getUrlImagenDocumento(id_visor, objDocumento);
	try{
		var n_imagenes = parseInt($tabla.attr('rel'));
		if(isNaN(n_imagenes)){n_imagenes=0;}
		n_imagenes++;
		$tabla.attr('rel', n_imagenes);
		if(_va_NimagenesMaximoParaPasarATiraSaturada!= -1 
			&& n_imagenes>=_va_NimagenesMaximoParaPasarATiraSaturada){
			
			urlIcono = _va_rutaIconoImagenPequena;
			if(n_imagenes==_va_NimagenesMaximoParaPasarATiraSaturada){
				tira_setModoSaturado($tabla,true);
			}
		}else{
			if(!isValidVariable(urlImagen, 'string')){
				urlImagen = _va_rutaIconoImagenPequena;
			}
			urlIcono = urlImagen;
			//tira_setModoSaturado($tabla,false);
		}
	}catch(ex){}
	var Estado =null;
	if(va_visores[id_visor].modoValidacion == true){
		if(typeof objDocumento.Estado_v !='undefined' && objDocumento.Estado_v !=''){
			Estado = '<div id="'+id_visor+'_statusIcon_'+idFila+'" class="statusImage statusImage'+objDocumento.Estado_v+'">&nbsp;</div>'
		}else{
			Estado = '<div id="'+id_visor+'_statusIcon_'+idFila+'" class="statusImage">&nbsp;</div>'
		}
	}else{
		if(typeof objDocumento.Estado !='undefined' && objDocumento.Estado !=''){
			Estado = '<div id="'+id_visor+'_statusIcon_'+idFila+'" class="statusImage statusImage'+objDocumento.Estado+'">&nbsp;</div>'
		}else{
			Estado = '<div id="'+id_visor+'_statusIcon_'+idFila+'" class="statusImage">&nbsp;</div>'
		}
	}
	var claseHijo='';
	if(idPadre!=-1){	// poniendole esta clase haces que el treetable sepa que este nodo es hijo de otro
		claseHijo = 'child-of-'+id_visor+'_fila-'+idPadre;
	}
	var html = '<tr id="'+id_visor+'_fila-'+idFila+'"'+
		' class="imagenTiraTR '+claseHijo+'" rel="'+objDocumento.id+'">'+
		'<td><div style="position:relative;">' + 
		(Estado!=null?Estado:'') + 
		'<span class="imagenTira" rel="'+objDocumento.id+'">' +
		'<img src="'+urlIcono+'" rel="'+urlImagen+'"/>' + 
		//'<div style="border:2px solid blue;width:90px;height:90px;background:url(\''+urlIcono+'\');" rel="'+urlImagen+'"></div>' +
		'<label>' + objDocumento.Title + '</label></span></div></td></tr>';
	if(buscarPadre){
		var anterior = tira_buscarUltimoHijo($tabla, id_visor, idPadre);
		$(html).insertAfter(anterior);
	}else{
		// Esto es mas rapido, conviene para la inicializacion, simplemente hace append a la tabla, de la otra forma hay que busacr el padre donde insertar
		$tabla.append(html);
	}
}

/**	busca el ultimo hijo o nieto de un nodo,
	se le pasa como idPadre el id del nodo en el treetable y te 
	devuelve el objeto jquery que apunta al ultimo nodo que desciende de el
	si no desciende ninguno te devuelve el mismo nodo (para que luego hagas insertAfter y te quede debajo)
	si no encuentra el nodo idPadre devolvera un objeto jquery vacio */
function tira_buscarUltimoHijo($tabla, id_visor, idPadre){
	var claseHijos = 'child-of-'+id_visor+'_fila-'+idPadre;
	var ultimoHijo = $('.' + claseHijos, $tabla).last();
	if(ultimoHijo.length){
		var claseNietos = 'child-of-'+ ultimoHijo[0].id; //id_visor+'_fila-'+idPadre;
		var ultimoNieto = $('.' + claseNietos, $tabla).last();
		if(ultimoNieto.length){
			return ultimoNieto;
		}else{
			return ultimoHijo;
		}
	}
	return $('#'+id_visor+'_fila-'+idPadre, $tabla);
}

/**	Llamada desde av_InsertDocument para insertar el objeto doc que le pases en la tira 
	(REALMENTE ES UNA PAGINA LO QUE VAS A INSERTAR) */
insertarDocumentoEnTira = function (id_visor, doc){
	var $tabla = $('#'+id_visor+'_treeTira');
	var idFilaActual = idsFilas(id_visor);
	if(doc.idDoc){
		var trpadre = $('#'+id_visor+' tr.documentoTiraTR[rel="'+doc.idDoc+'"]');
		if(trpadre.length){
			var idPadre = trpadre[0].id.substr((""+id_visor+'_fila-').length);
			tira_insertarPaginaEnTira($tabla, id_visor, idFilaActual, idPadre, doc, true);
			doc.idFilaTT = idFilaActual;
			var $tr = $('#'+id_visor+'_fila-'+idFilaActual, $tabla);
			$tr.tira_inicializa();
			var elm = $('.imagenTira', $tr);
			if(elm.length!=1){
				depura('Error al insertar?! ' + idFilaActual + ' ' + doc.id);
			}else{
				tira_inicializaDraggable($tabla, elm[0]);
				tira_inicializaDropablePagina($tabla, id_visor, elm[0]);
				$tr.click(function (e){
					tira_ClickElemento(id_visor, this, e);
				});
			}
		}
	}else{
		// documento sin padre!
		depura('pagina sin padre, qu? hago con ella.... PENDIENTE');
	}
}

/**	INICIALIZACION DE DRAG & DROP **/
function tira_inicializaDraggable($tabla, elmDom){
	if(typeof _av_allowDragDrop!='undefined' && _av_allowDragDrop===false){
		if($(elmDom).hasClass('documentoTira')){
			$(elmDom).css('cursor','default');
		}
		return;
	}
	if(typeof _av_allowDragDropDocuments!='undefined' && _av_allowDragDropDocuments===false){
		if($(elmDom).hasClass('documentoTira')){
			$(elmDom).css('cursor','default');
			return;
		}
	}
	if(typeof _av_allowDragDropChangeCategory!='undefined' && _av_allowDragDropChangeCategory===false){
		if($(elmDom).hasClass('documentoTira')){
			$(elmDom).css('cursor','default');
			return;
		}
	}
	
	if(typeof $(elmDom).draggable != 'function'){
		depura('NO TIENES JQUERY DRAGGABLE INSTANCIADO');
		return;
	}
	$(elmDom).draggable({
		  helper: "clone",
		  distance: _va_distanciaStartDrag, 
		  /*helper: function (h,i,j){
		   		depura(h);
		   		depura(i);
		   		depura(j);
				var k = $('<div class="helperguaydecarlos" style="border:1px solid red; width:100px;height:100px" ></div>')[0];
				k.PreviousTarget = h.target;
				return k;
			},*/
		  opacity: .50,
		  axis: "y",
		  refreshPositions: true, // Performance?
		  revert: "invalid",
		  revertDuration: 300,
		  start:function(){
			$('.imagenTira img').each(function(){
				//$(this).wrap('<div class="imagenwrapper" style="width:'+$(this).width()+'px;height:'+($(this).height()+4)+'px;" />');
				$(this).wrap('<div class="imagenwrapper" height="' + ($(this).height()+4) + '" style="height:' + ($(this).height()+4) + 'px;"/>');
			});
		  },
		  stop:function(){
				$('.imagenTira img').each(function(){
					$(this).unwrap();
				});
				// Esto quita el bordecito azul que se pone cuando arrastras una imagen sobre otra para reordenarlas
				$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
				//$('.helperguaydecarlos').remove();
		  },
		  scroll: true
		});
	if (jQuery.browser.msie) {
		$tabla.get(0).onselectstart = function () { return false; };
	}else{
		$tabla.get(0).onmousedown = function(e){e.preventDefault();};
	}
}

function tira_inicializaDropableCategoria($tabla, id_visor2, elmDom){
	if(typeof $($(elmDom).parents("tr")[0]).droppable != 'function'){
		depura('NO TIENES JQUERY DROPPABLE INSTANCIADO');
		return;
	}
	var id_visor=id_visor2;
	if(!$tabla){
		$tabla = $('#'+id_visor+'_treeTira');
	}
	$($(elmDom).parents("tr")[0]).droppable({
		accept: ".documentoTira",	//>> .documentoTiraTR
		drop: function(e, ui) {
			$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
			var $trDondeHiceDrop = $(e.target);
			var idCategoriaDondeHiceDrop = $trDondeHiceDrop.attr('rel');
			var $trElementoQueArrastraba = ui.draggable.parents('tr').eq(0);
			var $trcategAnterior = $trElementoQueArrastraba.getTTParentNode();
			var idCategAnterior = $trcategAnterior.attr('rel');
			$trElementoQueArrastraba.tira_appendBranchTo(this);
			var idDocumentoQueArrastraba = $trElementoQueArrastraba.attr('rel');
			tira_DocumentoDrop(id_visor, idDocumentoQueArrastraba, idCategAnterior, idCategoriaDondeHiceDrop);
		},
		hoverClass: "accept",
		over: function(e, ui) {
			$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
		}
	});
}

// Documentos:	Pueden recibir imagenes
function tira_inicializaDropableDocumento($tabla, id_visor2, elmDom){
	if(typeof $($(elmDom).parents("tr")[0]).droppable != 'function'){
		depura('NO TIENES JQUERY DROPPABLE INSTANCIADO');
		return;
	}
	var id_visor=id_visor2;
	if(!$tabla){
		$tabla = $('#'+id_visor+'_treeTira');
	}
	$($(elmDom).parents("tr")[0]).droppable({
		accept: ".imagenTira",
		drop: function(e, ui) { // Esto se ejecuta cuando sueltas una pagina sobre un documento
			$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');	// stop reordenando
			$(this).tira_expand();

			// por si uso un helper
			if(e.target.PreviousTarget){
				e.target = e.target.PreviousTarget;
			}
			if(!$(e.target).is("tr")){
				e.target = $(e.target).parents('tr')[0];
			}
			var $trDondeHiceDrop = $(e.target);
			var $trElementoQueArrastraba = ui.draggable.parents('tr').eq(0);
			var idPaginaQueArrastro = $trElementoQueArrastraba.attr('rel');
			var idDocumentoDondeHiceDrop = $trDondeHiceDrop.attr('rel');
			var $trDocPadreElementoQueArrastraba = $trElementoQueArrastraba.getTTParentNode();
			var $paginasDelMismoDoc = $('.child-of-'+$trDocPadreElementoQueArrastraba.attr('id'));
			var $NuevasPaginasDelMismoDoc = $('.child-of-'+$trDondeHiceDrop.attr('id'));
			var posEnDocAntes = $paginasDelMismoDoc.index($trElementoQueArrastraba);
			var posEnDocDestino = 0;
			var idDocDest = $trDondeHiceDrop.attr('rel');
			var idDocOrig = $trDocPadreElementoQueArrastraba.attr('rel');
			if(idDocOrig == idDocDest){
				// Mismo padre que antes de moverle => lo ha puesto arriba del todo en su documento
				$trElementoQueArrastraba.insertAfter($trDondeHiceDrop);
				//tira_PaginaDrop(id_visor, idPaginaQueArrastro, idDocOrig, idDocOrig, posEnDocAntes, 0);
				tira_PaginaDrop(id_visor, idPaginaQueArrastro, idDocOrig, idDocDest, posEnDocAntes, posEnDocDestino);
			}else{
				// distinto padre, appendbranch
				$trElementoQueArrastraba.tira_appendBranchTo($trDondeHiceDrop[0]);
				tira_PaginaDrop(id_visor, idPaginaQueArrastro, idDocOrig, idDocDest, posEnDocAntes, posEnDocDestino);
			}
		},
		hoverClass: "accept",
		over: function(e, ui) { // Esto se ejecuta cuando pasas por encima de un documento arrastrando una pagina
			  $('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
	
			  // esto expande los nodos cerrados cuando pasas el raton arrastrando una imagen, no me gusta como queda
			  /*if(ui.draggable.parents("tr.parent")[0]){
				  if(this.id != ui.draggable.parents("tr.parent")[0].id && !$(this).is(".expanded")) {
					$(this).tira_expand();
				  }
			  }*/
			  /* ademas lo anterior que es lo que venia en el ejemplo, no funciona, esto si, pero hace un efecto muy feo en la tira nuestra
			  if($(e.target).hasClass('parent') && !$(e.target).hasClass('expanded')){
				$(e.target).expand();
			  }*/
		}
	});
}

function tira_inicializaDropablePagina($tabla, id_visor2, elmDom){
	if(typeof $($(elmDom).parents("tr")[0]).droppable != 'function'){
		depura('NO TIENES JQUERY DROPPABLE INSTANCIADO');
		return;
	}
	var id_visor=id_visor2;
	if(!$tabla){
		$tabla = $('#'+id_visor+'_treeTira');
	}
	$($(elmDom).parents("tr")[0]).droppable({
		accept: ".imagenTira",
		drop: function(e, ui) {
			$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
			// por si uso un helper
			if(e.target.PreviousTarget){
				e.target = e.target.PreviousTarget;
			}
			if(!$(e.target).is("tr")){
				e.target = $(e.target).parents('tr')[0];
			}
			var trDondeHiceDrop = e.target;
			var $trDocPadreDondeHiceDrop = $(trDondeHiceDrop).getTTParentNode();
			var $trElementoQueArrastraba = ui.draggable.parents('tr').eq(0);
			var idPaginaQueArrastro = $trElementoQueArrastraba.attr('rel');
			var idPaginaDondeHiceDrop = $(trDondeHiceDrop).attr('rel');
			if(idPaginaQueArrastro == idPaginaDondeHiceDrop){
				// si la sueltas sobre si misma ni evento ni leches, vuelve
				return;
			}
			var $trDocPadreElementoQueArrastraba = ui.draggable.parents('tr').eq(0).getTTParentNode();
			var $paginasDelMismoDoc = $('.child-of-'+$trDocPadreElementoQueArrastraba.attr('id'));
			var $NuevasPaginasDelMismoDoc = $('.child-of-'+$trDocPadreDondeHiceDrop.attr('id'));
			var posEnDocAntes = $paginasDelMismoDoc.index($trElementoQueArrastraba);
			var posEnDocDestino = $NuevasPaginasDelMismoDoc.index(trDondeHiceDrop) + 1;
			var idDocDest = $trDocPadreDondeHiceDrop.attr('rel');
			var idDocOrig = $trDocPadreElementoQueArrastraba.attr('rel');
			if(idDocOrig != idDocDest){
				// Movido de su padre!
				if($trDocPadreDondeHiceDrop.length>0){
					$trElementoQueArrastraba.tira_appendBranchTo($trDocPadreDondeHiceDrop[0]);
				}else{
					depura('Error al mover el documento de su padre');
				}
			}

			// mover a la posicion buena
			$trElementoQueArrastraba.insertAfter(trDondeHiceDrop);

			// busca la posicion de la pagina donde he soltado mi pagina, pero dentro del documento en la que esta
			$NuevasPaginasDelMismoDoc = $('.child-of-'+$trDocPadreDondeHiceDrop.attr('id'));	// recalculo el array de paginas con la nueva ya insertada
			var posEnDocFinal = $NuevasPaginasDelMismoDoc.index($trElementoQueArrastraba);
			tira_PaginaDrop(id_visor, idPaginaQueArrastro, idDocOrig, idDocDest,posEnDocAntes, posEnDocFinal);
		},
		hoverClass: "accept",
		over: function(e, ui) {
			$('.insertarDespuesDeEste',$tabla).removeClass('insertarDespuesDeEste');
			$('.accept',$tabla).eq(0).addClass('insertarDespuesDeEste');
			//$(e.target).parents('tr').eq(0);
		}
	});
}

/**	Inicializa los elementos de la tira que no est?n, por ejemplo despu?s de una desagrupacion */
function tira_inicializaDragyClickDesagrupacion(id_visor2){
	var id_visor=id_visor2;
	var $tabla = $('#'+id_visor+'_treeTira');
	var $elms = $('#'+id_visor+'_treeTira tr').not('.initialized');
	$elms.each(function(){
		$(this).tira_inicializa();
		var objImagen = $('.imagenTira',this)[0];
		tira_inicializaDraggable($tabla, objImagen);
		if(objImagen){
			tira_inicializaDropablePagina($tabla, id_visor, objImagen);
		}else{
			depura('Problema inicializando la imagen de la tira:'+this.id);
		}
		$(this).click(function (e){
			tira_ClickElemento(id_visor, this, e);
		});
	});
}

/** EVENTOS REORDENACION TIRA **/
function tira_PaginaDrop(id_visor, idPagina, idDocumentoOrig, idDocumentoDest, posEnDocAntes, posEnDocFinal){

	av_changePageState(id_visor, idPagina, 'EDITED');
	for (pag in va_documentos[id_visor]){
		if(va_documentos[id_visor][pag].id==idPagina){
			if(va_documentos[id_visor][pag].idDoc!=idDocumentoOrig){
				depura('La pagina '+idPagina+' no pertenecia al documento '+idDocumentoOrig+' raro... ');
			}
			va_documentos[id_visor][pag].idDoc=idDocumentoDest;
			va_documentos[id_visor][pag].order=posEnDocFinal;
			break;
		}
	}

	// Categorias de los documentos y paginas
	var categoriaOrigen, categoriaDestino;
	for(var i=0;i<va_job[id_visor].length;i++){
		if(va_job[id_visor][i].id == idDocumentoOrig){
			categoriaOrigen=va_job[id_visor][i].typeId;
		}else if(va_job[id_visor][i].id == idDocumentoDest){
			categoriaDestino = va_job[id_visor][i].typeId;
			va_documentos[id_visor][pag].Categoria = categoriaDestino;
		}
		if(typeof categoriaOrigen!='undefined' && typeof categoriaDestino!='undefined'){
			break;
		}
	}

	// Recolocacion de ordenes de paginas:
	for (pag in va_documentos[id_visor]){
		var ordenPaginaRecienCambiada = -1;
		if(va_documentos[id_visor][pag].idDoc == idDocumentoOrig	&&	
		  va_documentos[id_visor][pag].id!=idPagina){
			if(va_documentos[id_visor][pag].order > posEnDocAntes){
				va_documentos[id_visor][pag].order--;
				ordenPaginaRecienCambiada=pag;
			}
		}
		if(va_documentos[id_visor][pag].idDoc == idDocumentoDest	&&		
		  va_documentos[id_visor][pag].id!=idPagina){
			if(va_documentos[id_visor][pag].order >= posEnDocFinal){
				va_documentos[id_visor][pag].order++;
			}
		}
	}

	// Recolocacion en el array va_job[doc].pages
	var pagQuitada = null;
	for (var i=0;i<va_job[id_visor].length;i++){
		if(va_job[id_visor][i].id == idDocumentoOrig){
			pagQuitada = va_job[id_visor][i].pages.splice(posEnDocAntes,1);
		}
	}
	if(pagQuitada!=null && pagQuitada.length>0){
		for (var i=0;i<va_job[id_visor].length;i++){
			if(va_job[id_visor][i].id == idDocumentoDest){
				va_job[id_visor][i].pages.splice(posEnDocFinal,0,pagQuitada[0]);
			}
		}
	}
	// recolocacion array va_documentos
	var nuevoVaDocs =[];
	$('.imagenTira', $('#' + id_visor + '_filmstrip'))	// coge todas las imagenes que hay en la tira:
	.not('.ui-draggable-dragging')	// Excepto la q se esta arrastrando
	.each(function (){
		// recorro las imagenes en la tira:
		var d = va_getDocumento(id_visor, $(this).attr('rel'));
		if(d!=null){
			nuevoVaDocs[nuevoVaDocs.length] = d;
		}
	});
	va_documentos[id_visor]=nuevoVaDocs;
	
	ComponenteFlashVW(id_visor).recargarJSON();
	if(idDocumentoOrig == idDocumentoDest){
		tira_eventoPaginaCambiaOrden(id_visor, idPagina, idDocumentoOrig, posEnDocAntes, posEnDocFinal, categoriaOrigen);
		va_jobchanges_movePage(id_visor, idPagina, idDocumentoOrig, idDocumentoDest,  posEnDocAntes, posEnDocFinal, categoriaOrigen, categoriaDestino);
	}else{
		tira_eventoPaginaCambiaDeDocumento(id_visor, idPagina, idDocumentoOrig, idDocumentoDest, categoriaOrigen, categoriaDestino, posEnDocAntes, posEnDocFinal);
		va_jobchanges_movePage(id_visor, idPagina, idDocumentoOrig, idDocumentoDest,  posEnDocAntes, posEnDocFinal, categoriaOrigen, categoriaDestino);
	}
}

function tira_DocumentoDrop(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria){
	for (var i=0;i<va_documentos[id_visor].length;i++){
		if(va_documentos[id_visor][i].idDoc == idDoc){
			// va_documentos[id_visor][i].Categoria == idAntiguaCategoria ??? !!! merece la pena comprobarlo?....
			va_documentos[id_visor][i].Categoria = idNuevaCategoria;
			av_changePageState(id_visor, va_documentos[id_visor][i].id, 'EDITED');
		}
	}
	if(va_job && va_job[id_visor]){
		for (var j=0;j<va_job[id_visor].length;j++){
			if(va_job[id_visor][j] && va_job[id_visor][j].id == idDoc){
				// va_job[id_visor][i].typeId == idAntiguaCategoria ??? !!! merece la pena comprobarlo?....
				va_job[id_visor][j].typeId = idNuevaCategoria;
				va_job[id_visor][j].Categoria = idNuevaCategoria;
				if(typeof va_job[id_visor][j].DocumentoOriginal !='undefined' && va_job[id_visor][j].DocumentoOriginal!=null){
					va_job[id_visor][j].DocumentoOriginal.Categoria = idNuevaCategoria;
				}
				var cat = va_getCategoria(id_visor, idNuevaCategoria, false);
				if(cat.title){
					va_job[id_visor][j].typeName = cat.title;
				}
			}
		}
	}
	// recolocacion array va_documentos
	var nuevoVaDocs =[];
	$('.imagenTira', $('#' + id_visor + '_filmstrip'))	// coge todas las imagenes que hay en la tira:
	.not('.ui-draggable-dragging')	// Excepto la q se esta arrastrando
	.each(function (){
		// recorro las imagenes en la tira:
		var d = va_getDocumento(id_visor, $(this).attr('rel'));
		if(d!=null){
			nuevoVaDocs[nuevoVaDocs.length] = d;
		}
	});
	va_documentos[id_visor]=nuevoVaDocs;
	
	ComponenteFlashVW(id_visor).recargarJSON();
	
	va_jobchanges_moveDocument(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria);
	va_jobchanges_logs_cambiaCategoria(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria);
	tira_eventoDocumentoCambiaDeCategoria(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria);
}

/** EVENTOS **/
function tira_eventoPaginaCambiaOrden(id_visor, idPagina, idDocumento, posEnDocAntes, posEnDocFinal, categoriaEnLaQueEsta){
	va_lanzarEvento(id_visor, 'onPageMove', idPagina, idDocumento, idDocumento, categoriaEnLaQueEsta, categoriaEnLaQueEsta, posEnDocAntes, posEnDocFinal);
}
function tira_eventoPaginaCambiaDeDocumento(id_visor, idPagina, origIdDoc, destIdDoc, idcategoriaAntigua, idcategoriaNueva,  posEnDocAntes, posEnDocFinal){
	va_lanzarEvento(id_visor, 'onPageMove', idPagina, origIdDoc, destIdDoc, idcategoriaAntigua, idcategoriaNueva,  posEnDocAntes, posEnDocFinal);

}
function tira_eventoDocumentoCambiaDeCategoria(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria){
	va_lanzarEvento(id_visor, 'onClassifiedDocument', idDoc, idAntiguaCategoria, idNuevaCategoria);
}

/**	Comprobador Url-Path documento para meter en la tira **/
function va_getUrlImagenDocumento(id_visor, documento){
	var Url = documento.Uri;
	if(Url == '' || typeof Url=='undefined' || Url == null){
		Url = va_visores[id_visor].rutaServletWAS + '?na=' + documento.Path;
	}
	var tipo = va_getTipoFromUrl(Url, documento.tipo);
	if(tipo==''){tipo='img';}
	var urlIcono = va_iconoFromTipo(tipo);
	if(urlIcono=='')urlIcono=Url;
	return urlIcono;
}

/**
	Retoque del funcionamiento de la tira
	Limpiar tira elimina de la tira de imagenes los documentos vacios
	
	quitarDocsAutogeneradosVacios : Elimina los documentos "Nuevo" que se autogeneran al clasificar (por defecto a true)
	quitarTodosLosDocsVacios : Elimina todos los documentos que no tienen página (autogenerados y no autogenerados) (por defecto a false) (si lo pones a true, ignora el argumento anterior
	quitarCategoriasVacias : Elimina las categorias que no tienen ningún documento dentro (por defecto a true)
	quitarCategoriaSinClasificar : Elimina tambien la categoria "Sin clasificar" si está vacía (por defecto a false)
**/
//function av_cleanFilmStrip(id_visor, quitarDocsAutogeneradosVacios, quitarTodosLosDocsVacios, quitarCategoriasVacias, quitarCategoriaSinClasificar){
function av_cleanFilmStrip(id_visor, quitarCategoriasVacias){
	/* if(typeof quitarDocsAutogeneradosVacios == 'undefined'){quitarDocsAutogeneradosVacios=true;}
	if(typeof quitarTodosLosDocsVacios == 'undefined'){quitarTodosLosDocsVacios=false;}*/
	if(typeof quitarCategoriasVacias == 'undefined'){quitarCategoriasVacias=true;}
	/*if(typeof quitarCategoriaSinClasificar == 'undefined'){quitarCategoriaSinClasificar=false;} */
	//if(quitarTodosLosDocsVacios || quitarDocsAutogeneradosVacios){
		for(var i=0; i<va_job[id_visor].length; i++){
			if(!va_job[id_visor][i].pages || va_job[id_visor][i].pages.length==0){
				//if(quitarTodosLosDocsVacios || va_job[id_visor][i].DOCUMENTO_AUTOGENERADO){
				if(va_job[id_visor][i].DOCUMENTO_AUTOGENERADO){
					delete va_jobchanges['visor1'][va_job[id_visor][i].id];
					$('.documentoTiraTR[rel="'+ va_job[id_visor][i].id +'"]').remove();
					va_job[id_visor].splice(i,1);
					i--;
				}
			}
		}
	//}

	if(quitarCategoriasVacias){
		// Almaceno las categorias que se estan usando
		var categoriasUsadas = {};
		for(var i=0; i<va_documentos[id_visor].length; i++){
			categoriasUsadas[va_documentos[id_visor][i].Categoria] = true;
		}
		// Recorro las categorias que hay en la tira
		$('#' + id_visor + ' TR.categoriaTiraTR').each(function (){
			// a ver si se están usando
			var idCat = $(this).attr('rel');
			//if(quitarCategoriaSinClasificar || (idCat!='-1' && idCat!='' && idCat!='false')){
			if(idCat!='-1' && idCat!='' && idCat!='false'){
				if(!categoriasUsadas[idCat]){
					// NO => la borro
					av_removeCategoryById(id_visor, idCat);
				}
			}
		});
	}
}

function av_removeCategoryById(id_visor, id_categoria){
	for(var i =0;i<va_categorias[id_visor].length;i++){
		if(va_categorias[id_visor][i].id == id_categoria){
			va_categorias[id_visor].splice(i,1);
			i--;
			$('#' + id_visor + ' TR.categoriaTiraTR[rel="'+id_categoria+'"]').remove();
		}
	}
}

function va_pageStateInFilmStrip(id_visor, id_pagina, activar){
	var idDoc = '';
	for(var i=0; i<va_documentos[id_visor].length; i++){
		if(va_documentos[id_visor][i].id == id_pagina){
			va_documentos[id_visor][i].enabled = activar;
			idDoc = va_documentos[id_visor][i].idDoc;
			break;
		}
	}
	if(!activar){
		$('.imagenTira[rel="' + id_pagina + '"]').draggable('disable');
		$('.documentoTira[rel="' + idDoc + '"]').draggable('disable');
	}else{
		$('.imagenTira[rel="' + id_pagina + '"]').draggable('enable');
		$('.documentoTira[rel="' + idDoc + '"]').draggable('enable');
		for(var i=0; i<va_job[id_visor].length; i++){
			if(va_job[id_visor][i].id == idDoc){
				for(var j=0; j<va_job[id_visor][i].pages.length; j++){
					if(va_job[id_visor][i].pages[j].enabled == false){
						$('.documentoTira[rel="' + idDoc + '"]').draggable('disable');
						break;
					}
				}
				break;
			}
		}
	}
}

function va_enablePage(id_visor, id_pagina, activar){
	va_pageStateInFilmStrip(id_visor, id_pagina, activar);
}

/*FIN VentanaValidacion_tiraTreetable.js*/ 
/*INICIO VentanaValidacion_desagrupacion.js*/ 
/**	VentanaValidacion_desagrupacion.js
	BOTON DE AGRUPADO **/
function va_clickBotonAgrupado(id_visor, idDocumento, elm){
	if(!idDocumento){
		idDocumento=va_documentos[id_visor][0].id;
	}
	if(idDocumento==-1){ //<< se coge el idDocumento del elemento del dom
		idDocumento=$(elm).attr('rel');
	}
	if(va_getDocumento(id_visor, idDocumento+'_1')!=null){
		va_visores[id_visor].mostradoAgrupado=$('#'+id_visor+' tr[rel="'+idDocumento+'"]').hasClass('tira_expanded');
	}else{
		av_desagruparPdf(id_visor, idDocumento);
		va_visores[id_visor].estadoAgrupado=false;
		va_visores[id_visor].mostradoAgrupado=$('#'+id_visor+' tr[rel="'+idDocumento+'"]').hasClass('tira_expanded');
	}
}

/**	BOTON DE COMPRIMIDO **/
function va_clickBotonComprimido(id_visor, idDocumento, elm){
	if(!idDocumento){
		idDocumento=va_documentos[id_visor][0].id;
	}
	if(idDocumento==-1){ //<< se coge el idDocumento del elemento del dom
		idDocumento=$(elm).attr('rel');
	}
	if(va_getDocumento(id_visor, idDocumento+'_1')!=null){
		va_visores[id_visor].mostradoAgrupado=$('#'+id_visor+' tr[rel="'+idDocumento+'"]').hasClass('tira_expanded');
	}else{
		av_descomprimirZip(id_visor, idDocumento);
		va_visores[id_visor].estadoAgrupado=false;
		va_visores[id_visor].mostradoAgrupado=$('#'+id_visor+' tr[rel="'+idDocumento+'"]').hasClass('tira_expanded');
	}
}

/**	ELIMINA TODAS LAS PAGINAS DE va_documentos que tengan por idDoc el documento pdf, y vuelve a llamar a desagrupar
	Lo que habria que hacer es eliminar todas imagenes que hayan salido del pdf original y reintentar **/
function va_reintentarDesagrupado(id_visor, iddoc){
	// eliminar los documentos que hayan salido del que acabo de desagrupar:
	if(va_documentos && va_documentos[id_visor] && va_documentos[id_visor].length){
		for(var i=1;i<va_documentos[id_visor].length; i++){
			//if(va_documentos[id_visor][i].id.substr(0,va_documentos[id_visor][0].id.length) == va_documentos[id_visor][0].id){
			if(va_documentos[id_visor][i].idDoc == iddoc){
				av_removeDocumentById(id_visor, va_documentos[id_visor][i].id, true);
			}
		}
	}
	av_desagruparPdf(id_visor, iddoc);
}

/**	ELIMINA TODAS LAS PAGINAS DE va_documentos que tengan por idDoc el documento zip, y vuelve a llamar a descomprimir
	Lo que habria que hacer es eliminar todas imagenes que hayan salido del zip original y reintentar **/
function va_reintentarDescompresion(id_visor, iddoc){
	// eliminar los documentos que hayan salido del que acabo de descomprimir:
	if(va_documentos && va_documentos[id_visor] && va_documentos[id_visor].length){
		for(var i=1;i<va_documentos[id_visor].length; i++){
			//if(va_documentos[id_visor][i].id.substr(0,va_documentos[id_visor][0].id.length) == va_documentos[id_visor][0].id){
			if(va_documentos[id_visor][i].idDoc == iddoc){
				av_removeDocumentById(id_visor, va_documentos[id_visor][i].id, true);
			}
		}
	}
	av_descomprimirZip(id_visor, iddoc);
}

/**	SERVICIO DE DESAGRUPADO
	DEPENDE DEL SERVLET **/
function av_desagruparPdf(id_visor, docid){
	depura('av_desagruparPdf("'+id_visor+'", "'+docid+'")');
	var doc = va_getDocumento(id_visor, docid);
	if(!doc){
		// Si todo ha ido bien en la inicializacion, los PDFs están en va_job, y no en va_documentos, pasará por aquí siempre.
		for(var ii=0;ii<va_job[id_visor].length;ii++){
			if(va_job[id_visor][ii].id == docid){
				doc = va_job[id_visor][ii];
				break;
			}
		}
	}
	if(va_visores[id_visor].desagrupacion != null && typeof va_visores[id_visor].desagrupacion.terminada !='undefined' && va_visores[id_visor].desagrupacion.terminada ===false){
		depura('\tPor ahora solo una desagrupacion al tiempo!:' + id_visor + ':' + docid);
		return;
	}
	if(typeof doc.Path == 'undefined' || doc.Path == ''){
		doc.Path = doc.Uri;
	}
	if(typeof doc.SourceLocation == 'undefined' || doc.SourceLocation == '' || doc.SourceLocation == 'r' || doc.SourceLocation == 'R'){
		doc.SourceLocation = 'remoto';
	}else if (typeof doc.SourceLocation == 'l' || doc.SourceLocation == 'L'){
		doc.SourceLocation = 'local';
		depura('\tPor ahora no se puede desagrupar en local!');
		return false;
	}
	var $spancargando = $('#'+id_visor+'_spancargando');
	var mensajeCargando = va_literalesVisor.cargando + '<span class="ImageViewerWaitingGif"/>'
	if($spancargando.length > 0){
		$spancargando.html(mensajeCargando);
	}else{
		$spancargando =$('<span id="'+id_visor+'_spancargando" class="spandesagrupando">'+mensajeCargando+'</span>');
		$('#'+id_visor+'_filmstrip').prepend($spancargando);
	}
	var numPaginas = va_desagruparGetNumPaginas(id_visor, doc);
	if (numPaginas < 1){
		$spancargando.html(va_literalesVisor.imposibleContactarServlet).attr('title', va_literalesVisor.imposibleContactarServlet);
	}else{
		var timestamp = _va_calculateTimestamp();
		va_desagruparCallDesagrupar(id_visor, doc.Path, function (datos, textStatus, jqXHR){
			// Esto esperará a ejecutarse hasta qe haya terminado el servlet de desagrupar
			va_visores[id_visor].desagrupacion.heAcabadoDeDesagrupar=true;
			va_visores[id_visor].desagrupacion.resultado=datos;
			if(datos.substr(0,4)!='OKOK')
				va_visores[id_visor].desagrupacion.error=true;
			depura('\tDesagrupacion terminada en el servlet: '+datos);
		},
		function (jqXHR, textStatus, errorThrown){
			va_visores[id_visor].desagrupacion.heAcabadoDeDesagrupar=true;
			va_visores[id_visor].desagrupacion.error=true;
			va_visores[id_visor].desagrupacion.resultado=textStatus + ':' + errorThrown;
			depura('\tError en desagrupacion: '+textStatus + ':' + errorThrown + ':' + jqXHR.responseText);
		},
		timestamp);

		/* INICIADA DESAGRUPACION
		 Guardo informacion sobre la desagrupacion y
		 Establezco el interval para ir actualizando la tira segun vayan saliendo im?genes del servlet
		 Calculo el nombre del archivo pdf */
		var nombreArchivo = doc.Path;
		if (typeof doc.Path=='undefined'){
			nombreArchivo = doc.Uri;
		}
		if(nombreArchivo.lastIndexOf(va_visores[id_visor].separadorRutasWAS) != -1){
			nombreArchivo = nombreArchivo.substr(nombreArchivo.lastIndexOf(va_visores[id_visor].separadorRutasWAS)+1);
		}
		va_visores[id_visor].desagrupacion = {
			iniciada: new Date(),
			lastreceived: new Date(),
			terminada:false,
			heAcabadoDeDesagrupar:false,
			error:false,
			resultado:'',
			docid : doc.id,
			catid : av_GetCategoryOfDocument(id_visor, doc),
			ruta_salida : va_visores[id_visor].rutaTemporalWAS + nombreArchivo + '_' + timestamp + va_visores[id_visor].separadorRutasWAS, // _va_rutaTemporal + doc.id + '_' + timestamp + '/',
			numPaginas : numPaginas,
			intervalLoader : null,
			imagenesCargadas: [],
			intentosFallidos:0,
			propiedadesArchivoPdf: doc.Properties
		};

		// Esta funcion se ejecutar? cada cierto tiempo mientras se carga el contenido de la tira
		var funcionRecargadoraTira = function (){
			if(!va_visores[id_visor].desagrupacion){
				return;
			}

			//Funcion que va intentando cargar cada im?gen
			var docsCargando = 0;
			var todasCargadas=false;
			for(var i=0;i<va_visores[id_visor].desagrupacion.numPaginas;i++){
				todasCargadas=true;
				if(va_getDocumento(id_visor, va_visores[id_visor].desagrupacion.docid + '_' + (i+1)) == null){
					// Este documento no ha sido cargado todavia
					todasCargadas=false;

					// comprueba si existe la imagen
					va_desagruparComprobarExistencia(id_visor, 
					va_visores[id_visor].desagrupacion.ruta_salida + nombreArchivo + '_' + i + '.jpg',
					function(datos){ // y si existe la inserta:
						if (datos=='YES'){
							// El archivo JPG (la p?gina) ya existe, y est? lista para ser descargada
							var rutaImagen = va_visores[id_visor].desagrupacion.ruta_salida + nombreArchivo + '_' + i + '.jpg';
							var rutaThumb = va_visores[id_visor].desagrupacion.ruta_salida + nombreArchivo + '_' + i + 't.jpg';
							var urlImagen = va_visores[id_visor].rutaServletWAS + '?na=' + escape(rutaImagen) + va_visores[id_visor].parametrosExtraServletWAS;
							var propiedadesArchivo;
							if(typeof va_visores[id_visor].desagrupacion.propiedadesArchivoPdf =='object' && va_visores[id_visor].desagrupacion.propiedadesArchivoPdf !=null){
								if(typeof jQuery != 'undefined' && typeof jQuery.extend == 'function'){
									// clonacion a jquery
									propiedadesArchivo = jQuery.extend(true, {}, va_visores[id_visor].desagrupacion.propiedadesArchivoPdf);
								}else{
									// clonacion a pelo
									propiedadesArchivo={};
									for(propi in va_visores[id_visor].desagrupacion.propiedadesArchivoPdf)
										propiedadesArchivo[propi] = va_visores[id_visor].desagrupacion.propiedadesArchivoPdf[propi];
								}
								if(typeof propiedadesArchivo!='undefined'){
									propiedadesArchivo['Pagina'] = (i+1);
								}
							}
							av_InsertDocument(id_visor,
								va_visores[id_visor].desagrupacion.docid + '_' + (i+1),
								va_literalesValidacion.pagina+(i+1),
								urlImagen,
								rutaImagen,
								'remoto',
								'',
								va_visores[id_visor].desagrupacion.catid,
								null, 'img', propiedadesArchivo,
								va_visores[id_visor].desagrupacion.docid);
							
							if(i==0){
								av_SelectDocumentByID(id_visor, va_visores[id_visor].desagrupacion.docid + '_' + (i+1));
								av_LoadDocumentByID(id_visor, va_visores[id_visor].desagrupacion.docid + '_' + (i+1));
							}
							va_visores[id_visor].desagrupacion.imagenesCargadas[va_visores[id_visor].desagrupacion.imagenesCargadas.length] = {'id': va_visores[id_visor].desagrupacion.docid + '_' + (i+1), 'url' : urlImagen, 'ruta' : rutaImagen};
							va_visores[id_visor].desagrupacion.lastreceived = (new Date());
						}
					});
					docsCargando++;
					if(va_visores[id_visor].desagrupacion.heAcabadoDeDesagrupar){
						if (docsCargando==5){
							break;	// intento cargar de 5 en 5 xq ya s? seguro que las imagenes est?n desagrupadas
						}
					}else{
						if(docsCargando==2){
							break;	// intento cargar de 3 en 3...
						}
					}
				}
			}
			if(todasCargadas==true){
				// Terminar el interval de carga
				va_visores[id_visor].desagrupacion.terminada=true;
				if(_va_AlDesagruparEliminarOriginales){
					var doc = va_getGrupoDocumentos('visor1', docid);
					if(doc!=null && typeof doc.DocumentoOriginal=='object'){
						doc.DocumentoOriginal=null;
					}
				}
				if(typeof va_lanzarEvento=='function'){
					va_lanzarEvento(id_visor, 'onUngroup');
				}
			}
			

			// timeout
			if(va_visores[id_visor].desagrupacion.terminada==false && ((new Date()).getTime() > (va_visores[id_visor].desagrupacion.lastreceived.getTime() + (_va_TimeOutDesagrupando * 1000)))){
				va_visores[id_visor].desagrupacion.error=true;
				va_visores[id_visor].desagrupacion.resultado=va_literalesVisor.tiempoEsperaAgotado;

				// Terminar el interval de carga
				va_visores[id_visor].desagrupacion.terminada=true;
				depura('\tDesagrupacion: ' + va_visores[id_visor].desagrupacion.resultado);
			}
			if(va_visores[id_visor].desagrupacion.terminada==true){
				clearInterval(va_visores[id_visor].desagrupacion.intervalLoader);
				if(va_visores[id_visor].desagrupacion.resultado.substr(0,4)!='OKOK'){
					va_visores[id_visor].desagrupacion.error=true;
				}
				if(va_visores[id_visor].desagrupacion.error==true){
					$spancargando.html(va_literalesVisor.errorPulse + ' <a href="javascript:void(0);" onclick="va_reintentarDesagrupado(\''+id_visor+'\',\''+va_visores[id_visor].desagrupacion.docid+'\');">' + va_literalesVisor.aqui + '</a> ' + va_literalesVisor.paraReintentar).attr('title', va_visores[id_visor].desagrupacion.resultado);
				}else{
					$spancargando.remove();
				}
				depura('\tDesagrupacion FINAL: ' + va_visores[id_visor].desagrupacion.resultado);
				va_visores[id_visor].desagrupacion=null;
				tira_inicializaDragyClickDesagrupacion(id_visor);
			}
		};
		va_visores[id_visor].desagrupacion.intervalLoader = setInterval(funcionRecargadoraTira,_va_PollingInterval);
	}
}

function av_descomprimirZip(id_visor, docid){
	depura('av_descomprimirZip("'+id_visor+'", "'+docid+'")');
	var doc = va_getDocumento(id_visor, docid);
	if(!doc){
		// Si todo ha ido bien en la inicializacion, los ZIPs están en va_job, y no en va_documentos, pasará por aquí siempre.
		for(var ii=0;ii<va_job[id_visor].length;ii++){
			if(va_job[id_visor][ii].id == docid){
				doc = va_job[id_visor][ii];
				break;
			}
		}
	}
	if(va_visores[id_visor].descompresion != null && typeof va_visores[id_visor].descompresion.terminada !='undefined' && va_visores[id_visor].descompresion.terminada ===false){
		depura('\tPor ahora solo una descompresion al tiempo!:' + id_visor + ':' + docid);
		return;
	}
	if(typeof doc.Path == 'undefined' || doc.Path == ''){
		doc.Path = doc.Uri;
	}
	if(typeof doc.SourceLocation == 'undefined' || doc.SourceLocation == '' || doc.SourceLocation == 'r' || doc.SourceLocation == 'R'){
		doc.SourceLocation = 'remoto';
	}else if (typeof doc.SourceLocation == 'l' || doc.SourceLocation == 'L'){
		doc.SourceLocation = 'local';
		depura('\tPor ahora no se puede descomprimir en local!');
		return false;
	}
	var $spancargando = $('#'+id_visor+'_spancargando');
	var mensajeCargando = va_literalesVisor.cargando + '<span class="ImageViewerWaitingGif"/>'
	if($spancargando.length > 0){
		$spancargando.html(mensajeCargando);
	}else{
		$spancargando =$('<span id="'+id_visor+'_spancargando" class="spandesagrupando">'+mensajeCargando+'</span>');
		$('#'+id_visor+'_filmstrip').prepend($spancargando);
	}
	var nombresImagenes = va_descomprimirGetNombresImagenes(id_visor, doc);
	if (nombresImagenes == null || nombresImagenes.length == 0){
		$spancargando.html(va_literalesVisor.imposibleContactarServlet).attr('title', va_literalesVisor.imposibleContactarServlet);
	}else{
		var timestamp = _va_calculateTimestamp();
		va_descomprimirCallDescomprimir(id_visor, doc.Path, function (datos, textStatus, jqXHR){
			// Esto esperará a ejecutarse hasta qe haya terminado el servlet de descompresion
			va_visores[id_visor].descompresion.heAcabadoDeDescomprimir=true;
			va_visores[id_visor].descompresion.resultado=datos;
			if(datos.substr(0,4)!='OKOK')
				va_visores[id_visor].descompresion.error=true;
			depura('\tDescompresion terminada en el servlet: '+datos);
		},
		function (jqXHR, textStatus, errorThrown){
			va_visores[id_visor].descompresion.heAcabadoDeDescomprimir=true;
			va_visores[id_visor].descompresion.error=true;
			va_visores[id_visor].descompresion.resultado=textStatus + ':' + errorThrown;
			depura('\tError en descompresion: '+textStatus + ':' + errorThrown + ':' + jqXHR.responseText);
		},
		timestamp);

		/* INICIADA DESCOMPRESION
		 Guardo informacion sobre la descompresion y
		 Establezco el interval para ir actualizando la tira segun vayan saliendo im?genes del servlet
		 Calculo el nombre del archivo zip */
		var nombreArchivo = doc.Path;
		if (typeof doc.Path=='undefined'){
			nombreArchivo = doc.Uri;
		}
		if(nombreArchivo.lastIndexOf(va_visores[id_visor].separadorRutasWAS) != -1){
			nombreArchivo = nombreArchivo.substr(nombreArchivo.lastIndexOf(va_visores[id_visor].separadorRutasWAS)+1);
		}
		va_visores[id_visor].descompresion = {
			iniciada: new Date(),
			lastreceived: new Date(),
			terminada:false,
			heAcabadoDeDescomprimir:false,
			error:false,
			resultado:'',
			docid : doc.id,
			catid : av_GetCategoryOfDocument(id_visor, doc),
			ruta_salida : va_visores[id_visor].rutaTemporalWAS + nombreArchivo + '_' + timestamp + va_visores[id_visor].separadorRutasWAS, // _va_rutaTemporal + doc.id + '_' + timestamp + '/',
			nombresImagenes : nombresImagenes,
			intervalLoader : null,
			imagenesCargadas: [],
			intentosFallidos:0,
			propiedadesArchivoZip: doc.Properties
		};

		// Esta funcion se ejecutar? cada cierto tiempo mientras se carga el contenido de la tira
		var funcionRecargadoraTira = function (){
			if(!va_visores[id_visor].descompresion){
				return;
			}

			//Funcion que va intentando cargar cada imágen
			var docsCargando = 0;
			var todasCargadas=false;
			var nombresImagenesLength = nombresImagenes.length;
			for(var i=0;i<nombresImagenesLength;i++){
				todasCargadas=true;
				if(va_getDocumento(id_visor, va_visores[id_visor].descompresion.docid + '_' + (i+1)) == null){
					// Este documento no ha sido cargado todavia
					todasCargadas=false;

					// comprueba si existe la imagen
					va_desagruparComprobarExistencia(id_visor, // esta es la funcion de desagrupar, pero se puede reutilizar para descomprimir sin problemas
					va_visores[id_visor].descompresion.ruta_salida + nombresImagenes[i],
					function(datos){ // y si existe la inserta:
						if (datos=='YES'){
							// El archivo (la pagina) ya existe, y esta lista para ser descargada
							var rutaImagen = va_visores[id_visor].descompresion.ruta_salida + nombresImagenes[i];
							var rutaThumb = va_visores[id_visor].descompresion.ruta_salida + 'thumb_' + nombresImagenes[i];
							var urlImagen = va_visores[id_visor].rutaServletWAS + '?na=' + escape(rutaImagen) + va_visores[id_visor].parametrosExtraServletWAS;
							var propiedadesArchivo;
							if(typeof va_visores[id_visor].descompresion.propiedadesArchivoZip =='object' && va_visores[id_visor].descompresion.propiedadesArchivoZip !=null){
								if(typeof jQuery != 'undefined' && typeof jQuery.extend == 'function'){
									// clonacion a jquery
									propiedadesArchivo = jQuery.extend(true, {}, va_visores[id_visor].descompresion.propiedadesArchivoZip);
								}else{
									// clonacion a pelo
									propiedadesArchivo={};
									for(propi in va_visores[id_visor].descompresion.propiedadesArchivoZip)
										propiedadesArchivo[propi] = va_visores[id_visor].descompresion.propiedadesArchivoZip[propi];
								}
								if(typeof propiedadesArchivo!='undefined'){
									propiedadesArchivo['Pagina'] = (i+1);
								}
							}
							av_InsertDocument(id_visor,
								va_visores[id_visor].descompresion.docid + '_' + (i+1),
								va_literalesValidacion.pagina+(i+1),
								urlImagen,
								rutaImagen,
								'remoto',
								'',
								va_visores[id_visor].descompresion.catid,
								null, 'img', propiedadesArchivo,
								va_visores[id_visor].descompresion.docid);
							va_visores[id_visor].descompresion.imagenesCargadas[va_visores[id_visor].descompresion.imagenesCargadas.length] = {'id': va_visores[id_visor].descompresion.docid + '_' + (i+1), 'url' : urlImagen, 'ruta' : rutaImagen};
							va_visores[id_visor].descompresion.lastreceived = (new Date());
						}
					});
					docsCargando++;
					if(va_visores[id_visor].descompresion.heAcabadoDeDescomprimir){
						if (docsCargando==5){
							break;	// intento cargar de 5 en 5 xq ya s? seguro que las imagenes est?n descomprimidas
						}
					}else{
						if(docsCargando==2){
							break;	// intento cargar de 3 en 3...
						}
					}
				}
			}
			if(todasCargadas==true){
				// Terminar el interval de carga
				va_visores[id_visor].descompresion.terminada=true;
				if(typeof va_lanzarEvento=='function'){
					va_lanzarEvento(id_visor, 'onUngroup');
				}
			}

			// timeout
			if(va_visores[id_visor].descompresion.terminada==false && ((new Date()).getTime() > (va_visores[id_visor].descompresion.lastreceived.getTime() + (_va_TimeOutDesagrupando * 1000)))){ // _va_TimeOutDesagrupando se puede reutilizar para descomprimir
				va_visores[id_visor].descompresion.error=true;
				va_visores[id_visor].descompresion.resultado=va_literalesVisor.tiempoEsperaAgotado;

				// Terminar el interval de carga
				va_visores[id_visor].descompresion.terminada=true;
				depura('\tDescompresion: ' + va_visores[id_visor].descompresion.resultado);
			}
			if(va_visores[id_visor].descompresion.terminada==true){
				clearInterval(va_visores[id_visor].descompresion.intervalLoader);
				if(va_visores[id_visor].descompresion.resultado.substr(0,4)!='OKOK'){
					va_visores[id_visor].descompresion.error=true;
				}
				if(va_visores[id_visor].descompresion.error==true){
					$spancargando.html(va_literalesVisor.errorPulse + ' <a href="javascript:void(0);" onclick="va_reintentarDescompresion(\''+id_visor+'\',\''+va_visores[id_visor].descompresion.docid+'\');">' + va_literalesVisor.aqui + '</a> ' + va_literalesVisor.paraReintentar).attr('title', va_visores[id_visor].descompresion.resultado);
				}else{
					$spancargando.remove();
				}
				depura('\tDescompresion FINAL: ' + va_visores[id_visor].descompresion.resultado);
				va_visores[id_visor].descompresion=null;
				tira_inicializaDragyClickDesagrupacion(id_visor); // esta funcion se puede reutilizar para la descompresion sin necesidad de cambios
			}
			
			var x = function (){
				var elm_selecionado = va_getSelectedItem(id_visor);
				var pos;
				if(elm_selecionado){
					var id_seleccionado = $(elm_selecionado).attr('rel');
					pos = va_getPosicionDocumento(id_visor, id_seleccionado);
					if(pos<0 || pos>=(va_documentos[id_visor].length -1)){
						pos=-1;
					}
				}else{
					pos=0;
				}
				try{
					av_SelectDocumentByID(id_visor, va_visores[id_visor].descompresion.imagenesCargadas[0].id, false);
					av_LoadDocumentByID(id_visor, va_visores[id_visor].descompresion.imagenesCargadas[0].id);
				}catch(e){
					
				}
				$("#" + id_visor + "_toolbar input.btnNavigator").val(pos+1);
			};
			var cb = vaf_esperaLlamada(x);
			if(va_visores[id_visor].modoEdicion==true){
				ComponenteFlash(id_visor).EditMode(false, cb);
				return;
			}else{
				vaf_llamadaPendiente(cb);
			}
		};
		va_visores[id_visor].descompresion.intervalLoader = setInterval(funcionRecargadoraTira,_va_PollingInterval);
		$('TR.documentoTiraTR[rel="'+docid+'"]').unbind();
	}
}

/**	Obtiene el numero de p?ginas de un PDF
	a trav?s de una llamada ajax al servlet
	doc es una estructura de documento, debe contener al menos la Uri 
	(la ruta de del pdf en el sistema de archivos del servidor)
	Es sincrona!
	(no vuelve hasta que no lo ha obtenido..
	puede devolver -1 o 0 si hay error o si no se pudo obtener el numero de p?ginas
	en ese caso habr? que ver el error en la consola (a trav?s de la funcion depura). **/
function va_desagruparGetNumPaginas(id_visor, doc){
	var rutaServlet = va_visores[id_visor].rutaServletWAS;
	var paramsServlet = va_visores[id_visor].parametrosExtraServletWAS;
	if(doc.SourceLocation == 'local'){
		rutaServlet = va_visores[id_visor].rutaServletLocal;
		paramsServlet = va_visores[id_visor].parametrosExtraServletLocal;
	}
	var url = rutaServlet + '?ac=' + 'np' +	'&na=' + escape(doc.Path) +	paramsServlet;
	var numPaginas = -1;
	$.ajax({
		'url':url,
		'async':false,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':function (datos){
			try{
				numPaginas = parseInt(datos);
			}catch(ex){
				depura(ex);
				numPaginas=-1;
			}
			if(numPaginas==-1){
				depura('El servlet de desagrupado obteniendo el numero de paginas devolvio:' + datos);
			}
		},
		'error':function(jqxhr, textStatus){depura('No se pudo llamar al servlet de desagrupado:' + textStatus);}
	});
	return numPaginas;		
}

function va_descomprimirGetNombresImagenes(id_visor, doc){
	var rutaServlet = va_visores[id_visor].rutaServletWAS;
	var paramsServlet = va_visores[id_visor].parametrosExtraServletWAS;
	if(doc.SourceLocation == 'local'){
		rutaServlet = va_visores[id_visor].rutaServletLocal;
		paramsServlet = va_visores[id_visor].parametrosExtraServletLocal;
	}
	var url = rutaServlet + '?ac=' + 'niz' + '&na=' + escape(doc.Path) +	paramsServlet;
	var nombresImagenes = [];
	$.ajax({
		'url':url,
		'async':false,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':function (datos){
			try{
				nombresImagenes = eval(datos);
			}catch(ex){
				depura(ex);
				nombresImagenes = null;
			}
			if(nombresImagenes == null){
				depura('El servlet de descompresion obteniendo los nombres de imagenes devolvio:' + datos);
			}
		},
		'error':function(jqxhr, textStatus){depura('No se pudo llamar al servlet de descompresion:' + textStatus);}
	});
	return nombresImagenes;		
}

function va_intentaObtenerNumPaginasPDF(id_visor, doc){
	var rutaServlet = va_visores[id_visor].rutaServletWAS;
	var paramsServlet = va_visores[id_visor].parametrosExtraServletWAS;
	if(doc.SourceLocation == 'local'){
		rutaServlet = va_visores[id_visor].rutaServletLocal;
		paramsServlet = va_visores[id_visor].parametrosExtraServletLocal;
	}
	$('#' + id_visor + ' .nPages').html('/...');
	var url = rutaServlet + '?ac=' + 'np' +	'&na=' + escape(doc.Path) +	paramsServlet;
	var numPaginas = -1;
	$.ajax({
		'url':url,
		'async':true,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':function (datos){
			try{
				numPaginas = parseInt(datos);
				$('#' + id_visor + ' .nPages').html('/ ' + numPaginas);
			}catch(ex){
				depura(ex);
				numPaginas=-1;
				$('#' + id_visor + ' .nPages').html('/ ?');
			}
			if(numPaginas==-1){
				$('#' + id_visor + ' .nPages').html('');
				depura('El servlet de desagrupado obteniendo el numero de paginas devolvi?:' + datos);
			}
		},
		'error':function(jqxhr, textStatus){depura('No se pudo llamar al servlet de desagrupado:' + textStatus);}
	});
}

/**	va_desagruparCallDesagrupar(id_visor, path, funcioncallback, funcionerror, timestamp){
	Argumentos:
		id_visor
		path del archivo en el sistema de archivos del servidor al que llamas (documento.path)
		funcioncallback -> funcion llamada cuando la peticion devuelve HTTP200
		funcionerror -> funcion llamada ocurre un error
		timestamp -> (O numero aleatorio, o ambos!) un cacho de texto que se a?adir? al final de la ruta donde se desagrupa el archivo
	Hace una llamada ajax GET ASINCRONA, al servlet de desagrupado
	con la rutaServlet, 
	accion (ac) = 'd' desagrupar
	nombre de archivo (na) = lo que le pases en Path (que ser? documento.Path del contexto)
	timestamp (ts) = lo que le pases en timestamp (puede ser un numero aleatorio, o una cadena, lo que quieras mientras sea ?nico)
	ruta salida (rs) = donde va a dejar los archivos:
	El servlet coge esos datos y crea una carpeta en ruta_salida:
	con el nombre del archivo (con su extension) un guion bajo y lo que le pases en timestamp
	por ejemplo, el archivo pdf situado en
		/de/qngx/ejemplospdf/archivo1.pdf
		tiene 5 paginas
		Si la ruta temporal es /tmp/pdfs/
		Y el timestamp que le pases al servlet es 1234, los archivos jpgs tendran estas rutas:
		/tmp/pdfs/archivo1.pdf_1234/archivo1.pdf_0.jpg
		/tmp/pdfs/archivo1.pdf_1234/archivo1.pdf_1.jpg
		/tmp/pdfs/archivo1.pdf_1234/archivo1.pdf_2.jpg
		/tmp/pdfs/archivo1.pdf_1234/archivo1.pdf_3.jpg
		/tmp/pdfs/archivo1.pdf_1234/archivo1.pdf_4.jpg
**/
function va_desagruparCallDesagrupar(id_visor, path, funcioncallback, funcionerror, timestamp){
	depura('va_desagruparCallDesagrupar("'+id_visor+'", "'+path+'", '+funcioncallback+', '+funcionerror+', '+timestamp+')');
	var rutaServlet = va_visores[id_visor].rutaServletWAS;
	var paramsServlet = va_visores[id_visor].parametrosExtraServletWAS;
	var rutaExtraer = va_visores[id_visor].rutaTemporalWAS;
	if(typeof timestamp=='undefined' || timestamp==0){
		timestamp='';
	}
	var url = rutaServlet + '?ac=' + 'd' + '&na=' + escape(path) + '&ts=' + timestamp + '&rs=' + rutaExtraer + '&dp=' + _va_dpiDesagrupar + paramsServlet;
	depura('va_desagruparCallDesagrupar:' +url);
	// popup ventana url desagrupacion
	if(url!='' && typeof url!='undefined'){
		$.ajax({
			'url':url,
			'async':true,
			'type':'GET',
			'cache':false,
			'dataType':'html',
			'success':funcioncallback,
			'error':funcionerror
		});
	}
}

function va_descomprimirCallDescomprimir(id_visor, path, funcioncallback, funcionerror, timestamp){
	depura('va_descomprimirCallDescomprimir("'+id_visor+'", "'+path+'", '+funcioncallback+', '+funcionerror+', '+timestamp+')');
	var rutaServlet = va_visores[id_visor].rutaServletWAS;
	var paramsServlet = va_visores[id_visor].parametrosExtraServletWAS;
	var rutaExtraer = va_visores[id_visor].rutaTemporalWAS;
	if(typeof timestamp=='undefined' || timestamp==0){
		timestamp='';
	}
	var url = rutaServlet + '?ac=' + 'dz' + '&na=' + escape(path) + '&ts=' + timestamp + '&rs=' + rutaExtraer + paramsServlet;
	// popup ventana url descompresion
	if(url!='' && typeof url!='undefined'){
		$.ajax({
			'url':url,
			'async':true,
			'type':'GET',
			'cache':false,
			'dataType':'html',
			'success':funcioncallback,
			'error':funcionerror
		});
	}
}

function va_desagruparComprobarExistencia(id_visor, nombreArchivo, funcioncallback){
	// No existe desagrupar en local por ahora PENDIENTE
	var urlexiste = va_visores[id_visor].rutaServletWAS + '?ac=' + 'e' + '&na=' + escape(nombreArchivo) + va_visores[id_visor].parametrosExtraServletWAS;
	$.ajax({
		'url':urlexiste,
		'async':false,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':funcioncallback
	});
}

function va_generarNuevaImagen(id_visor, nombreArchivo, funcioncallback){
	// No existe desagrupar en local por ahora PENDIENTE
	var urlgen = va_visores[id_visor].rutaServletWAS + '?ac=' + 'g'	+ '&na=' + escape(nombreArchivo) + va_visores[id_visor].parametrosExtraServletWAS;
	$.ajax({
		'url':urlgen,
		'async':false,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':funcioncallback
	});
}

function inicializarServletDesagrupacion(id_visor){
	var urlgen = va_visores[id_visor].rutaServletWAS + '?ac=' + 'i'	+ va_visores[id_visor].parametrosExtraServletWAS;
	$.ajax({
		'url':urlgen,
		'async':true,
		'type':'GET',
		'cache':false,
		'dataType':'html',
		'success':function(data){
			depura('\tLa inicializaci?n del servlet devolvio: '+data);
		}
	});
}

/**	VentanaValidacion_cambios.js
	Convenciones a tener en cuenta:
	Las posiciones de pagina empiezan por 1 en el xml (PERO EN MEMORIA POR 0)
	La posicion 0 no existe, y la posicion -1 (solo en page_number_final) significa que la pagina est? borrada
	Si una pagina se borra, se le pone el flagdelete a true, y el page_number_final a -1, pero si luego 
	por error-caprichos del destino, se mueve esa p?gina, se mantendr? el flagdelete a true, 
	pero se le pondr? el numero de pagina destino. Asique de lo que te tienes que fiar es del flagdelete, no del numero de pagina = -1
	---------------------------------------------------------------------------------
	Si en el XML vienen documentos que tienen el mismo ID, aunque vengan separados, aqui van a salir unidos, 
	todas sus paginas cuelgan del mismo documento, porque tienen el mismo id de documento, igual que en la tira
	En va_job vienen las cosas tal cual vienen en el XML, pero aqui est?n tal cual se ven en la tira
		Por ejemplo:
			<xml>
			<documentos>
				<doc id="5">
					<pagina id="5_1">...</pagina>
					<pagina id="5_2">...</pagina>
				</doc>
				<doc id="6">
					<pagina id="6_1">...</pagina>
				</doc>
				<doc id="5">
					<pagina id="5_3">...</pagina>
				</doc>
			</documentos>

			Esto genera un va_job exactamente igual, pero genera un xml de logs asi:
			<xml>
			<documentos>
				<doc id="5">
					<pagina id="5_1">...</pagina>
					<pagina id="5_2">...</pagina>
					<pagina id="5_3">...</pagina>
				</doc>
				<doc id="6">
					<pagina id="6_1">...</pagina>
				</doc>
			</documentos>
	------------------------------------------------------
	estructura tipica de va_jobchanges = 
	{
		%id_visor% : {
			async : (bool),
			documentos : [
				{
					'idDoc':idDoc,
					'idType':idType
				},
				....
			],
			logs :{
				%idDoc% : {
					'id': va_job[id_visor][i].id,
					'status':va_job[id_visor][i].PEGAValue,
					'flag':false,
					'typeini':va_job[id_visor][i].typeId,
					'typefin':va_job[id_visor][i].typeId,
					'pages':[
						{
							'id': va_job[id_visor][i].pages[j].id,
							'iddocini': va_job[id_visor][i].pages[j].idDoc,	// == va_job[id_visor][i].id !!!
							'iddocfin': va_job[id_visor][i].pages[j].idDoc,	// == va_job[id_visor][i].id !!!
							'pagenumini': j,
							'pagenumfin': j,
							'threshold': va_job[id_visor][i].pages[j].confidence,
							'flagdelete': false
						},
						....
					]
				},
				%idDoc2% : {
					....
				},
				....
			},
		}
	}

	EN EL INITLOGS SE RECALCULAN LOS NUMEROS DE PAGINA
	va_jobchanges_initLogs(id_visor)
	PORQUE NO TE PUEDES FIAR DE NADA.... */
function va_reiniciarJobChanges(id_visor){
	depura('va_reiniciarJobChanges("'+id_visor+'")');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('va_reiniciarJobChanges: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion');
	}
	va_jobchanges = null;
	va_jobchanges_init(id_visor);
}
/**	inicializa la estructura si no lo est? ya...
	hay que llamar a esto siempre si no quieres hacer muchas comprobaciones de undefineds...
	no te pisa lo que ya est? definido, simplemente define las cosas si no lo est?n para que no pete **/
function va_jobchanges_init(id_visor){
	depura('va_jobchanges_init("'+id_visor+'")');
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('va_jobchanges_init: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion');
	}
	
	if(!isValidVariable(va_jobchanges, 'object')){
		va_jobchanges = [];
		va_jobchanges[id_visor] = [];
	}else if(!isValidVariable(va_jobchanges[id_visor], 'object')){
		va_jobchanges[id_visor] = [];
	}else if(isValidVariable(va_jobchanges[id_visor].documentos, 'object')){
		return;
	}
	va_jobchanges[id_visor].async = 'false';
	va_jobchanges[id_visor].documentos = [];
	va_jobchanges_initLogs(id_visor);

	if(!isValidVariable(va_jobinfo, 'object')){
		va_jobinfo = [];
		va_jobinfo[id_visor] = {'jobid':''};
	}else if(!isValidVariable(va_jobinfo[id_visor], 'object')){
		va_jobinfo[id_visor] = {'jobid':''};
	}
}

/**	Inicializa el sistema de logs 
	llamado desde va_jobchanges_init, no llames a esto nunca... **/
function va_jobchanges_initLogs(id_visor){
	if(!isValidVariable(id_visor, 'string') || id_visor == ''){
		throw new Error('va_jobchanges_initLogs: el argumento "id_visor" es nulo, no es un "string" o esta vacio. Se interrumpe la ejecucion');
	}
	
	if(!isValidVariable(va_jobchanges, 'object')){
		va_jobchanges = [];
		va_jobchanges[id_visor] = {};
	}else if(!isValidVariable(va_jobchanges[id_visor], 'object')){
		va_jobchanges[id_visor] = {};
	}
	if(!isValidVariable(va_job, 'object')){
		va_job = [];
		va_job[id_visor] = [];
	}else if(!isValidVariable(va_job[id_visor], 'object')){
		va_job[id_visor] = [];
	}
	va_jobchanges[id_visor].logs = [];
	var numsDePagina = [];
	for(var i=0; i<va_job[id_visor].length; i++){
		if(!(va_jobchanges[id_visor].logs[ va_job[id_visor][i].id ])){
			va_jobchanges[id_visor].logs[ va_job[id_visor][i].id ] = {
				'id': va_job[id_visor][i].id,
				'status':va_job[id_visor][i].PEGAValue,
				'flag':false,
				'typeini':va_job[id_visor][i].typeId,
				'typefin':va_job[id_visor][i].typeId,
				'pages':[]
			};
			numsDePagina[va_job[id_visor][i].id]=0;
		}
		for(j=0;j<va_job[id_visor][i].pages.length;j++){
			var paginas = va_jobchanges[id_visor].logs[ va_job[id_visor][i].id ].pages;
			paginas[paginas.length] = {
				'id': va_job[id_visor][i].pages[j].id,
				'iddocini': va_job[id_visor][i].pages[j].idDoc,	// == va_job[id_visor][i].id !!!
				'iddocfin': va_job[id_visor][i].pages[j].idDoc,	// == va_job[id_visor][i].id !!!
				'pagenumini': numsDePagina[va_job[id_visor][i].id] ,
				'pagenumfin': numsDePagina[va_job[id_visor][i].id] ,
				'threshold': va_job[id_visor][i].pages[j].confidence,
				'flagdelete': false
			};

			// reescribir order correctamente: (corrige para xmls mal formados)
			va_job[id_visor][i].pages[j].order = numsDePagina[va_job[id_visor][i].id];
			numsDePagina[va_job[id_visor][i].id]++;
		}
	}
}

/**	Inserta un nuevo cambio en el array de cambios
	categoria es opcional, si no se lo pasas la busca el solito */
function va_jobchanges_insertNewDocumentChange(id_visor, idDoc, categoria){
	va_jobchanges_init(id_visor);
	var idType;
	if(categoria){
		idType = categoria;
	}else{
		for (var k=0;k<va_job[id_visor].length;k++){
			if(va_job[id_visor][k].id==idDoc){
				idType = va_job[id_visor][k].typeId;
				break;
			}
		}
	}
	va_jobchanges[id_visor].documentos[va_jobchanges[id_visor].documentos.length] = {'idDoc':idDoc,'idType':idType};
	return va_jobchanges[id_visor].documentos.length-1;
}

function va_jobchanges_getDocumentPos(id_visor, idDoc, crearSiNoExiste, categoriaParaCrear){
	va_jobchanges_init(id_visor);
	var pos = -1;
	for(var j=0;j<va_jobchanges[id_visor].documentos.length;j++){
		if(va_jobchanges[id_visor].documentos[j].idDoc==idDoc){
			pos = j;
		}
	}
	if(crearSiNoExiste && pos==-1){
		pos = va_jobchanges_insertNewDocumentChange(id_visor, idDoc, categoriaParaCrear);
	}
	return pos;
}

function av_getReprocessXMLOCR(id_visor, async){
	return va_jobchanges_getXML(id_visor, async);
}

function va_jobchanges_getXML(id_visor, async){
	va_jobchanges_init(id_visor);
	if(!va_jobinfo || !va_jobinfo[id_visor]){
		va_jobinfo[id_visor]={'jobid':''};
	}
	var xml = '';
	var linea = function(datos){xml+= datos + "\n";};
	if(typeof async !='undefined'){
		if(typeof async =='boolean'){
			va_jobchanges[id_visor].async = (async ?'true':'false');
		}else{
			va_jobchanges[id_visor].async=async;
		}
	}
	linea('<'+'?'+'xml version="1.0" encoding="ISO-8859-1"?>');
	linea('<REPROCESSING_DATA>');
	linea('<JOB_ID>' + va_jobinfo[id_visor].jobid + '</JOB_ID>');
	linea('<ASYNCHRONOUS>' + va_jobchanges[id_visor].async + '</ASYNCHRONOUS>');
	linea('<DOCUMENTS>');
	for(var i=0; i < va_jobchanges[id_visor].documentos.length;i++){
		var doc = va_jobchanges[id_visor].documentos[i];

		// Busco el idCategoria del documento.. se busca desde aqui:
		for(var k=0;k<va_job[id_visor].length;k++){
			if(va_job[id_visor][k].id == doc.idDoc){
				doc.idType = va_job[id_visor][k].typeId;
				break;
			}
		}
		linea('<DOCUMENT>');
		linea('<DOCUMENT_ID>' + doc.idDoc + '</DOCUMENT_ID>');
		linea('<DOCUMENT_TYPE>' + doc.idType + '</DOCUMENT_TYPE>');
		linea('<DOCUMENT_PAGES>');
		/*for (var j=0;j< va_documentos[id_visor].length;j++){
			if(va_documentos[id_visor][j].idDoc == doc.idDoc)
				linea('<PAGE_ID>' + va_documentos[id_visor][j].id + '</PAGE_ID>');
		}*/
		for (var j=0;j< va_job[id_visor].length;j++){
			if(va_job[id_visor][j].id==doc.idDoc){
				for(pag in va_job[id_visor][j].pages){
					linea('<PAGE_ID>' + va_job[id_visor][j].pages[pag].id + '</PAGE_ID>');
				}
				break;
			}
		}
		linea('</DOCUMENT_PAGES>');
		if(doc.deletedPages){
			linea('<DOCUMENT_REMOVE_PAGES>');
			for(borrada in doc.deletedPages){
				linea('<PAGE_ID>' + doc.deletedPages[borrada].id + '</PAGE_ID>');
			}
			linea('</DOCUMENT_REMOVE_PAGES>');
		}
		linea('</DOCUMENT>');
	}
	linea('</DOCUMENTS>');
	linea('</REPROCESSING_DATA>');
	return xml;
}

/**	va_jobchanges_movePage(
	id_visor, 
	idPage, 	
	idDocOrigen, idDoc donde estaba, este documento ha perdido una pagina, se marca para reprocesar
	idDocDestino opcional, idDocumento que tiene la pagina ahora, se reprocesar? el documento.
	Si no se inica se obtiene automaticamente, si es igual que idDocOrigen es que has 
	reordenado el documento, se reprocesar? igualmente.
	posEnDocAntes posicion que tenia en el documento anterior		
	posDocDestino posicion en el array, base 0! **/
function va_jobchanges_movePage(id_visor, idPage, idDocOrigen, idDocDestino, posEnDocAntes, posDocDestino, categoriaAntes, categoriaDespues){
	va_jobchanges_init(id_visor);
	if(!idDocDestino && idPage){
		for (var j=0;j< va_documentos[id_visor];j++){	
			if(va_documentos[id_visor][j].id == idPage){
				idDoc = va_documentos[id_visor][j].idDoc;
				break;
			}
		}
	}

	// Esto a?ade al XML de reprocesado el documento
	// ya una vez metido, al generar el xml meter? las p?ginas
	va_jobchanges_getDocumentPos(id_visor, idDocOrigen, true, categoriaAntes);
	if(idDocDestino!=idDocOrigen){
		va_jobchanges_getDocumentPos(id_visor, idDocDestino, true, categoriaDespues);
	}
	va_jobchanges_movePage_log(id_visor, idPage, idDocOrigen, idDocDestino, posEnDocAntes, posDocDestino, categoriaAntes, categoriaDespues);
}

function va_jobchanges_moveDocument(id_visor, idDoc, categoriaAntes, categoriaDespues){
	var pos = va_jobchanges_getDocumentPos(id_visor, idDoc, true, categoriaDespues);
	if(pos>-1){
		va_jobchanges[id_visor].documentos[pos].idType = categoriaDespues;
	}

	// mas abajo
	va_jobchanges_logs_cambiaCategoria(id_visor, idDoc, categoriaAntes, categoriaDespues)
}

function va_jobchanges_nuevoDocumentoAutogenerado(id_visor, idDoc, categoria){
	va_jobchanges_init(id_visor);
	var pos = va_jobchanges_getDocumentPos(id_visor, idDoc, true, categoria);
	if(pos>-1 && va_jobchanges[id_visor].documentos[pos]){
		va_jobchanges[id_visor].documentos[pos]['AUTOGENERADO']=true;
	}
	va_jobchanges[id_visor].logs[idDoc] = {
		'id': idDoc,
		'status':'',
		'flag':false,
		'typeini':categoria,
		'typefin':categoria,
		'pages':[],
		'AUTO_GENERADO':true
	};
	return pos;
}
function va_jobchanges_nuevaPaginaGenerada(id_visor, idPag, nPag, idDoc,  categoria){
	va_jobchanges_init(id_visor);
	var pos = va_jobchanges_getDocumentPos(id_visor, idDoc, true, categoria);
	
	var paginas = va_jobchanges[id_visor].logs[idDoc].pages;

	paginas[paginas.length] = {
								'id': idPag,
								'iddocini': idDoc,
								'iddocfin': idDoc,
								'pagenumini': nPag,
								'pagenumfin': nPag,
								'threshold': 0,
								'flagdelete': false,
								'GENERADA': true
						  };
	return pos;
}
function va_jobchanges_nuevaPagina(id_visor, idPag, nPag, idDoc,  categoria){
	va_jobchanges_init(id_visor);
	var pos = va_jobchanges_getDocumentPos(id_visor, idDoc, true, categoria);
	
	var paginas = va_jobchanges[id_visor].logs[idDoc].pages;

	paginas[paginas.length] = {
								'id': idPag,
								'iddocini': idDoc,
								'iddocfin': idDoc,
								'pagenumini': nPag,
								'pagenumfin': nPag,
								'threshold': 0,
								'flagdelete': false,
								'NUEVA': true
						  };
	return pos;
}

function va_jobchanges_movePage_log(id_visor, idPage, idDocOrigen, idDocDestino, posEnDocAntes, posDocDestino, categoriaAntes, categoriaDespues, reintento){
	va_jobchanges_init(id_visor);
	try{
		var paginasDocOrigen = va_jobchanges[id_visor].logs[idDocOrigen] ? va_jobchanges[id_visor].logs[idDocOrigen].pages : null;
		var paginasDocDestino = va_jobchanges[id_visor].logs[idDocOrigen] ? va_jobchanges[id_visor].logs[idDocDestino].pages : null;
		if(!paginasDocOrigen || !paginasDocDestino){
			depura('Error en modulo de log!! movePage:'+idPage+":"+ idDocOrigen+":"+ idDocDestino);
			return;
		}
		var nuevoPaginasDocOrigen = [];
		var pagina_movida = null;

		// Establece los nuevos datos en la pagina, y quita del array de paginas del documento de origen, la pagina que quieres mover
		for(var i=0;i<paginasDocOrigen.length;i++){
			if(paginasDocOrigen[i].id == idPage){
				paginasDocOrigen[i].iddocfin = idDocDestino;
				paginasDocOrigen[i].pagenumfin = posDocDestino; // == (paginasDocDestino -1)
				pagina_movida = paginasDocOrigen[i];
			}else{
				// Insertar la pagina en el array nuevo del documento antiguo
				paginasDocOrigen[i].pagenumfin = nuevoPaginasDocOrigen.length;	// cambia el numero de pagina
				nuevoPaginasDocOrigen[nuevoPaginasDocOrigen.length] = paginasDocOrigen[i];
			}
		}
		va_jobchanges[id_visor].logs[idDocOrigen].pages = nuevoPaginasDocOrigen;
		if(idDocOrigen== idDocDestino){
			paginasDocDestino = nuevoPaginasDocOrigen;
		}
		var nuevoPaginasDocDestino = [];
		var insertada = false;
		for(var i=0;i<paginasDocDestino.length;i++){
			if(i==posDocDestino){
				insertada = true;
				nuevoPaginasDocDestino[nuevoPaginasDocDestino.length] = pagina_movida;
			}
			paginasDocDestino[i].pagenumfin = nuevoPaginasDocDestino.length;
			nuevoPaginasDocDestino[nuevoPaginasDocDestino.length]=paginasDocDestino[i];
		}
		if (!insertada){
			nuevoPaginasDocDestino[nuevoPaginasDocDestino.length] = pagina_movida;
			pagina_movida.pagenumfin = nuevoPaginasDocDestino.length -1;
			if(pagina_movida.pagenumfin!=posDocDestino){
				depura('Movida pagina en el log, pero los ordenes no coincidian!');
			}
		}
		va_jobchanges[id_visor].logs[idDocDestino].pages = nuevoPaginasDocDestino;
	}catch(ex){
		va_reiniciarJobChanges(id_visor);
	}
}

function va_jobchanges_logs_cambiaCategoria(id_visor, idDoc, idAntiguaCategoria, idNuevaCategoria){
	va_jobchanges_init(id_visor);
	var paginas = va_jobchanges[id_visor].logs[idDoc] ? va_jobchanges[id_visor].logs[idDoc].pages : null;

	// comprobar ????
	//todas las paginas tienen que tener ya el Categoria = categoria nueva
	if(va_jobchanges[id_visor].logs[idDoc]){
		va_jobchanges[id_visor].logs[idDoc].typefin = idNuevaCategoria;
		va_jobchanges[id_visor].logs[idDoc].flag = true;
	}else{
		// mal asunto, no hay objeto log para este documento...
		depura("El sistema de logs no ha funcionado para :" + idDoc);
		va_reiniciarJobChanges(id_visor);
	}
}

function va_jobchanges_deletePage(id_visor, idPage, idDoc){
	try{
		va_jobchanges_init(id_visor);
		var pos = va_jobchanges_getDocumentPos(id_visor, idDoc, true);
		if(pos!=-1){
			var entrada = va_jobchanges[id_visor].documentos[pos];
			if(!entrada.deletedPages){
				entrada.deletedPages =[];
			}
			entrada.deletedPages[ entrada.deletedPages.length ] = {'id':idPage};
		}

		// Log:
		var paginas = va_jobchanges[id_visor].logs[idDoc].pages;
		for(var i=0;i<paginas.length;i++){
			if(paginas[i].id == idPage){
				paginas[i].flagdelete=true;
				paginas[i].pagenumfin=-1;
				break;
			}
		}
	}catch(ex){
		va_reiniciarJobChanges(id_visor);
	}
}

// Retabular esta mierda:
// ([ 	]*)linea\('
// linea('\1
//linea('([ 	]*)
// \1linea('
/*function av_getClassificationLogXML(id_visor, conCabeceraXml){
	return va_jobchanges_getClassificationLog(id_visor, conCabeceraXml);
}*/

/*function va_jobchanges_getClassificationLog(id_visor, conCabeceraXml){
	va_jobchanges_init(id_visor);
	var xml = '';
	var linea = function(datos){
		xml+= datos + "\n";
	};
	if(conCabeceraXml){
		linea('		<'+'?'+'xml version="1.0" encoding="ISO-8859-1"'+'?'+'>');
	}
	linea('	<CLASSIFICATION_LOG>');
	linea('	  <JOB_ID_LOG>' + (va_jobinfo[id_visor].jobid ? va_jobinfo[id_visor].jobid : '') + '</JOB_ID_LOG>');
	linea('	  <USER_LOG>' + (va_jobinfo[id_visor].user ? va_jobinfo[id_visor].user : '') + '</USER_LOG>');
	linea('	  <OFFICE_LOG>' + (va_jobinfo[id_visor].office ? va_jobinfo[id_visor].office : '') + '</OFFICE_LOG>');
	linea('	  <DOCUMENTS_LOG>');
	for(idDocu in va_jobchanges[id_visor].logs){
		linea('			<DOCUMENT_LOG>');
		linea('				<DOCUMENT_ID_LOG>' + idDocu + '</DOCUMENT_ID_LOG>');
		linea('				<DOCUMENT_STATUS_LOG>' + va_jobchanges[id_visor].logs[idDocu].status + '</DOCUMENT_STATUS_LOG>');
		linea('				<FLAG_RECLASSIFICATION_LOG>' + (va_jobchanges[id_visor].logs[idDocu].flag?'TRUE':'FALSE') + '</FLAG_RECLASSIFICATION_LOG>');
		linea('				<DOCUMENT_TYPE_INITIAL_LOG>' + va_jobchanges[id_visor].logs[idDocu].typeini + '</DOCUMENT_TYPE_INITIAL_LOG>');
		linea('				<DOCUMENT_TYPE_FINAL_LOG>' + va_jobchanges[id_visor].logs[idDocu].typefin + '</DOCUMENT_TYPE_FINAL_LOG>');
		linea('				<PAGES_LOG>');
		var paginas = va_jobchanges[id_visor].logs[idDocu].pages;
		for (var i=0;i<paginas.length;i++){
			linea('				  <PAGE_LOG>');
			linea('					<PAGE_ID_LOG>' + paginas[i].id + '</PAGE_ID_LOG>');
			linea('					<DOCUMENT_ID_INITIAL_LOG>' + paginas[i].iddocini + '</DOCUMENT_ID_INITIAL_LOG>');
			linea('					<DOCUMENT_ID_FINAL_LOG>' + paginas[i].iddocfin + '</DOCUMENT_ID_FINAL_LOG>');
			linea('					<PAGE_NUMBER_INITIAL_LOG>' + (paginas[i].pagenumini+1) + '</PAGE_NUMBER_INITIAL_LOG>');
			linea('					<PAGE_NUMBER_FINAL_LOG>' + (paginas[i].pagenumfin+1) + '</PAGE_NUMBER_FINAL_LOG>');
			linea('					<THRESHOLD_LOG>' + paginas[i].threshold + '</THRESHOLD_LOG>');
			linea('					<FLAG_DELETE_LOG>' + (paginas[i].flagdelete?'TRUE':'FALSE') + '</FLAG_DELETE_LOG>');
			linea('				  </PAGE_LOG>');
		}
		linea('				</PAGES_LOG>');
		linea('			</DOCUMENT_LOG>');
	}
	linea('	  </DOCUMENTS_LOG>');
	linea('	 </CLASSIFICATION_LOG>');
	return xml;
}*/

/** DEP
	Devuelve true si se cambio de orden la p?gina, 
	y false si no, si la pagina ya estaba en su sitio **/
/*function va_jobchanges_logs_cambiaOrdenPagina(id_visor, idDoc, idPag, numPagina){
	va_jobchanges_init(id_visor);
	if(va_jobchanges[id_visor].logs[idDoc]){
		var paginas = va_jobchanges[id_visor].logs[idDoc].pages || [];	// ese || [] es para que no pete si .pages no esta definido
		for(var i =0;i<paginas.length;i++){
			if(paginas[i].id==idPag){
				if(paginas[i].pagenumfin != numPagina+1){
					var pagina = paginas.splice(i,1);
					pagina = pagina[0];
					paginas.splice(numPagina, 0, pagina);
					pagina.pagenumfin = numPagina+1;
					return true;
				}else{
					return false;
				}
			}
		}
	}
	return false;
}*//*FIN VentanaValidacion_cambios.js*/ 
/*INICIO VentanaValidacion_toolbar.js*/ 
/* GONZALO */
/************************************************************************************
   BOTONES DEL TOOLBAR  
**************************************************************************************/

function va_botonPulsable(btn){
	var $btn = $(btn);
	return (!$btn.hasClass('buttonDisabled') && !$btn.hasClass('buttonUnavailable') && !$btn.is(':hidden'));
}

function initToolBar(id_visor2){
	var id_visor=id_visor2;

	/** btnInfo **/
	$("#" + id_visor + "_toolbar .btnInfo").click(function (){
		if(va_botonPulsable(this)){
			av_showPropertiesDialog(id_visor);
		}
	});

	/** btnFullScreen **/
	// Este boton no existe! se supone que era el que estaba en la toolbar, 
	// esta funcion ya no se usa, se deja por si acaso
	$("#" + id_visor + "_toolbar .btnFullScreen").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='pdf' && typeof va_pdfFullScreen=='function'){
				va_pdfFullScreen(id_visor);
			}else if (va_visores[id_visor].modo=='img'){
				ComponenteFlash(id_visor).switchFullScreen();
			}
		}
	});
	
	/** btnEdit **/
	$("#" + id_visor + "_toolbar .btnEdit").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='pdf'){
				// Unavailable
				depura('Intentando editar un pdf, llamada ignorada');
			}else if (va_visores[id_visor].modo=='img'){
				ComponenteFlash(id_visor).EditMode(!va_visores[id_visor].modoEdicion);
			}
		}
	});

	/** btnPrint **/
	$("#" + id_visor + "_toolbar .btnPrint").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='pdf'){
				try{
					getPDFObject(id_visor + '_objetopdf').print();
				}catch(ex){
					alert('Imprimir desde aqui solo está soportado en InternetExplorer');
				}
			}else if (va_visores[id_visor].modo=='img'){
				ComponenteFlash(id_visor).printDialog();
			}else if (va_visores[id_visor].modo=='other'){
				try{
					$('#' + id_visor + '_emptyviewer iframe')[0].contentWindow.print();
				}catch(ex){
					alert('Error al imprimir:' + ex);
				}
			}
		}
	});
	$("#" + id_visor + "_toolbar .btnStart").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='pdf'){
				try{
					getPDFObject(id_visor + '_objetopdf').gotoFirstPage();
					// Input
					$("#" + id_visor + "_toolbar input.btnNavigator").val('1');
				}catch(ex){alert('Solo está soportado en InternetExplorer');}
			}else if (va_visores[id_visor].modo=='img' || va_visores[id_visor].modo=='other'){
				// llamada pendiente 
				var x = function (){
				// codigo llamada pendiente 
					av_SelectDocumentByID(id_visor, va_documentos[id_visor][0].id,false);
					av_LoadDocumentByID(id_visor, va_documentos[id_visor][0].id);
					$("#" + id_visor + "_toolbar input.btnNavigator").val(1);
				
				// llamada a llamada pendiente {
				};
				var cb = vaf_esperaLlamada(x);
				if(va_visores[id_visor].modoEdicion==true){
					ComponenteFlash(id_visor).EditMode(false, cb);
					return;
				}else{
					vaf_llamadaPendiente(cb);
				}
				// fin llamada pendiente }
				
			}
		}
	});
	$("#" + id_visor + "_toolbar .btnPrev").click(function (){
		if(va_botonPulsable(this)){
		
			if (va_visores[id_visor].modo=='pdf'){
				try{
					getPDFObject(id_visor + '_objetopdf').gotoPreviousPage();
					
					// Input
					var actual=parseInt($("#" + id_visor + "_toolbar input.btnNavigator").val());
					if(actual>1){
						$("#" + id_visor + "_toolbar input.btnNavigator").val(actual-1);
					}else{
						$("#" + id_visor + "_toolbar input.btnNavigator").val(1);
					}
				}catch(ex){
					alert('Solo está soportado en InternetExplorer');
				}
			}else if (va_visores[id_visor].modo=='img' || va_visores[id_visor].modo=='other'){
				// llamada pendiente 
				var x = function (){
				// codigo llamada pendiente
					var elm_selecionado = va_getSelectedItem(id_visor);
					var pos;
					if(elm_selecionado){
						var id_seleccionado = $(elm_selecionado).attr('rel');
						pos = va_getPosicionDocumento(id_visor, id_seleccionado);
						if(pos<=0){
							pos=va_documentos[id_visor].length;
						}
						pos--;
					}else{
						pos=0;
					}
					av_SelectDocumentByID(id_visor, va_documentos[id_visor][pos].id,false);
					av_LoadDocumentByID(id_visor, va_documentos[id_visor][pos].id);
					$("#" + id_visor + "_toolbar input.btnNavigator").val(pos+1);
				
				// llamada a llamada pendiente {
				};
				var cb = vaf_esperaLlamada(x);
				if(va_visores[id_visor].modoEdicion==true){
					ComponenteFlash(id_visor).EditMode(false, cb);
					return;
				}else{
					vaf_llamadaPendiente(cb);
				}
				// fin llamada pendiente }
				
			}
		}
	});
	$("#" + id_visor + "_toolbar .btnNext").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='pdf'){
				try{
					getPDFObject(id_visor + '_objetopdf').gotoNextPage();
					
					// Input
					var actual=parseInt($("#" + id_visor + "_toolbar input.btnNavigator").val());
					if(actual>1){
						$("#" + id_visor + "_toolbar input.btnNavigator").val(actual-1);
					}else{
						$("#" + id_visor + "_toolbar input.btnNavigator").val(1);
					}
				}catch(ex){
					alert('Solo está soportado en InternetExplorer');
				}
			}else if (va_visores[id_visor].modo=='img' || va_visores[id_visor].modo=='other'){
				// llamada pendiente 
				var x = function (){
					// codigo llamada pendiente
					var elm_selecionado = va_getSelectedItem(id_visor);
					var pos;
					if(elm_selecionado){
						var id_seleccionado = $(elm_selecionado).attr('rel');
						pos = va_getPosicionDocumento(id_visor, id_seleccionado);
						if(pos<0 || pos>=(va_documentos[id_visor].length -1)){
							pos=-1;
						}
						pos++;
					}else{
						pos=0;
					}
					av_SelectDocumentByID(id_visor, va_documentos[id_visor][pos].id,false);
					av_LoadDocumentByID(id_visor, va_documentos[id_visor][pos].id);
					$("#" + id_visor + "_toolbar input.btnNavigator").val(pos+1);
					// llamada a llamada pendiente {
				};
				var cb = vaf_esperaLlamada(x);
				if(va_visores[id_visor].modoEdicion==true){
					ComponenteFlash(id_visor).EditMode(false, cb);
					return;
				}else{
					vaf_llamadaPendiente(cb);
				}
				// fin llamada pendiente }
			}
		}
	});
	$("#" + id_visor + "_toolbar .btnEnd").click(function (){
		if(va_botonPulsable(this)){
		
			if (va_visores[id_visor].modo=='pdf'){
				try{
					getPDFObject(id_visor + '_objetopdf').gotoLastPage();
					
					// Input
					var actual=parseInt($("#" + id_visor + "_toolbar input.btnNavigator").val());
					if(actual>1){
						$("#" + id_visor + "_toolbar input.btnNavigator").val(actual-1);
					}else{
						$("#" + id_visor + "_toolbar input.btnNavigator").val(1);
					}
				}catch(ex){
					alert('Solo está soportado en InternetExplorer');
				}
			}else if (va_visores[id_visor].modo=='img' || va_visores[id_visor].modo=='other'){
				// llamada pendiente 
				var x = function (){
					// codigo llamada pendiente
					var id_seleccionado = va_getSelectedItem(id_visor);
					var pos = va_documentos[id_visor].length-1;
					av_SelectDocumentByID(id_visor, va_documentos[id_visor][pos].id,false);
					av_LoadDocumentByID(id_visor, va_documentos[id_visor][pos].id);
					$("#" + id_visor + "_toolbar input.btnNavigator").val(pos+1);
					// llamada a llamada pendiente {
				};
				var cb = vaf_esperaLlamada(x);
				if(va_visores[id_visor].modoEdicion==true){
					ComponenteFlash(id_visor).EditMode(false, cb);
					return;
				}else{
					vaf_llamadaPendiente(cb);
				}
				// fin llamada pendiente }
			}
		}
	});
	$("#" + id_visor + "_toolbar input.btnNavigator").keyup(function (ev){
		if(va_botonPulsable(this)){
			if(ev.keyCode==13){	// INTRO
				try{
					var pag = $("#" + id_visor + "_toolbar input.btnNavigator").val();
					pag = parseInt(pag);
				}catch(ex){}
				if(pag<=0 || isNaN(pag)){
					pag=1;
				}
				if(pag>va_documentos[id_visor].length){
					pag=va_documentos[id_visor].length;
				}
				$("#" + id_visor + "_toolbar input.btnNavigator").val(pag);
			if (va_visores[id_visor].modo=='pdf'){
					try{
						if(pag>0){
							getPDFObject(id_visor + '_objetopdf').setCurrentPage(pag);
						}
					}catch(ex){
						depura('Solo está soportado en InternetExplorer');
					}
				}else if (va_visores[id_visor].modo=='img' || va_visores[id_visor].modo=='other'){
					var x = function (){	// dejo esta funcion pendiente de ejecutarse
							av_SelectDocumentByID(id_visor, va_documentos[id_visor][pag-1].id,false);
							av_LoadDocumentByID(id_visor, va_documentos[id_visor][pag-1].id);
					};
					var cb = vaf_esperaLlamada(x);
					if(va_visores[id_visor].modoEdicion==true){
						ComponenteFlash(id_visor).EditMode(false, cb);
						return;
					}else{
						vaf_llamadaPendiente(cb);
					}
				}
			}
		}
	});

	/** btnZoom **/
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').click(function (){
		vaf_quitaOtrosZooms(id_visor);
	});

	/** btnZoom - Change **/
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').change(function (){
		if(va_botonPulsable(this)){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel', 
				$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').index(
					$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option:selected')
			));
			if (va_visores[id_visor].modo=='pdf'){
				try{
					var zoom=parseInt($(this).val());
					if(zoom>0){
						getPDFObject(id_visor + '_objetopdf').setZoom(zoom);
					}
				}catch(ex){
					depura('Solo está soportado en InternetExplorer');
				}
			}else if (va_visores[id_visor].modo=='img'){
				try{
					var zoom=parseInt($(this).val());
					if(zoom>=0){
						ComponenteFlash(id_visor).setZoom(zoom);
					}
				}catch(ex){}
			}else if (va_visores[id_visor].modo=='other'){
				try{
					var zoom=parseInt($(this).val());
					if(zoom>0){
						$('#' + id_visor + '_emptyviewer iframe')[0].contentWindow.document.body.style.fontSize=Math.floor(14 * (zoom / 100));
					}
				}catch(ex){}
			}
		}
	});

	/** btnScan **/
	// PENDIENTE

	/** btnSend **/
	// PENDIENTE
	$("#" + id_visor + "_toolbar .btnSend").click(function (){
		if(va_botonPulsable(this)){
			//ComponenteFlash(id_visor).Send(url);
			alert('No soportado');
		}
	});

	/** btnRotateViewLeft **/
	$("#" + id_visor + "_toolbar .btnRotateViewLeft").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='img'){
				ComponenteFlash(id_visor).rotateLeft();
			}
		}
	});

	/** btnRotateViewRight **/
	$("#" + id_visor + "_toolbar .btnRotateViewRight").click(function (){
		if(va_botonPulsable(this)){
			if (va_visores[id_visor].modo=='img'){
				ComponenteFlash(id_visor).rotateRight();
			}
		}
	});

	/** btnAddPage **/
	$("#" + id_visor + "_toolbar .btnAddPage").click(function (){
		if(va_botonPulsable(this)){
			addPage(id_visor, false);
		}
	});

	/** btnDelPage **/
	$("#" + id_visor + "_toolbar .btnDelPage").click(function (){
		if(va_botonPulsable(this)){
				var x = function (){
					var elms=va_getSelectedItems(id_visor);
					if(elms.length > 0 && 
						confirm(va_literalesValidacion.confirmarEliminarPaginas)){
						for(var i=0;i<elms.length;i++){
							var elm = elms[i];
							var idpag = $(elm).attr('rel');
							var siguientePagina=0;
							for (var kk=0;kk<va_documentos[id_visor].length;kk++){
								if(va_documentos[id_visor][kk].id==idpag){
									siguientePagina=kk;// cargaré el que va a estar en la misma posicion que este que voy a borrar
									if(siguientePagina==va_documentos[id_visor].length-1){	// este era el ultimo
										siguientePagina=kk-1;// cargo el anterior
									}
									break;
								}
							}
							
							av_removeDocumentById(id_visor, idpag);
							$('#'+id_visor+'_toolbar span.nPages').html("/" + va_documentos[id_visor].length );
							if (idpag == va_visores[id_visor].ultimoIdDocumentoCargado &&  // si tenia cargado este mismo documento que acabo de quitar
									va_documentos[id_visor].length>0){						// y todavia quedan docuemntos
								/* cargo el primero ... noooo 
								va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado=0;
								av_SelectDocumentByID(id_visor, va_documentos[id_visor][0].id, false);
								av_LoadDocumentByID(id_visor, va_documentos[id_visor][0].id, 'auto', va_documentos[id_visor][0].SourceLocation);
								*/
								/* cargo el el siguiente */
								
								va_visores[id_visor].ultimoElementoDeLaTiraSeleccionado=siguientePagina;
								av_SelectDocumentByID(id_visor, va_documentos[id_visor][siguientePagina].id, false);
								av_LoadDocumentByID(id_visor, va_documentos[id_visor][siguientePagina].id, 'auto', va_documentos[id_visor][0].SourceLocation);
								
								
  							}
							
						}
						ComponenteFlashVW(id_visor).recargarJSON();
					}
				};
				var cb = vaf_esperaLlamada(x);
				if(va_visores[id_visor].modoEdicion==true){
					ComponenteFlash(id_visor).EditMode(false, cb);
					return;
				}else{
					vaf_llamadaPendiente(cb);
				}

		}
	});

	/** btnReprocess **/
	vaf_disableReprocessButton(id_visor);	// deshabilitado por defecto hasta que pulsas sobre algun icono
	$("#" + id_visor + "_toolbar .btnReprocess").click(function (){
		//provisional
		//vaf_getActualCoordinates(id_visor, recibirObjetoCoordenadas);
		
		//permanente
		if(va_botonPulsable(this)){									
			ComponenteFlashVW(id_visor).reprocesarRecorte();
		}
	});
	
	/** btnZip **/
	$("#" + id_visor + "_toolbar .btnZip").click(function (){
		if(va_botonPulsable(this) && av_IsVisibleTiraImagenes(id_visor)){
			makeZip(id_visor);
		}
	});
	
	/** btnJoinToPDF **/
	$("#" + id_visor + "_toolbar .btnJoinToPDF").click(function (){
		if(va_botonPulsable(this) && av_IsVisibleTiraImagenes(id_visor)){
			/*Llamadas correspondientes para elaborar el pdf conjunto*/
			makeJoinedPDF(id_visor);
		}
	});
	
}

function getPathsSelectedDocs(id_visor){
	var docs = av_GetSelectedDocuments(id_visor);
	var path = '';
	var p;
	var lastDotIndex;
	var extension;
	for(var i=0; i<docs.length; i++){
		p = av_GetDocumentByID(id_visor, docs[i]).Path;
		lastDotIndex = p.lastIndexOf('.');
		if(lastDotIndex > -1){
			extension = p.substring(lastDotIndex+1);
		}else{
			extension = '';
		}
		if(extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'png'){
			path = path + p + ';';
		}else{
			path = '';
			showMessage(id_visor, va_literalesVisor.imagenInvalida);
			break;
		}
	}
	if (!(path.length === 0)){
		path = path.substring(0, path.length - 1);
	}
	return path;
}

function makeZip(id_visor){
	var path = getPathsSelectedDocs(id_visor);
	if(path != ''){
		var nombreArchivo = 'Comprimido_' + (new Date()).getTime() + "r" + Math.floor(Math.random()*100000) + '.zip';
		var rutaServlet = va_visores[id_visor].rutaServletWAS;
		var rutaExtraer = va_visores[id_visor].rutaTemporalWAS + nombreArchivo;
		$('#iframeDownload').remove();
		$.ajax({type:'post',
			url:rutaServlet, 
			data:{ac:'cw',
				  li:path,
				  rs:rutaExtraer},
			success: function() {
				var urlzip = rutaServlet + '?ac=w&na='+escape(rutaExtraer);
				$('<iframe id="iframeDownload"></iframe>').attr('src', urlzip).hide().appendTo($('body'));
			},
			error:function (xhr, thrownError) {
				depura('error al crear el zip: ' + thrownError);
			}
		});
	}
}

function makeJoinedPDF(id_visor){
	var path = getPathsSelectedDocs(id_visor);
	if(path != ''){
		var nombreArchivo = 'PDF_' + (new Date()).getTime() + "r" + Math.floor(Math.random()*100000) + '.pdf';
		var rutaServlet = va_visores[id_visor].rutaServletWAS;
		var rutaAgrupacion = va_visores[id_visor].rutaTemporalWAS + nombreArchivo;
		$('#iframeDownload').remove();
		$.ajax({type:'post',
			url:rutaServlet, 
			data:{ac:'aw',
				  li:path,
				  rs:rutaAgrupacion},
			success: function(d) {
				var urlAgr = rutaServlet + '?ac=wp&na='+escape(rutaAgrupacion);
				$('<iframe id="iframeDownload"></iframe>').attr('src', urlAgr).hide().appendTo($('body'));
			},
			error:function (xhr, thrownError) {
				depura('error al crear el pdf de agrupacion: ' + thrownError);
			}
		});
	}
}

function addPage(id_visor, pegarImagenAlGenerar){
	if(typeof id_visor == 'object'){
		pegarImagenAlGenerar = id_visor[1];
		id_visor = id_visor[0];
	}
	var x = function (){
		va_addNewDocument(id_visor, pegarImagenAlGenerar);
	};
	var cb = vaf_esperaLlamada(x);
	if(va_visores[id_visor].modoEdicion==true){
		ComponenteFlash(id_visor).EditMode(false, cb);
		return;
	}else{
		vaf_llamadaPendiente(cb);
	}
}

/**
	va_colocaVisorPdfyToolBar(id_visor, mostrandoAdobeBar){

		mostrandoAdobeBar -> bool que indica si se muestra la barra original del plugin de adobe o no
		
	Coloca el workarea de forma que el visor de pdf tape nuestra toolbar
**/
function va_colocaVisorPdfyToolBar(id_visor, mostrandoAdobeBar){
	depura('va_colocaVisorPdfyToolBar("'+id_visor+'", '+mostrandoAdobeBar+')');
	var top ='0';
	var height = $('#'+id_visor+'_workarea').height();
	var ovflow='hidden';
	
	if(mostrandoAdobeBar){
		var compensacionAlto=0;
		ovflow = 'visible';

		// si hay pestanas se compensa mas:
		var x;
		
		x = $('#'+id_visor+'_pestanas_validacion');
		if(x.length && x[0].style.display!='none'){
			compensacionAlto += (x + (jQuery.browser.msie?8:10));
		}else{
			x = $('#'+id_visor+'_pestanas_edicion');
			if(x.length && x[0].style.display!='none'){
				compensacionAlto += (x + (jQuery.browser.msie?8:10));
			}
		}
		
		// Si existe la toolbar nuestra, pone el visor de pdf un poco mas arriba
		x=$('#'+id_visor+'_toolbar');
		if(x.length && x[0].style.display!='none'){
			compensacionAlto = _va_anchoToolbarParaPluginAdobe_Standard;
			if(jQuery.browser.msie){
				compensacionAlto=_va_anchoToolbarParaPluginAdobe_IE;
			}
		}
		
		top = '-' + compensacionAlto + 'px';
		height = height + compensacionAlto;
	}
	
	$('#'+id_visor+'_workarea')[0].style.overflow = ovflow;
	$('#'+id_visor+'_visorpdf')[0].style.top = top;
	$('#'+id_visor+'_visorpdf')[0].style.height = height+"px";
}

/**
	Esto pincha el evento de cuando el usuario hace click en el botón de descargar
	Hace que al hacer click en ese botón 
	
		Si la url no tiene "?" se interpreta que es un archivo tal cual, (externo o descargado directamente del was)
			se abre una ventana nueva con window.open... esto puede que no funcione en rto y puede que simplemente muestre la imagen en la nueva ventana)
		
		Si la url tiene una interrogación, se da por hecho que es del Servlet (TODO .. a lo mejor esto no es lo mejor)
			y se le añade a la url los caracteres "&ac=w" esto hace que el servlet añada la cabecera
				"content-disposition: attachment; ... "
				y eso hace que el navegador muestre el dialogo de guardar como
			
			se genera un iframe que:
				Se añade al body oculto
				se le pone como src la url esa con el "&ac=w"
				Al intentar cargar el contenido de ese iframe (aunque está oculto, lo carga), se muestra el dialogo de guardar como
		
	*/
function va_pincharEventoDownloadToolBar(id_visor, url, tipo){
	depura('va_pincharEventoDownloadToolBar("'+id_visor+'", "'+url+'", "'+tipo+'")');
	if(typeof id_visor=='undefined'|| id_visor=='' || 
		typeof url=='undefined'|| url==''){
		depura('2º intento de cargar una url en blanco!! (ignorada peticion) ' + id_visor);
		return;
	}
		var u=url;
		va_visores[id_visor].funcionDescargar=function (){
			var accion='w';
			if (typeof tipo!='undefined'){
				if(tipo=='pdf'){
					accion='wp';
				}else if(tipo=='img'){
					accion='wi';
				}
			}
			if(url.indexOf('?')!=-1){
				
				u = url+'&ac='+accion;
				depura('pinchado boton descargar, metodo 1:' + u);
				$('<iframe></iframe>').hide().appendTo($('body')).attr('src', u);
			}else{
				depura('pinchado boton descargar, metodo 2:' + u);
				window.open(u, va_literalesValidacion.descarga);
			}
			
			/*
			//Obtener dominio y nombre del archivo
			var domain_aux = document.domain;
			//alert("domainaux:" + domain_aux);
			var domain = domain_aux.substring(0, domain_aux.lastIndexOf("/")+1);
			//alert("domain:" + domain);	
			//window.open(domain + "/" + _va_URLServletArchivoWAS + "/?na=" + nombrearchivo + _va_URLServletArchivoWAS_params);
			if (va_visores[id_visor].modo=='pdf'){
				try {
					getPDFObject(id_visor + '_objetopdf').execCommand('SaveAs','1','fileName.pdf');
				}catch(ex){
					depura(ex);
				}
			}*/
	};
	
	$("#" + id_visor + "_toolbar .btnDownload").unbind().click(function (){
		if(va_botonPulsable(this)){
			va_visores[id_visor].funcionDescargar();
		}
	});
}


// Desactivamos los botones que no se pueden utilizar en modo PDF
function va_toolBarChangeMode(id_visor) {
	$('#' + id_visor + '_toolbar .buttonUnavailable').removeClass('buttonUnavailable');
	$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', '');
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', '');
	if (va_visores[id_visor].modo == "pdf"){
		//$("#" + id_visor + "_toolbar .btnFullScreen").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnEdit").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnSend").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnFullscreen").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnRotateViewLeft").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnRotateViewRight").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnDelPage").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnAddPage").addClass("buttonUnavailable");
		if(!jQuery.browser.msie){
			$("#" + id_visor + "_toolbar .btnNavigator").addClass("buttonUnavailable");
			$("#" + id_visor + "_toolbar .btnZoom").addClass("buttonUnavailable");
			$("#" + id_visor + "_toolbar .btnFullscreen").addClass("buttonUnavailable");
			$("#" + id_visor + "_toolbar .btnPrint").addClass("buttonUnavailable");
			$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', 'disabled');
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', 'disabled');
		}
		if (va_visores[id_visor].showAdobeBar){
			// mostrando adobebar se ocultan los botones innecesarios
			$("#" + id_visor + "_toolbar").addClass('modoshowAdobeBar');
			/*.btnPrint").hide();
			$("#" + id_visor + "_toolbar .btnDownload").hide();
			$("#" + id_visor + "_toolbar .btnScan").css('margin-right', '40px');
			*/
		}else{
			$("#" + id_visor + "_toolbar").removeClass('modoshowAdobeBar');
		}
	}
	/* if (va_visores[id_visor].modo == "zip"){
		$("#" + id_visor + "_toolbar .btnEdit").addClass("buttonUnavailable").css('filter', 'alpha(opacity = 40)');
		$("#" + id_visor + "_toolbar .btnFullscreen").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnRotateViewLeft").addClass("buttonUnavailable").css('filter', 'alpha(opacity = 40)');
		$("#" + id_visor + "_toolbar .btnRotateViewRight").addClass("buttonUnavailable").css('filter', 'alpha(opacity = 40)');
		$("#" + id_visor + "_toolbar .btnDelPage").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnAddPage").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnNavigator").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnZoom").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnFullscreen").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnPrint").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', 'disabled');
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', 'disabled');
	} */
	if (va_visores[id_visor].modo == "img"){
		//$("#" + id_visor + "_toolbar .btnFullScreen").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnFullscreen").hide();
		$("#" + id_visor + "_toolbar").removeClass('modoshowAdobeBar');
	}
	if (va_visores[id_visor].modo == "other"){
		$("#" + id_visor + "_toolbar .btnRotateViewLeft").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnRotateViewRight").addClass("buttonUnavailable");
		//$("#" + id_visor + "_toolbar .btnPrint").addClass("buttonUnavailable");
		$("#" + id_visor + "_toolbar .btnSend").addClass("buttonUnavailable");
		/* Deshabilitar button Navigation en caso que no se pueda implementar */
		$("#" + id_visor + "_toolbar .btnFullscreen").hide();
		$("#" + id_visor + "_toolbar").removeClass('modoshowAdobeBar');
	}
	$("#" + id_visor + "_toolbar .btnFullscreen").hide();
	$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('opacity','0.4').css('filter', 'alpha(opacity = 40)');
}


function av_isVisibleToolBar(id_visor){
	if ($("#" + id_visor + "_toolbar").is(":hidden")) {
			return false;
	}
	return true;
}

function av_setVisibleToolBar(id_visor, valor) {
	if (valor) {
		$("#" + id_visor + "_toolbar").show();
	}
	else {
		$("#" + id_visor + "_toolbar").hide();
	}
}

function av_isEnabledToolBar(id_visor) {
	return ($("#" + id_visor + "_toolbar").hasClass("toolbarDisabled"));
}

function av_setEnabledToolBar(id_visor, valor) {
	if (valor) {
		$("#" + id_visor + "_toolbar").removeClass("toolbarDisabled");

		// Ahora la toolbar va a estar habilitada, asique vuelvo a poner la opacidad que tenian los botones deshabilitados
		$("#" + id_visor + "_toolbar .buttonDisabled").removeClass("buttonDisabled").css('filter','');
		$("#" + id_visor + "_toolbar .buttonDisabled2").removeClass("buttonDisabled2").addClass('buttonDisabled').css('filter','alpha(opacity=40)');
		if($("#" + id_visor + "_toolbar .btnNavigator").hasClass('buttonDisabled')){
			$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', true);
		}else{
			$("#" + id_visor + '_toolbar input.btnNavigator').removeAttr('disabled');
		}
		if($("#" + id_visor + "_toolbar .btnZoom").hasClass('buttonDisabled')){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', true);
		}else{
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').removeAttr('disabled');
		}
	
	}
	else {
		$("#" + id_visor + "_toolbar").addClass("toolbarDisabled");
		
		// pongo todos los botones como buttonDisabled, y los que ya lo tienen les pongo buttonDisabled2 para luego dejarlos deshabilitados tambien
		$("#" + id_visor + "_toolbar .buttonDisabled").addClass('buttonDisabled2');
		$("#" + id_visor + "_toolbar .toolBarButton").addClass('buttonDisabled').css('filter','alpha(opacity=40)');
		$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', true);
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', true);

	}
}


function av_isBtnVisible(id_visor, button) {
	if ($("#" + id_visor + "_toolbar ." + button).is(":hidden")) {
			return false;
	}
	return true;
}

function av_setBtnVisible(id_visor, valor, button) {
	if (valor) {
		$("#" + id_visor + "_toolbar ." + button).show();
		if (button=='btnNavigator'){
			$("#" + id_visor + "_toolbar input.btnNavigator").show();
		}
		if (button=='btnZoom'){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').show();
		}
	}
	else {
		$("#" + id_visor + "_toolbar ." + button).hide();
		if (button=='btnNavigator'){
			$("#" + id_visor + "_toolbar input.btnNavigator").hide();
		}
		if (button=='btnZoom'){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').hide();
		}
	}
}

function av_isBtnDisabled(id_visor, button) {
	return ($("#" + id_visor + "_toolbar ." + button).hasClass("buttonDisabled"));
	
}

function av_setBtnDisabled(id_visor, valor, button){

	if (!valor) {
		$("#" + id_visor + "_toolbar ." + button).removeClass("buttonDisabled").css('filter','');
		if (button=='btnNavigator'){
			$("#" + id_visor + "_toolbar input.btnNavigator").removeAttr('disabled');
		}
		if (button=='btnZoom'){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').removeAttr('disabled');
		}
	}
	else {
		$("#" + id_visor + "_toolbar ." + button).addClass("buttonDisabled").css('filter','alpha(opacity=40)');
		if (button=='btnNavigator'){
			$("#" + id_visor + "_toolbar input.btnNavigator").attr('disabled', true);
		}
		if (button=='btnZoom'){
			$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', true);
		}
	}
	
	if($("#" + id_visor + "_toolbar").hasClass('toolbarDisabled')){
		if (!valor) {
			$("#" + id_visor + "_toolbar ." + button).removeClass("buttonDisabled2");
		}else{
			$("#" + id_visor + "_toolbar ." + button).addClass("buttonDisabled2");
		}
	}
	
}


/** 

	Gestion de tira desde la toolbar
	
	Reescritas y renombradas funciones del visor a la ventana
	(Vamos, que esto no es compatible con lo que hay en el visor y por eso tiene hasta distinto nombre)
	
**/
// En la VW es va_addNewDocument, en el visor es vaf_ xq en principio iba a ser de flash
function va_addNewDocument(id_visor, pegarImagenAlGenerar){
	if(typeof id_visor=='object'){
		pegarImagenAlGenerar = id_visor[1];
		id_visor=id_visor[0];
	}
	id_visor = idVisorFix(id_visor);
	/*alert(id_visor);
	alert(typeof id_visor);
	alert(va_visores[id_visor]);
	alert(typeof va_visores[id_visor]);
	alert(va_visores[id_visor].PathImagenCargada);*/
	var idPaginaActual = av_GetSelectedDocument(id_visor);
	var docu = va_getDocumento(id_visor, idPaginaActual);
	var idDocumento = docu.idDoc;
	var idCategoria = docu.Categoria;
	
	if(typeof id_visor=='undefined' || id_visor==null || id_visor==''){
		depura('aniadiendo documento a todos los visores');
		for(visor in va_visores){
			va_addNewDocument(visor);
		}
	}else{
		depura('addNewDocument de ' + id_visor);
		var r_id = generaIdyRutaArchivoTemporalWAS(id_visor, docu);
		var ruta = r_id.ruta;
		var idDoc = r_id.id;
		var Prop = r_id.propiedades;
		va_generarNuevaImagen(id_visor, ruta, function (data, textStatus, jqXHR){
			if(data=='OK'){
				// Handler de que la ha generado correctamente
				var urlImagen = va_visores[id_visor].rutaServletWAS	+ '?na=' + escape(ruta)	+ va_visores[id_visor].parametrosExtraServletWAS;
				av_InsertDocument(id_visor, idDoc, va_literalesValidacion.paginaNueva, urlImagen, ruta,	'remoto', '', idCategoria, null, 'img', Prop, idDocumento);
				// Colocar el documento
				var docins = va_getDocumento(id_visor, idDoc);
							
				
				// Cargar documento nuevo
				av_SelectDocumentByID(id_visor, idDoc);
				av_LoadDocumentByID(id_visor, idDoc, 'img', 'remoto');
				if(av_getActiveTab(id_visor)==0){
					if(_va_PasarAEdicionTrasInsertarPagina){av_DoEdit(id_visor);}
				}
				
				va_jobchanges_nuevaPaginaGenerada(id_visor, docins.id, docins.order, docins.idDoc, docins.Categoria);
				$('#'+id_visor+'_toolbar span.nPages').html("/" + va_documentos[id_visor].length );
				
				ComponenteFlashVW(id_visor).recargarJSON();
				
				if(pegarImagenAlGenerar){
					vaf_pegar(id_visor);
				}
			}else{alert(data);depura(data);}
		});
	}
}

function showMessage(id_visor, message){
	va_setObjectLayer(id_visor, -1);
	$('<div class="ImageViewer_Infow" style="width:350px;height:200px;padding:10px;"><span class="tit">'+message+'</span></div>').dialog({
		title: va_literalesVisor.atencion,
		autoOpen:true,
		buttons: [
			{
				text: va_literalesVisor.cerrar,
				click: function(){
					$(this).dialog('close').dialog('destroy').remove();
				}
			}
		],
		close:function(){
			va_setObjectLayer(id_visor, -2);
		}
	});
}

/**************
	DIALOGO DE PROPIEDADES
	
	id_visor es opcional, si no esta definido coge el primer visor
	propiedades es opcional, 
		si no esta definido coge el documento seleccionado en el visor id_visor
		si es una cadena, coge el documento con id = propiedades, que esté en id_visor o en el primer visor
**********************/

function av_showPropertiesDialog(id_visor, propiedades){
	if(!id_visor){
		for(idVisor in va_visores){
			av_showPropertiesDialog(idVisor, propiedades);
		}
		return;
	}
	if(typeof propiedades=='undefined'){
		if(id_visor){
			var sel = av_GetSelectedDocument(id_visor);
			if(typeof sel=='undefined'){	// puede ser un pdf
				//las properties tienen que salir de va_job, no de va_documentos
				if(va_visores[id_visor].modo=='pdf' || va_visores[id_visor].modo=='zip'){
					
					for(doc in va_job[id_visor]){
						if(va_job[id_visor][doc].id == va_visores[id_visor].ultimoIdDocumentoCargado){
							av_showPropertiesDialog(id_visor, va_job[id_visor][doc].Properties);
							return;
						}
					}
					return;
				}
			}
			var doc= av_GetDocumentByID(id_visor, sel);
			propiedades = doc.Properties;
		}
	}else if(typeof propiedades=='string'){
		if(id_visor){
			var doc= av_GetDocumentByID(id_visor, propiedades);
			if(doc.Properties){
				propiedades = doc.Properties;
			}
			if(typeof propiedades =='string'){
				try{
					if(typeof doc.Properties=='string'){
						doc.Properties=eval("("+doc.Properties+")");//Para recibir ""
					}
				}catch(ex){
					depura('Excepcion al evaluar doc.Properties');
				}
			}
		}
	}

	// Genera el dialogo
	var dialogo = $('<div></div>')
		.addClass('ImageViewer_Infow')
		.hide()
		.css('height','350px')
		.css('width','200px')
		.css('padding','10px')
		.appendTo('body');

	if(typeof propiedades == 'object' && propiedades!=null){
		for(campo in propiedades){
			if(typeof propiedades[campo]=='object'){
				dialogo.append('<span class="tit">'+campo+'</span>&nbsp;&nbsp;<span>'+propiedades[campo][0]+'<span class="infobtn" title="'+propiedades[campo][1]+'"></span></span><br/>');
			}else{
				dialogo.append('<span class="tit">'+campo+'</span>&nbsp;&nbsp;<span>'+propiedades[campo]+'</span><br/>');
			}
		}
	}else{
		dialogo.append('<span class="tit">No hay información acerca del documento</span>&nbsp;&nbsp;<span></span><br/>');
	}

	// Pinta el dialogo
	dialogo.dialog({
		title: va_literalesVisor.propiedades,
		autoOpen:true,
		buttons: [{
			text: va_literalesVisor.cerrar, 
			click: function() {
				$( this ).dialog( "close" ).dialog("destroy").remove();
				va_setObjectLayer(id_visor, -2);
				if(va_visores[id_visor].modo == 'zip'){
					$('#' + id_visor + '_toolbar .btnEdit').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
					$('#' + id_visor + '_toolbar .btnRotateView').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
					$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
				}
			}
		}],
		close:function(){
			va_setObjectLayer(id_visor, -2);
			if(va_visores[id_visor].modo == 'zip'){
				$('#' + id_visor + '_toolbar .btnEdit').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
				$('#' + id_visor + '_toolbar .btnRotateView').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
				$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
			}
		}
	});
	$('.ImageViewer_Infow').css('height', 'auto');
	
	// Oculta el workarea si es necesario
	if(_va_OcultarWorkareaAlMostrardialogo){
		va_setObjectLayer(id_visor, -1);
	}
}
	/*
av_showPropertiesDialog(propiedades){


	si propiedades = undefined (osea, si llaman a la funcion sin argumentos:  av_showPropertiesDialog()  )
		se muestran el dialogo con las propiedades del archivo que hay cargado actualmente en el visor
			
			(ellos podrían haber cambiado las propiedades con una llamada a 
				av_SetDocumentProperties(id_visor, idDocumento, propiedades)
			
			o metiendo las propiedades en el contexto
	
	si propiedades = String, se busca el ID de la pagina y se muestran sus propiedades
	
	si propiedades = [... objeto properties ... ]
		Se muestra el dialogo con las propiedades que le pases, el objeto este es como el que le pasarías a setProperties
		{
			clave: valor,
			clave: valor,
			...
			clave: [valor, tooltip],
			...
		}
		
			
	
}
*//*FIN VentanaValidacion_toolbar.js*/ 
/*INICIO LlamadasExternasVisorNuevo.js*/ 
/** LlamadasExternas.js
 * LLAMADAS EXTERNAS AL VISOR FLASH
 * COMUNICACION CON FLEX, Y CONFIGURACION DEL VISOR
 ***
 * Ejemplo de llamada a flex:
function callFlex(appName){
	if (navigator.appName.indexOf ("Microsoft") !=-1){return window[appName];}
	else{return document[appName];}
}
callFlex('NombreDeApp').funcionPublicaEnElComponenteFlex(argumentos, ...);
Nombre de App es el nombre del proyecto flex! mentira... creo que es el id dentro del codigo html
MaquetaFlex **/

var _vaf_nueva_url_servlet="";
var _vaf_nueva_rutaArchivoWAS="";
var idVisorFix = function (id_visor){
	if(typeof id_visor == 'undefined'){return '';}
	else if(typeof id_visor == 'object' && typeof id_visor[0] != 'undefined'){return id_visor[0];}
	else{return id_visor;}
	return id_visor;
}

function vaf_log(texto){
	depura(texto);
}

function vaf_escanear(){
	alert("Llamando a vaf_escanear...");
}

// Se ejecuta cuando el flash ha recibido correctamente la llamada a modoEdicion(true), y ha activado la edicion
function vaf_edicionActivada(id_visor){
	va_visores[id_visor].modoEdicion=true;
	$("#" + id_visor + "_toolbar .btnZoom").addClass("buttonUnavailable");
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel', 
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').index(
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option:selected')
		));
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq(_va_zoom100por100enCombo).attr('selected','selected');	// 100%
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('disabled', 'disabled');
	
	// deshabilita los botones de rotado de vista
	$('#' + id_visor + '_toolbar .btnRotateView').addClass('buttonUnavailable').css('filter', 'alpha(opacity = 40)');
	if(typeof va_lanzarEvento=='function'){
		va_lanzarEvento(id_visor, 'onEnterEdit');
	}
}

// Se ejecuta cuando el flash ha recibido correctamente la llamada a modoEdicion(false), y ha desactivado la edicion
function vaf_edicionDesactivada(id_visor){
	va_visores[id_visor].modoEdicion=false;
	// Coge del rel el estado anterior
	$("#" + id_visor + '_toolbar select[name="btnZoom"]').children('option').eq($("#" + id_visor + '_toolbar select[name="btnZoom"]').attr('rel')).attr('selected','selected');
	// Le quita la clase buttonUnavailable a todo el zoom
	$("#" + id_visor + "_toolbar .btnZoom").removeClass("buttonUnavailable");
	// activa el combo si no tiene la clase buttonDisabled
	if(!$("#" + id_visor + "_toolbar .btnZoom").hasClass('buttonDisabled')){
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').removeAttr('disabled');
	}
	if(!va_visores[id_visor].modoValidacion){
		// quita la clase buttonUnavailable al rotado de vista
		$('#' + id_visor + '_toolbar .btnRotateView').removeClass('buttonUnavailable').css('filter', '');
	}
	if(typeof va_lanzarEvento=='function'){
		va_lanzarEvento(id_visor, 'onExitEdit');
	}
}

function vaf_isBtnFullScreenVisible(id_visor){
	return va_visores[id_visor].btnFullScreenVisible;
}

function vaf_botonDescargarClick(id_visor){
	id_visor = idVisorFix(id_visor);
	if(id_visor==''){
		depura('descargando de todos los visores');
		for (visor in va_visores){
			if(typeof (va_visores[visor].funcionDescargar) == 'function'){va_visores[visor].funcionDescargar();}
		}
	}else{
		depura('descargando de ' + id_visor);
		if(typeof (va_visores[id_visor].funcionDescargar) == 'function'){va_visores[id_visor].funcionDescargar();}
	}
}
function vaf_pegar(id_visor){
	ComponenteFlash(id_visor).pegar();
}
function vaf_getUrlServlet(id_visor){
	id_visor = idVisorFix(id_visor);
	if(_vaf_nueva_url_servlet !=""){
		return _vaf_nueva_url_servlet;
	}else{
		return _va_URLServletArchivoWAS;
	}
	//return "https://de-escenia.es.igrupobbva/NACAR/qngx_es_web/servlet/ServletArchivo?OPERACION=ADMP110L&LOCALE=es_ES"
	//return "https://de-escenia.es.igrupobbva/NACAR/qngx_es_web/servlet/ServletArchivo?OPERACION=ADMP110L&LOCALE=es_ES"
	//"http://localhost:8101/VisorAvanzado/ServletArchivo";
	//return "http://127.0.0.1:8081/web2/ServletArchivoMP";
	//return "http://localhost:8101/VisorAvanzado/ServletArchivo";
	//return "http://localhost:8081/web2/ServletArchivo";
}

function vaf_puedoEscanear(id_visor){
	id_visor = idVisorFix(id_visor);
	// Llamada al RTO, para saber si es posible escanear, en un navegador no vas a poder
	logea("llamada a vaf_puedoEscanear() que no deberia existir...");
	return false; //por ahora devuelvo false siempre, deshabilita el bot?n
}

function vaf_getCalidadJPG(id_visor){
	return 85;
}

function va_getButtonsState(id_visor){
	return eval('va_states_' + id_visor);
}

function vaf_getRutaArchivoTemporalLocal(id_visor){
	logea("llamada a vaf_getRutaArchivoTemporalLocal() que no deberia existir...");
	return vaf_getRutaArchivoTemporalWAS( LlamadasExternas.idVisor);
}

function vaf_getRutaArchivoTemporalWAS(id_visor){
	id_visor = idVisorFix(id_visor);
	/*alert(id_visor);
	alert(typeof id_visor);
	alert(va_visores[id_visor]);
	alert(typeof va_visores[id_visor]);
	alert(va_visores[id_visor].PathImagenCargada);*/
	if (_vaf_nueva_rutaArchivoWAS !=""){
		return _vaf_nueva_rutaArchivoWAS;
	}
	if(typeof id_visor=='undefined' || id_visor==null || id_visor==''){
		return _va_rutaTemporal + '/r' + Math.floor(Math.random()*100000) + '.jpg';
	}else{
		if(typeof va_visores[id_visor].PathImagenCargada != 'undefined' && va_visores[id_visor].PathImagenCargada!=''){
			return va_visores[id_visor].PathImagenCargada;
		}else{
			var r_id = generaIdyRutaArchivoTemporalWAS(id_visor);
			return r_id.ruta;
		}
	}
}

function generaIdyRutaArchivoTemporalWAS(id_visor, modelo){
	id_visor = idVisorFix(id_visor);
	/*alert(id_visor);
	alert(typeof id_visor);
	alert(va_visores[id_visor]);
	alert(typeof va_visores[id_visor]);
	alert(va_visores[id_visor].PathImagenCargada);*/
	var ruta = va_visores[id_visor].rutaTemporalWAS;
	var idPag;
	var PropiedadesXDefecto = null;
	var cadenaUnica = (new Date()).getTime() + "r" + Math.floor(Math.random()*100000);
	if(modelo) {
		ruta = modelo.Path.substr(0, modelo.Path.lastIndexOf(va_visores[id_visor].separadorRutasWAS) + 1);
		idPag = modelo.id + "_new" + cadenaUnica;
	}else{
		for(doci in va_documentos[id_visor]){
			var doc = va_documentos[id_visor][doci];
			if(typeof doc.Path != 'undefined' && doc.Path != ''){
				if(doc.Path.lastIndexOf(va_visores[id_visor].separadorRutasWAS) != -1){
					ruta = doc.Path.substr(0, doc.Path.lastIndexOf(va_visores[id_visor].separadorRutasWAS) + 1);
					idPag = doc.id + "_" + cadenaUnica;
					// propiedades de las paginas nuevas:
					if((typeof doc.Properties!='undefined') && doc.Properties!=null){
					}
				}
			}
		}
	}
	ruta = ruta + 'newPage' + cadenaUnica + '.jpg';
	return {'ruta': ruta, 'id': idPag, 'propiedades': PropiedadesXDefecto};
}

// SOLO VALIDO PARA VISOR, PARA EVITAR CONFLICTOS SE DEJA AQUI, 
// PERO YA, NI ES VAF_, ni hace lo que hace aqui
function vaf_addNewDocument(id_visor){
	id_visor = idVisorFix(id_visor);
	/*alert(id_visor);
	alert(typeof id_visor);
	alert(va_visores[id_visor]);
	alert(typeof va_visores[id_visor]);
	alert(va_visores[id_visor].PathImagenCargada);*/
	var idDocumento = va_getDocumento(id_visor, av_GetSelectedDocument(id_visor)).idDoc;
	if(typeof id_visor=='undefined' || id_visor==null || id_visor==''){
		depura('aniadiendo documento a todos los visores');
		for(visor in va_visores){
			vaf_addNewDocument(visor);
		}
	}else{
		depura('addNewDocument de ' + id_visor);
		var r_id = generaIdyRutaArchivoTemporalWAS(id_visor);
		var ruta = r_id.ruta;
		var idDoc = r_id.id;
		var Prop = r_id.propiedades;
		va_generarNuevaImagen(id_visor, ruta, function (data, textStatus, jqXHR){
			if(data=='OK!' || true){ // <<< TODO: QUITA ESTE TRUE, ... se salta cualquier error al generar!!
				// Handler de que la ha generado correctamente
				var urlImagen = va_visores[id_visor].rutaServletWAS	+ '?na=' + escape(ruta)	+ va_visores[id_visor].parametrosExtraServletWAS;
				av_InsertDocument(id_visor, idDoc, 'Página nueva', urlImagen, ruta,	'remoto', '', -1, null, 'img', Prop, idDocumento);
				// Colocar el documento
				var docins = va_getDocumento(id_visor, idDoc);
				var li = va_getLastSelectedItem(id_visor);
				// Misma categoria que el que habia seleccionado
				var iddoc_anterior = va_LiId2DocumentId(id_visor, li.id);
				if(iddoc_anterior!=''){
					docant = va_getDocumento(id_visor, iddoc_anterior);
					av_SetCategoryOfDocument(id_visor, idDoc, docant.Categoria, docant.CategoriaNombre);
				}
				// Colocado a continuacion que el que habia seleccionado
				if(li){$('#' + docins.idLi).insertAfter(li);}
				// Cargar documento nuevo
				av_SelectDocumentByID(id_visor, idDoc);
				av_LoadDocumentByID(id_visor, idDoc, 'img', 'remoto');
				if(_va_PasarAEdicionTrasInsertarPagina){av_DoEdit(id_visor);}
			}else{depura(data);}
		});
	}
}

function vaf_getDocumentos(id_visor){
	return va_documentos[id_visor];
}

function vaf_refreshImage(id_visor, PathImagen){
	if(typeof id_visor == 'object'){
		PathImagen = id_visor[1];
		id_visor = id_visor[0];
	}
	if(id_visor==''){
		depura('refreshImage de todos los visores');
		for(visor in va_visores){
			vaf_refreshImage(visor, PathImagen);
		}
	}else{
		depura('refreshImage '+PathImagen+' de ' + id_visor);
		for(doci in va_documentos[id_visor]){
			if(typeof va_documentos[id_visor][doci].Path !='undefined' && va_documentos[id_visor][doci].Path == PathImagen){
				var urlImagen = va_visores[id_visor].rutaServletWAS + '?na=' + escape(PathImagen) + va_visores[id_visor].parametrosExtraServletWAS + "&ran=" + Math.floor(Math.random()*100000);
				if(typeof va_documentos[id_visor][doci].Uri =='undefined'){
					va_documentos[id_visor][doci].Uri = urlImagen;
				}
				else{
					var url = va_documentos[id_visor][doci].Uri;
					if(url.indexOf('ran=') !=-1){
						if(url.indexOf('&', url.indexOf('ran=')+1) !=-1){url = url.substr(0,url.indexOf('ran=') + 4) + Math.floor(Math.random()*100000) + url.substr(url.indexOf('&', url.indexOf('ran=')+1));}
						else{url = url.substr(0,url.indexOf('ran=') + 4) + Math.floor(Math.random()*100000);}
					}else{
						if(url.indexOf('?') !=-1){url+="&ran=" + Math.floor(Math.random()*100000);}
						else{url+="?ran=" + Math.floor(Math.random()*100000);}
					}
					va_documentos[id_visor][doci].Uri = url;
					urlImagen=url;
				}
				
				if(typeof va_documentos[id_visor][doci].idFilaTT!='undefined'){
					$('#' +id_visor +"_fila-" + va_documentos[id_visor][doci].idFilaTT + ' img').attr('src', urlImagen);
				}
				
				// TODO: quitar esta linea, es para la tira antigua:
				if(typeof va_documentos[id_visor][doci].idLi!='undefined'){
					$('#' + va_documentos[id_visor][doci].idLi + ' img').attr('src', urlImagen);
				}
				return urlImagen;
			}
		}
	}
}

/**	Combo de zooms: **/
function vaf_textOtrosZooms(id_visor){
	if(va_visores[id_visor].prev_selzoom_restored){
		var sel = $("#" + id_visor + '_toolbar select[name="btnZoom"]');
		if(sel.length>0){
			var x=sel[0];
			va_visores[id_visor].prev_selzoom_index = x.selectedIndex;
			va_visores[id_visor].prev_selzoom = x.options[x.selectedIndex].text;
			va_visores[id_visor].prev_selzoom_value = x.options[x.selectedIndex].value;
			x.options[x.selectedIndex].text = va_literalesValidacion.personalizado;
			va_visores[id_visor].prev_selzoom_restored = false;
		}
	}
}

function vaf_quitaOtrosZooms(id_visor, valor){
	if(va_visores[id_visor].prev_selzoom_restored == false){
		var sel = $("#" + id_visor + '_toolbar select[name="btnZoom"]');
		if(sel.length>0){
			var x=sel[0];
			x.selectedIndex = va_visores[id_visor].prev_selzoom_index;
			x.options[x.selectedIndex].text = va_visores[id_visor].prev_selzoom;
			if(va_visores[id_visor].prev_selzoom_value != -1){
				$("#" + id_visor + '_toolbar select[name="btnZoom"]').val(va_visores[id_visor].prev_selzoom_value);
				ComponenteFlash(id_visor).setZoom(va_visores[id_visor].prev_selzoom_value);
			}
			va_visores[id_visor].prev_selzoom_restored = true;
		}
	}
	if(typeof valor!='undefined'){
		$("#" + id_visor + '_toolbar select[name="btnZoom"]').val(valor);
		ComponenteFlash(id_visor).setZoom(valor);
	}
}

/** Llamadas al componente flash! **/
var vaf_almacenLlamadas = [];
var llamadasAlFlashPendientes = {};
var ComponenteFlash = function(id_visor){
	return {getFlexApp:	function(movieName){
			/*if(navigator.appName.indexOf("Microsoft") != -1){return window[appName];}
			else{return document[appName];}*/
			if(navigator.appName.indexOf("Microsoft") != -1){return window[movieName];}
			else{
				if(document[movieName].length != undefined){return document[movieName][1];}
				return document[movieName];
			}
		},
		setUrlImagen : function(url, zoom){
			//this.getFlexApp('EditorFlex').setUrlImagen(url);
			//this.setUrlImagen0(url);
			//llamaAlFlash('setUrlImagen', url);
			if(typeof zoom=='undefined'){
				llamaAlFlash(id_visor,'setUrlImagen', url);
			}else{
				llamaAlFlash(id_visor,'setUrlImagenZoom', [url, zoom]);
			}
		},
		switchFullScreen : function (){llamaAlFlash(id_visor,'switchFullScreen');},
		EditMode : function (estado, callbackjs){
			if(typeof callbackjs == 'undefined'){llamaAlFlash(id_visor,'EditMode', estado);}
			else{llamaAlFlash(id_visor,'EditModeCB', [estado, callbackjs]);}
		},
		toggleEditMode: function(){llamaAlFlash(id_visor,'toggleEditMode');},
		setZoom: function(zoom){
			llamaAlFlash(id_visor,'setZoom', zoom);
			if($('#' + id_visor + '_validacion').length > 0 ){
				ComponenteFlashVW(id_visor).setZoom(zoom);
			} //si hay ventana de validacion
		},
		pegar:function(){
			llamaAlFlash(id_visor,'pasteFromJS');
		},
		printDialog: function(){llamaAlFlash(id_visor,'printDialog');},
		rotateRight: function(){llamaAlFlash(id_visor,'rotateRight');},
		rotateLeft: function(){llamaAlFlash(id_visor,'rotateLeft');},
		llamadaarbitraria: function(funcion, argumentos){llamaAlFlash(id_visor, funcion, argumentos);},
		addMouseMoveToStage: function(){llamaAlFlash(id_visor,'addMouseMoveToStage');},
		removeMouseMoveFromStage: function(){llamaAlFlash(id_visor,'removeMouseMoveFromStage');}
	};
}

function llamaAlFlash(id_visor,funcion, args){
	var llamadas = llamadasAlFlashPendientes[id_visor];
	if(typeof llamadas !='object'){llamadas = llamadasAlFlashPendientes[id_visor] = [];}
	llamadas[llamadas.length] = {nombreFuncion : funcion, argumentos : args};
}

//Esta funcion es llamada periodicamente por el flash para obtener las llamadas al visor
function getCallsToFlash(idVisor){
	var llamadas = llamadasAlFlashPendientes[idVisor];
	if(llamadas.length){
		var ll = llamadas.splice(0,1);
		return ll[0];
		/*var ll = llamadas[0]; //guardo la referencia a la funcion que estoy a punto de llamar
		//copio el resto del array para borrar la primera posicion
		var nuevoLlamadas = new Array();
		for(var j = 1;j <llamadas.length; j++){
			nuevoLlamadas[j-1] = llamadas[j];
		}
		llamadasAlFlashPendientes[idVisor] = null;
		llamadasAlFlashPendientes[idVisor]  = nuevoLlamadas;
		return ll;*/
	}
	return null; //no hay llamadas pendientes
}

function vaf_esperaLlamada(funcion){
	/*var almacen = llamadasAlFlashPendientes[id_visor];
	if(typeof llamadas !='object'){llamadas = llamadasAlFlashPendientes[id_visor] = [];}*/
	var r = vaf_almacenLlamadas.length;
	vaf_almacenLlamadas[r] = funcion;
	return r;
}

function vaf_llamadaPendiente(parametros_id, id_visor, args){
	var id = parametros_id;
	if(typeof parametros_id=='object' && parametros_id.length){
		id=parametros_id[0];
		id_visor = parametros_id[1];
		args = parametros_id[2];
	}
	var ll = vaf_almacenLlamadas[id];
	vaf_borrallamadaPendiente(id);
	if(ll && (typeof ll=='function')){ll(id_visor, args);}
	return (function (){});
}



function vaf_llamadaPendiente3parametros(parametros){
	//parametros[0] = id; parametros[1] = id_visor; parametros[2] = args
	var ll = vaf_almacenLlamadas[parametros[0]];
	vaf_borrallamadaPendiente(parametros[0]);
	if(ll && (typeof ll=='function')){ll(parametros[1], parametros[2]);}
	return (function (){});
}

function vaf_borrallamadaPendiente(id){vaf_almacenLlamadas[id]=false;}

/**	getFlashVersion()
	devuelve la version actual de flashplayer
	por lo general una cadena de la forma "10,2,30" **/
function getFlashVersion(){
	try{
		try{
			var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
			try{
				axo.AllowScriptAccess = 'always';
			}catch(e){
				return '6,0,0';
			}
		}catch(e){}
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	}catch(e){
		try{
			if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
				return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
			}
		}catch(e){}
	}
	return 'No disponible';
}

/*FIN LlamadasExternasVisorNuevo.js*/ 
/*INICIO LlamadasExternasValidacion.js*/ 
/** LlamadasExternasValidacion.js
 * LLAMADAS EXTERNAS AL VISOR FLASH
 * COMUNICACION CON FLEX, Y CONFIGURACION DEL VISOR
******
llamadas  flash > javascript **/

function va_getDocumentos(id_visor){
	return va_job[id_visor];
}

function va_getCabecera(id_visor){
	return va_jobinfo[id_visor].xmlheader;
}

function va_getPie(id_visor){
	return va_jobinfo[id_visor].xmlfooter;
}

function va_getJobId(id_visor){
	return va_jobinfo[id_visor].jobid;
}

function va_getLiteralesVisor(){
	return va_literalesVisor;
}

function va_getLiteralesValidacion(){
	return va_literalesValidacion;
}

function vaf_getOutputXmlPath(id_visor){
	id_visor = idVisorFix(id_visor);
	return va_visores[id_visor].outputXmlPath;
}

function av_setOutputXmlPath(id_visor, path){
	va_visores[id_visor].outputXmlPath = path;
}

function vaf_setFieldValue(id_visor, id_pagina, newField){
	if(typeof id_visor == 'object'){
		id_pagina = id_visor[1];
		newField = id_visor[2];
		id_visor = id_visor[0];
	}
	var doc = va_getDocumento(id_visor, id_pagina);
	if(doc != null && typeof doc.fields != 'undefined' && typeof doc.fields.length){
		for(var i =0; i<doc.fields.length;i++){
			if(typeof doc.fields[i].id != 'undefined' && doc.fields[i].id == newField.id){
				doc.fields[i] = newField;
				return;
			}
		}
	}
}

function vaf_updateState(parametros){
	var id_visor = parametros[0];
	var id_pagina = parametros[1];
	var state = parametros[2];
	if(state){
		av_changePageState(id_visor, id_pagina, 'OK');
	}else{
		av_changePageState(id_visor, id_pagina, 'REVIEW');
	}
}

function vaf_enableReprocessButton(id_visor){
	id_visor = idVisorFix(id_visor);
	$('#' + id_visor + '_toolbar .btnReprocess').removeClass('buttonUnavailable').css('filter', '');
	va_visores[id_visor].fieldSelected = true;
}

function vaf_disableReprocessButton(id_visor){
	id_visor = idVisorFix(id_visor);
	$('#' + id_visor + '_toolbar .btnReprocess').addClass('buttonUnavailable').css('opacity','0.4').css('filter', 'alpha(opacity = 40)');
	va_visores[id_visor].fieldSelected = false;
}

function vaf_getWidthPreviewArea(id_visor){
	id_visor = idVisorFix(id_visor);
	return va_visores[id_visor].widthPreviewArea ? va_visores[id_visor].widthPreviewArea : '';
}

function vaf_getWidthClassArea(id_visor){
	id_visor = idVisorFix(id_visor);
	return va_visores[id_visor].widthClassArea ? va_visores[id_visor].widthClassArea : '';
}

function vaf_getActualCoordinates(id_visor, callback){
	var id_llamada_pendiente = vaf_esperaLlamada(callback);
	ComponenteFlashVW(id_visor).getActualCoordinates(id_llamada_pendiente);
}

function vaf_setValidationImageLoaded(params){
	va_visores[params[0]].validationImageLoaded = params[1];
}

/**
	Quien reprocesa el recorte:
	
	1  -> la arquitectura NACAR
	
	0 o undefined (o cualquier otra cosa)  el servlet de AT
	
*/
var _va_Servicio_de_reprocesado_de_recortes=1;



function vaf_peticionProcesarRecorte(params) {
	var id_visor= params[0];
	var parametros = params[1];
	if(_va_Servicio_de_reprocesado_de_recortes==1){
		setParametrosEntrada("OPERACION","KJID0500");
		setParametrosEntrada("PAR_INICIO.ALTO_RECORTE", parametros.height);
		setParametrosEntrada("PAR_INICIO.ANCHO_RECORTE", parametros.width);
		setParametrosEntrada("PAR_INICIO.ID_DOCUMENTO", parametros.idDocument);
		setParametrosEntrada("PAR_INICIO.ID_LOTE_OCR", parametros.idJob);
		setParametrosEntrada("PAR_INICIO.ID_PAGINA", parametros.idPage);
		setParametrosEntrada("PAR_INICIO.POSICION_X", parametros.x);
		setParametrosEntrada("PAR_INICIO.POSICION_Y", parametros.y);

		if(typeof dir_base =='undefined'){
			dir_base = "";
		}
		if(typeof aplicacion =='undefined'){
			aplicacion = "kjid_es_web";
		}
		if(typeof metodoFormu =='undefined'){
			metodoFormu = "POST";
		}
		

		
		ejecutarOperacionNACAR('ingeniotech',
				function(control,data){
					var cadenaXML = '';
					if (window.ActiveXObject){
						// IE..
						cadenaXML = data.xml;
					}else{
						// Navegadores de verdad
						cadenaXML = (new XMLSerializer()).serializeToString(data);
					}
					ComponenteFlashVW(id_visor).procesadoRecorte(cadenaXML);
				},'kjid_es_web',false,false);

	
	}else{
		//var cadenaFija = "<FIELD><FIELD_ID>SField5<\/FIELD_ID><FIELD_NAME>Nombre y apellidos<\/FIELD_NAME><FIELD_VALUE>JULIO HERN?NDEZ L?PEZ<\/FIELD_VALUE><FIELD_TYPE>STRING<\/FIELD_TYPE><FIELD_FORMAT/><FIELD_CONFIDENCE>90<\/FIELD_CONFIDENCE><FIELD_COORDINATES><X>894<\/X><Y>852<\/Y><WIDTH>474<\/WIDTH><HEIGHT>57<\/HEIGHT><\/FIELD_COORDINATES><FIELD_STATUS><STATUS_VALUE>00<\/STATUS_VALUE><STATUS_INFO>Campo Correcto<\/STATUS_INFO><\/FIELD_STATUS><FIELD_STATUS_PEGA><STATUS_VALUE>00<\/STATUS_VALUE><STATUS_INFO>Campo Correcto<\/STATUS_INFO><\/FIELD_STATUS_PEGA><READ_ONLY>false<\/READ_ONLY><HIDDEN>false<\/HIDDEN><\/FIELD>";
		var parametrosStr = "{'idLote':'" + parametros.idJob + "'," +
				"'idPagina':'" + parametros.idPage + "'," +
				"'idDocumento':'" + parametros.idDocument + "'," +
				"'x':'" + parametros.x + "'," +
				"'y':'" + parametros.y + "'," +
				"'height':'" + parametros.height + "'," +
				"'width':'" + parametros.width + "'}";
		$.ajax({
			data: "operacion={'operacion':'procesarRecorteFromImagen'}&parametros=" + parametrosStr,
			type: "GET",
			dataType: "json",
			url: _va_UrlServletProcesarRecortes,
			success: function(respuesta){
				ComponenteFlashVW(id_visor).procesadoRecorte(respuesta.DATO_RECORTE);
				//ComponenteFlashVW(id_visor).procesadoRecorte(cadenaFija);
			},
			error: function(result){alert('ERROR AL REPROCESAR RECORTE: ' + result.status + ' ' + result.statusText);}
		});
	}
}

/*function av_getValidationLogXML(id_visor, callback){
	if(typeof callback!='undefined'){
		var id_llamada_pendiente = vaf_esperaLlamada(callback);
		ComponenteFlashVW(id_visor).getValidationLogXML(id_llamada_pendiente);
	}else{
		ComponenteFlashVW(id_visor).uploadOutputXMLLogs();
	}
}*/

function av_uploadOutputXML(id_visor, callback){
	var cb = vaf_esperaLlamada(callback);
	ComponenteFlashVW(id_visor).uploadOutputXML(cb);
}

function av_getOutputXML(id_visor, callback){
	ComponenteFlashVW(id_visor).getOutputXML(vaf_esperaLlamada(callback));
}

/** Llamadas javascript >> flash **/
/** La antigua llamada a flex se hac?a as?:
	 function callFlex(appName){
		if (navigator.appName.indexOf ("Microsoft") !=-1){return window[appName];}
		else{return document[appName];}
	}
	callFlex('NombreDeApp').funcionPublicaEnElComponenteFlex(argumentos, ...);
	NombreDeApp es el id dentro del codigo html
	pero esto no funciona en firefox **/
var llamadasAlFlashPendientesVW = {};
var ComponenteFlashVW = function(id_visor){
	return {
		getFlexApp:	function(movieName){
			/*if(navigator.appName.indexOf ("Microsoft") !=-1){return window[appName];}
			else{return document[appName];}*/
			if(navigator.appName.indexOf("Microsoft") != -1){
				return window[movieName];
			}else{
				if(document[movieName].length != undefined){return document[movieName][1];}
				return document[movieName];
			}
		},
		setUrlImagen : function(url){
			llamaAlFlashVW(id_visor,'setUrlImagen', url);
		},
		setZoom : function(zoom){
			if(va_visores[id_visor].fieldSelected || va_visores[id_visor].ultimaCapaVisible == 4){
				llamaAlFlashVW(id_visor,'setZoom', zoom);
			}
		},
		reprocesarRecorte : function(){
			va_cortinillaVisor(id_visor,true);
			llamaAlFlashVW(id_visor,'reprocesarRecorte');
		},
		procesadoRecorte : function(xmlstring){
			va_cortinillaVisor(id_visor,false);
			llamaAlFlashVW(id_visor,'procesadoRecorte', xmlstring);
		},
		uploadOutputXML:function(idCallback){llamaAlFlashVW(id_visor, 'uploadXML', idCallback);},
		uploadOutputXMLLogs:function(){llamaAlFlashVW(id_visor, 'uploadXMLLogs');},
		getOutputXML:function(idCallback){llamaAlFlashVW(id_visor, 'getOutputXML', idCallback);},
		getValidationLogXML:function(idCallback){llamaAlFlashVW(id_visor, 'getXMLLogsContent', idCallback);},
		updatePreview:function(){
			llamaAlFlashVW(id_visor,'updatePreview');
		},
		getActualCoordinates:function(idCallback){llamaAlFlashVW(id_visor,'getActualCoordinates', idCallback);},
		recargarJSON:function(){llamaAlFlashVW(id_visor,'recargarJSON');}
	};
};

function llamaAlFlashVW(id_visor,funcion, args){
	var llamadas = llamadasAlFlashPendientesVW[id_visor];
	if(typeof llamadas !='object'){
		llamadas = llamadasAlFlashPendientesVW[id_visor] = [];
	}
	llamadas[llamadas.length] = {nombreFuncion : funcion, argumentos : args};
}

/** Esta funcion es llamada periodicamente por el flash para obtener las llamadas al visor **/
function getCallsToValidationWindow(idVisor){
	var llamadas = llamadasAlFlashPendientesVW[idVisor];
	if(llamadas.length){
		var ll = llamadas[0]; //guardo la referencia a la funcion que estoy a punto de llamar
		// copio el resto del array para borrar la primera posicion
		var nuevoLlamadas = new Array();
		for(var j = 1;j <llamadas.length; j++){
			nuevoLlamadas[j-1] = llamadas[j];
		}
		llamadasAlFlashPendientesVW[idVisor] = null;
		llamadasAlFlashPendientesVW[idVisor]  = nuevoLlamadas;
		//devuelvo la funcion a la que quiero llamar
		return ll;
	}
	return null; //no hay llamadas pendientes
}/*FIN LlamadasExternasValidacion.js*/ 
/*FIN APIViewerValidationWindow.js*/ 
