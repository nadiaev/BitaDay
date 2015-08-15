//----VARIABLES----//
var pictureSource;   // picture source
var destinationType; // sets the format of returned value
var noteText = ""; //texto de la nota
var noteImg = ""; //foto de la nota
var noteLtd = ""; //latitud de la nota
var noteLng = ""; //longitud de la nota
var city; //ciudad de la nota
var country; //pais de la nota
var geocoder;

function onLoad() {
    document.addEventListener("deviceready",onDeviceReady,false);
}
            
function onDeviceReady() {
    alert("Device Ready!!");
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

//---------------------------------------------------CAMARA--------------------------------------------------------//
// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Get image handle
  //
  var smallImage = document.getElementById('smallImage');

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;

  noteImg = imageData;
  //alert("IMAGEN GUARDADA");
}

// A button will call this function
//
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL });
}

// Called if something bad happens.
//
function onFail(message) {
  alert('Failed because: ' + message);
}  
//-----------------------------------------------------------------------------------------------------------------//

//--------------------------------------------------GEOLOCATION----------------------------------------------------//
function onSuccess(position) {
  noteLtd = position.coords.latitude;
  noteLng = position.coords.longitude;
  alert(noteLtd +"//"+ noteLng);
};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
//-----------------------------------------------------------------------------------------------------------------//

//-------------------------------------------------------GUARDAR---------------------------------------------------//
function saveNote() {
  //alert("GUARDANDO NOTA");
  noteText = document.getElementById('inputNote').value;

  if (noteText != "") {
    var arrayNotas = JSON.parse(localStorage.notas);

    arrayNotas.push({texto: noteText, image: noteImg, latitude: noteLtd, longitude: noteLng});

    localStorage.notas = JSON.stringify(arrayNotas);

    window.history.back();
  } else {
    alert("Ingrese una nota");
  }
}  
//-----------------------------------------------------------------------------------------------------------------//

//-----------------------------------------------------CARGAR NOTA-------------------------------------------------//
function cargarNotas() {
  //alert('CARGANDO NOTAS');

  //si no existen se crea un elemento en el LS que sera un arreglo para guardar notas 
  if (localStorage.notas === undefined) {
      //alert("arreglo vacio");
      localStorage.notas = '[]';
  }

  //traigo el arreglo de notas del LS
  var mostrarNotas = JSON.parse(localStorage.notas);

  if (mostrarNotas.length > 0) {
    var lasNotas = document.getElementById('notas');
    for (var i=0; i<=mostrarNotas.length-1; i++) {
      var item = document.createElement('li'); //item va a ser una nota dentro de la lista de notas

      //si la nota tiene foto la agrego al elemento item
      if (mostrarNotas[i].image != "") {
        // alert("CARGANDO FOTO");
        var foto = document.createElement('img'); //foto de la nota

        foto.setAttribute('id', 'largeImage')
        foto.setAttribute('src', "data:image/jpeg;base64," + mostrarNotas[i].image);
        item.appendChild(foto);
      }

      //texto de la nota que sera un link a la nota completa
      var newNotalLink = document.createElement("a");
      // ads property to the href attribute
      newNotalLink.href = "seeNote.html?id="+i;
      // creates text in the li
      var liText = document.createTextNode(mostrarNotas[i].texto);
      // ads text to a
      newNotalLink.appendChild(liText);
      item.appendChild(newNotalLink);

      lasNotas.appendChild(item);
    }
  } 
}
//-----------------------------------------------------------------------------------------------------------------//

//-------------------------------------------MUESTRA NOTA COMPLETA-------------------------------------------------//
/*paso el id por  url y lo tomo com geGET e imprimo la nota*/

