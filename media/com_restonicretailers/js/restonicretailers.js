/**
 * Created by Chad Windnagle on 6/15/14.
 */

// kick off the map load
google.maps.event.addDomListener(window, 'load', pageMapLoad);

// add watcher to the form submit
window.addEventListener('submit', formSubmit, false);

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

    var zip = getZipcode()

    if(! zip)
    {
        console.log('there was a zipcode issue');
        return
    }

    geocodeZipcode(zip, function(latlong) {
        if (! latlong)
        {
            return
        }

        lookupDatabaseRecords(latlong, function(recordsList) {
            getLocationListDirections(recordsList, latlong, function(calculatedLocations) {

            });
        });

    });


    console.log(zip);
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

            var map = new google.maps.Map(document.getElementById("results"), mapOptions);
        }
    });

    // set the map div element
    //var map = new google.maps.Map(document.getElementById('results'), mapOptions);
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
            // something wasn't okay, send error message
            callback(status); // exit early
        }

        var location = results[0].geometry.location;

        console.log(location);

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

function getZipcode()
{
    var zipcode = document.getElementById('zip').value;

    zipcode = '32168';

    if (zipcode.length && zipcode != '')
    {
        return zipcode;
    }

    return false;
}

function lookupDatabaseRecords(latlong, callback)
{

    var url = 'index.php?option=com_restonicretailers&view=retailerlocations&format=json';

    console.log('records');
    console.log(latlong);

    jQuery.ajax({
       type: "POST",
        url: url,
        data: latlong,
        dataType: "json",
        success: function(resultList)
        {
            callback(resultList);
        }
    });
}

function getLocationListDirections(resultList, latlong, callback)
{
    console.log('write log');
    console.log(latlong);
    console.log(resultList);

    latlongMap = new google.maps.LatLng(latlong.latitude, latlong.longitude);

    origins = [];
    destinations = [];

    for(iterator = 0; iterator < resultList.length; iterator++)
    {

        destinations.push(new google.maps.LatLng(resultList[iterator].location_lat, resultList[iterator].location_long));
    }

    console.log(destinations);

}

function getDistanceCalculations(element, index, array)
{
    console.log(element, index, array);
}