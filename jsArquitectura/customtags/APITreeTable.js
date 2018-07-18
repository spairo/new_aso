/*******************************************************************************************************/
/***********************************CUSTOM TAG TREE TABLE***********************************************/
/*******************************************************************************************************/
var pilaTreeTable={}; //Variable global para el evento onclick definido por el usuario sobre los iconos de expandir/contraer filas
/*******************************************************************************************************
* Función checkSelectionTreeTable:
Precondiciones: recibe el id_table y un vector con las posiciones de las filas a seleccionar.
Postcondiciones: devuelve las posiciones seleccionadas en los check de las filas correspondientes.
******************************************************************************************************/
function checkSelectionTreeTable(id_table, v){
	var check=true;
	var inputs;
	if(document.getElementById(id_table).getElementsByTagName("tbody").length>0)
		inputs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName('input');
	for(i=0; i<v.length; i++) //Recorremos el vector
		if(document.getElementById(getRowIdTreeTable(id_table,v[i]))!=null)//Si existe la fila
			document.getElementById(getRowIdTreeTable(id_table,v[i])).getElementsByTagName("input")[0].checked=true; //Marcamos el check	
	for(i=0; i<numRowsTreeTable(id_table); i++)//Recorremos todas las filas de la tabla
		if(inputs[i].checked=='')
			check=false;		
	//Seleccionamos el check de la cabecera si están todos los checks seleccionados			
	if(check==true && document.getElementById(id_table+"_head").getElementsByTagName("input")[0]!=undefined)
		document.getElementById(id_table+"_head").getElementsByTagName("input")[0].checked=true;
}

/******************************************************************************************************
* Función uncheckSelectionTreeTable:
Precondiciones: recibe el id_table y un vector con las posiciones de las filas a deseleccionar.
Postcondiciones: devuelve las posiciones deseleccionadas en los check de las filas correspondientes.
******************************************************************************************************/
function uncheckSelectionTreeTable(id_table, v){
	var check=false;
	var inputs;
	if(document.getElementById(id_table).getElementsByTagName("tbody").length>0)
		inputs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName('input');
	for(i=0; i<v.length; i++) //Recorremos el vector
		if(document.getElementById(getRowIdTreeTable(id_table,v[i]))!=null)//Si existe la fila
			document.getElementById(getRowIdTreeTable(id_table,v[i])).getElementsByTagName("input")[0].checked=false; //Desmarcamos el check
	for(i=0; i<numRowsTreeTable(id_table); i++)//Recorremos todas las filas de la tabla
		if(inputs[i].checked=='checked')
			check=true;	
	//Deseleccionamos el check de la cabecera si están todos los checks deseleccionados					
	if(check==false && document.getElementById(id_table+"_head").getElementsByTagName("input")[0]!=undefined)
		document.getElementById(id_table+"_head").getElementsByTagName("input")[0].checked=false;
}

/******************************************************************************************************
* Función getSelectedRowTreeTable:
Precondiciones: recibe el id de la tabla.
Postcondiciones: devuelve un vector con las posiciones de las filas seleccionadas.
******************************************************************************************************/
function getSelectedRowTreeTable(id_table){
	var v=new Array(); //Creamos un vector
	var posicion_vector=0; //Inicializamos la posición del vector donde insertar los elementos
	var num_filas=numRowsTreeTable(id_table); //Guardamos el número de filas de la tabla
	var check;
	for(var i=0; i<num_filas; i++){ //Recorremos las filas
		check = document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("input")[i].checked;
		if (check){ //Si el check está marcado 
			v[posicion_vector]=i+1; //Guardamos la posición de la fila (numerada desde 1 hasta n) en el vector
			posicion_vector=posicion_vector+1; //Aumentamos la posición del vector donde insertar
		}
	}
	return v;
}

/******************************************************************************************************
* Función getRowIdTreeTable:
Precondiciones: recibe el id de la tabla, y la posición de la fila.
Postcondiciones: devuelve el id de la fila.
******************************************************************************************************/
function getRowIdTreeTable(id_table, pos_row){
	if(pos_row>numRowsTreeTable(id_table)) //Si la posición de la fila es mayor que el número de filas de la tabla, devolvemos null
		return null;
	else
		return document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].id; //Devolvemos el atributo id de la fila número pos_row de la tabla id_table
}

/******************************************************************************************************
* Función selectAllTreeTable:
Precondiciones: recibe el id de la tabla
Postcondiciones: selecciona todas las casillas si hay alguna sin seleccionar, o deselecciona todas las casillas si están todas seleccionadas. 
******************************************************************************************************/
function selectAllTreeTable(id_table){
	var check=true; //todos seleccionados
	var num_filas=numRowsTreeTable(id_table); //Guardamos el número de filas de la tabla
	var inputs;
	if(document.getElementById(id_table).getElementsByTagName("tbody").length>0)
		inputs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName('input');
	if($("#"+id_table+" input").attr("type")=="checkbox"){
		for(i=0; i<num_filas; i++)//Recorremos todas las filas de la tabla
			if(inputs[i].checked=='' && inputs[i].disabled==false) //Recorremos desde 1 hasta n para no comprobar el input de la cabecera
				check=false;			
		if(!check){
			for(var i=0; i<numRowsTreeTable(id_table);i++)
				if(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("input")[i].disabled==false)
					document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("input")[i].checked=true; //Seleccionamos todos los checks
			if(document.getElementById(id_table+"_head").getElementsByTagName("input")[0]!=undefined)
				document.getElementById(id_table+"_head").getElementsByTagName("input")[0].checked=true;
		}else{
			for(var i=0; i<numRowsTreeTable(id_table);i++)
				if(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("input")[i].disabled==false)
						document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("input")[i].checked=false; //Deseleccionamos todos los checks
			if(document.getElementById(id_table+"_head").getElementsByTagName("input")[0]!=undefined)
				document.getElementById(id_table+"_head").getElementsByTagName("input")[0].checked=false;
		}
	}
}

/******************************************************************************************************
* Función getCellValueTreeTable:
Precondiciones: recibe el id de la tabla, la posición de la fila y la posición de la columna donde se encuentra la celda.
Postcondiciones: devuelve el valor de la celda en dicha posición.
******************************************************************************************************/
function getCellValueTreeTable(id_table, pos_row, pos_column){
	if(pos_row>numRowsTreeTable(id_table) || pos_column>numColumnsTreeTable(id_table) || pos_row<1 || pos_column<1)
		return null;
	else{
		pos_row=pos_row-1;
		pos_column=pos_column-1;
		if(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row].getElementsByTagName("td")[pos_column].getElementsByTagName("span").length==0)//Si no hay span (en columnas template)
			return document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row].getElementsByTagName("td")[pos_column].innerHTML;
		else
			if(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row].getElementsByTagName("td")[pos_column].getElementsByTagName("span")[0].getElementsByTagName("span").length>0)//Hay dos span
				return document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row].getElementsByTagName("td")[pos_column].getElementsByTagName("span")[0].getElementsByTagName("span")[0].innerHTML; //Devolvemos el html del segundo span
			else
				return document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row].getElementsByTagName("td")[pos_column].getElementsByTagName("span")[0].innerHTML; //Devolvemos el valor de la celda con posición de fila pos_row y posición de columna pos_column.
	}
}

/******************************************************************************************************
* Función getRowDataTreeTable:
Precondiciones: recibe el id de la tabla y la posición de la fila.
Postcondiciones: devuelve los valores de todos los campos de la fila pos_row.
******************************************************************************************************/
function getRowDataTreeTable(id_table, pos_row){
	if(pos_row>numRowsTreeTable(id_table) || pos_row<1)
		return null;
	else{
		var v=new Array(); //Creamos un nuevo vector
		var num_columnas=numColumnsTreeTable(id_table); //Guardamos el número de columnas de la fila pos_row
		for(i=0; i<num_columnas; i++)
			v[i]=getCellValueTreeTable(id_table,pos_row,i+1);
		return v; //Devolvemos el vector.
	}
}

/******************************************************************************************************
* Función getCellIdTreeTable:
Precondiciones: recibe el id de la tabla, la posición de la fila y la posición de la columna donde se encuentra la celda.
Postcondiciones: devuelve el id de la celda en dicha posición.
******************************************************************************************************/
function getCellIdTreeTable(id_table, pos_row, pos_column){
	if(pos_row>numRowsTreeTable(id_table) || pos_column>numColumnsTreeTable(id_table) || pos_row<1 || pos_column<1)
		return null;
	else{
		var id_cell="";
		var celda=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1].id;
		if(celda==undefined)
			id_cell=null;
		else
			id_cell=celda;
		return id_cell; //Devolvemos el id de la celda con posición de fila pos_row y posición de columna pos_column.
	}
}

