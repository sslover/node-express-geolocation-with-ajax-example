// CUSTOM JS FILE //
var map; // global map variable
var markers = []; // array to hold map markers

function init() {
  
  // set some default map details, initial center point, zoom and style
  var mapOptions = {
    center: new google.maps.LatLng(40.74649,-74.0094), // NYC
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  // create the map and reference the div#map-canvas container
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  // get the animals (ajax) 
  // and render them on the map
  renderPlaces();
}

// add form button event
// when the form is submitted (with a new animal), the below runs
jQuery("form").submit(function(e){

	// first, let's pull out all the values
	// the name form field value
	var name = jQuery("#name").val();
	var age = jQuery("#age").val();
	var weight = jQuery("#weight").val();
	var tags = jQuery("#tags").val();
	var breed = jQuery("#breed").val();
	var url = jQuery("#url").val();
	var location = jQuery("#location").val();

	// make sure we have a location
	if(!location || location=="") return alert('We need a location!');
      
	// POST the data from above to our API create route
  jQuery.ajax({
  	url : '/api/create',
  	dataType : 'json',
  	type : 'POST',
  	// we send the data in a data object (with key/value pairs)
  	data : {
  		name : name,
  		age : age,
  		tags : tags,
  		breed : breed,
  		weight: weight,
  		url : url,
  		location : location
  	},
  	success : function(response){
  		if(response.status=="OK"){
	  		// success
	  		console.log(response);
	  		// re-render the map
	  		renderPlaces();
	  		// now, clear the input fields
	  		jQuery("form input").val('');
  		}
  		else {
  			alert("something went wrong");
  		}
  	},
  	error : function(err){
  		// do error checking
  		alert("something went wrong");
  		console.error(err);
  	}
  }); 

	// prevents the form from submitting normally
  e.preventDefault();
  return false;
});

// get Animals JSON from /api/get
// loop through and populate the map with markers
var renderPlaces = function() {
	var infowindow =  new google.maps.InfoWindow({
	    content: ''
	});

	jQuery.ajax({
		url : '/api/get',
		dataType : 'json',
		success : function(response) {

			console.log(response);
			animals = response.animals;
			// now, loop through the animals and add markers to the map
			for(var i=0;i<animals.length;i++){

				var latLng = {
					lat: animals[i].location.geo[1], 
					lng: animals[i].location.geo[0]
				}

				// make and place map maker.
				var marker = new google.maps.Marker({
				    map: map,
				    position: latLng,
				    title : animals[i].name + "<br>" + animals[i].breed + "<br>" + animals[i].location.name
				});

				bindInfoWindow(marker, map, infowindow, '<b>'+animals[i].name + "</b> ("+animals[i].breed+") <br>" + animals[i].location.name);
				// not currently used but good to keep track of markers
				markers.push(marker);
			}

			// now, render the animal image/data
			renderAnimals(animals);

		}
	})
};

// binds a map marker and infoWindow together on click
var bindInfoWindow = function(marker, map, infowindow, html) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}

function renderAnimals(animals){

	// first, make sure the #animal-holder is empty
	jQuery('#animal-holder').empty();

	// loop through all the animals and add them in the animal-holder div
	for(var i=0;i<animals.length;i++){
		var htmlToAdd = '<div class="col-md-4 animal">'+
			'<img src="'+animals[i].url+'">'+
			'<h1>'+animals[i].name+'</h1>'+
			'<ul>'+
				'<li>Location: '+animals[i].location.name+'</li>'+
				'<li>Breed: '+animals[i].breed+'</li>'+
				'<li>Age: '+animals[i].age+'</li>'+
				'<li>Weight: '+animals[i].weight+'</li>'+
				'<li>Tags: '+animals[i].tags+'</li>'+
			'</ul>'+
			'<button id="'+animals[i]._id+'" onclick="deleteAnimal(event)">Delete Animal</button>'+
		'</div>';

		jQuery('#animal-holder').prepend(htmlToAdd);

	}

}


function deleteAnimal(event){
	var targetedId = event.target.id;
	console.log('the animal to delete is ' + targetedId);

	// now, let's call the delete route with AJAX
	jQuery.ajax({
		url : '/api/delete/'+targetedId,
		dataType : 'json',
		success : function(response) {
			// now, let's re-render the animals

			renderPlaces();

		}
	})

	event.preventDefault();
}

// when page is ready, initialize the map!
google.maps.event.addDomListener(window, 'load', init);