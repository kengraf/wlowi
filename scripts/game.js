/*global Wlowi _config*/

var Wlowi = window.Wlowi || {};

// TODO get rid of all the TODOs
var todo = true;

// Globals to run game play
var GD = {};	    // Game Data: presisted as JSON object
var cardQueue =	[]; // Attack objects waiting for user to run, {phase,title,html,type,action}
var actionQueue	= [];	// Attacks, bypasses, injects waiting to be shown
var deployedMitigations	= [];	// Array of id in the form "mitigationCardMXXXX"

function runDefense () {
    // Invoked when the player clicks the "RUN DEFENSE" button
    var success	= true;	// until shown otherwise
    
    cardQueue.forEach(function (c) {
	// Cycler through the queue: attacks, bypasses, injects

	switch(c.type) {
	  case "technique":
	    // eval against deployed mitigations
	    
	    if( GD.attackStatus < c.phase ) {
		// Ignore card as proper phase not reached
		break;
	    }
	    
	    // Ingore technique if mitigation is deployed
	    var blocked = false;
	    var needed = mitreAttack.relationships.filter(o => o.technique === c.id);
	    deployedMitigations.forEach( function(m) {
		needed.forEach( function(n) {
		    if( m.includes(n.mitigation) ) {
			// Proper mitigation card deployed
			blocked = true;
		    }
		});
	    });
	    if( blocked ) {
		// Mitigation is in place
		break;
	    }
	    
	    
	    // The technique worked, so flow through to bypass
 	    
	  case "bypass":
	    // Escalate attack status
	    GD.attackStatus = c.phase +1;

	  case "inject":
	    // show modal for attack action is taken by modal button
	    actionQueue.push(c);
	    if( c.type === "technique" || c.type === "bypass" ) {
		success = false;
	    }
	    break;
	  default:
	    // ignoring the error: TODO
	}
    });

    if ( success === true ) {
        GD.level += 1;
	if ( GD.level === GD.levels.length ) {
	    // Show winner modal
	    showWinnerModal();
	} else {
	    // Show success modal
	    showSuccessModal();
	    enterLevel();
	}
    } else {
        showIncidentModal();
    }    
}

function handleEvent(e) {
    alert( "Game request failed" );
}

function addListeners(xhr) {
    xhr.addEventListener('error', handleEvent);
}
function loadGame () {
    // Load button is rendered as a modal
    var id = $('#cardModal #gameModalID').val().trim();
    var url = location.hostname + '/prod/gameLoad?id=' + id;
    
    GD = $.ajax({
	url: url,
	async: false,
	error: function(xhr, status, error){
	     var errorMessage = xhr.status + ': ' + xhr.statusText
	     alert('Error - Could not load game\n' + url + '\n' + errorMessage);
	 }
    }).responseJSON;
}

function TODOsaveGame () {
    // Save button is rendered as a model
    var id = $('#cardModal #gameModalID').val().trim();

    var xhr = new XMLHttpRequest();
    addListeners(xhr);
    xhr.open("POST", '/saveGame?id=' + id, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(GD));
}

// Function group  to allow mitigation drag-n-drop
function allowDrop (ev) {
    ev.preventDefault();
}
function dragStart (ev) {
    ev.dataTransfer.setData ("text",  ev.target.id);
}
function dragDrop (ev) {
    ev.preventDefault ();
    
    if( GD.budget === 0 ) {
	return;
    }
    
    var data =  ev.dataTransfer.getData ("text");
    ev.target.appendChild (document.getElementById(data));
    
    // Array populated for runDefense()
    deployedMitigations.push(data);
    GD.budget -= 1;
    updateStatus();
}



// Modal functions
const gameIdtext = [
    '<div class="input-group mb-3"> <div class="input-group-prepend">',
    '<span class="input-group-text" id="basic-addon1">Game ID</span></div>',
    '<input type="text" id="gameModalID" class="form-control" placeholder="Enter your game ID"',
    ' aria-label="GameId" aria-describedby="basic-addon1"></div>',
    ].join("\n");
    
