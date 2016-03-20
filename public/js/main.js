//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }

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

    $('#search').keyup(function(){
        var input = $(this).val();
        if (input != "") {
            $.post('/search', {search: input}, function (res) {
                $('#result').html(res);
            });
        }else{
            $('#result').html("Suggestions: none");
        }
    });

    $('#insert').click(function(){
        var input = $('#entry').val();
        $.post('/insert', {data: input}, function (res) {
            $('#data').html(res);
        });
    });
});
