$(function() {

    function get_pm(m_id) {
        $.post('/get_pm', {m_id: m_id}, function (res) {
            $("#pm-list").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.o.length; i++){
                if (data.o[i].u_from == m_id) {
                    $("#pm-list").append("<li class='right clearfix'> <span class='pm-img pull-right'> <div class='img-circle avatar-right'><p>"+data.m.f_name.charAt(0).toUpperCase()+data.m.l_name.charAt(0).toUpperCase()+"</p></div> </span> <div class='pm-body clearfix'> <div class='header'> <small class='text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.o[i].t +"</small> <strong class='pull-right primary-font'>"+ data.m.f_name +" " + data.m.l_name+"</strong> </div> <p class='justify'>"+ data.o[i].data +"</p> </div> </li>");
                    if (!data.o[i].u_read){
                        $("#pm-list li:last").addClass("to-read");
                    }
                } else{
                    $("#pm-list").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-left'><p>"+data.u.f_name.charAt(0).toUpperCase()+data.u.l_name.charAt(0).toUpperCase()+"</p></div></span> <div class='pm-body clearfix'> <div class='header'> <strong class='primary-font'>"+ data.u.f_name +" "+ data.u.l_name+ "</strong> <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.o[i].t +" </small> </div> <p class='justify'>"+ data.o[i].data +"</p> </div> </li>");
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

    function list_pm(sel) {
        $.post('/list_pm', {sel: sel}, function (res) {
            $("#conv-list").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#conv-list").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-left'><p>"+data[i].f_name.charAt(0).toUpperCase()+data[i].l_name.charAt(0).toUpperCase()+"</p></div></span> <div class='pm-body clearfix'> <div class='header'> <strong class='primary-font'>"+ data[i].f_name +" "+ data[i].l_name+ "</strong> <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data[i].t +" </small> </div> <p class='justify'>"+ data[i].data +"</p> </div> </li>");
                $("#conv-list li:last").attr("m_id", data[i].m_id);
                if (!data[i].u_read && data[i].u_from == data[i].m_id){
                    $("#conv-list li:last").addClass("to-read");
                }
            }

            $("#conv-list li").click(function () {
                var m_id = $(this).attr("m_id");
                $(this).removeClass("to-read");
                get_pm(m_id);

                $("#send").unbind("click");
                $("#refresh").unbind("click");

                $('#refresh').click(function () {
                    get_pm(m_id);
                });

                $('#send').click(function () {
                    add_pm(m_id);
                });
            });

        });
    }

    function loadContent(href){
            var input = href.split("/");
            if (input[1] == 'logout') {
                window.location.href = '/logout';
            } else {
                $.post('/content', {page: input[1], id: input[2]}, function (res) {
                    $('#page-wrapper').html(res);

                    var input = href.split("/");
                    switch (input[1]) {
                        case 'member':
                            get_pm(input[2]);

                            $('#refresh').click(function () {
                                get_pm(input[2]);
                            });

                            $('#send').click(function () {
                                add_pm(input[2]);
                            });

                            break;
                        case 'pm':
                            list_pm("all");

                            $('#all-pm').click(function () {
                                list_pm("all");
                            });

                            $('#unread_pm').click(function () {
                                list_pm("unread");
                            });

                            break;
                    }
                });
            }
        if (href != window.location.pathname) {
            window.history.pushState('', 'page: '+href, href);
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