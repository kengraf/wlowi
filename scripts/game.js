/*global Wlowi _config*/

var Wlowi = window.Wlowi || {};
var todo = true;

// Globals to run game play
// testData.stage; progress through testData.scenarios[] and testData.levels[]
// testData.currentPhase; index to attackPhases
// testData.attackPhases = ['compromises', 'escalations', 'presistences', 'exfil'];

// This function is invoked when the player clicks the "Let's Defend!" button
let letsDefend = () => {
    // Activate current attacks in phase
    let scenario = testData.scenarios[testData.stage];
    let phase = testData.attackPhases[testData.currentPhase];
    let attacks = scenario[phase];
    testData.currentPhase += 1;

    // Injects TODO
    
    // Run attacks
    attacks.forEach(function (e) {
	attackObj = findId(testData, e);
	for( var d in attackObj.detections ) {
	    if ( document.getElementById("defenseSwitch" + attackObj.detections[d]).checked === false ) {
		// Defense is not working
		$("#defenseCard" + attackObj.detections[d]).removeClass().addClass('card mb-3 ' + 'bg-warning');
		createAttackerCard( attackObj );
	    } else { 
		// Ignore attack if defended
	    }
	}
    });
    
   
    if ( $("[id^=attackCard").length == 0 ) {
	if ( testData.stage > testData.scenarios.length ) {
	    // Show winner modal
	    $('#resultModal').modal();
	} else {
	    // Show success modal
	    showResultModal(testData.levels[testData.stage]);
	    
	    // Advance to next defender level with bonus from this level
	    testData.budget += testData.levels[testData.stage].completionBonus;
	    updateStatus();
	    
	    // Increment attacker and defense levels
	    testData.currentPhase = 0;
	    testData.stage += 1;
	    setStage();
	}
    } else {
	if ( (testData.currentPhase == testData.attackPhases.length) || (testData.budget == 0) ) {
	    // Show failure model
	    $('#resultModal').modal();
	} else {
	    // Open attack still progressing
	    // Player is now remediating and defending
	}
    }
    
}

let saveGame = () => {
// TODO save button is rendered as an 'a' element
}

function allowDrop (ev) {
ev.preventDefault();
}
function dragStart (ev) {
ev.dataTransfer.setData ("text",  ev.target.id);
}
function dragDrop (ev) {
ev.preventDefault ();
var data =  ev.dataTransfer.getData ("text");
ev.target.appendChild (document.getElementById(data));
}

let showResultModal = (obj) => {
    jQuery.noConflict();
    var m = $('#cardModal');
    m.find('.modal-title').text(obj.result.title);
    m.find('.modal-body').html(obj.result.html);
    m.modal('show');
}

let showCardModal = (id) => {
    var m = jQuery('#cardModal');
    let obj = findId(mitreAttack, id );
    m.find('.modal-title').text(obj.name);
    m.find('.modal-body').html(obj.description);
    m.modal('show');
}


