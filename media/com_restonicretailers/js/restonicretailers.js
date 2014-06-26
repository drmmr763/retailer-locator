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
        lookupDatabaseRecords(latlong, function(results) {

            for (var i = 0; i < results.length; i++)
            {
                addResultToList(results[i]);

                //getOriginDestinationDrivingDistance(latlong, results[i]);
            }
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

    var request = jQuery.ajax({
        type: "POST",
        url: url,
        data: latlong,
        dataType: "json"
    }); // end ajax

    request.success(callback);
}

function getOriginDestinationDrivingDistance(origin, destination, callback)
{
    console.log('write log');
    console.log(origin);
    console.log(destination);

    // create origin object ew object
    var originLocation = new google.maps.LatLng(origin.latitude, origin.longitude);

    // add origins array - google won't accept anything but
    var originLocationList = [originLocation];

    // same for destination
    var destinationLocation = new google.maps.LatLng(destination.location_lat, destination.location_long);
    var destinationLocationList = [destinationLocation];

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
        }, callback
    )
}

function addResultToList(locationRecord)
{
    console.log(locationRecord);
    var resultList = document.getElementById('retailer-locations');

    resultList.innerHTML += '<div class="retailer-location">';
    resultList.innerHTML +=     '<h3>' + locationRecord.location_name + '</h3>'
    resultList.innerHTML +=     '<ul>';
    resultList.innerHTML +=         addBlockLine('Phone', locationRecord.location_phone);
    resultList.innerHTML +=         addBlockLine('Address', locationRecord.location_address);
    resultList.innerHTML +=         addBlockLine('City', locationRecord.location_city);
    resultList.innerHTML +=         addBlockLine('State', locationRecord.location_state);
    resultList.innerHTML +=         addBlockLine('Zipcode', locationRecord.location_zip);
    resultList.innerHTML +=         addBlockLine('Distance (Est Miles)', locationRecord.location_distance);
    resultList.innerHTML +=         addWebLink('facebook', locationRecord.location_facebook);
    resultList.innerHTML +=         addWebLink('twitter', locationRecord.location_twitter);
    resultList.innerHTML +=         addWebLink('website', locationRecord.location_website);

    resultList.innerHTML +=     '</ul>'
    resultList.innerHTML += '</div>';
}

function addBlockLine(label, lineContent)
{
    if (lineContent == '')
    {
        return;
    }

    return '<li>' + label + ': ' + lineContent + '</li>';
}


function addWebLink(label, linkSource)
{
    if (linkSource == '')
    {
        return;
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