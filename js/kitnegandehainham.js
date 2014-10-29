var map;
var emsg = "Something went wrong";
function initialize() {
  var mapOptions = {
    zoom: 17
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
  google.maps.event.addListener(map, 'rightclick', function(e) {
    placeMarker(e.latLng, map);
  });
    google.maps.event.addListener(map, 'dblclick', function(e) {
    placeMarker(e.latLng, map);
  });
  plotExistingMarkers();
}

function plotExistingMarkers() {
    $.post("nitro/nitro.php?action=getMarkers").done(function(data) {
    if(typeof data == "string") data = jQuery.parseJSON(data);
    if((data.errorcode != 0) || (data.message != "Done")) {
       bootbox.alert(emsg);
       return;
    }
    if(data.markers == null) {
        console.log("Nothing to show");
        return;
    }
    for(var i = 0; i< data.markers.length; i++) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.markers[i].Lat, data.markers[i].Lng),
        map: map
      });
    }
   } ,"json");
}
//new google.maps.LatLng(21.1289956, 82.7792201)

function placeMarker(position, map) {
  Recaptcha.create("6LeRZvwSAAAAAGjP7P9C-FAsrA9TQz3FnjRcqYE1",
    "recaptcha_div",
    {
      theme: "white",
      callback: Recaptcha.focus_response_field
    }
  );

  var formDiv = '<form class="form-horizontal" id="markerForm" enctype="multipart/form-data" method="POST"> ' +
              '<div class="form-group form-inline">' +
                '<label class="col-sm-4">Location Cordinates</label>' +
                '<div class="form-group col-sm-4">' +
                    '<input type="text" class="form-control" name="Lat" id="Lat" value='+position.k+' readonly>' +
                '</div>' +
                '<div class="form-group col-sm-4">' +
                    '<input type="text" class="form-control" name="Lng" id="Lng" value='+position.B+' readonly>' +
                '</div>' +
              '</div>' +
              '<div class="form-group form-inline">' +
              '<label class="col-sm-4">Less</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="Severe" id="inlineRadio1" value=1> 1'+
                '</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="Severe" id="inlineRadio2" value=2 checked> 2'+
                '</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="Severe" id="inlineRadio3" value=3> 3'+
                '</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="Severe" id="inlineRadio4" value=4> 4'+
                '</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="Severe" id="inlineRadio5" value=5> 5'+
                '</label>' +
                '<label class="col-sm-2 pull-right">Most</label>' +
              '</div>' +
              '<div class="form-group form-inline" id="SelectM">' +
                '<label class="col-sm-4">Mode</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="SelectMode" value=1 checked>Click New Picture'+
                '</label>' +
                '<label class="radio-inline">' +
                    '<input type="radio" name="SelectMode" value=2>Browse'+
                '</label>' +
                '</div>' +
              '<div class="form-group form-inline" id="showCamera">' +
                '<label class="col-sm-4">Picture</label>' +
                '<input type="file" name="dirtyPic"  class="col-sm-2" id="dirtyPic" accept="image/*" capture="camera">'+
              '</div>' +
              '<div id="recaptcha_div"class="form-group"></div>' +
              '</form>';

  $('#recaptcha_area').addClass("pull-right");
  bootbox.dialog({
     title: "Do you want to declare this place dirty ?",
     message: formDiv,
              
     buttons: {
       success : {
         label: "Save",
         className: "btn-success",
         callback: function (data) {
            $("#markerForm").submit();

         }
       }
    }});

    $("#SelectM input[name='SelectMode']").click(function() {
        if($('input:radio[name=SelectMode]:checked').val() == 1) {
            $('#dirtyPic').attr("capture", "camera");
        } else {
            $('#dirtyPic').removeAttr("capture");
        }
    });

    $("#dirtyPic").fileinput({
        showUpload: false,
        previewFileType: "image",
        allowedFileTypes: ["image"],
        browseClass: "btn btn-primary",
        browseLabel: "Select",
        browseIcon:  '<i class="glyphicon glyphicon-picture"></i>',
        removeClass: "btn btn-danger",
        removeLabel: "Delete",
        removeIcon:  '<i class="glyphicon glyphicon-trash"></i>',
    });
    
    $("form#markerForm").submit(function(e) {
        var postData = new FormData($(this)[0]);
        $.ajax({
            url:         "nitro/nitro.php?action=saveMarker",
            type:        "POST",
            data:        postData,
            cache:       false,
            contentType: false,
            processData: false,
            success:     function(data) {
                if(data.errorcode != 0 || data.message != "Done") {
                    if(typeof data == "string") data = jQuery.parseJSON(data);
                    bootbox.dialog({message:data.message,
                        title:"Server Error",
                        buttons:{danger: { label: "Re-try",className: "btn-danger", callback: function() {}}}
                    });
                } else {
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(data.marker["Lat"], data.marker["Lng"]),
                        map: map 
                    });
                }
            }});
            e.preventDefault();
    });

  //map.panTo(position);*/
}

function handleNoGeolocation(errorFlag) {

  var options = {
    map: map,
    position: new google.maps.LatLng(21.1289956, 82.7792201)
  };

  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);