/******************************************************************************************************
* Función updateCellSelectionTreeTable:
Precondiciones:
Postcondiciones:
******************************************************************************************************/
function updateCellSelectionTreeTable(id_table, pos_row, pos_column, text, checked, enabled){
	if(!(pos_row>numRowsTreeTable(id_table) || pos_column>numColumnsTreeTable(id_table) || pos_row<1 || pos_column<1)){
		var celda_span=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1].getElementsByTagName("span")[0];
		var celda_input=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1].getElementsByTagName('input')[0];
		var html_etiquetas=celda_span.innerHTML;
		var html="";
		var i;
		if(text!=null){
			for(i=0; html_etiquetas.charAt(i-1)!=">"; i++)
				html=html+html_etiquetas.charAt(i); //Guardamos el html antes del texto
			celda_span.innerHTML=(html+" "+text);
		}
		if(checked!=null){
			if(checked=='T' || checked=='t')
				celda_input.checked='checked';
			else
				celda_input.checked='';
		}
		if(enabled!=null){
			if(enabled=='T' || enabled=='t')
				celda_input.disabled='';
			else
				celda_input.disabled='disabled';
		}
		checkSizeTreeTable(id_table,pos_row,pos_column);
		var id=getRowIdTreeTable(id_table,pos_row,pos_column);
		var cadena_num=getCodPkTreeTable(id_table,id);
		updateContextSelectionTreeTable(id_table,cadena_num, pos_column, text, checked, enabled);
	}
}

/******************************************************************************************************
* Función updateCellBoundTreeTable:
Precondiciones:
Postcondiciones:
******************************************************************************************************/
function updateCellBoundTreeTable(id_table, pos_row, pos_column, text, href, src,title){
	if(!(pos_row>numRowsTreeTable(id_table) || pos_column>numColumnsTreeTable(id_table) || pos_row<1 || pos_column<1)){
		var celda_td=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1];
		var html_etiquetas=celda_td.getElementsByTagName("span")[0].innerHTML;
		var html;
		var i;
		var j;
		var pos;
		
		var cambiaTexto = false;
		
		// funcion para comprobar si un texto está vacio
		var isText = function (text){
			return (typeof text!='undefined' && text != null && text != '' && text!='undefined');
		};
		
		//Configuramos el texto
		if(!isText(text)){
			html="";
			if(celda_td.getElementsByTagName("a").length>0)
				text=celda_td.getElementsByTagName("a")[0].innerHTML;
			else
				if(celda_td.getElementsByTagName("p").length>0)
					text=celda_td.getElementsByTagName("p")[0].innerHTML;
				else
					text="";
		}else{
			cambiaTexto = true;
		}
		//Configuramos el enlace
		//html_etiquetas=celda_td.getElementsByTagName("span")[0].innerHTML;
		if(!isText(href)){
			if(celda_td.getElementsByTagName("a").length>0)
				href=celda_td.getElementsByTagName("a")[0].href;
			else
				href='';
		}
		//Configuramos la imagen
		//html_etiquetas=celda_td.getElementsByTagName("span")[0].innerHTML;
		if(!isText(src)){
			if(html_etiquetas.indexOf('<img')!=-1 || html_etiquetas.indexOf('<IMG')!=-1)
				src=celda_td.getElementsByTagName("img")[0].src;
			else
				src='';
		}
		//Configuramos el title
		//html_etiquetas=celda_td.getElementsByTagName("span")[0].innerHTML;
		if(!isText(title)){
			if(html_etiquetas.indexOf('<img')!=-1 || html_etiquetas.indexOf('<IMG')!=-1)
				title=celda_td.getElementsByTagName("img")[0].title;
			else
				title='';
		}
		html="";
		//Modificamos el código html
		var celda;
		if(celda_td.getElementsByTagName("span")[0].getElementsByTagName("span").length>0){//Si hay 2 span
				celda=celda_td.getElementsByTagName("span")[0].getElementsByTagName("span")[0];
		}else{ //Si hay 1 span
				celda=celda_td.getElementsByTagName("span")[0];
		}
		

		
		if(isText(text)){
			html = "<p>"+text+"</p>";
		}
		if(isText(href)){
			if(isText(text)){
				html = '<a href="'+href+'">'+text+'</a>';
			}else{
				html = '<a href="'+href+'">'+href+'</a>';
			}
		}
		if(isText(src)){
			if(isText(title)){
				html = '<img src="'+src+'" title="'+title+'">' + html;
			}else{
				html = '<img src="'+src+'">' + html;
			}
		
		}
		celda.innerHTML=html;
		
		if(cambiaTexto){
			checkSizeTreeTable(id_table,pos_row,pos_column);		
		}
		var id=getRowIdTreeTable(id_table,pos_row,pos_column);
		var cadena_num=getCodPkTreeTable(id_table,id);
		updateContextBoundTreeTable(id_table,cadena_num, pos_column, text, href, src,title);
	}
}

/******************************************************************************************************
* Función updateCellTemplateTreeTable:
Precondiciones:
Postcondiciones:
******************************************************************************************************/
function updateCellTemplateTreeTable(id_table, pos_row, pos_column, codeHTML){
	var nFilas=numRowsTreeTable(id_table);
	var nColumns=numColumnsTreeTable(id_table);
	if(!(pos_row>nFilas || pos_column>nColumns || pos_row<1 || pos_column<1))
		if(codeHTML!=null)
			document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1].innerHTML=codeHTML;
}

/******************************************************************************************************
* Función checkSizeTreeTable:
Precondiciones: recibe el id de la tabla, la posición de la fila y la posición de la columna donde se encuentra la celda.
Postcondiciones: comprueba el tamaño del valor de la celda en la fila pos_row y columna pos_column, y lo modifica.
******************************************************************************************************/
function checkSizeTreeTable(id_table, pos_row, pos_column,cell_width, altoTreeTable){
	var tipoColumn=document.getElementById(id_table).attMapTreeTable[(pos_column-1)]['typeColumn'];
	//var tipoColumn=$('#'+id_table)[0].attMapTreeTable[(pos_column-1)]['typeColumn'];
	if(tipoColumn!='template' && tipoColumn!='' && tipoColumn!='selection'){//Si no es template
		var fila=document.getElementById(id_table).getElementsByTagName("tr")[pos_row-1];
		var collapsed=false;	// la fila estaba colapsada
		if(fila.style.display=='none'){
			fila.style.display='';
			//$(fila).show();
			collapsed=true;
		}
		if(typeof cell_width=='undefined'){
			//var elm = document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1];
			//var cell_width2 = $(elm).width();
			cell_width = $('#' + id_table + ' tr').eq(pos_row-1).find('td').eq(pos_column-1).width();
		}
		if(typeof altoTreeTable=='undefined'){
			altoTreeTable =$("#" + id_table + "_divbody").height();
		}

		
		var celda=document.getElementById(id_table).getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1];
		var $celda = $(celda);
		//var $celda = $fila.children('td').eq(pos_column-1);
		var offsetMaximo = $(celda).offset().left + cell_width;
		var div = celda.getElementsByTagName("div")[0];//$('div', $celda);
		var offsetDiv = $(div).offset().left;
		var span=celda.getElementsByTagName("span")[0];//$('span', $celda);
		var textoTooltip = span.innerText || span.textContent;
						// mu lento \/		
		if ($(span).offset().left + $(span).width() > offsetMaximo){
			// corta y añade la flechita:
			if(offsetMaximo - offsetDiv > 14){
				div.style.width=offsetMaximo - offsetDiv - 14;
			}
			//Añadir la clase:
			$celda.addClass('ImagenDerechaCheckSizeTreeTable');
			//Fin añadir la clase
			celda.title=textoTooltip;
		}else{
			// no corta
			if(offsetMaximo - offsetDiv > 2){
				div.style.width=offsetMaximo - offsetDiv - 2;
			}
			//Eliminar la clase:
			$celda.removeClass('ImagenDerechaCheckSizeTreeTable');

			//Fin eliminar la clase
			celda.title='';
		}
		if(collapsed)//estaba colapsada
			fila.style.display='none';
			//$(fila).hide();
		if($('#' + id_table)[0].tt_width==undefined)
			$('#' + id_table)[0].tt_width=new Array();

		if($celda.hasClass('ImagenDerechaCheckSizeTreeTable')){
			$('#' + id_table)[0].tt_width[pos_column-1] = cell_width+13;
		}else{
			$('#' + id_table)[0].tt_width[pos_column-1] = cell_width;
		}
		$('#' + id_table)[0].tt_teniaScroll = scrollTreeTable(id_table, altoTreeTable);
	}
}

function pruebaTableTreeTable(id_table){
	var nRows = numRowsTreeTable(id_table);
	var nColumns = numColumnsTreeTable(id_table);
	var j = parseInt($('#'+id_table)[0].attInfoTreeTable[0]["columnNavigation"]);
	var cell_width;
	var altoTreeTable;
	for(var i = 0 ; i < nRows ; i++){
		if (i == 0){
			cell_width=$(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i].getElementsByTagName("td")[j]).width();
			altoTreeTable = $("#" + id_table + "_divbody").height();
		}
		pruebaTreeTable(id_table, i+1, j+1, cell_width);
	}
}

