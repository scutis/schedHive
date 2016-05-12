$(function() {

    function update_pm(m_id) {
        $("#pm").empty();
        $.post('/pm', {m_id: m_id}, function (res) {
            var data = JSON.parse(res);
            for (var i = 0; i < data.output.length; i++){
                if (data.output[i].u_id == data.user.id) {
                    $("#pm").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-left'><div class= 'pm-init'>"+data.user.f_name.charAt(0).toUpperCase()+data.user.l_name.charAt(0).toUpperCase()+"</div></div></span> <div class='pm-body clearfix'> <div class='header'> <strong class='primary-font'>"+ data.user.f_name +" "+ data.user.l_name+ "</strong> <small class='pull-right text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.output[i].t +" </small> </div> <p>"+ data.output[i].data +"</p> </div> </li>");
                } else{
                    $("#pm").append("<li class='right clearfix'> <span class='pm-img pull-right'> <div class='img-circle avatar-right'><div class= 'pm-init'>"+data.member.f_name.charAt(0).toUpperCase()+data.member.l_name.charAt(0).toUpperCase()+"</div></div> </span> <div class='pm-body clearfix'> <div class='header'> <small class='text-muted'> <i class='fa fa-clock-o fa-fw'></i> "+ data.output[i].t +"</small> <strong class='pull-right primary-font'>"+ data.member.f_name +" " + data.member.l_name+"</strong> </div> <p>"+ data.output[i].data +"</p> </div> </li>");
                }
            }
        });
    }

    function login(res) {
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

    //Collapse side-bar
    $('div.navbar-collapse').addClass('collapse');


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
        if (e.keyCode === 38 || e.keyCode === 40) return false;
    });

    $('#search-box').keyup(function(e){
        var selected = $('#search-res .selected');
        if (e.which == 13 && selected.length != 0){
            $('#search-box').val(selected.text());
            $.post('/member', {m_id: selected.attr("m_id")}, function (res) {
                $('#page-wrapper').html(res);
                update_pm(selected.attr("m_id"));
            });
            $("#search-res").empty();
        }
        else if (e.which == 38){
            if (selected.length != 0){
                selected.prev().addClass("selected");
                selected.removeClass("selected");
                $('#search-box').val(selected.prev().text());
            }
            else
                $('#search-res a:last-child').addClass("selected");
            $('#search-box').val($('#search-res .selected').text());
        } else if (e.which == 40){
            if (selected.length != 0)
            {
                selected.next().addClass("selected");
                selected.removeClass("selected");
            }
            else
                $('#search-res a:first-child').addClass("selected");
            $('#search-box').val($('#search-res .selected').text());
        }
        else {
            var input = $(this).val();
            if (input.trim() != "") {
                $.post('/search', {search: input}, function (res) {
                    $("#search-res").empty();
                    var output = JSON.parse(res);
                    
                    for (var i = 0; i < output.length; i++)
                        $("#search-res").append("<a m_id='"+output[i][0]+"'>"+output[i][1]+" "+output[i][2]+"</a>");

                    $('#search-res a').click(function(){
                        var m_id = $(this).attr("m_id");
                        $('#search-box').val($(this).text());
                        $.post('/member', {m_id: m_id}, function (res) {
                            $('#page-wrapper').html(res);
                            update_pm(m_id);
                        });
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
