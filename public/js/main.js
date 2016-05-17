$(function() {

    function searchBox (){
        //Avoid default change in cursor position (arrow up/down)
        $('#search-box').keydown(function(e) {
            if (e.which === 38 || e.which === 40)
                e.preventDefault();
        });

        $('#search-box').focusin(function() {
            $('#search-res').attr("style", "display:block");
        });

        $('#search-box').focusout(function() {
            $('#search-res').attr("style", "display:none");
        });

        $('#search-res').mouseenter(function() {
            $('#search-box').unbind("focusout");
        });

        $('#search-res').mouseleave(function() {
            $('#search-box').focusout(function() {
                $('#search-res').attr("style", "display:none");
            });
        });

        $('#search-box').keyup(function(e){
            var selected = $('#search-res .search-sel');
            if (e.which == 13 && selected.length != 0){
                var href = selected.attr("href");
                $('#search-box').val(selected.text());
                loadContent(href);

                e.preventDefault();
                $("#search-res").empty();
            }
            else if (e.which == 38){
                if (selected.length != 0){
                    selected.prev().addClass('search-sel');
                    selected.removeClass('search-sel');
                    $('#search-box').val(selected.prev().text());
                }
                else
                    $('#search-res a:last-child').addClass('search-sel');
                $('#search-box').val($('#search-res .search-sel').text());
            } else if (e.which == 40){
                if (selected.length != 0)
                {
                    selected.next().addClass('search-sel');
                    selected.removeClass('search-sel');
                }
                else
                    $('#search-res a:first-child').addClass('search-sel');
                $('#search-box').val($('#search-res .search-sel').text());
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
                            $('#search-res .search-sel').removeClass('search-sel');
                            $(this).addClass('search-sel');
                        });


                    });
                }
                else
                    $("#search-res").empty();
            }
        });
    }

    function createGroup(){
        var memberList = [];
        var memberName = [];


        function print_members(){
            $('#m_list').empty();
            for (var i = 0; i < memberList.length; i++){
                $('#m_list').append("<span m_id="+memberList[i]+">"+memberName[memberList[i]]+"<i style='cursor: pointer;' class='fa fa-times fa-fw'></i>| </span>");
            }

            $('#m_list span i').unbind("click");
            $('#m_list span i').click(function(){
                memberList.splice(memberList.indexOf(parseInt($(this).closest('span').attr("m_id"))), 1);
                print_members(memberList, memberName);
            });
        }

        //Avoid default change in cursor position (arrow up/down)
        $('#member-box').keydown(function(e) {
            if (e.which === 38 || e.which === 40)
                e.preventDefault();
        });

        $('#member-box').focusin(function() {
            $('#member-res').attr("style", "display:block");
        });

        $('#member-box').focusout(function() {
            $('#member-res').attr("style", "display:none");
        });

        $('#member-res').mouseenter(function() {
            $('#member-box').unbind("focusout");
        });

        $('#member-res').mouseleave(function() {
            $('#member-box').focusout(function() {
                $('#member-res').attr("style", "display:none");
            });
        });

        $('#member-box').keyup(function(e){
            var selected = $('#member-res .search-sel');
            if (e.which == 13 && selected.length != 0){
                var m_id = parseInt(selected.attr("m_id"));
                $('#member-box').val("");
                memberList.push(m_id);
                memberName[m_id] = selected.text();
                print_members(memberList, memberName);

                e.preventDefault();

                $("#member-res").empty();
            }
            else if (e.which == 38){
                if (selected.length != 0){
                    selected.prev().addClass('search-sel');
                    selected.removeClass('search-sel');
                    $('#member-box').val(selected.prev().text());
                }
                else
                    $('#member-res a:last-child').addClass('search-sel');
                $('#member-box').val($('#member-res .search-sel').text());
            } else if (e.which == 40){
                if (selected.length != 0)
                {
                    selected.next().addClass('search-sel');
                    selected.removeClass('search-sel');
                }
                else
                    $('#member-res a:first-child').addClass('search-sel');
                $('#member-box').val($('#member-res .search-sel').text());
            }
            else {
                var input = $(this).val();
                if (input.trim() != "") {
                    $.post('/search', {search: input}, function (res) {
                        $("#member-res").empty();
                        var output = JSON.parse(res);

                        for (var i = 0; i < output.length; i++) {
                            if (memberList.indexOf(output[i][0]) <= -1)
                                $("#member-res").append("<a m_id='" + output[i][0] + "'>" + output[i][1] + " " + output[i][2] + "</a>");
                        }

                        $('#member-res a').click(function(e){
                            var m_id = parseInt($(this).attr("m_id"));
                            $('#member-box').val("");
                            memberList.push(m_id);
                            memberName[m_id] = $(this).text();
                            print_members(memberList, memberName);
                            $("#member-res").empty();
                            e.preventDefault();
                        });

                        $('#member-res a').mouseover(function(){
                            $('#member-res .search-sel').removeClass('search-sel');
                            $(this).addClass('search-sel');
                        });


                    });
                }
                else
                    $("#member-res").empty();
            }
        });

        $('#newGroup').on('hidden.bs.modal', function () {
            memberList = [];
            memberName = [];
            $('#m_list').empty();
            $('#member-res').empty();
            $('#member-box').val("");
        });
    }

    function get_pm(m_id) {
        $("#message").removeAttr('disabled');
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

            if (data.o.length == 0) {
                $("#pm-list").append("<small class='text-muted'>Use this panel to start a conversation with " + data.m.f_name + " " + data.m.l_name + ".</small>");
            }

            $("#pm_title").html(data.m.f_name +" "+ data.m.l_name);

            $("#pm-panel").scrollTop($("#pm-panel")[0].scrollHeight);

            if ($("#pm-list .to-read").length != 0)
                update_pm();
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

    function update_pm(){
        $.post('/list_pm', {sel: "unread"}, function (res) {
            $("#pm-nav").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#pm-nav").append("<li><a href='/pm/unread/"+data[i].m_id+"'><div><strong>"+data[i].f_name+" "+data[i].l_name+"</strong><span class='pull-right text-muted'><em>"+data[i].t+"</em></span></div><div>"+data[i].data+"</div></a></li><li class='divider'></li>");
            }

            if (data.length == 0){
                $("#pm-nav").append("<li><a class='text-center'><em style='cursor:default;'>No new messages</em></a></li><li class='divider'></li>");
                $("#pm-nav").append("<li><a class='text-center' href='/pm'><strong>View All Conversations</strong><i class='fa fa-angle-right'></i></a></li>");
                $(".notif-count").attr("style", "display:none;");
            } else{
                $("#pm-nav").append("<li><a class='text-center' href='/pm/unread'><strong>View New Messages</strong><i class='fa fa-angle-right'></i></a></li>");
                $(".notif-count").text(data.length);
                $(".notif-count").remove("style", "display:block;");
            }

            $('a[href]').unbind("click");

            $('a[href]').click(function(e) {

                var href = $(this).attr("href");
                loadContent(href);
                e.preventDefault();
            });

        });
    }

    function list_pm(sel) {
        $.post('/list_pm', {sel: sel}, function (res) {
            $("#conv-list").empty();
            $("#conv_title").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#conv-list").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-right'><p>"+data[i].f_name.charAt(0).toUpperCase()+data[i].l_name.charAt(0).toUpperCase()+"</p></div></span> <div class='conv-body clearfix'> <div class='header'> <strong class='primary-font'>"+ data[i].f_name +" "+ data[i].l_name+ "</strong> </div> <p class='justify text-muted'>"+ data[i].data +"<span class='pull-right'> <i class='fa fa-arrow-circle-right fa-fw'></i></span></p> <small class='text-muted pull-left'> <i class='fa fa-clock-o fa-fw'></i> "+ data[i].t +" </small> </div> </li>");
                $("#conv-list li:last").attr("m_id", data[i].m_id);
                if (!data[i].u_read && data[i].u_from == data[i].m_id){
                    $("#conv-list li:last").addClass("to-read");
                }
            }
            if (sel == "all")
                $("#conv_title").text("Conversations / All");
            else if (sel == "unread")
                $("#conv_title").text("Conversations / Unread");

            if (data.length == 0){
                if (sel == "all")
                    $("#conv-list").html("<small class='text-muted'>No conversation started. Search for a member to begin a conversation.</small>");
                else if (sel == "unread")
                    $("#conv-list").html("<small class='text-muted'>No unread conversations.</small>");
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

            $("#conv-list li").mouseleave(function () {
                $(this).removeAttr("id");
            });

            $("#conv-list li").mouseenter(function () {
                $(this).attr('id', 'conv-sel');
            });

        });
    }

    function loadContent(href){
        update_pm();
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

                        if (input.length == 4){
                            list_pm(input[2]);
                            get_pm(input[3]);
                            href = input[0] + input[1] + input[2];
                        }
                        else if (input.length == 3)
                            list_pm(input[2]);
                        else
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
        if (href != window.location.pathname && input.length < 4) {
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
    }

    //Start client scripts

    if (window.location.pathname != '/login'){
        searchBox(); //Enable search box
        createGroup(); //Enable group creation
        loadContent('/home');
        $('#side-menu').metisMenu(); //Enable sub-menu expansion/collapse
        $('div.navbar-collapse').addClass('collapse'); //Collapse side-bar

        $('a[href]').click(function(e) {

            var href = $(this).attr("href");
            loadContent(href);
            e.preventDefault();
        });

        window.onpopstate = function(event) {
            loadContent(location.pathname);
        };
    } else {
        //Login
        $('#login').click(function(){
            login ();
        });
        $('#pw').keypress(function (e) {
            if (e.which == 13){
                login ();
            }
        });
    }
});