function pruebaTreeTable(id_table, pos_row, pos_column, cell_width){
	if(typeof cell_width=='undefined' || cell_width=='undefined'){
		cell_width = $(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1]).width();
	}
	//var $fila=$('#'+id_table+' tr').eq(pos_row-1);
	var fila=document.getElementById(id_table).getElementsByTagName("tr")[pos_row-1];
	var collapsed=false;	// la fila estaba colapsada
	if(fila.style.display=='none'){
		$(fila).show("fast");
		collapsed=true;
	}
	var celda=document.getElementById(id_table).getElementsByTagName("tr")[pos_row-1].getElementsByTagName("td")[pos_column-1];
	//var $celda = $fila.children('td').eq(pos_column-1);
	var offsetMaximo = $(celda).offset().left + cell_width;
	var div = celda.getElementsByTagName("div")[0];//$('div', $celda);
	var offsetDiv = $(div).offset().left;
	var span=celda.getElementsByTagName("span")[0];//$('span', $celda);
	var textoTooltip = span.innerText || span.textContent;
					// mu lento \/									
	if ($(span).offset().left + $(span).width() > offsetMaximo){
		// corta y añade la flechita:
		div.style.width=offsetMaximo - offsetDiv - 14;
		//Añadir la clase:
		$(celda).addClass('ImagenDerechaCheckSizeTreeTable');
		//Fin añadir la clase
		celda.title=textoTooltip;
	}else{
		// no corta
		div.style.width=offsetMaximo - offsetDiv - 2;
		//Eliminar la clase:
		celda.style.backgroundImage='none';
		//Fin eliminar la clase
		celda.title='';
	}
	if(collapsed)	// estaba colapsada
		$(fila).hide();
}

/******************************************************************************************************
* Función deleteNRowTreeTable:
Precondiciones: recibe el id de la tabla, y la posición (o id) de la fila a eliminar.
Postcondiciones: elimina la fila y todos los nodos que cuelgan de la fila si no es un nodo hoja.
******************************************************************************************************/
function deleteNRowTreeTable(id_table,row){ //Eliminamos a partir de la posición de la fila 
	var id_row=getRowIdTreeTable(id_table,row); //Guardamos el id de la fila con posición row.
	if(id_row!=null)
		deleteRowIdTreeTable(id_table, id_row); //Llamamos a deleteRowIdTreeTable para eliminar a partir del id_row obtenido. Se elimina la fila row y todas las que cuelgan de esta fila en el árbol.
}

function deleteRowIdTreeTable(id_table, id_row){//Eliminamos a partir del id de la fila
	var nColumns=numColumnsTreeTable(id_table);
	if($("#"+id_table+" tbody tr").hasClass("child-of-"+id_row)){ //Si hay filas que tengan la clase child-of de la fila id_row
		var num_filas=numRowsTreeTable(id_table); //Guardamos el número de filas
		for(i=0; i<num_filas; i++){ //Recorremos todas las filas
			if($(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i]).hasClass("child-of-"+id_row)){ //Si la fila con posición i tiene la clase child-of de la fila id_row				
				deleteRowIdTreeTable(id_table, getRowIdTreeTable(id_table,(i+1))); //Llamamos a deleteRowIdTreeTable con la fila de la posición i para eliminar las filas que cuelgan de ésta en la tabla.
				i=0;//Inicializamos la variable i, para que vuelva a buscar en todas las filas, ya que al eliminar una fila, las posiciones para cada fila han cambiado.
			}
		}
	}
	$("#"+id_table).attr("style","table-layout:''"); //Quitamos el estilo para que se desplacen las filas
	var class_hijo=$("#"+id_table+" tbody #"+id_row).attr("class");//obtenemos el id del padre antes de eliminar
	var child_of=class_hijo.indexOf("child-of");
	if(child_of!=-1){
		var id_parent="";
		for(var i=child_of+9; class_hijo.charAt(i)!=" " && i<class_hijo.length; i++)
			id_parent=id_parent+class_hijo.charAt(i);
	}
	document.getElementById(id_table).getElementsByTagName("tbody")[0].removeChild(document.getElementById(id_row));
	deleteContextTreeTable(id_table,id_row);
	$("#"+id_table).attr("style","table-layout:fixed"); //Añadimos el estilo para fijar el tamaño de las celdas de la tabla
	//td que contiene el expander
	var num_td;//td que contiene la clase expander
	for(var i=0; i<nColumns; i++)
		if($("#"+id_table+" tbody #"+id_parent+" td:nth-child("+(i+1)+")").html()!=null)
			if($("#"+id_table+" tbody #"+id_parent+" td:nth-child("+(i+1)+")").html().indexOf("expander")!=-1)
				num_td=i+1;
	//Si hemos eliminado todos los hijos de un padre, quitamos la clase parent y el expander
	if(($("#"+id_table+" tbody").html()).indexOf("child-of-"+id_parent)==-1){
		$("#"+id_table+" tbody #"+id_parent+" td:nth-child("+num_td+")").removeClass("parent");//Eliminamos la clase parent
		$("#"+id_table+" tbody #"+id_parent+" td:nth-child("+num_td+") span").html($("#"+id_table+" tbody #"+id_parent+" td:nth-child("+num_td+") span span").html());
	}
	updateColorTreeTable(id_table);
}
	
/******************************************************************************************************
* Función deleteContextTreeTable:
Precondiciones: recibe el id de la tabla y el id de al fila
Postcondiciones: elimina del contexto la fila cuyo cod_pk coincida con el del id_row a eliminar
******************************************************************************************************/
function deleteContextTreeTable(id_table,id_row){
	var id=id_row;
	var pos_num=id.indexOf("node-");
	var cadena_num="";
	var pos;
	//Obtenemos el cod_pk
	cadena_num=getCodPkTreeTable(id_table,id_row);
	//Eliminamos del contexto:
	pos=-1;
	//buscar la posicion de la fila en la que el cod_pk es igual
	for(var i=0; i<$("#"+id_table)[0].dataTreeTable.length; i++)
		if($("#"+id_table)[0].dataTreeTable[i]['COD_PK']==cadena_num)
			pos=i;
	//Eliminamos la fila del dataTreeTable
	$("#"+id_table)[0].dataTreeTable.splice(pos,1);
}

/******************************************************************************************************
* Función addRowTreeTable:
Precondiciones: recibe el id de la tabla, y el objeto json con los atributos del contexto de la fila a añadir
Postcondiciones: añade la fila a la tabla a partir del padre indicado o como raíz de la tabla si el padre tiene como cod_pk 0
******************************************************************************************************/
function addRowTreeTable(id_table,json){
	//Modificado 23-05-2011
	var pk=json[$('#'+id_table)[0].attInfoTreeTable[0]["pkField"]];
	//Modificado 23-05-2011
	var pk_padre=json[$('#'+id_table)[0].attInfoTreeTable[0]["pkParentField"]];
	var pos=-1;//No existe en la tabla
	var nColumns=numColumnsTreeTable(id_table);
	//buscamos el pk en la tabla
	var id_new=id_table+"node-"+pk;
	if($("#"+id_new).length==0){ //Si el id_new no existe ya en la tabla
		$("#"+id_table)[0].dataTreeTable[numRowsTreeTable(id_table)]=json;//Añadimos el elemento json al contexto en una posición más de las que existen
		// PENDIENTE: hiddenrow -> id_table + "_hiddenrow"
		var fila_clonada=document.getElementById(id_table+"hiddenrow").cloneNode(true);//Clonamos la fila
		var trs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr");//Guardamos todas las filas de la tabla
		var pos_padre=0;
		for(var j=0; j<trs.length; j++){//Buscamos la posición del padre con pk_padre
			if(trs[j].id==id_table+"node-"+pk_padre){
				pos_padre=j+1;
				break;
			}
		}
		if(pk_padre==0 || pos_padre!=0){ //Si es raíz o existe el nodo padre
			if(pk_padre==0)//Es raíz
				$("#"+id_table+" tbody").append(fila_clonada);//Añadimos la fila clonada a la tabla como raíz
			else//Tiene padre
				$(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos_padre-1]).after(fila_clonada); //Añadimos fila al padre con posición pos_padre
				//$("#"+id_table+" tbody tr:nth-child("+pos_padre+")").after(fila_clonada); //Añadimos fila al padre con posición pos_padre
			trs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr");
			for(var i=0; i<trs.length; i++)//Buscamos posición donde se ha añadido la fila clonada
				if(trs[i].id==(id_table+"hiddenrow")){
					pos=i;
					break;
				}
			//Configuramos la fila
			$(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos]).attr("id",id_table+"node-"+pk); //Cambiamos el id
			for(var i=0; i<nColumns; i++)
				document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos].getElementsByTagName("td")[i].id=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos].getElementsByTagName("td")[i].id+pk;
			//Modificado 23-05-2011
			if(json[$('#'+id_table)[0].attInfoTreeTable[0]["stateNavigationField"]]=="F" || json[$('#'+id_table)[0].attInfoTreeTable[0]["stateNavigationField"]]==undefined)
				$(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[pos]).attr("class","collapsed");//Añadimos collapsed, si está expandido no se añade ninguna clase
			//	$("#"+id_table+" tbody tr:nth-child("+(pos+1)+")").attr("class","collapsed");
			pos=pos+1;
			if(!$("#"+id_table+"node-"+pk_padre).hasClass("parent") && pk_padre!=0) //Si es padre por primera vez
				parentStyleTreeTable(id_table, id_table+"node-"+pk_padre); //Añadimos el estilo de las filas padre
			rowStyleTreeTable(id_table,id_table+"node-"+pk,id_table+"node-"+pk_padre);
			addRowValuesColumnsTreeTable(id_table,json,pos,pk_padre,pk); //Configuramos los valores de la fila
		}
	}
}