function loadGameModal () {
    var m = jQuery('#cardModal');
    m.find('.modal-title').text("Load Game State");
    m.find('.modal-body').html( gameIdtext );
    m.find('.modal-footer').html( '<button class="btn btn-default btn-primary" id="gameModalAction">Load Game</button>');
    jQuery('#gameModalAction').on('click', function(event) {
	loadGame();
    });
    m.modal('show');
}

function saveGameModal () {
    var m = jQuery('#cardModal');
    m.find('.modal-title').text("Save Game State");
    m.find('.modal-body').html( gameIdtext );
    m.find('.modal-footer').html( '<button class="btn btn-default btn-primary" id="gameModalAction">Save Game</button>');
    jQuery('#gameModalAction').on('click', function(event) {
	saveGame();
    });
    m.modal('show');

}

function showWinnerModal () {
    showModal("WINNER!", "Congratulations","");
}

function showSuccessModal () {
    showModal("SUCCESS", "The level has been successfully defended.<br>Ready for a tougher challenge?","");
}

function showGameOverModal () {
    document.getElementById("game").style.background = '#000000';
    showModal("Game Over", "Well has least no one got hurt.  Try again.","");
}

function showModal (title, html, footer) {
    var m = jQuery('#cardModal');
    m.find('.modal-title').text(title);
    m.find('.modal-body').html(html);
    m.find('.modal-footer').html(footer);
    m.modal('show');
}

function showIncidentModal () {
    // Use the budget number from current modal before moving the queue
    var m = jQuery('#cardModal');

    // show modal for attack action is taken by modal button
    var a = actionQueue.pop();
    if( a != undefined ) {
	// Modal dismiss actions will recursively callback to this function
        m.data( "damage", "-1" );
	showAlert(a);
    }
    return false;
}

function assessDamage (amount) {
    // Budget hits are negative
    GD.budget += amount;
    updateStatus();	

    if( GD.budget < 0 ) {
	// Game over
	showGameOverModal();
	return;
    }

}

// Avoiding eval()
function looseParse(obj) { return Function('"use strict";return (' + obj + ')')(); }

let showAlert = (a) => {
    var m = jQuery('#cardModal');
//    m.modal('hide');

    m.find('.modal-title').text(a.title);
    m.find('.modal-body').html(a.html);

    // Build callback buttons
    var btnHtml = [
	'<button type="button" id="modalBtnIgnore" class="btn btn-default btn-ok" data-dismiss="modal">Ignore</button>',
	'<button type="button" id="modalBtnAccept" ',
	'class="btn btn-default btn-ok bg-danger" data-dismiss="modal">Accept</button>',
    ].join("\n");
    m.find('.modal-footer').html(btnHtml);
    jQuery('#modalBtnIgnore').on('click', function(event) {
	// TODO add as bypass or remove mitigation from game?
	looseParse( "{a:assessDamage(-2)}" );
 	showIncidentModal();
	event.preventDefault();
    });
    jQuery('#modalBtnAccept').on('click', function(event) {
	looseParse( "{a:assessDamage(-2)}" );
 	showIncidentModal();
	event.preventDefault();
    });
    setTimeout(() => { m.modal('show') }, 500 );
}

$('#cardModal').on('show.bs.modal', function (event) {
});

$('#cardModal').on('hidden.bs.modal', function () {
    showIncidentModal();
});

let showMitigationModal = (id) => {
    var m = mitreAttack.mitigations.find(o => o.id === id);
    showModal(m.name, m.description );
}

let showTechniqueModal = (id) => {
    var t = mitreAttack.techniques.find(o => o.technique === id);
    showModal(t.name, t.description );
    return false;
}