$('#cardModal').on('show.bs.modal', function (event) {
/*
let button = $(event.relatedTarget)
    let id = button.data("id");
    let obj = findId( mitreAttack, id );
    let modal = jQuery(this);
    modal.find('.modal-title').text(obj.name)
    modal.find('.modal-body').html(obj.description)
*/
});

    // Find an ID in the JSON data
    let findId = (json, id) => {
	let x;

        for( var key in json ) {
	    if ( Array.isArray(json[key]) ) {
	        json[key].forEach(function(obj) {
		    if(obj.hasOwnProperty('id')){
			if (obj.id === id ) {
			    x = obj;
			};
		    };
		});
	    };
	};
	return x;
    }
    
    let inactive = (id, state) => {
	let statusColor = ['bg-secondary', 'bg-danger', 'border-warning text-warning', 'bg-info', 'bg-primary', 'bg-success']
	$("#" + id).removeClass().addClass('card mb-3 ' + statusColor[state]);
    }

    let updateStatus = () => {
	var a = "RUN: Script Kiddies vs. Me, Myself, and I with " + testData.budget + " credits"
	var b = document.getElementById("runDefense");
	b.innerHTML = a;
	b.style.background = "green";
    } 
    
    // Generate cards for each attacker scenario: TODO make this a modal
    let createAttackerCard = (proc) => {
	var html = [
	'<div id="attackCard' + proc.id + '" role="tablist" aria-multiselectable="true" class="card mb-3 bg-secondary" >',
	    '<h5 class="card-header" role="tab" id="heading' + proc.id +'">',
		proc.title ,
		'<a href="#cardModal" data-toggle="modal" id="info.' + proc.id + '">',
		'<i class="fa fa-info-circle pull-right fa-lg"></i></a></h5>',
	].join("\n");
	$("#attackArea").append(html);
	$("#attackCard" + proc.id).removeClass().addClass('card mb-3 ' + 'bg-danger');
    }

    // Generate cards for each defender procedure
    let createMitigationCard = (div, proc) => {
	var html = [
	    '<div id="mitigationCard' + proc.id + '" draggable="true" ondragstart="dragStart (event)">',
	    '<button class="cardBtn" onclick="showCardModal(\'' + proc.id + '\');event.preventDefault();">' + proc.name,
	    '</button></div></div>',
	].join("\n");
	div.append(html);
    }

    let createMitigationArea = (subBody) => {
    	let defense  = testData.levels[testData.stage];
        let html = [
	'<div class="col" id="mitigationArea"></div>',
	].join("\n");
	subBody.append(html);
	
        mitreAttack.mitigations.forEach(element => createMitigationCard(jQuery('#mitigationArea'), element ));
    }
    
    
    function changeDefenseState(slider) { 
	var id = slider.id.slice(-2);
	// Determine if we can afford to enable the requirements
	let p = testData.procedures.find( record => record.id === id )

	if (document.getElementById("defenseSwitch" + id).checked) {
	    let hit = 0;
	    for(var i in p.requirements) {
		// if already checked no budget hit
		if ( document.getElementById("defenseSwitch" + p.requirements[i]).checked === false ) {
		    hit++;
		}
	    }
	    if (testData.budget > hit ) {
		for(i in p.requirements) {
		    // Turn on any required procedures
		    if ( document.getElementById("defenseSwitch" + p.requirements[i]).checked === false ) {
			$("#defenseSwitch" + p.requirements[i]).prop('checked', true );
			$("#defenseCard" + p.requirements[i]).removeClass().addClass('card mb-3 ' + 'bg-primary');
			testData.budget--;
		    }
		}

		$("#defenseCard" + id).removeClass().addClass('card mb-3 ' + 'bg-primary');
		testData.budget--;
	    } else {
		// Not enough budget so undo the UI indicator
		$("#defenseSwitch" + id).prop('checked', false );
	    }
	} else {
	    $("#defenseCard" + id).removeClass().addClass('card mb-3 ' + 'bg-secondary');
	    testData.budget++;
	}
	updateStatus();
    }
    
    let setStage = () => {
	updateStatus();
    return; // TODO mitre json fixes
	let defense  = testData.levels[testData.stage];
    }

    // Read MItre Att&ck data, TODO handle failures
    mitreAttack = $.ajax({
	url: "MitreAttack.json",
	async: false,
    }).responseJSON;

    // Read game data, TODO handle failures
    testData = $.ajax({
	url: "game.json",
	async: false,
    }).responseJSON;

    let subBody = $(document.createElement('div'))
	.attr("class", "container col-12");
    $("#gameboard").append(subBody);

    let row = $(document.createElement('div'))
	.attr("class", "row");
    subBody.append(row);
    
    row.append('<div class="col-6 d-flex flex-column"><div id="mitigationArea" class="row"></div></div>');
    row.append('<div class="col-6 d-flex flex-column"><div id="defendArea" class="row" ondrop="dragDrop(event)" ondragover="allowDrop(event)"></div></div>');
    
    mitreAttack.mitigations.forEach(element => createMitigationCard(jQuery('#mitigationArea'), element ));

    setStage();

(function gameScopeWrapper($) {
    // Bypass auth if running from a local server
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
	//TODO need code to get json data locally
	return;
	
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
            url: _config.api.invokeUrl + '/game',
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
                console.error('Error requesting game: ', textStatus, ', Details: ', errorThrown);
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

    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);

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
        var pickupLocation = "";
        event.preventDefault();
        requestGame(pickupLocation);
    }


    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }

}(jQuery));
