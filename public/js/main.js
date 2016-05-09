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
        $("#search-res").empty();
        if (input != "") {
            $.post('/search', {search: input}, function (res) {
                var output = JSON.parse(res);
                for (var i = 0; i < output.length; i++) {
                    $("#search-res").append("<a href='#'>"+output[i]+"</a>");
                }
            });
        }
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
            $("#login").click()
        }
    });

    //Enable sub-menus expansion/collapse
    $('#side-menu').metisMenu();
});
