"use strict";

$(document).ready(function() {
    var theURL = 'https://rhitktpwebsite.herokuapp.com';
    $.ajax({
        url: theURL + '/login/login/checkLoggedIn',
        method: 'POST',
        data: {
            guid: document.cookie
        }
    }).done(function (data) {
        if (data.loggedIn) {
            if (window.location.protocol != 'https:') {
                location.href = location.href.replace("http://", "https://");
            }
            $("#Register").click(function() {
            if ($("#password").val().length < 8) {
                alert("password must be greater than 8 characters");
                document.location.href = "https://rhitktpwebsite.herokuapp.com/login";
            } else {
                //  confirm that the passwords look similar
                if ($("#password").val() === $("#confirmpassword").val()) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log("Registering new user:");
                    if (/\S/.test($("#name").val()) && /\S/.test($("#username").val()) && /\S/.test($("#password").val())) {
                        
                            $.ajax({
                                url: theURL + '/users',
                                type: "POST",
                                data: {
                                    username: $("#username").val(),
                                    password: $("#password").val(),
                                    position: "scrub",
                                    alumnusStatus: false,
                                    profPoints: 0,
                                    serveHours: 0,
                                    littles: [],
                                    initiationClass: 3,
                                    gradYear: $("#gradYear").val()
                                },
                                datatype: "application/json",
                                success: function(data) {
                                    if (data.success == 1) {
                                        console.log(data);
                                        alert("User has been registered");
                                    } else {
                                        alert("There was a problem registering.  Please try again.");
                                    }
                                },
                                fail: function() {
                                    alert("could not get names");
                                },
                                complete: function(data) {}
                            });
                        
                    } else {
                        alert("There cannot just be spaces.  You must have at least 1 character");
                    }
                }
            }
        });
            }
            // if not logged in
        else {
            document.location.href = "https://rhitktpwebsite.herokuapp.com/login";
        }
    });    
});