/******************************************************************************************************
* Función addRowValuesColumnsTreeTable:
Precondiciones: recibe el id de la tabla, el json a añadir, la posicion de la fila, el pk del padre y el pk.
Postcondiciones: Añade los valores nuevos a la columna y actualiza el contexto
******************************************************************************************************/
function addRowValuesColumnsTreeTable(id_table,json,pos,pk_padre,pk){
	var valor;
	var text, checked, enabled, href,src;
	var objeto_attmap=$('#'+id_table)[0].attMapTreeTable;
	var n_filas=numColumnsTreeTable(id_table);
	for(var i=1; i<=n_filas; i++){
	if(objeto_attmap[i-1]['typeColumn']=='selection'){
		valor=objeto_attmap[i-1]['text'];
		if (valor==undefined)
			text='';
		else
			text=json[valor_text];
		valor=objeto_attmap[i-1]['checked'];
		if(valor==undefined)
			checked='F';
		else
			checked=json[valor];
		valor=objeto_attmap[i-1]['disabled'];
		if(valor==undefined)
			enabled='T'
		else
			enabled=json[valor];
		updateCellSelectionTreeTable(id_table,pos,i,text,checked,enabled);
		//updateContextSelectionTreeTable(id_table,pk, i, text, checked, enabled);
	}else
		if(objeto_attmap[i-1]['typeColumn']=='bound'){
			valor=objeto_attmap[i-1]['text'];
			if (valor==undefined)
				text='';
			else
				text=json[valor];
			valor=objeto_attmap[i-1]['href'];
			if (valor==undefined)
				href='';
			else
				href=json[valor];
			valor=objeto_attmap[i-1]['src'];
			if (valor==undefined)
				src='';
			else
				src=json[valor];
			valor=objeto_attmap[i-1]['imageAltField'];//cambiar valor!!
			if(valor==undefined)
				alt=''
			else
				alt=json[valor];		
			updateCellBoundTreeTable(id_table,pos,i,text,href,src,alt);
			//updateContextBoundTreeTable(id_table,pk, i, text,href,src,alt);
		}
	}
}

/******************************************************************************************************
* Función updateContextSelectionTreeTable:
Precondiciones: recibe el id de la tabla, el cod_pk, el texto, el atributo checked y el atributo enabled.
Postcondiciones: Modifica el contexto en la columna Selection
******************************************************************************************************/
function updateContextSelectionTreeTable(id_table,cod_pk, pos_column, text, checked, enabled){
	var pos=-1;
	var nFilas=numRowsTreeTable(id_table);
	var objectAttMap=$('#'+id_table)[0].attMapTreeTable[pos_column-1];
	//buscar la posicion de la fila del contexto en la que el cod_pk es igual
	for(var i=0; i<nFilas; i++)
		if($("#"+id_table)[0].dataTreeTable[(i)]['COD_PK']==cod_pk)
			pos=i;
	var objectData=$("#"+id_table)[0].dataTreeTable[pos];		
	if(objectAttMap['text']!=undefined && text!=null){
		//Obtiene el campo del contexto asociado al texto de la celda
		var campoContexto = objectAttMap['text'];							
		//Actualiza el campo del contexto con el nuevo texto	
		if(pos!=-1) //Si existe en el contexto
			objectData[campoContexto] = text;
	}
	if(objectAttMap['checked']!=undefined && checked!=null){
		//Obtiene el campo del contexto asociado al texto de la celda
		var campoContexto = objectAttMap['checked'];							
		//Actualiza el campo del contexto con el nuevo texto	
		if(pos!=-1)
			objectData[campoContexto] = checked.charAt(0).toUpperCase();
	}
	if(objectAttMap['disabled']!=undefined && enabled!=null){
		//Obtiene el campo del contexto asociado al checked de la celda
		var campoContexto = objectAttMap['disabled'];							
		//Actualiza el campo del contexto con el nuevo texto	
		if(pos!=-1)
			objectData[campoContexto] = enabled.charAt(0).toUpperCase();
	}
}

/******************************************************************************************************
* Función updateContextBoundTreeTable:
Precondiciones: recibe el id de la tabla, el cod_pk, el texto, el enlace y la imagen.
Postcondiciones: Modifica el contexto en la columna Bound
******************************************************************************************************/
function updateContextBoundTreeTable(id_table,cod_pk, pos_column, text, href, src,alt){
	var pos=-1;
	var objectAttMap=$('#'+id_table)[0].attMapTreeTable[pos_column-1];
	//buscar la posicion de la fila en la que el cod_pk es igual
	for(var i=0; i<$("#"+id_table)[0].dataTreeTable.length; i++)
		if($("#"+id_table)[0].dataTreeTable[i]['COD_PK']==cod_pk)
			pos=i;
	var objectData=$("#"+id_table)[0].dataTreeTable[pos];
	if(text!=''){
		if(objectAttMap['text']!=undefined && text!=null){	
			//Obtiene el campo del contexto asociado al texto de la celda
			var campoContexto = objectAttMap['text'];							
			//Actualiza el campo del contexto con el nuevo texto	
			if(pos!=-1)
				objectData[campoContexto] = text;
		}
	}
	if(href!=''){
		if(objectAttMap['href']!=undefined && href!=null){
			//Obtiene el campo del contexto asociado al texto de la celda
			var campoContexto = objectAttMap['href'];							
			//Actualiza el campo del contexto con el nuevo texto	
			if(pos!=-1)
				objectData[campoContexto] = href;
		}
	}
	if(src!=''){
		if(objectAttMap['src']!=undefined && src!=null){
			//Obtiene el campo del contexto asociado al texto de la celda
			var campoContexto = objectAttMap['src'];							
			//Actualiza el campo del contexto con el nuevo texto	
			if(pos!=-1)
				objectData[campoContexto] = src;
		}
	}
	if(alt!=''){
		if(objectAttMap['imageAltTextField']!=undefined && alt!=null){
			//Obtiene el campo del contexto asociado al texto de la celda
			var campoContexto = objectAttMap['alt'];							
			//Actualiza el campo del contexto con el nuevo texto	
			if(pos!=-1)
				objectData[campoContexto] = alt;
		}
	}
}

/******************************************************************************************************
* Función rowStyleTreeTable:
Precondiciones: recibe el id de la tabla, y la posición de la fila a la que aplicar el estilo.
Postcondiciones: aplica el estilo a la nueva fila.
******************************************************************************************************/
function rowStyleTreeTable(id_table, row ,id_parent){
	var num=getCodPkTreeTable(id_table,id_parent);
	if(num!='0') //Es padre
		$("#"+row).addClass("child-of-"+id_parent);
	var nColumns=numColumnsTreeTable(id_table);
	for(var i=0; i<nColumns; i++)//Modificado 23-05-2011
		if($('#'+id_table)[0].attInfoTreeTable[0]["columnNavigation"]==(i)){
			$(document.getElementById(row).getElementsByTagName("td")[i]).addClass("Nivel"+levelOfTreeTable(id_table,$("#"+id_table+" tbody #"+row)));
			//$("#"+id_table+" tbody #"+row+" td:nth-child("+i+")").addClass("Nivel"+levelOfTreeTable(id_table,$("#"+id_table+" tbody #"+row)));
			//$(document.getElementById(row).getElementsByTagName("td")[i]).attr("style","padding-left:"+((levelOfTreeTable(id_table,$("#"+id_table+" tbody #"+row))-1)*5)+"px;");
			//$("#"+id_table+" tbody #"+row+" td:nth-child("+i+")").attr("style","padding-left:"+((levelOfTreeTable(id_table,$("#"+id_table+" tbody #"+row))-1)*5)+"px;");
			var pos=0;
			var nFilas=numRowsTreeTable(id_table);
			for(var j=0; j<nFilas;j++)
				if(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[j].id==row)
					pos=j+1;	
		}
	updateColorTreeTable(id_table);
}

