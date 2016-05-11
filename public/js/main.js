$(function() {

    var login = function(res) {
        if (res == "false") {
            $('#login-error').show();
            $('#login-error').html("Invalid Credentials");
        }
        else if (res == "true")
            window.location.href = '/';
        else
            $('#login-error').html("Error");
    };

    //Collapse side-bar
    $('div.navbar-collapse').addClass('collapse');


    //Login
    $('#login').click(function(){
        var username = $('#username').val();
        var password = $('#password').val();
        $.post('/login', {username: username, password: password}, function (res){
            login (res);
        });
    });
    $('#password').keypress(function (e) {
        if (e.which == 13){
            var username = $('#username').val();
            var password = $('#password').val();
            $.post('/login', {username: username, password: password}, function (res){
                login (res);
            });
        }
    });

    //Search
    $('#search-btn').click(function (){
        $("#search-res").empty();
        $.post('/member', {user: 49}, function (res) {
            $('#page-wrapper').html(res);
        });
    });

    //Avoid default change in cursor position (arrow up/down)
    $('#search-box').keydown(function(e) {
        if (e.keyCode === 38 || e.keyCode === 40) return false;
    });

    $('#search-box').keyup(function(e){
        if (e.which == 13){
            $("#search-res").empty();
        }
        else if (e.which < 37 || e.which > 40){
            var input = $(this).val();
            if (input != "" && input.trim() != "") {
            
                $.post('/search', {search: input}, function (res) {
                    $("#search-res").empty();
                    var output = JSON.parse(res);
                    
                    for (var i = 0; i < output.length; i++)
                        $("#search-res").append("<a>"+output[i][1]+" "+output[i][2]+"</a>");

                    $('#search-res a').click(function(){
                        $('#search-box').val($(this).text());
                        $("#search-res").empty();
                    });

                    $('#search-res a').mouseover(function(){
                        $('#search-res .selected').removeClass("selected");
                        $(this).addClass("selected");
                    });

                });
            }
            else
                $("#search-res").empty();
        }
        else if (e.which == 38){
            var current = $('#search-res .selected');
            if (current.length != 0){
                current.prev().addClass("selected");
                current.removeClass("selected");
                $('#search-box').val(current.prev().text());
            }
            else
                $('#search-res a:last-child').addClass("selected");
            $('#search-box').val($('#search-res .selected').text());
        } else if (e.which == 40){
            var current = $('#search-res .selected');
            if (current.length != 0)
            {
                current.next().addClass("selected");
                current.removeClass("selected");
            }
            else
                $('#search-res a:first-child').addClass("selected");
            $('#search-box').val($('#search-res .selected').text());
        }
    });


    $('#insert').click(function(){
        var input = $('#entry').val();
        $.post('/insert', {data: input}, function (res) {
            $('#data').html(res);
        });
    });

    //Enable sub-menu expansion/collapse
    var sideMenu = $('#side-menu');
    if (sideMenu.length != 0)
        sideMenu.metisMenu();
});
