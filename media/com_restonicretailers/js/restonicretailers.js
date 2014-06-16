/**
 * Created by Chad Windnagle on 6/15/14.
 */
function initislise()
{

    buildMapOnLoad();

    geocodeZipcode('32168');
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

function geocodeZipcode(zip)
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
        if (status == google.maps.GeocoderStatus.OK)
        {
            var location = results[0].geometry.location;
            console.log(location);
            console.log("Latitude: " + location.lat());
            console.log("Longitude: " + location.lng())
            // exit early
            return location;
        }

        // something wasn't okay, send error message
        return status;
    });
}

function getZipcode()
{
    zipcode = document.getElementById('zip').value();

    if (zipcode.length && zipcode != '')
    {
        return zipcode;
    }

    return false;

}



google.maps.event.addDomListener(window, 'load', initislise);