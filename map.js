// JS specifically for the query page.

bizmatchApp.controller('QueryUIController', function QueryUIController($scope, $location, BusinessMatch) {
	// Controller that manages linking the map and URL arguments to the
	// current query. It has no querying logic itself. That is left up to
	// QueryController which is also
	// instantiated in query.html.

	// (disabled) On first load, read in URL arguments and load those into the query.
	// angular.extend($scope.watched, $location.search());

	// Otherwise, update the URL arguments on any change.
	$scope.$watch('watched', function(newVal, oldVal) {
		$scope.query.name = angular.toJson(newVal.name);
		var locationTokens = newVal.lnglat.split(",");
		$scope.query.location = angular.toJson({
			'address1': newVal.address,
			'address2': '',
			'address3': '',
			'city': newVal.city,
			'state': newVal.state,
			'zip': newVal.zip,
			'country': 'US',
			'latitude': parseFloat(locationTokens[1]),
			'longitude': parseFloat(locationTokens[0])
		});
		$scope.query.num_results = newVal.num_results;
		$scope.query.relax_name = newVal.relax_name;
		$scope.query.relax_location = newVal.relax_location;
		if (newVal.suggested_business_id) {
			$scope.query.suggested_business_id = newVal.suggested_business_id;
		} else {
			delete $scope.query.suggested_business_id;
		}
		$location.search($scope.query);
	// Pass true so we are watching even nested changes to the query object.
	}, true);

	$scope.map = init_gmap(document.getElementById("map-canvas"));
	// Setup map marker bindings.
	$scope.queryMarker = null;
	$scope.resultMarkers = [];
	$scope.$watch('watched.lnglat', function(newVal, oldVal) {
		var locationTokens = newVal.split(",");
		$scope.replaceMarker(new google.maps.LatLng(locationTokens[1], locationTokens[0]));
	});
	// Setup click behavior.
	google.maps.event.addListener($scope.map, 'click', function(event) {
		// Since this callback isn't fired from within angularjs, we have to
		// make changes in $apply so it knows to propigate changes.
		$scope.$apply(function() {
			$scope.watched.lnglat = event.latLng.lng() + "," + event.latLng.lat();
		});
	});

	$scope.replaceMarker = function(latlng) {
		// Replace the current marker representing the query location. Doesn't
		// actually update the query, just the map.
		//
		// Args:
		// latlng - google.maps.LatLng with the new query location; null to
		//     remove the marker

		if ($scope.queryMarker) {
			$scope.queryMarker.setMap(null);
		}
		if (latlng) {
			$scope.queryMarker = place_marker_on_map($scope.map, latlng);
		} else {
			$scope.queryMarker = null;
		}
	};

	$scope.replaceResultMarkers = function(latlngs) {
		// Replace the current result marker representing a business location.
		//
		// Args:
		// latlngs - Array of google.maps.LatLng with the new query location;
		//     something falsy to remove the markers

		// Remove any existing markers.
		angular.forEach($scope.resultMarkers, function(marker) {
			marker.setMap(null);
		});
		$scope.resultMarkers = [];
		if (latlngs) {
			angular.forEach(latlngs, function(latlng) {
				$scope.resultMarkers.push(place_marker_on_map($scope.map, latlng));
			});
		}
	};

	// Fill in the request.
	$scope.fillInBusinessMatchRequest = function(request) {
		console.log(request);
		console.log(request.name);
		$scope.watched.name = request.name;
		$scope.watched.address = request.address;
		$scope.watched.city = request.city;
		$scope.watched.state = request.state;
		$scope.watched.zip = request.zip;
		$scope.watched.num_results = request.num_results;
		$scope.watched.relax_name = request.relax_name;
		$scope.watched.relax_location = request.relax_location;
		$scope.watched.name = request.name;
		$scope.watched.lnglat = request.longitude + "," + request.latitude;
	};

	$scope.sampleQueries = [
		{
			'label': 'None',
			'name': '',
			'address': '',
			'city': '',
			'state': '',
			'zip': '',
			'num_results': '',
			'relax_name': false,
			'relax_location': false,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': 'Starbucks with poor location input',
			'name': 'Starbucks',
			'address': '',
			'city': 'San Francisco',
			'state': 'CA',
			'zip': '',
			'num_results': '5',
			'relax_name': false,
			'relax_location': true,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': 'Starbucks with good location input',
			'name': 'Starbucks',
			'address': '706 Mission St',
			'city': 'San Francisco',
			'state': 'CA',
			'zip': '',
			'num_results': '1',
			'relax_name': false,
			'relax_location': false,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': 'Tricky Starbucks (expect 13048424)',
			'name': 'STARBUCKS COFFEE',
			'address': '505 SANSOME ST',
			'city': 'San Francisco',
			'state': 'CA',
			'zip': '94110',
			'num_results': '3',
			'relax_name': false,
			'relax_location': false,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': 'Bua with poor location input',
			'name': 'Bua',
			'address': '',
			'city': 'Claremont',
			'state': 'CA',
			'zip': '',
			'num_results': '5',
			'relax_name': false,
			'relax_location': true,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': 'Bua with good location input',
			'name': 'Bua',
			'address': '450 W 1st St',
			'city': 'Claremont',
			'state': 'CA',
			'zip': '91711',
			'num_results': '1',
			'relax_name': false,
			'relax_location': false,
			'latitude': '',
			'longitude': ''
		},
		{
			'label': "Mo's coffee bar (expect no output)",
			'name': "MO'S COFFEE BAR",
			'address': '750 FOLSOM ST',
			'city': 'San Francisco',
			'state': 'CA',
			'zip': '94107',
			'num_results': '2',
			'relax_name': false,
			'relax_location': false,
			'latitude': '37.782674',
			'longitude': '-122.400456'
		},
		{
			'label': "East Japanese (expect 6984259)",
			'name': "East Japanese",
			'address': '253 W 55th St',
			'city': 'New York',
			'state': 'NY',
			'zip': '10019',
			'num_results': '2',
			'relax_name': false,
			'relax_location': false,
			'latitude': '40.76506',
			'longitude': '-73.982735'
		}
	];
});
