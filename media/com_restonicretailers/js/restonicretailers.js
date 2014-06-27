/**
 * Created by Chad Windnagle on 6/15/14.
 */

// kick off the map load
google.maps.event.addDomListener(window, 'load', pageMapLoad);

// add watcher to the form submit
window.addEventListener('submit', formSubmit, false);

// these make me sad
globalResultList = '';
globalOriginLatlng = ''
globalArrayCounter = 0;

/*
 * Loads the map function on page load
 * called by google's map loader
 */

function pageMapLoad()
{
    buildMapOnLoad();
    //geocodeZipcode('32168');
}


/*
 * Kicks off actions when the form is submitted
 * Fairly procedural
 */

function formSubmit()
{
    event.preventDefault(); // stop form submit

    // clear any previous results
    clearResultList();

    // clear old errors
    clearErrors();

    // clear the global vars list
    globalResultList = '';
    globalOriginLatlng = '';
    globalArrayCounter = 0;

    // init the map
    buildMapOnLoad();

    var zip = getZipcode()

    if(! zip)
    {
        return
    }

    // kick off the major tasks like geocoding, getting results and populating content
    geocodeZipcode(zip, function(latlong) {
        // set our global placeholder
        globalOriginLatlng = latlong;

        // geocoding was successful so we can move on to getting records
        lookupDatabaseRecords(latlong, function(results) {

            // if there aren't any results just quit now
            if (! results.length || results == '')
            {
                writeError('No results found. Try a larger distance.');
                return false;
            }

            var bounds = new google.maps.LatLngBounds();

            // throw our results into the global list
            // hate doing this but its the only way around callback hell
            globalResultList = results;

            // add our driving distances - this is most of the remaining functionality
            getOriginDestinationDrivingDistance();

            // loop through items and expand the map area
            for (var i = 0; i < results.length; i++)
            {
                var locationLatLong = new google.maps.LatLng(results[i].location_lat, results[i].location_long);
                bounds.extend(locationLatLong);
            }

            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
    });
}

/*
 * Creates a google map
 * centers on united states zoomed out
 */

function buildMapOnLoad()
{
    var geocoder = new google.maps.Geocoder();

    // We set the map to show the middle of the US, zoomed out quite a bit
    geocoder.geocode({'address': "1200 Market Street St. Louis MO 63103"}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var mapOptions = {
                zoom: 3,
                center: results[0].geometry.location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // i hate globals but we don't have a choice here
            map = new google.maps.Map(document.getElementById("results"), mapOptions);
        }
    });
}

/*
 * Takes a zipcode in string format
 * Sends it to Google Maps API
 * Returns an object containing latitude & longitude
 */

function geocodeZipcode(zip, callback)
{
    var geocodeOptions =
    {
        'address': zip
    }

    // instiate the google map geocoder class
    var geocoder = new google.maps.Geocoder();

    // places the results into a function
    geocoder.geocode(geocodeOptions, function(results, status) {

        // validate response and return location or error
        if (status != google.maps.GeocoderStatus.OK)
        {
            writeError('Google\'s API had an error. Readmore: ' + status);
            // something wasn't okay, send error message
            callback(status); // exit early
        }

        var location = results[0].geometry.location;

        // build json object
        var latlong =
        {
            'latitude': location.lat(),
            'longitude': location.lng()
        }

        // callbacks are some unknown return-y thing that apparently work
        callback(latlong);
    });
}

/*
 * grab the zip from the DOM
 * Does a little validation to make sure we have a value
 */

function getZipcode()
{
    var zipcode = document.getElementById('zip').value;

    if (zipcode.length && zipcode != '')
    {
        return zipcode;
    }

    writeError('Your location is required!');

    return false;
}

/*
 * Search database for items. Returns a json array of objects
 */

function lookupDatabaseRecords(latlong, callback)
{
    var url = 'index.php?option=com_restonicretailers&view=retailerlocations&format=json';

    var maximumDistance = document.getElementById('distanceConfig');

    var data = {
        'latitude': latlong.latitude,
        'longitude': latlong.longitude,
        'maximumDistance': maximumDistance.options[maximumDistance.selectedIndex].value
    };

    var request = jQuery.ajax({
        type: "POST",
        url: url,
        data: data,
        dataType: "json"
    }); // end ajax

    request.success(callback);
    request.error(function(jqXHR, textStatus, errorThrow){
        writeErorr('There was an error getting data! ' + errorThrow );
    })

}

/*
 * Pretty big blocking function
 * Loops through our global array of objects
 * populates the result list and places our marker pins
 */

function getOriginDestinationDrivingDistance()
{
    // loop through items in the global
    globalResultList.forEach(function(value, index, globalResultList) {
        // build a latlng object from our global origin
        originLocation = new google.maps.LatLng(globalOriginLatlng.latitude, globalOriginLatlng.longitude);

        // put origin latlng object into a list
        var originLocationList = [originLocation];

        console.log(originLocationList);

        // same for destination
        var destinationLocation = new google.maps.LatLng(value.location_lat, value.location_long);
        var destinationLocationList = [destinationLocation];

        console.log(destinationLocation);

        // get a new service
        var service = new google.maps.DistanceMatrixService();

        service.getDistanceMatrix(
            {
                origins: originLocationList,
                destinations: destinationLocationList,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidHighways: false,
                avoidTolls: false
            },  function(response, status) { // call back function finishes things off

                    // check the status of the response
                    if (status != google.maps.DistanceMatrixStatus.OK)
                    {
                        writeError('Google Maps API had a problem ' + status);
                        return
                    }

                    // pull the global counter into a local variable
                    var count = globalArrayCounter;

                    var maximumDistance = document.getElementById('distanceConfig');

                    // we need miles as text and as an integer
                    var driving_miles_text = response.rows[0].elements[0].distance.text;
                    var driving_miles_value = getMetersFromMiles(response.rows[0].elements[0].distance.value) // this value comes as meters

                    // push the text into our global object
                    globalResultList[count].location_driving_miles = driving_miles_text;

                    // checks our driving distance
                    // keeps us accurate around lakes, rivers and streams
                    if (driving_miles_value < (maximumDistance.options[maximumDistance.selectedIndex].value * 1))
                    {
                        addResultToList(globalResultList[count]);
                        addMapPins(globalResultList[count]);
                    }
                    // anything outside our max driving range gets skipped

                    // increment our global counter
                    globalArrayCounter = (count + 1);
                }
        )
    })
}

/*
 * simple function to convert meters to miles
 * google api returns values as meters only
 */

function getMetersFromMiles(meters)
{
    return meters *  0.00062137;
}

/*
 * Takes a record and appends it to the result list
 */

function addResultToList(locationRecord)
{
    // get the result list element
    var resultList = document.getElementById('retailer-locations');

    // create a new container
    var resultContainer = document.createElement('div');

    // give it a class name
    resultContainer.className = 'retailer-location';

    // set the contents
    resultContainer.innerHTML = recordTextBlock(locationRecord);

    // put it in the list
    resultList.appendChild(resultContainer);
}

/*
 * handy reusable function to build a text block for info window and result
 */

function recordTextBlock(locationRecord)
{
    var textblock = '';
    textblock +=     '<h3>' + locationRecord.location_name + '</h3>'
    textblock +=     '<ul>';
    textblock +=         addBlockLine('Phone', locationRecord.location_phone);
    textblock +=         addBlockLine('Address', locationRecord.location_address);
    textblock +=         addBlockLine('City', locationRecord.location_city);
    textblock +=         addBlockLine('State', locationRecord.location_state);
    textblock +=         addBlockLine('Zipcode', locationRecord.location_zip);
    textblock +=         addBlockLine('Distance (Est Miles)', locationRecord.location_driving_miles);
    textblock +=         addWebLink('facebook', locationRecord.location_facebook);
    textblock +=         addWebLink('twitter', locationRecord.location_twitter);
    textblock +=         addWebLink('website', locationRecord.location_website);
    textblock +=     '</ul>'

    return textblock;
}

/*
 * Add a marker pin to the map
 */

function addMapPins(locationRecord)
{
    var locationLatLong = new google.maps.LatLng(locationRecord.location_lat, locationRecord.location_long);

    var marker = new google.maps.Marker({
        position: locationLatLong,
        map: map, // this is a global variable - uck
        icon: '/media/com_restonicretailers/images/map-icon.png'
    });

    var infowindow = addPinInfoWindow(locationLatLong, locationRecord);

    google.maps.event.addListener(marker, 'click', function(){
        infowindow.open(map, marker);
    })

    // add in an info window
    addPinInfoWindow(locationLatLong, locationRecord);
}

/*
 * Reusable function that takes a latlng object and content
 * And puts it on our map as an info window
 */

function addPinInfoWindow(latlng, locationRecord)
{
    var content = recordTextBlock(locationRecord);
    var info = new google.maps.InfoWindow({
        position: latlng,
        content: content,
    })

    return info;
}

/*
 * Reusable function to generate list elements of labels and values
 */

function addBlockLine(label, lineContent)
{
    if (lineContent == '')
    {
        return '';
    }

    return '<li>' + label + ': ' + lineContent + '</li>';
}

/*
 * Useful function for building the web link icons
 */


function addWebLink(label, linkSource)
{
    if (linkSource == '' || (typeof linkSource === 'undefined'))
    {
        return '';
    }

    // init vars
    var imgMarkup;
    var linkMarkup;

    if (label == 'facebook')
    {
        imgMarkup = '<img src="/images/social-icons/facebook.png" />';
        linkMarkup = '<a target="_blank" href="' + linkSource +'">' + imgMarkup + '</a>';
    }

    if (label == 'twitter')
    {
        imgMarkup = '<img src="/images/social-icons/twitter.png" />';
        linkMarkup = '<a target="_blank" href="' + linkSource +'">' + imgMarkup + '</a>';
    }

    if (label == 'website')
    {
        imgMarkup = '<img src="/images/social-icons/goodbed.png" />';
        linkMarkup = '<a target="_blank" href="' + linkSource +'">' + imgMarkup + '</a>';
    }

    // markup vars didn't get set so exit the function
    if ((!imgMarkup || imgMarkup == '') || (!linkMarkup || linkMarkup == ''))
    {
        return false;
    }

    return '<li>' + linkMarkup + '</li>';
}

/*
 * Clear any existing results from the list.
 */

function clearResultList() {
    var resultList = document.getElementById('retailer-locations');
    resultList.innerHTML = '';
}

/*
 * add an error message to the error element
 */

function writeError(message)
{
    var errorContainer = document.getElementById('system-message-container');

    // clear errors
    clearErrors();

    var errorMessage = document.createElement('div');

    errorMessage.className = 'alert alert-warning';
    errorMessage.innerHTML = '<p>' + message + '</p>';

    errorContainer.appendChild(errorMessage);
}

/*
 * Clears the error element values
 */

function clearErrors()
{
    var errorContainer = document.getElementById('system-message-container');

    // clear old errors
    errorContainer.innerHTML = '';
}