/******************************************************************************************************
* Función updateColorTreeTable:
Precondiciones: recibe el id de la tabla.
Postcondiciones: aplica el color de los css y estilos a las filas pares e impares
******************************************************************************************************/
function updateColorTreeTable(id_table){
	var cssMain, cssAlternative, styleMain, styleAlternative;
	var objectattInfo=$('#'+id_table)[0].attInfoTreeTable;
	cssMain=objectattInfo['cssMainRowClass'];
	cssAlternative=objectattInfo['cssAlternativeRowClass'];
	styleMain=objectattInfo['styleMainRowClass'];
	styleAlternative=objectattInfo['styleAlternativeRowClass'];
	if(cssMain!=undefined){
		$("#"+id_table+" tbody tr:even").addClass(cssMain);
		$("#"+id_table+" tbody tr:odd").removeClass(cssMain);
	}
	if(cssAlternative!=undefined){
		$("#"+id_table+" tbody tr:odd").addClass(cssAlternative);
		$("#"+id_table+" tbody tr:even").removeClass(cssAlternative);
	}
	if(styleMain!=undefined){
		$("#"+id_table+" tbody tr:even").attr('style',styleMain);
		$("#"+id_table+" tbody tr:odd").css(styleMain,"none");
	}
	if(styleAlternative!=undefined){
		$("#"+id_table+" tbody tr:odd").attr('style',styleAlternative);
		$("#"+id_table+" tbody tr:even").css(styleAlternative,"none");
	}
}

/******************************************************************************************************
* Función parentStyleTreeTable:
Precondiciones: recibe el id de la tabla, la posición de la fila padre a la que aplicar el estilo.
Postcondiciones: aplica el estilo a la nueva fila padre.
******************************************************************************************************/
function parentStyleTreeTable(id_table, row){
	var nColumns=numColumnsTreeTable(id_table);
	//Modificado 23-05-2011
	var columnNavigation=$('#'+id_table)[0].attInfoTreeTable[0]["columnNavigation"];
	var nFilas=numRowsTreeTable(id_table);
	var celda_td=document.getElementById(row).getElementsByTagName("td");
	var left_navegador_treeTable=0;
	var margin_navegador_treeTable=0;
	if(navigator.appName != 'Microsoft Internet Explorer'){
		left_navegador_treeTable=5;
		margin_navegador_treeTable=-5;	
	}	
	for(var i=1; i<=nColumns; i++)
		if(columnNavigation==(i-1)){
			$(celda_td[i-1]).click(function() {toggleBranch($("#"+id_table+" tbody #"+row),id_table)}); //Evento click sobre la celda que expande/contrae
			$("#"+row).removeClass("collapsed").addClass("expanded"); //Añadimos la clase expanded a la fila padre
			$(celda_td[i-1]).addClass("cursor: pointer");
			$("#"+row).addClass("initialized");
			$("#"+row).addClass("parent");
			//$('span', celda_td[i-1]).html('<span class="expander" style="position:relative; top 0px; left: 10px; margin-left: 0px; padding-left: 30px;">'+ $('span', celda_td[i-1]).html()+'</span>'); //Añadimos el icono para expandir/contraer los nodos de la nueva fila padre
			//$("#"+id_table+" tbody #"+row+" td:nth-child("+i+") span").html('<span class="expander" style="position:relative; top 0px; left: 10px; margin-left: 0px; padding-left: 30px;">'+$("#"+id_table+" tbody #"+row+" td:nth-child(2) span").html()+'</span>'); //Añadimos el icono para expandir/contraer los nodos de la nueva fila padre
			$(celda_td[i-1].getElementsByTagName("span")[0]).html('<span class="expander" style="position:relative; top 0px; margin-left: '+margin_navegador_treeTable+'px; padding-left: 20px; left:'+left_navegador_treeTable+'px">'+$(celda_td[i-1].getElementsByTagName("span")[0]).html()+'</span>'); //Añadimos el icono para expandir/contraer los nodos de la nueva fila padre
			var pos=0;	
			var celda_tr=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr");
			for(var j=0; j<nFilas;j++)
				if(celda_tr[j].id==row){
					pos=j+1;
					break;
				}
			checkSizeTreeTable(id_table,pos,i);
		}
}

/******************************************************************************************************
* Función toggleBranch:
Precondiciones: recibe la fila a cotnraer/expandir.
Postcondiciones: contrae/expande la fila.
******************************************************************************************************/
function toggleBranch(row,id_table){
	if(row.hasClass("collapsed")) 
		row.expand();
	else 
		row.removeClass("expanded").collapse();
	if(pilaTreeTable[id_table]!=null)
		pilaTreeTable[id_table]();
}

/******************************************************************************************************
* Función levelOfTreeTable:
Precondiciones: recibe el id de la tabla, y el nodo del que obtener el nivel de profundidad dentro del árbol.
Postcondiciones: devuevle el nivel de profundidad del nodo dentro del árbol.
******************************************************************************************************/
function levelOfTreeTable(id_table, node){
	var nivel=1; //nivel inicial
	return levelOf2TreeTable(id_table, node, nivel); //función recursiva para calcular el nivel de profundidad del nodo dentro de la tabla.
}

function levelOf2TreeTable(id_table, node, nivel){
	if((node.attr("class")).indexOf("child-of-")!=-1){ //Si tiene padre
		cadena="";
		nivel=nivel+1; //Incrementamos el nivel de profundidad
		clase=node.attr("class"); //Guardamos el valor de la case
		if(clase.indexOf("-0")==-1)
		for(i=(clase.indexOf("child-of-")+9); clase.charAt(i)!=' ' && clase.charAt(i)!='"' && i<clase.length; i++)
			cadena=cadena+clase.charAt(i); //Guardamos el id del padre
		node=$("#"+id_table+" tbody #"+cadena); //Guardamos el node el padre del nodo actual
		return levelOf2TreeTable(id_table, node, nivel); //Llamada recursiva con el nodo del padre actual	
	}else
		return nivel; //Devolvemos el nivel
}

/******************************************************************************************************
* Función numRowsTreeTable:
Precondiciones: recibe el identificador de la tabla.
Postcondiciones: devuelve el número de filas de la tabla dentro del tbody.
******************************************************************************************************/
function numRowsTreeTable(id_table){ //Filas del tbody
	var num_filas=0;
	if(document.getElementById(id_table).getElementsByTagName('tbody').length>0) //Si tiene tbody
		if(document.getElementById(id_table).getElementsByTagName('tbody')[0].getElementsByTagName("tr").length>0) //Si existen filas dentro de tbody
			num_filas=$("#"+id_table+" tbody tr").size();
	return num_filas;
}

/******************************************************************************************************
* Función numColumnsTreeTable:
Precondiciones: recibe el identificador de la tabla.
Postcondiciones: devuelve el número de columnas de la tabla.
******************************************************************************************************/
function numColumnsTreeTable(id_table){
	if(numRowsTreeTable(id_table)!=0) //Si tiene filas
		return document.getElementById(id_table).getElementsByTagName('tbody')[0].rows[0].getElementsByTagName("td").length; //Número de celdas de la primera fila
	else
		return 0;
}

/******************************************************************************************************
* Función getDataContextTreeTable:
Precondiciones: recibe el identificador de la tabla.
Postcondiciones: devuelve el contexto de salida con las modificacioens realizadas y la actualización de los checks y expandidos.
******************************************************************************************************/
//Obtener contexto de salida
function getDataContextTreeTable(id_table){
	//Modificar los checks
	var valor_check;
	var column_selection=0;
	var cod_pk;
	for(var i=0; i<$('#'+id_table)[0].attMapTreeTable.length; i++)
		if($('#'+id_table)[0].attMapTreeTable[i]['checked']!=undefined){//Si es una columna selection
			valor_check=$('#'+id_table)[0].attMapTreeTable[i]['checked'];
			column_selection=i;//columna selection
		}
	if(valor_check!=undefined){//Si existe el atributo check
		var inputs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName('input');
		for(var i=0; i<inputs.length; i++){
			cod_pk=getCodPkTreeTable(id_table,getRowIdTreeTable(id_table,i+1));
			if(inputs[i].checked==true)
				updateContextSelectionTreeTable(id_table,cod_pk,column_selection+1, null,'T',null);
			else
				updateContextSelectionTreeTable(id_table,cod_pk,column_selection+1, null,'F',null);
		}
	}
	//Modificar los expandidos	
	//Modificado 23-05-2011
	var valor_expandido=$('#'+id_table)[0].attInfoTreeTable[0]['stateNavigationField'];
	var trs=new Array();
	trs=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName('tr');
	if(valor_expandido!=undefined){//si existe el atributo expandido
		for(var i=0; i<trs.length;i++){
			cod_pk=getCodPkTreeTable(id_table,trs[i].id);
			//Modificado 23-05-2011
			var valor=$("#"+id_table)[0].attInfoTreeTable[0]['pkField'];
			for(var j=0; j<$("#"+id_table)[0].dataTreeTable.length; j++){
				if($("#"+id_table)[0].dataTreeTable[j][valor]==cod_pk)
					if($("#"+id_table+" tbody #"+trs[i].id).hasClass("expanded"))
						$("#"+id_table)[0].dataTreeTable[j][valor_expandido]='T';
					else
						$("#"+id_table)[0].dataTreeTable[j][valor_expandido]='F';
			}
		}
	}
	return $('#'+id_table)[0].dataTreeTable;
}

