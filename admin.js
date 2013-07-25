// General admin JS.


// This is the angularjs module that all things are added to. It's a namespace
// basically.
var bizmatchApp = angular.module('bizmatch', [], function($locationProvider) {
	// Make angularjs accept standard URL arguments.
	$locationProvider.html5Mode(true).hashPrefix("!");
});


bizmatchApp.service('BusinessMatch', function($http) {
	// Make an angularjs object that allows querying of the BusinessMatch service.

	this.doQuery = function(callback, endpoint, query) {
		// Perform a given query.
		//
		// Args:
		// callback - function(response, status)
		// query - Query object; can provide name, location (including lnglat), phone number,
		//     and debug

		$http.get(endpoint, {
			params: query
		}).success(callback).error(callback);
	};

	this.queryURL = function(endpoint, query) {
		// Return the URL for querying the BusinessMatch service.
		//
		// Args:
		// query - Query object; can provide name, location, phone, num_results, relax_name, relax_location,
		// and suggested_business_id

		return endpoint + "?" + $.param(query);
	};
});

bizmatchApp.controller('QueryController', function QueryController($scope, BusinessMatch) {
	// Controller that manages a BusinessMatch query. It stores a model query
	// and provides a convenient way to bind to results and errors.

	$scope.loading = false;

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

	// Our query model object.
	$scope.query = {};

	$scope.lnglat = "-122.41952431201935,37.764073094986266";

	$scope.doQuery = function(endpoint) {
		// Actually performs a query stored in the controller's model against
		// BusinessMatch and store it in response, any errors in errorMessage,
		// and the last BusinessMatch query URL in lastQueryURL.

		$scope.loading = true;
		$scope.response = undefined;
		$scope.errorMessage = undefined;
		BusinessMatch.doQuery(
			function(response, status) {
				if (status === 0) {
					$scope.errorMessage = "Could not connect to BusinessMatch.";
					$scope.response = undefined;
				} else if (status === 500) {
					$scope.errorMessage = "BusinessMatch unhandled error " + status + ":\n\n" + response;
					$scope.response = undefined;
				} else if (status !== 200) {
					$scope.errorMessage = "BusinessMatch error " + status + ":\n\n" + response.error;
					$scope.response = undefined;
				} else {
					$scope.errorMessage = null;
					// response is automatically decoded from JSON.
					$scope.response = response;
				}
				$scope.loading = false;
			},
			endpoint,
			$scope.query
		);

		$scope.lastQueryURLArgs = $.param($scope.query);
		$scope.lastQueryURL = BusinessMatch.queryURL(endpoint, $scope.query);
	};
});


init_gmap = function(mapElement) {
	// Initalizes the Google Map.
	//
	// Args:
	// mapElement - DOM element to place the map in.
	// Returns:
	// map - The resulting Google Map.

	var scottsHouse = new google.maps.LatLng(37.764073094986266, -122.41952431201935);

	// Inits the map and sets a default location.
	var mapOptions = {
		center: scottsHouse,
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(mapElement,
		mapOptions);

	return map;
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
