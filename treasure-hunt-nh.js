
var huntURL = new URL(window.location.href);
var huntRegion = huntURL.searchParams.get("region")

// Read game data
var hunt = jQuery.ajax({
    url: huntRegion + 'hunt.json',
    async: false,
    error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         alert('Error - ' + huntRegion + errorMessage);
     }
}).responseJSON;

function validAnswer(id) {
  var theGuess = document.getElementById('answer'+id).value;
  var theAnswer = hunt.puzzles[id-1].md5;
  var color = "bg-danger";

  theGuess = theGuess.replace(/\W/g,"").toLowerCase();
  var passhash = CryptoJS.MD5(theGuess).toString();
    if( passhash === theAnswer ) {
        color = "bg-success";
    }
    
    var clist = document.getElementById("card"+id).classList;
    if( clist.contains('bg-primary') ) { clist.remove("bg-primary"); }
    if( clist.contains('bg-danger') ) { clist.remove("bg-danger"); }
    if( clist.contains('bg-sucess') ) { clist.remove("bg-success"); }
    clist.add( color );
}

function createRiddleCard(riddle) {
    const args = riddle.id + riddle.md5;
    var html = [
        '<div class="card accordion-item" id="card' + riddle.id + '"><h2 class="accordion-header">',
        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' + riddle.id + '" ',
        'aria-expanded="true" aria-controls="collapse' + riddle.id + '">' + riddle.title + '</button></h2>',
        '<div id="collapse' + riddle.id + '" class="accordion-collapse collapse"',
        'aria-labelledby="card' + riddle.id + '" data-bs-parent="#accordionDiv">',
        '<div class="accordion-body">' + riddle.riddle,
        '<input type="text" placeholder="Answer" id="answer' + riddle.id + '">',
        '<button id="button' + riddle.id + '" onclick="validAnswer(' + riddle.id + ')" ',
        'class="btn btn-primary">Submit</button></div></div></div>',
    ].join('\n');
    var div = document.getElementById('accordionDiv')
    div.innerHTML += html;
}

// This displays various markers.
// When the user clicks a marker, an info window opens.
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: hunt.zoom,
    center: {lat: hunt.lat, lng: hunt.lng},
  });

  var infowindow = new google.maps.InfoWindow();

  hunt.puzzles.forEach(function(h) {
    var content = '<div id="content"><div id="siteNotice"></div>' +
          '<h2 id="firstHeading" class="firstHeading">' + h.title + '</h2><div id="bodyContent">' +
          '<a title="View source of image" href="' + h.story.link + '"target="_blank">' +
             '<img title="' + h.story.imageCaption + '" src="' + h.story.image + '" style="height:200px;"></a>';
    if( h.story.url.length != 0 ) {
        content += '<div><a href="' + h.story.url + '" target="_blank"><h5>More info</h5></a></div>'
        }
    content += '</div></div>';
    var marker = new google.maps.Marker({
      position: h.position,
      map: map,
      title: h.title,
    });
    google.maps.event.addListener(marker,'click', (function(marker,content,infowindow) { 
        return function() {
            infowindow.setContent(content);
            infowindow.open(map,marker);
        };
    })(marker,content,infowindow));
        });
}  


hunt.puzzles.forEach(function(h) {
    createRiddleCard(h);
});