/******************************************************************************************************
* Función getCodPkTreeTable:
Precondiciones: recibe el identificador de la tabla.
Postcondiciones: devuelve el cod_pk del id.
******************************************************************************************************/
function getCodPkTreeTable(id_table,id){
	return id.substr(id_table.length+5,id.length);
}

/******************************************************************************************************
* Función checkSizeTableTreeTable:
Precondiciones: recibe el identificador de la tabla.
Postcondiciones: aplica checksize a toda la tabla.
******************************************************************************************************/
function checkSizeTableTreeTable(id_table){
	var nRows = numRowsTreeTable(id_table);
	var nColumns = numColumnsTreeTable(id_table);
	var j = parseInt($('#'+id_table)[0].attInfoTreeTable[0]["columnNavigation"]);
	var cell_width;
	var altoTreeTable;
	for(var i = 0 ; i < nRows ; i++){
		if(i == 0){
			cell_width=$(document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i].getElementsByTagName("td")[j]).width();
			altoTreeTable = $("#" + id_table + "_divbody").height();
		}
		checkSizeTreeTable(id_table, i+1, j+1, cell_width, altoTreeTable);
	}
}

/******************************************************************************************************
* Función onEventManejadorTreeTable:
Precondiciones: recibe el identificador de la tabla y el nombre de la función definida por el usuario.
Postcondiciones: ejecuta la función definida por el usuario en el evento click sobre el icono de expandir/contraer filas.
******************************************************************************************************/
/*Eventos toggle definidos por el usuario*/
function onExpandTreeTable(id_table,funcion){
	pilaTreeTable[id_table]=funcion;//Añadimos la función a la variable pilaTreeTable para el id de la tabla idTreeTable
}

//Existe scroll = true, no existe scroll = false
function scrollTreeTable(id_table, altoTreeTable){
	//return  ($("#" + id_table + "_divbody").get(0).scrollHeight > $("#" + id_table + "_divbody").height());
	//var filas = $("#" + id_table + " tr");
	//var alturaTabla= filas.length * filas.eq(0).height();
	//return  ($("#" + id_table + "_divbody").get(0).scrollHeight > alturaTabla);
	//return false;
	//alert($("#" + id_table + "_divbody").get(0).scrollHeight+">"+altoTreeTable);
	return  ($("#" + id_table + "_divbody").get(0).scrollHeight > altoTreeTable);
}

//Quitar o añadir 20px
function checkScrollTableTreeTable(id_table){
	var nRows=numRowsTreeTable(id_table);
	var nCol=numColumnsTreeTable(id_table);
	var celda,celda_span,fila,celda_div;
	var porcentajes;
	var pos_width,pos_pyc,string_width,tam;
	var valor_porcentaje="";
	var cambiar_valor_scroll=$('#' + id_table)[0].tt_teniaScroll;
	var width_=20;
	var width=new Array();
	var ancho_celda=new Array();
	var inicializado_valor_ancho_columna=false;
	var altoTreeTable;
	var cell_width;
	if((typeof altoTreeTable)=='undefined' || altoTreeTable=='undefined')
		altoTreeTable = $("#" + id_table + "_divbody").height();
	for(i=0; i<nRows; i++){
		fila=document.getElementById(id_table).getElementsByTagName("tbody")[0].getElementsByTagName("tr")[i];
		for(j=0; j<nCol; j++){
			celda=(fila.getElementsByTagName("td")[j]);
			var $celda = $(celda);
			celda_div=(celda.getElementsByTagName("div")[0]);
			if(i==0){
				//if($celda[0].style.background!='none')
				//if($celda.hasClass("ImagenDerechaCheckSizeTreeTable"))
				ancho_celda[j]=$celda.width();
				width[j]=ancho_celda[j]-($('#' + id_table)[0].tt_width[j]);
			}
			if($celda.eq(0).hasClass("ImagenDerechaCheckSizeTreeTable")){
			//if($celda[0].style.backgroundImage!='none' &&$(celda)[0].style.backgroundImage!=''){
				if(width[j]<0)
					width[j]=width[j]*(-1);
				if(scrollTreeTable(id_table, altoTreeTable) ){//Si hay scroll
					if(!($('#' + id_table)[0].tt_teniaScroll) ){//No tenía scroll
						$(celda_div).width($(celda_div).width()-width[j]);
						if(!inicializado_valor_ancho_columna){
							$('#' + id_table)[0].tt_width[j]=	ancho_celda[j];
							inicializado_valor_ancho_columna=true;
						}
						cambiar_valor_scroll =true;
					}
				}else{//Si no hay scroll
					if($('#' + id_table)[0].tt_teniaScroll ){//Había scroll
						$(celda_div).width($(celda_div).width()+width[j]);	
						if(!inicializado_valor_ancho_columna){
							$('#' + id_table)[0].tt_width[j]=	ancho_celda[j];
							inicializado_valor_ancho_columna=true;
						}
						cambiar_valor_scroll =false;
					}
				}
			}
		}
	}
	$('#' + id_table)[0].tt_teniaScroll=cambiar_valor_scroll;
}

/********************************************************************************/
/* CORTINILLA TREETABLE ***/
/********************************************************************************/
// 		.ttcortina{position:absolute; background: #cccccc; opacity: 0.5}
//		.ttcortina img{position: relative; top: 50%; left: 50%; margin-top: -50px; margin-left: -50px}
function tt_cortina_On(id){
	var id_div_treetable = id + '_divbody';
	var id_div_treetablehead = id + '_divhead';
	if($('.' + id + '_cortinacontainer').length == 0){
		//$('#' + id_div_treetable).wrap('<div id="' +  id + '_cortinacontainer"></div>');
		$('#' + id_div_treetable).parent().parent().addClass(id + '_cortinacontainer');
		$('.' + id + '_cortinacontainer').prepend('<div id="' + id + '_cortina" class="ttcortina ImageViewerWaitingGif"></div>');
		//$('#' + id + '_cortina').width(Math.max($('.' + id + '_cortinacontainer').width(), $('#' + id + '_divbody').width(), $('#' + id + '_divhead').width()));
		$('#' + id + '_cortina').css('width','100%');
		//$('#' + id + '_cortina').css('height','50%');
		$('#' + id + '_cortina').height(Math.max($('.' + id + '_cortinacontainer').height()*2, 2*($('#' + id + '_divbody').height() + $('#' + id + '_divhead').height())));
		csscortinilla();
	}
}

function tt_cortina_Off(id){
	$('#' + id + '_cortina').remove();
	$('.' + id + '_cortinacontainer').removeClass(id + '_cortinacontainer');
}

function csscortinilla(){
	$('.ttcortina').css('z-index', '999999').css('position','absolute').css('opacity','0.9').css('background','#cccccc').css('filter', 'alpha(opacity = 90)');
	//$('.ttcortina img').css('position','relative').css('top','50%').css('left','50%').css('margin-top','-104px').css('margin-left','-7px');
	$('.ttcortina p').css('position','relative').css('top','25%').css('width','100%');
	//$('.ttcortina img').css('position','relative');
	//	document.getElementById('Otro').contentWindow.document.getElementById('frame_OPL').contentWindow.$('.ttcortina').css('z-index', '99999').css('position','absolute').css('opacity','0.9').css('background','#cccccc').css('filter', 'alpha(opacity = 90)');
	//document.getElementById('Otro').contentWindow.document.getElementById('frame_OPL').contentWindow.$('.ttcortina img').css('position','relative').css('top','50%').css('left','50%').css('margin-top','-7px').css('margin-left','-104px');
}

/* jQuery treeTable Plugin 2.3.0
 * http://ludo.cubicphuse.nl/jquery-plugins/treeTable/
 * Copyright 2010, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Modificado 21/2/2011 para que haga caso a los nodos que tienen expanded o collapsed en su class,
 * no se si era un bug pero no funcionaba, lo que hace ahora es ocultar todas las filas de la tabla al inicio, despu?s muestra solo las raices
 * y despu?s ya utiliza el metodo para inicializarlas que ten?a ?l, y que no ten?a por qu? ir mal */
