//-----VARIABLES---------------------------------------------------------------------------------------------------//
var pictureSource;   // picture source
var destinationType; // sets the format of returned value
var nota_txt = ""; // texto de la nota
var nota_foto = ""; // se guarda la imagen sacada con la camara
var nota_latitud = ""; // latitud de donde fue sacada la foto
var nota_longitud = ""; // longitud de donde fue sacada la foto
var nota_fechaHora = "";
var nota_ciudad = "ciudad";
var nota_pais = "pais";

//-----------------//

function onLoad() {
    document.addEventListener("deviceready",onDeviceReady,false);
}
            
function onDeviceReady() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

//-----CAMARA------------------------------------------------------------------------------------------------------//
//foto sacada con exito
function onPhotoDataSuccess(imageData) {
	var smallImage = document.getElementById('smallImage');
	smallImage.src = "data:image/jpeg;base64," + imageData;
	nota_foto = imageData;
}

function capturePhoto() {
	// toma la foto usando la camara del dispositivo y la devuelve como base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL, 
    saveToPhotoAlbum: true,
    correctOrientation: true});
}

// si algo sale mal
function onFail(message) {
  alert('Failed because: ' + message);
}  
//-----------------------------------------------------------------------------------------------------------------//

//-----GEOLOCATION-------------------------------------------------------------------------------------------------//
function onSuccess(position) {
  nota_latitud = position.coords.latitude;
  nota_longitud = position.coords.longitude;
  getLugar(nota_latitud, nota_longitud);
};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
//-----------------------------------------------------------------------------------------------------------------//

//-----GEOCODE-----------------------------------------------------------------------------------------------------//
function getLugar(ltd, lng) {
  var latlng = new google.maps.LatLng(ltd, lng);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) { // Si todo salió bien
      if (results[0]) {
        var arrAddress = results[0].address_components;
        arrAddress.forEach(function(address_component) {
            if (address_component.types[0] == "locality") {
                nota_ciudad = address_component.long_name;
            } else if (address_component.types[0] == "country") {
                nota_pais = address_component.long_name;
              }
        });
      } else {
        // ¡No se encontraron resultados!
      }
    } else {
      // Geocoder falló
    }

  });
}
//-----------------------------------------------------------------------------------------------------------------//

//-----GUARDAR-----------------------------------------------------------------------------------------------------//
function saveNote() {

	var fecha = new Date();

	nota_fechaHora = fecha.getDate()+"/"+fecha.getMonth()+"/"+fecha.getFullYear()+" "+fecha.getHours()+":"+minutos(fecha.getMinutes());
	
  nota_txt = document.getElementById('inputNote').value;

	if (nota_txt != "") {
		var arrayNotas = JSON.parse(localStorage.notas);

		arrayNotas.unshift({texto: nota_txt, foto: nota_foto, fecha_hora: nota_fechaHora, latitud: nota_latitud, longitud: nota_longitud, ciudad: nota_ciudad, pais: nota_pais});

    localStorage.notas = JSON.stringify(arrayNotas);

		window.history.back();
	} else {
		//VER COMO DESHABILITAR BOTON GUARDAR
		alert("Ingrese una nota");
	}
}  
//-----------------------------------------------------------------------------------------------------------------//

//-----ARREGLA MINUTOS---------------------------------------------------------------------------------------------//
function minutos(num) {
  if (num <= 9) {
    return ("0" + num);
  }
  return num;
}
//-----------------------------------------------------------------------------------------------------------------//

//-----HABILITA/DESHABILITA BOTON GUARDAR--------------------------------------------------------------------------//
function contador() {
  var cantCar = document.getElementById('inputNote').value.length;
  var maxLength = 200;
  var leftCar = maxLength - cantCar;
  if ((leftCar >= 0) && (leftCar < maxLength)) {
    document.getElementById('save').removeAttribute('disabled');
  } else {
      document.getElementById('save').setAttribute('disabled', 'disabled');
    }
  document.getElementById('cantidad').innerHTML = leftCar.toString();  
}
//-----------------------------------------------------------------------------------------------------------------//

//-----CARGAR LISTA DE NOTAS---------------------------------------------------------------------------------------//
function cargarNotas() {
  if (localStorage.notas === undefined) {
    localStorage.notas = '[]';
  } else {
    var arrayNotas = JSON.parse(localStorage.notas);
    if (arrayNotas.length > 0) {
      var listaNotas = document.getElementById('notas');

      for (var i=0; i<=arrayNotas.length-1; i++) {

        //va a contener todos los elemento de una nota
        var unaNota = document.createElement('div');
        unaNota.setAttribute('id', 'nota');
        unaNota.setAttribute('data-value', i);
        
        //ubicacion
        var ubicacion = document.createElement('p');
        ubicacion.setAttribute('class', 'lugar');
        ubicacion.textContent = arrayNotas[i].ciudad + ", " + arrayNotas[i].pais;
        unaNota.appendChild(ubicacion);
        
        //fecha y hora
        var fechaHora = document.createElement('p');
        fechaHora.setAttribute('class', 'fecha');
        fechaHora.textContent = arrayNotas[i].fecha_hora;
        unaNota.appendChild(fechaHora);

        //se crea un elemento que contanga la imagen de la nota si es que la tiene
        if (arrayNotas[i].foto != "") {
          var imagen = document.createElement('img');
          imagen.setAttribute('class', 'foto');
          imagen.setAttribute('src', "data:image/jpeg;base64," + arrayNotas[i].foto);
          unaNota.appendChild(imagen);
        }

        //texto de la nota
        var notaText = document.createTextNode(arrayNotas[i].texto);
        unaNota.appendChild(notaText);
        
        //link a la nota completa
        var detalle = document.createElement('a');
        detalle.setAttribute('type', 'button');
        detalle.setAttribute('class', 'btn btn-link');
        detalle.href = "seeNote.html?id="+i;
        detalle.textContent = "+"
        unaNota.appendChild(detalle);

        listaNotas.appendChild(unaNota);
      }
    }
  }
}
//-----------------------------------------------------------------------------------------------------------------//

