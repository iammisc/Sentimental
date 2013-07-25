// General admin JS.


// This is the angularjs module that all things are added to. It's a namespace
// basically.
var sentimentalApp = angular.module('sentimental', [], function($locationProvider) {
	// Make angularjs accept standard URL arguments.
	$locationProvider.html5Mode(true).hashPrefix("!");
});

sentimentalApp.controller('MapController', function MapController($scope) {
	// Controller that manages the emotion map.

	// Values that are watched are stored in $scope.watch. Initilize here.
	$scope.watched = {
		name: '',
		relax_name: false,
		relax_location: false,
		address: '',
		city: '',
		state: '',
		zip: '',
		num_results: 1
	};


	$scope.lnglat = "-122.41952431201935,37.764073094986266";
});


init_gmap = function(mapElement) {
    // Initalizes the Google Map.
    //
    // Args:
    // mapElement - DOM element to place the map in.
    // Returns: An object with the following properties:
    //     map - The resulting Google Map.
    //     heatmapData - The heatmap array

    var scottsHouse = new google.maps.LatLng(37.764073094986266, -122.41952431201935);

    // Inits the map and sets a default location.
    var mapOptions = {
	center: scottsHouse,
	zoom: 14,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapElement,
	         	          mapOptions);

    var dataArray = new google.maps.MVCArray([
        {location: new google.maps.LatLng(37.7750, -122.4174), weight: 10},
        {location: new google.maps.LatLng(37.7752, -122.4181), weight: 10},
        {location: new google.maps.LatLng(37.7755, -122.4186), weight: 10},
        {location: new google.maps.LatLng(37.7751, -122.4183), weight: 10},
        {location: new google.maps.LatLng(37.7745, -122.4175), weight: 10},
        {location: new google.maps.LatLng(37.7748, -122.4177), weight: 10},
        {location: new google.maps.LatLng(37.7742, -122.4188), weight: 10},
        {location: new google.maps.LatLng(37.7747, -122.4181), weight: 10},
    ]);
    var heatmap = new google.maps.visualization.HeatmapLayer({data: dataArray});
    heatmap.setMap(map);

    return {map : map, heatmapData : dataArray};
};


place_marker_on_map = function(map, latlng) {
	// Places a marker on the map and centers the map on it.
	//
	// Args:
	// map - The map.
	// latlng - A google.maps.LatLng object.
	// Returns:
	// newMarker - The marker on this map.

	var newMarker = new google.maps.Marker({
		position: latlng,
		map: map
	});

	map.panTo(latlng);

	return newMarker;
};


place_marker_for_result_map = function(map, latlng, description) {
	// Place a marker on the given map at latlng and add a tooltip on the marker with description.
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		draggable: false,
		title: description
	});

	if(description === "User") {
		// The user's location gets a blue marker, the business locations get the default (red).
		marker.setIcon('/static/img/blue-dot.png');
	}
	return marker;
};

init_gmap_for_result = function(mapElement, log_line) {
	// Initalizes the Google Map for a single log line in suggest_log admin page.
	//
	// Args:
	// mapElement - DOM element to place the map in.
	// log_line - A suggest_log line dict
	// Returns:
	// map - The resulting Google Map.

	// LatLng of the user making the request
	personLatLng = new google.maps.LatLng(log_line.location.lat, log_line.location.lon);

	var mapOptions = {
		center: personLatLng,
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true,
		keyboardShortcuts: false
	};
	map = new google.maps.Map(mapElement, mapOptions);

	// Placing markers for the user and all of the log lines.
	for(var x = 0; x < log_line.manager_results.length; x++) {
		var manager_results = log_line.manager_results[x];
		for(var y = 0; y < manager_results.results.length; y++) {
			var biz = manager_results.results[y];
			var bizLatLng = new google.maps.LatLng(biz.business_location.lat, biz.business_location.lon);
			place_marker_for_result_map(map, bizLatLng, biz.business_name);
		}
	}

	place_marker_for_result_map(map, personLatLng, "User");

	return map;
};
