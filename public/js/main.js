$(function() {

    //Collapse sidebar
    $('div.navbar-collapse').addClass('collapse');

    $('#login').click(function(){
        var username = $('#username').val();
        var password = $('#password').val();
        $.post('/login', {username: username, password: password}, function (res) {
            if (res == "Invalid credentials")
                $('#info').html(res);
            else
                window.location.href = '/';
        });
    });

    $('#search-box').keyup(function(){
        var input = $(this).val();
        if (input != "" && input != " " ) {
            $.post('/search', {search: input}, function (res) {
                $("#search-res").empty();
                var output = JSON.parse(res);
                for (var i = 0; i < output.length; i++) {
                    $("#search-res").append("<a '>"+output[i][1]+" "+output[i][2]+"</a>");
                }
                $('#search-res a').click(function(){
                    $('#search-box').val($(this).text());
                    $("#search-res").empty();
                });
            });
        }
        else
            $("#search-res").empty();
    });


    $('#insert').click(function(){
        var input = $('#entry').val();
        $.post('/insert', {data: input}, function (res) {
            $('#data').html(res);
        });
    });

    //Login by pressing enter key in password field
    $('#password').keypress(function (e) {
        if (e.which == 13) {
            var username = $('#username').val();
            var password = $('#password').val();
            $.post('/login', {username: username, password: password}, function (res) {
                if (res == "Invalid credentials")
                    $('#info').html(res);
                else
                    window.location.href = '/';
            });
        }
    });

    //Enable sub-menus expansion/collapse
    $('#side-menu').metisMenu();
});
