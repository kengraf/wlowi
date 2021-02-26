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
	attackObj = findId(e);
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

let showResultModal = (obj) => {
    jQuery.noConflict();
    var m = $('#cardModal');
    m.find('.modal-title').text(obj.result.title);
    m.find('.modal-body').html(obj.result.html);
    m.modal('show');
}


$('#cardModal').on('show.bs.modal', function (event) {
    if (event.relatedTarget === undefined ) {
	return;
    }
    
    let id = event.relatedTarget.id.split('.')[1];
    let obj = findId( id );
    var modal = $(this)
    modal.find('.modal-title').text(obj.title)
    modal.find('.modal-body').html(obj.html)
});

    // Find an ID in the JSON data
    let findId = (id) => {
	let x;
	var groups = "compromises"

        for( var key in testData ) {
	    if ( Array.isArray(testData[key]) ) {
	        testData[key].forEach(function(obj) {
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
	var a = "SOC status: " + testData.status + " | Budget level: " + testData.budget;
	document.getElementById("cardStatus").innerHTML = a;
    } 
    
    // Generate cards for each attacker scenario
    let createStatusCard = () => {
	var html = [
	    '<div class="container"><div class="row">',
	    '<div role="tablist" aria-multiselectable="true" class="card col-12 mb-2 bg-success" >',
	    '<h4 id="cardStatus" class="card-header" role="tab"></h4></div>',
	    '</div><div class="row mb-4"><div class="col text-center">',
	    '<a id="letsDefend" class="home-button" href="#" onclick="letsDefend();return false;">Let\'s Defend!</a>',
	    '<a id="saveGame" class="home-button" href="#" onclick="saveGame();return false;">Save Game</a>',
	    '</div></div></div></div>',
	].join("\n");
	$(body).append(html);
	testData.status = "clear";
	testData.budget = 4;
	updateStatus();
//todo example call	$('#letsDefend').click(function(){ letsDefend(); return false; });
//todo example call	$('#saveGame').click(function(){ saveGame(); return false; });
    }

    // Generate cards for each attacker scenario
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
    let createDefenderCard = (row, proc) => {
	var html = [
	'<div id="defenseCard' + proc.id + '" role="tablist" aria-multiselectable="true" class="card mb-3 bg-secondary" >',
	    '<h5 class="card-header" role="tab" id="heading' + proc.id +'">',
		'<div class="custom-control custom-switch switch-lg">',
		'<input type="checkbox" class="custom-control-input" onchange="changeDefenseState(this)" ',
		    'data-target="changeDefenseState(this)" id="defenseSwitch' + proc.id + '">',
		'<label class="custom-control-label h4" for="defenseSwitch' + proc.id + '"></label>' +proc.title,
		'<a href="#cardModal" data-toggle="modal" id="info.' + proc.id + '">',
		'<i class="fa fa-info-circle pull-right fa-lg"></i></a></div></h5>',
	].join("\n");
	row.append(html);
	$("#defenseCard" + proc.id).removeClass().addClass('card mb-3 ' + 'bg-secondary');
    }

    let createDefenderArea = (subBody) => {
    	let defense  = testData.levels[testData.stage];
        let html = [
	    '<div id="defenderArea" role="tablist" aria-multiselectable="true" class="card mb-3 bg-primary" >',
	    '<h4 class="card-header" role="tab" >',
	    '<a href="#cardModal" data-toggle="modal" id="stage.' + defense.id + '">',
		'<p id="defenderLink" class="plink">' + defense.title + '</p></a></h4></div>',
	].join("\n");
	subBody.append(html);
	
        testData.procedures.forEach(element => createDefenderCard(subBody, element ));
    }
    
let handleAttackChange = (event) => {
    scenario = testData.scenarios[2];
};

   
    let createAttackerArea = (subBody) => {
	let scenario = testData.scenarios[0];
        let html = [
	    '<div id="attackerArea" role="tablist" aria-multiselectable="true" class="card mb-3 bg-danger" >',
	    '<h4 class="card-header" role="tab" ><a href="todo" >',
	    '<a href="#cardModal" data-toggle="modal" id="scenario.' + scenario.id + '">',
	    '<p id="attackerLink" class="plink">' + scenario.title + '</p></a></h4></div>',
	].join("\n");
	subBody.append(html);
    }
    
    
    // Use Bootstrap alerts for messaging user
    // alertType = ['alert-success','alert-warning','alert-danger','alert-info']
    let showMessage = ( text, alertType ) => {
	var alertBox = $(document.createElement('div'))
	    .attr("class", "alert alert-success alert-dismissible fade show " + alertType );
	alertBox.after().html(
	   '<button type="button" class="close" data-dismiss="alert">&times;</button>' + text );
	alertBox.appendTo(document.getElementById('alertBar'));
	$(document).ready(function () {
	    window.setTimeout(function() {
		$(".alert").fadeTo(1000, 0).slideUp(1000, function() {
		    $(this).remove(); 
		});
	    }, 5000);
	});
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
	let defense  = testData.levels[testData.stage];
	
	// Set the background
        $("body").attr("style", "background-image: url('" + defense.background + 
	    "'); background-size:cover; background-position: center center; " +
	    "background-attachment: fixed; background-repeat:no-repeat");
	
	// Set the defender stage title
	document.getElementById("defenderLink").innerHTML = defense.title;
	$("[id^=stage").attr("id", "stage." + defense.id );

	// Set the attacker stage title
	let attack  = testData.scenarios[testData.stage];
	document.getElementById("attackerLink").innerHTML = attack.title;
	$("[id^=scenario").attr("id", "scenario." + attack.id);
    }

    // Read game data, TODO handle failures
    testData = $.ajax({
	url: "game.json",
	async: false,
    }).responseJSON;

    // Top card shows operational status
    createStatusCard();
    
    let subBody = $(document.createElement('div'))
	.attr("class", "container col-12");
    $("body").append(subBody);

    let row = $(document.createElement('div'))
	.attr("class", "row");
    subBody.append(row);
    
    let defendArea = $(document.createElement('div'))
	.attr("class", "col-6")
	.attr( "id", "defendArea");
    row.append(defendArea);
    let attackArea = $(document.createElement('div'))
	.attr("class", "col-6")
	.attr( "id", "attackArea");
    row.append(attackArea);
    
    createDefenderArea(defendArea);
    createAttackerArea(attackArea);
//    subBody.append('<a href="#resultModal" data-toggle="modal"></a>');

    setStage();


/*
   

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

*/