(function($){
	// Helps to make options available to all functions
	// TODO: This gives problems when there are both expandable and non-expandable
	// trees on a page. The options shouldn't be global to all these instances!
	var options;
	var defaultPaddingLeft;
	$.fn.treeTable = function(opts){
		options = $.extend({}, $.fn.treeTable.defaults, opts);
		return this.each(function(){
			$(this).addClass("treeTable").find("tbody tr").each(function (){
				// 21/2/2011 : A?adido este each que oculta todos lo nodos al principio
				this.style.display = "none";
				$('span', $(this)).hide();
				$('img', $(this)).hide();
			}).each(function(){
				// Initialize root nodes only if possible
				if(!options.expandable || $(this)[0].className.search(options.childPrefix) == -1){
					// To optimize performance of indentation, I retrieve the padding-left
					// value of the first root node. This way I only have to call +css+
					// once.
					// 21/2/2011 : A?adida esta linea que muestra las carpetas que son raiz
					this.style.display='';
					$('span', $(this)).show();
					$('img', $(this)).show();
					if (isNaN(defaultPaddingLeft)){
						defaultPaddingLeft = parseInt($($(this).children("td")[options.treeColumn]).css('padding-left'), 10);
					}
					initialize($(this));
				}
			});
		});
	};
	$.fn.treeTable.defaults = {
		childPrefix: "child-of-",
		clickableNodeNames: false,
		expandable: true,
		indent: 19,
		initialState: "collapsed",
		treeColumn: 0,
		expandidos:[]
	};

	// Recursively hide all node's children in a tree
	$.fn.collapse = function(){
		$(this).addClass("collapsed");
		childrenOf($(this)).each(function(){
			if(!$(this).hasClass("collapsed")){
				$(this).collapse();
			}
			this.style.display = "none";
			$('span', $(this)).hide();
			$('img', $(this)).hide();
		});
		return this;
	};

	// Recursively show all node's children in a tree
	$.fn.expand = function(){
		$(this).removeClass("collapsed").addClass("expanded");
		childrenOf($(this)).each(function(){
			initialize($(this));
			if($(this).is(".expanded.parent")){
				$(this).expand();
			}
			$(this).show();
			$('span', $(this)).show();
			$('img', $(this)).show();
		});
		return this;
	};

	// Reveal a node by expanding all ancestors
	$.fn.reveal = function(){
		$(ancestorsOf($(this)).reverse()).each(function(){
			initialize($(this));
			$(this).expand().show();
		});
		return this;
	};

	// Add an entire branch to +destination+
	$.fn.appendBranchTo = function(destination){
		var node = $(this);
		var parent = parentOf(node);
		var ancestorNames = $.map(ancestorsOf($(destination)), function(a){return a.id;});
		// Conditions:
		// 1: +node+ should not be inserted in a location in a branch if this would
		//    result in +node+ being an ancestor of itself.
		// 2: +node+ should not have a parent OR the destination should not be the
		//    same as +node+'s current parent (this last condition prevents +node+
		//    from being moved to the same location where it already is).
		// 3: +node+ should not be inserted as a child of +node+ itself.
		if($.inArray(node[0].id, ancestorNames) == -1 && (!parent || (destination.id != parent[0].id)) && destination.id != node[0].id){
			indent(node, ancestorsOf(node).length * options.indent * -1); //Remove indentation
			if(parent){node.removeClass(options.childPrefix + parent[0].id);}
			node.addClass(options.childPrefix + destination.id);
			move(node, destination); //Recursively move nodes to new location
			indent(node, ancestorsOf(node).length * options.indent);
		}
		return this;
	};

	// Add reverse() function from JS Arrays
	$.fn.reverse = function(){
		return this.pushStack(this.get().reverse(), arguments);
	};

	// Toggle an entire branch
	$.fn.toggleBranch = function(){
		if($(this).hasClass("collapsed")){$(this).expand();}
		else{$(this).removeClass("expanded").collapse();}
		var id_table=($(this)).parent().parent().attr("id");
		if(pilaTreeTable[id_table]!=null){pilaTreeTable[id_table]();}
		return this;
	};

	// === Private functions
	function ancestorsOf(node){
		var ancestors = [];
		while(node = parentOf(node)){ancestors[ancestors.length] = node[0];}
		return ancestors;
	};

	function childrenOf(node){
		return $("table.treeTable tbody tr." + options.childPrefix + node[0].id);
	};

	function getPaddingLeft(node){
		var paddingLeft = parseInt(node[0].style.paddingLeft, 10);
		return (isNaN(paddingLeft)) ? defaultPaddingLeft : paddingLeft;
	}

	function indent(node, value){
		var cell = $(node.children("td")[options.treeColumn]);
		cell[0].style.paddingLeft = getPaddingLeft(cell) + value + "px";
		childrenOf(node).each(function(){
			indent($(this), value);
		});
	};

	function initialize(node){
		if(!node.hasClass("initialized")){
			node.addClass("initialized");
			var childNodes = childrenOf(node);
			if(!node.hasClass("parent") && childNodes.length > 0){
				node.addClass("parent");
			}
			if(node.hasClass("parent")){
				var cell = $(node.children("td")[options.treeColumn]);
				var padding = 0;
				childNodes.each(function(){$(this).children("td")[options.treeColumn].style.paddingLeft = padding + "px";});
				if(options.expandable){
					var left_navegador_treeTable=0;
					var margin_navegador_treeTable=0;
					if(navigator.appName != 'Microsoft Internet Explorer'){
						left_navegador_treeTable=5;
						margin_navegador_treeTable=-5;
					}
					// 29/03/2011: Modificacion para a?adir la clase expander despues del <div><span> perteneciente al <td>
					if(document.getElementById(cell[0].id).getElementsByTagName("span").length < 1){
						cell.prepend('<span style="position: relative;top: 0px;left:'+left_navegador_treeTable+'px;margin-left: '+margin_navegador_treeTable+'px;padding-left: 20px" class="expander"></span>');
					}else{
						var html=document.getElementById(cell[0].id).getElementsByTagName("span")[0].innerHTML;
						document.getElementById(cell[0].id).getElementsByTagName("span")[0].innerHTML="<span style='position: relative;top: 0px;left: "+left_navegador_treeTable+"px;margin-left: "+margin_navegador_treeTable+"px;padding-left: 20px' class='expander'>"+html+"</span>";
					}
					$(cell[0].firstChild).click(function() { node.toggleBranch(); });
					if(options.clickableNodeNames){
						cell[0].style.cursor = "pointer";
						$(cell).click(function(e){
							// Don't double-toggle if the click is on the existing expander icon
							if(e.target.className != 'expander'){
								node.toggleBranch();
							}
							recalcularAncho($(this).parents("table").attr("id"));
						});
					}
					// Check for a class set explicitly by the user, otherwise set the default class
					if(!(node.hasClass("expanded") || node.hasClass("collapsed"))){
						node.addClass(options.initialState);
					}
					if(node.hasClass("expanded")){
						node.expand();
					}
				}
			}
		}
	};

	function move(node, destination){
		node.insertAfter(destination);
		childrenOf(node).reverse().each(function(){move($(this), node[0]);});
	};

	function parentOf(node){
		var classNames = node[0].className.split(' ');
		for(key in classNames){
			if(classNames[key].match(options.childPrefix)){return $("#" + classNames[key].substring(9));}
		}
	};
})(jQuery);

/** API para manejar una tabla HASH **/
/* contiene la informacion de los scrolls de todas las tablas de la jsp */
function Hash(){
	this.length = 0;
	this.items = new Array();
	for(var i = 0; i < arguments.length; i += 2){
		if(typeof(arguments[i + 1]) != 'undefined'){
			this.items[arguments[i]] = arguments[i + 1];
			this.length++;
		}
	}
	this.removeItem = function(in_key){
		var tmp_previous;
		if(typeof(this.items[in_key]) != 'undefined'){
			this.length--;
			var tmp_previous = this.items[in_key];
			delete this.items[in_key];
		}
		return tmp_previous;
	}
	this.getItem = function(in_key){return this.items[in_key];}
	this.setItem = function(in_key, in_value){
		var tmp_previous;
		if(typeof(in_value) != 'undefined'){
			if(typeof(this.items[in_key]) == 'undefined'){this.length++;}
			else{tmp_previous = this.items[in_key];}
			this.items[in_key] = in_value;
		}
		return tmp_previous;
	}
	this.hasItem = function(in_key){return typeof(this.items[in_key]) != 'undefined';}
	this.clear = function(){
		for(var i in this.items){
			delete this.items[i];
		}
		this.length = 0;
	}
}
/** FIN API HASH **/

var arrayHadScroll = new Hash();
var i = 0;

function layoutTable(id_table){
	if(typeof(arrayHadScroll[id_table]) == 'undefined'){
		arrayHadScroll.setItem(id_table, false);
		recalcularAncho(id_table);
	}
}