function cargarNota(){

  var id = getGET();

  var mostrarNotas = JSON.parse(localStorage.notas);

  ltd = mostrarNotas[id].latitude;
  ltg = mostrarNotas[id].longitude;
  var mapa_url = seeMap(ltd,ltg);
  var lasNotas = document.getElementById('nota');
  var item = document.createElement('li');
  var string = document.createElement('p');
  var map = document.createElement('img');

  if (mostrarNotas[id].image != "") {
    // alert("CARGANDO FOTO");
    var foto = document.createElement('img');

    foto.setAttribute('id', 'largeImage')
    foto.setAttribute('src', "data:image/jpeg;base64," + mostrarNotas[id].image);
    item.appendChild(foto);
  }

  string.setAttribute('id', 'nota');
  string.textContent = mostrarNotas[id].texto;
  item.appendChild(string);

  map.setAttribute('id', 'largeMapa')
  map.setAttribute('src', mapa_url);

  lasNotas.appendChild(item); 
  document.getElementById("map_canvas").appendChild(map);
}
//-----------------------------------------------------------------------------------------------------------------//

//---------------------------------------------------TOMAR ID------------------------------------------------------//
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
      alert("entre al get" + get[tmp[0]] );
      return get[tmp[0]];
  }
}
//-----------------------------------------------------------------------------------------------------------------//

//-------------------------------------------------ELIMINAR NOTA---------------------------------------------------//
function eliminarNota() {
  var id = getGET();
  var arrayNotas = JSON.parse(localStorage.notas);
  arrayNotas.splice(id, 1);
  localStorage.notas = JSON.stringify(arrayNotas);
  window.history.back();
}
//-----------------------------------------------------------------------------------------------------------------//

//-----------------------------------------------------MAPA--------------------------------------------------------//
function seeMap(ltd, ltg){

  var baseUrl = "http://maps.google.com/maps/api/staticmap?";
  var params = new Array();
  var map = new google.maps.Map(document.getElementById("map_canvas"));

  params.push("center=" + ltd +','+ ltg);
  params.push("zoom=" + 15 );

  params.push("size=" + "500x500");
  params.push("markers=" + ltd +','+ ltg);
  params.push("maptype=roadmap");

  var ret = baseUrl + params.join("&") ;
  return ret;
}
//-----------------------------------------------------------------------------------------------------------------//

//-----------------------------------------------------GEOCODE-----------------------------------------------------//
function getLugar() {
  alert("function getLugar");
  var latlng = new google.maps.LatLng(noteLtd, noteLng);
  geocoder.geocode({'latLng': latlng}, function(results, status) {
  alert(status);
  if (status == google.maps.GeocoderStatus.OK) { // Si todo salió bien
    if (results[0]) {
      var arrAddress = results[0].address_components;
      arrAddress.forEach(function(address_component) {
        if (address_component.types[0] == "locality") {
          city = address_component.long_name;
        } else if (address_component.types[0] == "country") {
          country = address_component.long_name;
        }
      });
      //
      // En las variables city y country quedaron la ciudad y país
      // de las coordenadas provistas
      alert("estoy en " + city + ", " + country);
    } else {
      alert("¡No se encontraron resultados!");
    }
  } else {
    alert("Geocoder falló");
  }
});

  // alert("estoy en " + city + ", " + country);
}
//-----------------------------------------------------------------------------------------------------------------//

//--------------------------------------------------COMPARTIR------------------------------------------------------//
function messageOrMessageAndImage() {
  var id = getGET();
  var arrayNotas = JSON.parse(localStorage.notas);
  var nota = arrayNotas[id].texto;
  if (arrayNotas[id].image != ""){
    var foto = "data:image/jpeg;base64," + arrayNotas[id].image;
    window.plugins.socialsharing.share(nota, null, foto, null);
  } else {
    window.plugins.socialsharing.share(nota);
  }
}
//-----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------INICIALIZADORES----------------------------------------------------//
//index.html
function initializeIndex() {
  onLoad();
  //geocoder = new google.maps.Geocoder();
  //getLugar();
  cargarNotas();
}

//addNote.html
function initializeAddNote() {
  onLoad();
  geocoder = new google.maps.Geocoder();
  getLugar();
}

//seeNote.html
function initializeSeeNote() {
  onLoad();
  cargarNota();
}

//-----------------------------------------------------------------------------------------------------------------//