//-----TOMAR ID----------------------------------------------------------------------------------------------------//
function getGET() {
	//url
  	var loc = document.location.href;
  	// si existe el ?
  	if (loc.indexOf('?') >0 ) {
    	// cogemos la parte de la url que hay despues del interrogante
      	var getString = loc.split('?')[1];
      	// obtenemos un array con cada clave=valor
      	var GET = getString.split('&');
      	var get = {};
      	// recorremos todo el array de valores
      	for(var i = 0, l = GET.length; i < l; i++){
          	var tmp = GET[i].split('=');
          	get[tmp[0]] = unescape(decodeURI(tmp[1]));
      	}
    return get[tmp[0]];
  }
}
//-----------------------------------------------------------------------------------------------------------------//

//-----MAPA--------------------------------------------------------------------------------------------------------//
function seeMap(ltd, ltg){

  var baseUrl = "http://maps.google.com/maps/api/staticmap?";
  var params = new Array();
  var map = new google.maps.Map(document.getElementById("map_canvas"));

  params.push("center=" + ltd +','+ ltg);
  params.push("zoom=" + 15);

  params.push("size=" + "500x500");
  params.push("markers=" + ltd +','+ ltg);
  params.push("maptype=roadmap");

  var ret = baseUrl + params.join("&") ;
  return ret;
}
//-----------------------------------------------------------------------------------------------------------------//

//-----MUESTRA NOTA COMPLETA---------------------------------------------------------------------------------------//
function cargarNota(){

  var id = getGET();

  var arrayNotas = JSON.parse(localStorage.notas);
  ltd = arrayNotas[id].latitud;
  ltg = arrayNotas[id].longitud;
  
  var mapa_url = seeMap(ltd, ltg);
  var laNota = document.getElementById('nota');
  
  //fecha y hora
  var fh = document.getElementById('fecha');
  fh.textContent = arrayNotas[id].fecha_hora + " en ";
  //lugar
  var lugar = document.getElementById('address');
  lugar.textContent = arrayNotas[id].ciudad + ", " + arrayNotas[id].pais;
  //texto de la nota
  var texto = document.createElement('p');
  texto.setAttribute('id', 'textoNota');
  texto.textContent = arrayNotas[id].texto;
  laNota.appendChild(texto);
  //foto de la nota
  if (arrayNotas[id].foto != "") {
    var foto = document.createElement('img');
    foto.setAttribute('id', 'largeImage')
    foto.setAttribute('src', "data:image/jpeg;base64," + arrayNotas[id].foto);
    laNota.appendChild(foto);
  }
  //mapa con ubicacion  
  var map = document.createElement('img');
  map.setAttribute('id', 'largeMapa')
  map.setAttribute('src', mapa_url);
  document.getElementById("map_canvas").appendChild(map);
}
//-----------------------------------------------------------------------------------------------------------------//

//-----COMPARTIR---------------------------------------------------------------------------------------------------//
function compartir() {
  var id = getGET();
  var arrayNotas = JSON.parse(localStorage.notas);
  var sendNota = arrayNotas[id].texto;
  if (arrayNotas[id].foto != ""){
    var sendFoto = "data:image/jpeg;base64," + arrayNotas[id].image;
    window.plugins.socialsharing.share(nota, null, foto, null);
  } else {
    window.plugins.socialsharing.share(nota);
  }
}
//-----------------------------------------------------------------------------------------------------------------//

//-----ELIMINAR NOTA-----------------------------------------------------------------------------------------------//
function eliminarNota() {
  var ok = confirm("¿Seguro que quiere eliminar esta nota?");
  if (ok) {
    var id = getGET();
    var arrayNotas = JSON.parse(localStorage.notas);
    arrayNotas.splice(id, 1);
    localStorage.notas = JSON.stringify(arrayNotas);
    window.history.back();
  }  
}
//-----------------------------------------------------------------------------------------------------------------//

//-----INICIALIZADORES---------------------------------------------------------------------------------------------//
//index.html
function initializeIndex() {
  cargarNotas();
}

//addNote.html
function initializeAddNote() {
  onLoad();
}

//seeNote.html
function initializeSeeNote() {
  cargarNota();
}