function recalcularAncho(id_table){
	// Comprobar si hay scroll o no en la tabla
	// En caso que SI haya scroll, a?adimos una nueva columna al final para simular el scroll
	if($("#" + id_table + "_divbody").get(0).scrollHeight > $("#" + id_table + "_divbody").height()){
		if(!(arrayHadScroll.getItem(id_table))){
			var head = $("#" + id_table + "_divhead");
			if(typeof(head) != 'undefined'){
				var thscroll = "<th id='" + id_table + "thscrollhead' width='12px' bgcolor='#ffffff'>&nbsp;</th>";
				$("#" + id_table + "_head tr").append(thscroll); //Lo colocamos al final de las cabeceras
			}
			var foot = $("#" + id_table + "_divfoot");
			if(typeof(foot) != 'undefined'){
				var thscroll = "<th id='" + id_table + "thscrollfoot' width='12px' bgcolor='#ffffff'>&nbsp;</th>";
				$("#" + id_table + "_foot tr").append(thscroll); //Lo colocamos al final de las cabeceras
			}
			arrayHadScroll.setItem(id_table, true);
		}
	}else{ //En caso que NO haya scroll, eliminamos la columna final que simula el scroll
		if(arrayHadScroll.getItem(id_table)){
			var head = $("#" + id_table + "_divhead");
			if(typeof(head) != 'undefined'){$("#" + id_table + "thscrollhead").remove();} //Eliminamos la columna que simula el scroll en el head
			var foot = $("#" + id_table + "_divfoot");
			if(typeof(foot) != 'undefined'){$("#" + id_table + "thscrollfoot").remove();} //Eliminamos la columna que simula el scroll en el foot
			arrayHadScroll.setItem(id_table, false);
		}
	}
	checkScrollTableTreeTable(id_table); //checkSizeTableTreeTable(id_table);
}

/*function recalcularAncho(id_table){
	// Comprobar si hay scroll o no en la tabla
	// En caso que si haya scroll, reducimos el tama?o de cabecera y pie
	if($("#" + id_table + "_divbody").get(0).scrollHeight > $("#" + id_table + "_divbody").height()){
		var anchorhead = $("#" + id_table + "_divhead").attr("style");
		if(typeof(anchorhead) != 'undefined'){
			if((anchorhead.toLowerCase().indexOf("width") > 0) && !(arrayHadScroll.getItem(id_table))){
				// Obtenemos el valor del ancho del div de la cabecera
				if(anchorhead.indexOf(";",anchorhead.toLowerCase().indexOf("width")) > 0){var widthhead = anchorhead.substring(anchorhead.toLowerCase().indexOf("width"), anchorhead.indexOf(";",anchorhead.toLowerCase().indexOf("width")));}
				else{var widthhead = anchorhead.substring(anchorhead.toLowerCase().indexOf("width"), anchorhead.length);}
				var valuewidthhead = widthhead.substring(widthhead.indexOf(":")+1, widthhead.length);
				//alert("style:" + anchorhead + "- solo width:" + widthhead + "- empieza width:" + anchorhead.toLowerCase().indexOf("width") + "- acaba width:" + anchorhead.indexOf(";",anchorhead.toLowerCase().indexOf("width")));
				//reducimos el valor del width en 2.7%
				if(valuewidthhead.indexOf("%") > 0){
					var valuehead = valuewidthhead.substring(0,valuewidthhead.indexOf("%"));
					valuehead = parseInt(valuehead) - 2.7;
					valuehead = "width:" + valuehead + "%;";
					$("#" + id_table + "_divhead").attr("style", "position:relative;" + valuehead);
				}else{
					//reducimos el valor del width en 15px
					if(valuewidthhead.toLowerCase().indexOf("px") > 0){
						var valuehead = valuewidthhead.substring(0,valuewidthhead.toLowerCase().indexOf("px"));
						valuehead = parseInt(valuehead) - 15;
						valuehead = "width:" + valuehead + "px;";
						$("#" + id_table + "_divhead").attr("style", "position:relative;" + valuehead);
					}
				}
			}
			var anchorfoot = $("#" + id_table + "_divfoot").attr("style");
			if(typeof(anchorfoot) != 'undefined'){
				if((anchorfoot.toLowerCase().indexOf("width") > 0) && !(arrayHadScroll.getItem(id_table))){
					// Obtenemos el valor del ancho del div del pie
					if(anchorfoot.indexOf(";",anchorfoot.toLowerCase().indexOf("width")) > 0){var widthfoot = anchorfoot.substring(anchorfoot.toLowerCase().indexOf("width"), anchorfoot.indexOf(";",anchorfoot.toLowerCase().indexOf("width")));}
					else{var widthfoot = anchorfoot.substring(anchorfoot.toLowerCase().indexOf("width"), anchorfoot.length);}
					var valuewidthfoot = widthfoot.substring(widthfoot.indexOf(":")+1, widthfoot.length);
					//reducimos el valor del width en 2.7%
					if(valuewidthfoot.indexOf("%") > 0){
						var valuefoot = valuewidthfoot.substring(0,valuewidthfoot.indexOf("%"));
						valuefoot = parseInt(valuefoot) - 2.7;
						valuefoot = "width:" + valuefoot + "%;";
						$("#" + id_table + "_divfoot").attr("style", "position:relative;" + valuefoot);
					}else{
						//reducimos el valor del width en 15px
						if(valuewidthfoot.toLowerCase().indexOf("px") > 0){
							var valuehead = valuewidthhead.substring(0,valuewidthhead.toLowerCase().indexOf("px"));
							valuehead = parseInt(valuehead) - 15;
							valuehead = "width:" + valuehead + "px;";
							$("#" + id_table + "_divfoot").attr("style", "position:relative;" + valuehead);
						}
					}
				}
			}
			arrayHadScroll.setItem(id_table, true);
		}
	}else{ //Sino hay scroll, pero lo ha habido antes, aumentamos el ancho de cabecera y pie
		var anchorhead = $("#" + id_table + "_divhead").attr("style");
		if(typeof(anchorhead) != 'undefined'){
			if ((anchorhead.toLowerCase().indexOf("width") > 0) && (arrayHadScroll.getItem(id_table))){
				// Obtenemos el valor del ancho del div de la cabecera
				if(anchorhead.indexOf(";",anchorhead.toLowerCase().indexOf("width")) > 0){var widthhead = anchorhead.substring(anchorhead.toLowerCase().indexOf("width"), anchorhead.indexOf(";",anchorhead.toLowerCase().indexOf("width")));}
				else{var widthhead = anchorhead.substring(anchorhead.toLowerCase().indexOf("width"), anchorhead.length);}
				var valuewidthhead = widthhead.substring(widthhead.indexOf(":")+1, widthhead.length);
				//aumentamos el valor del width en 2.7%
				if(valuewidthhead.indexOf("%") > 0){
					var valuehead = valuewidthhead.substring(0,valuewidthhead.indexOf("%"));
					valuehead = parseInt(valuehead) + 3;
					valuehead = "width:" + valuehead + "%;";
					$("#" + id_table + "_divhead").attr("style", "position:relative;" + valuehead);
				}else{
					//aumentamos el valor del width en 15px
					if(valuewidthhead.toLowerCase().indexOf("px") > 0){
						var valuehead = valuewidthhead.substring(0,valuewidthhead.toLowerCase().indexOf("px"));
						valuehead = parseInt(valuehead) + 15;
						valuehead = "width:" + valuehead + "px;";
						$("#" + id_table + "_divhead").attr("style", "position:relative;" + valuehead);
					}
				}
			}
			var anchorfoot = $("#" + id_table + "_divfoot").attr("style");
			if(typeof(anchorfoot) != 'undefined'){
				if((anchorfoot.toLowerCase().indexOf("width") > 0) && (arrayHadScroll.getItem(id_table))){
					// Obtenemos el valor del ancho del div del pie
					if(anchorfoot.indexOf(";",anchorfoot.toLowerCase().indexOf("width")) > 0){var widthfoot = anchorfoot.substring(anchorfoot.toLowerCase().indexOf("width"), anchorfoot.indexOf(";",anchorfoot.toLowerCase().indexOf("width")));}
					else{var widthfoot = anchorfoot.substring(anchorfoot.toLowerCase().indexOf("width"), anchorfoot.length);}
					var valuewidthfoot = widthfoot.substring(widthfoot.indexOf(":")+1, widthfoot.length);
					//aumentamos el valor del width en 2.7%
					if(valuewidthfoot.indexOf("%") > 0){
						var valuefoot = valuewidthfoot.substring(0,valuewidthfoot.indexOf("%"));
						valuefoot = parseInt(valuefoot) + 3;
						valuefoot = "width:" + valuefoot + "%;";
						$("#" + id_table + "_divfoot").attr("style", "position:relative;" + valuefoot);
					}else{
						//aumentamos el valor del width en 15px
						if(valuewidthfoot.toLowerCase().indexOf("px") > 0){
							var valuehead = valuewidthhead.substring(0,valuewidthhead.toLowerCase().indexOf("px"));
							valuehead = parseInt(valuehead) + 15;
							valuehead = "width:" + valuehead + "px;";
							$("#" + id_table + "_divfoot").attr("style", "position:relative;" + valuehead);
						}
					}
				}
			}
			arrayHadScroll.setItem(id_table, false);
		}
	}
}*/