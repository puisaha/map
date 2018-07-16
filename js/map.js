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
	//this.markers = ko.observableArray();

	this.map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 43.0498933, lng: -89.5073649},
	  zoom: 11
	});

	this.largeInfowindow = new google.maps.InfoWindow();

	//var largeInfowindow = new google.maps.InfoWindow({content: contentString});
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
		// this.filter_location = this.model().locations_original;


		for (var i = 0; i < this.filter_location().length; i++) {

		// Get the position from the location array.
		    var position = this.filter_location()[i].location;
		    //location: {lat: 42.9960594, lng: -89.568889}
		    
		    var title = this.filter_location()[i].title;

		    // Create a marker per location, and put into markers array.
		    var marker = new google.maps.Marker({
		        map: this.view.map,
		        position: position,
		        title: title,
		        animation: google.maps.Animation.DROP,
		        id: i
		     });
		    // Push the marker to our array of markers.
		    this.view.markers.push(marker);
		    this.FoursquareInfo = function(marker) {
			    
		    };


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
		//console.log(latlong);
	    // Check to make sure the infowindow is not already opened on this marker.
	    if (infowindow.marker != marker) {
	        infowindow.marker = marker;
	        var url = 'https://api.foursquare.com/v2/venues/search?ll=' + latlong + '&client_id=OFPDBI3PEIOE1QBLIIR5A1GZS1Q5UDWWKTGTHAYOXVOQ2ZVY&client_secret=GRXLCYLQAR2IBA33G1DNWJBFPBBWYAEDW2PLTGKUZBOUAEXR&v=20180715'
		    //GET https://api.foursquare.com/v2/venues/search
		    var info;

		    $.getJSON(url, function(data){
		    	var result = data.response.venues;
	            var name = result[0].name;
	            var pic = result[0].categories[0].icon["prefix"];
	            var picture = pic + ".png";

	            info ='<div>'+ name + '</div>' + '<img src=' + picture + '></img>';
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


	this.filtering = function(){
		var word = this.filterText();
		this.locations = this.model().locations_original;
		//console.log(this.locations().length);
		
		this.filter_location.removeAll();

		for(var i =0; i<this.locations().length; i++){
			console.log(typeof this.locations()[i]);
			if (this.locations()[i].title.indexOf(word) !== -1){
				console.log("matched " + this.locations()[i].title + " with " + word);
				this.filter_location.push(this.locations()[i]);
			}
		}
	}

}

var vm = new ViewModel();
vm.initMap();


ko.applyBindings(vm);