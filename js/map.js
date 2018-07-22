var Model = function(){
	// These are the real estate listings that will be shown to the user.
	// Normally we'd have these in a database instead.
	this.locations_original = ko.observableArray([
		{title: 'Epic Office', location: {lat: 42.9960594, lng: -89.568889}},
		{title: 'Burlington', location: {lat: 43.05493260000001, lng: -89.5002401}},
		{title: 'Burger king', location: {lat: 43.1013674, lng: -89.347495}},
		{title: 'Kohls', location: {lat: 43.0567389, lng: -89.51128509999999}},
		{title: 'Swagat', location: {lat: 43.0752015, lng: -89.51759349999999}},
		{title: 'Capitol', location: {lat: 43.0747126, lng: -89.3843732}},
		{title: 'park', location: {lat: 43.1278811, lng: -89.37041019999999}}
	]);
	
	
}


var View = function(){
	this.markers = [];

	this.map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 43.0498933, lng: -89.5073649},
	  zoom: 11
	});

	this.largeInfowindow = new google.maps.InfoWindow();

	this.bounds = new google.maps.LatLngBounds();
}

var ViewModel = function(){


	this.model = ko.observable(new Model());

	this.view =  new View();

	this.filterText = ko.observable('');

	
	this.initMap = function () {
		// Constructor creates a new map - only center and zoom are required.

		this.filter_location = ko.observableArray();

		// The following group uses the location array to create an array of markers on initialize.
		for (var i = 0; i < this.model().locations_original().length; i++) {
			this.filter_location.push(this.model().locations_original()[i]);
		}


		for (var i = 0; i < this.filter_location().length; i++) {

			// Get the position from the location array.
		    var position = this.filter_location()[i].location;
		    
		    var title = this.filter_location()[i].title;

		    // Create a marker per location, and put into markers array.
		    var marker = new google.maps.Marker({
		        map: this.view.map,
		        position: position,
		        title: title,
		        animation: google.maps.Animation.DROP,
		        id: i
		     });
		    //marker.visibleMarker(true);
		    // Push the marker to our array of markers.
		    this.view.markers.push(marker);
		    // if(i === 2) marker.visible = false;
		    // console.log(marker);


		    var populateInfoWindow = this.populateInfoWindow;
		    var largeInfowindow = this.view.largeInfowindow;
		    // Create an onclick event to open an infowindow at each marker.
		    marker.addListener('click', function() {
		      	populateInfoWindow(this, largeInfowindow);
		    });
		

		    this.view.bounds.extend(this.view.markers[i].position);
		}
		// Extend the boundaries of the map for each marker
		this.view.map.fitBounds(this.view.bounds);

	};

	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	this.populateInfoWindow = function (marker, infowindow) {
		var lat = marker.position.lat();
		var long = marker.position.lng();
		var latlong = lat +","+ long ;

	    // Check to make sure the infowindow is not already opened on this marker.
	    if (infowindow.marker != marker) {
	        infowindow.marker = marker;
	        var url = 'https://api.foursquare.com/v2/venues/search?ll=' + latlong + '&client_id=OFPDBI3PEIOE1QBLIIR5A1GZS1Q5UDWWKTGTHAYOXVOQ2ZVY&client_secret=GRXLCYLQAR2IBA33G1DNWJBFPBBWYAEDW2PLTGKUZBOUAEXR&v=20180715'
		    var info;

		    $.getJSON(url, function(data){
		    	var result = data.response.venues;
	            var name = result[0].name;
	            var pic = result[0].categories[0].icon["prefix"];
	            var address = result[0].location.formattedAddress[0];
	            console.log(address);
	            var picture = pic + ".png";

	            //info ='<div>'+ name + '</div>' + '<img src=' + picture + '></img>';
	            info ='<div>'+ name + '</div>' + '<div>' + address + '</div>';
	            console.log(picture);	

	            infowindow.setContent('<div>' + info + '</div>');
	        	infowindow.open(marker.map, marker);
	        
		    }).error(function(e){
            
    		});
	        
	        // Make sure the marker property is cleared if the infowindow is closed.
	        infowindow.addListener('closeclick',function(){
	           infowindow.setMarker = null;
	        });
	    }
	};
	
  	// This function will loop through the listings and hide them all.
  	this.hideMarkers = function(marker) {
     	marker.setMap(null);
  	}

	this.filtering = function(){
		var word = this.filterText();
		this.locations = this.model().locations_original;
		
		this.filter_location.removeAll();

		for(var i =0; i<this.locations().length; i++){
			//console.log(typeof this.locations()[i]);
			if (this.locations()[i].title.toLowerCase().indexOf(word.toLowerCase()) !== -1){
				console.log("matched " + this.locations()[i].title + " with " + word);
				console.log();
				
				this.filter_location.push(this.locations()[i]);
				
				
			}
			else{
				vm.hideMarkers(vm.view.markers[i]);
			}
		}
	}
	// printAB fn for connecting list with markers info
	var largeInfowindow = this.view.largeInfowindow;
	this.printAB = function(){
		//console.log(this.title);
		//console.log(vm.view.markers[0].title);
		for(var i =0; i<vm.view.markers.length; i++){
			//console.log(vm.view.markers[i].title);
			if (this.title === vm.view.markers[i].title){

				vm.populateInfoWindow(vm.view.markers[i], largeInfowindow);
			}
		}
		

	}

}

var vm = new ViewModel();
vm.initMap();


ko.applyBindings(vm);