$(function() {

    function get_pm(m_id) {
        $("#pm-list").empty();
        $.post('/get_pm', {m_id: m_id}, function (res) {
            var data = JSON.parse(res);
            for (var i = 0; i < data.output.length; i++){
                if (data.output[i].u_id == data.user.id) {
                    $("#pm-list").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-left'><p>"+data.user.f_name.charAt(0).toUpperCase()+data.user.l_name.charAt(0).toUpperCase()+"</p></div></span> <div class='pm-body clearfix'> <div class='header'> <strong class='primary-font'>"+ data.user.f_name +" "+ data.user.l_name+ "</strong> <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.output[i].t +" </small> </div> <p class='justify'>"+ data.output[i].data +"</p> </div> </li>");
                } else{
                    $("#pm-list").append("<li class='right clearfix'> <span class='pm-img pull-right'> <div class='img-circle avatar-right'><p>"+data.member.f_name.charAt(0).toUpperCase()+data.member.l_name.charAt(0).toUpperCase()+"</p></div> </span> <div class='pm-body clearfix'> <div class='header'> <small class='text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.output[i].t +"</small> <strong class='pull-right primary-font'>"+ data.member.f_name +" " + data.member.l_name+"</strong> </div> <p class='justify'>"+ data.output[i].data +"</p> </div> </li>");
                }
            }
            $("#pm-panel").scrollTop($("#pm-panel")[0].scrollHeight);
        });
    }

    function add_pm(m_id) {
        if($('#message').val().trim() != ""){
            $.post('/add_pm', {m_id: m_id, data: $('#message').val()}, function (res) {
                get_pm(m_id);
            });
            $('#message').val("");
        }
    }

    function loadContent(href){
        if (href != '/logout'){
            $.post('/content', {href: href}, function (res) {
                $('#page-wrapper').html(res);

                var input = href.split("/");
                switch(input[1]) {
                    case 'member':
                        get_pm(input[2]);

                        $('#refresh').click(function (){
                            get_pm(input[2]);
                        });

                        $('#send').click(function (){
                            add_pm(input[2]);
                        });

                        break;
                }
            });
        } else{
            window.location.href = '/logout';
        }
    }

    function login() {
        var username = $('#u-name').val();
        var password = $('#pw').val();
        $.post('/login', {u_name: username, pw: password}, function (res){
            if (res == "false") {
                $('#login-error').show();
                $('#login-error').html("Invalid Credentials");
            }
            else if (res == "true")
                window.location.href = '/';
            else
                $('#login-error').html("Error");
        });
    };

    
    if (window.location.pathname != '/login'){
        loadContent('/home');
        $('#side-menu').metisMenu(); //Enable sub-menu expansion/collapse
        $('div.navbar-collapse').addClass('collapse'); //Collapse side-bar
    }

    $('a[href]').click(function(e) {

        var href = $(this).attr("href");
        loadContent(href);
        history.pushState('', 'page: '+href, href);
        e.preventDefault();
    });

    window.onpopstate = function(event) {
        loadContent(location.pathname);
    };

    //Login
    $('#login').click(function(){
        login ();
    });
    $('#pw').keypress(function (e) {
        if (e.which == 13){
            login ();
        }
    });

    //Search

    //Avoid default change in cursor position (arrow up/down)
    $('#search-box').keydown(function(e) {
        if (e.which === 38 || e.which === 40)
            e.preventDefault();
    });

    $('#search-box').keyup(function(e){
        var selected = $('#search-res #selected');
        if (e.which == 13 && selected.length != 0){
            var href = selected.attr("href");
            $('#search-box').val(selected.text());
            loadContent(href);

             history.pushState('', 'page: '+href, href);
             e.preventDefault();
            $("#search-res").empty();
        }
        else if (e.which == 38){
            if (selected.length != 0){
                selected.prev().attr('id', 'selected');
                selected.removeAttr("id");
                $('#search-box').val(selected.prev().text());
            }
            else
                $('#search-res a:last-child').attr('id', 'selected');
            $('#search-box').val($('#search-res #selected').text());
        } else if (e.which == 40){
            if (selected.length != 0)
            {
                selected.next().attr('id', 'selected');
                selected.removeAttr("id");
            }
            else
                $('#search-res a:first-child').attr('id', 'selected');
            $('#search-box').val($('#search-res #selected').text());
        }
        else {
            var input = $(this).val();
            if (input.trim() != "") {
                $.post('/search', {search: input}, function (res) {
                    $("#search-res").empty();
                    var output = JSON.parse(res);
                    
                    for (var i = 0; i < output.length; i++)
                        $("#search-res").append("<a href='/member/"+output[i][0]+"'>"+output[i][1]+" "+output[i][2]+"</a>");

                    $('#search-res a').click(function(e){
                        var href = $(this).attr("href");
                        $('#search-box').val($(this).text());
                        loadContent(href);
                        $("#search-res").empty();

                        history.pushState('', 'page: '+href, href);
                        e.preventDefault();
                    });

                    $('#search-res a').mouseover(function(){
                        $('#search-res #selected').removeAttr("id");
                        $(this).attr('id', 'selected');
                    });

                });
            }
            else
                $("#search-res").empty();
        }
    });
});