// Find an ID in the JSON data
function findId (json, id) {
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
    
function updateStatus () {
    // Update the button to run the game

    // Set color indicator
    let statusColors = ["success","warning", "danger", "dark"];
    let statusText = ['Normal','Breached','Persistance','Data Loss']
    color = statusColors[GD.attackStatus];
    
    // Set stage text
    var html = [
	'<div class="btn-group mb-2" role="group" aria-label="Basic example">',
	'<h4 class="align-self-center text-uppercase fw-bold bg-' + color + ' float-left mr-3">' + statusText[GD.attackStatus] + '<h4>',
	'<h4 class="align-self-center  mr-3">' + GD.levels[GD.level].title + '</h4>',
	'<button type="button" class="btn btn-' + color + ' float-right mr-3" onclick="runDefense()"><h4>RUN</h4></button>',
	'<h4 class="align-self-center mr-3">Credits: ' + GD.budget + '</h4>',
	'</div>',
    ].join("\n");

    var b = document.getElementById("runDefense");
    b.innerHTML = html;
} 

let createMitigationCard = (div, proc) => {
    // Generate dragable button for each mitigation
    var html = [
	'<div id="mitigationCard' + proc.id + '" draggable="true" ondragstart="dragStart (event)">',
	'<button class="cardBtn" onclick="showMitigationModal(\'' + proc.id + '\');event.preventDefault();">' + proc.name,
	'</button></div></div>',
    ].join("\n");
    div.append(html);
}

  
    
function enterLevel () {
    // User is entering a new level
    
    // Set phase to pre-compromise
    GD.attackStatus = 0;
    var stage = GD.levels[GD.level];
    GD.budget += stage.levelBudget;
    jQuery("#game").css('background', "url('"+ stage.background + "') no-repeat center center");

    // Add mitigations that become available in this dtage
    mitreAttack.mitigations.forEach(function(element) {
	if( element.level == GD.level + 1 ) {
	    createMitigationCard(jQuery('#mitigationArea'), element );
	}
    });
    
    // Should already be empty at this point
    attackCards = []; // {phase,title,html,type,action}
    
    // Add bypasses for this level
    stage.bypasses.forEach(function(id) {
	var technique = mitreAttack.techniques.find(o => o.technique === id);
	var a = {"phase": 0, "title": technique.name, "html": technique.description, "type": "bypass",
			"id": technique.technique, "action": -1 }
	cardQueue.push(a);
    });
    
    // Add attack techniques
    var techniques = [stage.compromises, stage.escalations, stage.exfils ];
    var phase = 0;
    techniques.forEach(function(t) {
	t.forEach(function(id) {
	    var technique = mitreAttack.techniques.find(o => o.technique === id);
	    var a = {"phase": phase, "title": technique.name, "html": technique.description, "type": "technique",
			    "id": technique.technique, "action": -1 }
	    cardQueue.push(a);
	});
	phase += 1;
    });
    
    // Sort cards into appropriate phases
    cardQueue = cardQueue.sort(function X(a, b) {
	return a.phase < b.phase ?  1 : a.phase > b.phase ? -1 : 0;
    });
    
    // Show the RUN DEFENSE button to user
    updateStatus();	
}


// Read Mitre Att&ck data
mitreAttack = $.ajax({
    url: "MitreAttack.json",
    async: false,
    error: function(xhr, status, error){
	 var errorMessage = xhr.status + ': ' + xhr.statusText
	 alert('Error - MitreAttack.json' + errorMessage);
     }
}).responseJSON;

// Read game data
GD = $.ajax({
    url: "game.json",
    async: false,
    error: function(xhr, status, error){
	 var errorMessage = xhr.status + ': ' + xhr.statusText
	 alert('Error - game.json' + errorMessage);
     }
}).responseJSON;

// Setup the initial gameboard
enterLevel();

    var authToken;

    // Bypass auth if running from a local server
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
	;
    } else {
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
    }
    
    function completeRequest() { }
    
    function saveGame() {
        $.ajax({
            method: 'PUT',
            url: _config.api.invokeUrl + 'gameSave',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify(GD),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting game: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your game:\n' + jqXHR.responseText);
            }
        });
    }

