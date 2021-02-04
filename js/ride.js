/*global Wlowi _config*/

var Wlowi = window.Wlowi || {};
Wlowi.map = Wlowi.map || {};

(function rideScopeWrapper($) {
    var authToken;
    Wlowi.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestGame(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your game:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var game;
        var pronoun;
        console.log('Response received from API: ', result);
        game = result.Game;
        pronoun = game.Gender === 'Male' ? 'his' : 'her';
        displayUpdate(game.Name + ', your ' + game.Color + ' game, is on ' + pronoun + ' way.');
        animateArrival(function animateCallback() {
            displayUpdate(game.Name + ' has arrived. Giddy up!');
            Wlowi.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $(Wlowi.map).on('pickupChange', handlePickupChanged);

        Wlowi.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request game');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = Wlowi.map.selectedPoint;
        event.preventDefault();
        requestGame(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = Wlowi.map.selectedPoint;
        var origin = {};

        if (dest.latitude > Wlowi.map.center.latitude) {
            origin.latitude = Wlowi.map.extent.minLat;
        } else {
            origin.latitude = Wlowi.map.extent.maxLat;
        }

        if (dest.longitude > Wlowi.map.center.longitude) {
            origin.longitude = Wlowi.map.extent.minLng;
        } else {
            origin.longitude = Wlowi.map.extent.maxLng;
        }

        Wlowi.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
