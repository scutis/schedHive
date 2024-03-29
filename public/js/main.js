$(function() {

    function searchTool(targetBox, targetRes, enterFunction, appendFunction){
        //Avoid default change in cursor position (arrow up/down)
        $(targetBox).keydown(function(e) {
            if (e.which === 38 || e.which === 40)
                e.preventDefault();
        });

        $(targetBox).focusin(function() {
            $(targetRes).show();
        });

        $(targetBox).focusout(function() {
            $(targetRes).hide();
        });

        $(targetRes).mouseenter(function() {
            $(targetBox).unbind("focusout");
        });

        $(targetRes).mouseleave(function() {
            $(targetBox).focusout(function() {
                $(targetRes).hide();
            });
        });

        $(targetBox).keyup(function(e){
            var selected = $(targetRes+' .search-sel');
            if (e.which == 13 && selected.length != 0){
                enterFunction(selected);

                e.preventDefault();
                $(targetRes).empty();
            }
            else if (e.which == 38){
                if (selected.length != 0){
                    selected.prev().addClass('search-sel');
                    selected.removeClass('search-sel');
                    $(targetBox).val(selected.prev().text());
                }
                else
                    $(targetRes+' a:last-child').addClass('search-sel');
                $(targetBox).val($(targetRes+' .search-sel').text());
            } else if (e.which == 40){
                if (selected.length != 0)
                {
                    selected.next().addClass('search-sel');
                    selected.removeClass('search-sel');
                }
                else
                    $(targetRes+' a:first-child').addClass('search-sel');
                $(targetBox).val($(targetRes+' .search-sel').text());
            }
            else {
                var input = $(this).val();
                if (input.trim() != "") {
                    $.post('/search', {search: input}, function (res) {
                        $(targetRes).empty();
                        var output = JSON.parse(res);

                        for (var i = 0; i < output.length; i++)
                            appendFunction(targetRes, output[i]);

                        $(targetRes+' a').click(function(e){
                            enterFunction($(this));

                            e.preventDefault();
                            $(targetRes).empty();
                        });

                        $(targetRes+' a').mouseover(function(){
                            $(targetRes+' .search-sel').removeClass('search-sel');
                            $(this).addClass('search-sel');
                        });


                    });
                }
                else
                    $(targetRes).empty();
            }
        });
    }

    function searchBox (){

        searchTool('#search-box', '#search-res', function(selected){
            var href = selected.attr("href");
            $('#search-box').val(selected.text());
            loadContent(href);
        }, function(targetRes, output){
            $(targetRes).append("<a href='/member/"+output[0]+"'>"+output[1]+" "+output[2]+"</a>");
        });
    }

    function updateGroup() {
        $.post('/list_grp', {}, function (res) {
            $("#group-nav").empty();
            $("#group-nav").append("<li><a style='font-style: italic;cursor:pointer;' data-toggle='modal' data-target='#newGroup'>Create Group</a></li>");
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#group-nav").append("<li><a href='/group/"+data[i].g_id+"'>"+data[i].name+"</a></li>");
            }

            $('a[href]').unbind("click");

            $('a[href]').click(function(e) {

                var href = $(this).attr("href");
                loadContent(href);
                e.preventDefault();
            });

        });
    }

    function print_members(list_sel, memberList, memberName, memberLevel){
        $(list_sel).empty();
        for (var i = 0; i < memberList.length; i++){
            $(list_sel).append("<span data-m_id="+memberList[i]+">"+memberName[i]+"<sup id='m_lvl' style='cursor: pointer;'> ("+memberLevel[i]+")</sup><i id='m_rmv' style='cursor: pointer;' class='fa fa-times fa-fw'></i></span> | ");
        }

        $(list_sel+' #m_rmv').unbind("click");
        $(list_sel+' #m_rmv').click(function(){
            var index = memberList.indexOf(parseInt($(this).closest('span').attr("data-m_id")));
            memberList.splice(index, 1);
            memberName.splice(index, 1);
            memberLevel.splice(index, 1);

            print_members(list_sel, memberList, memberName, memberLevel);
        });

        $(list_sel+' #m_lvl').unbind("click");
        $(list_sel+' #m_lvl').click(function(e){
            var index = memberList.indexOf(parseInt($(this).closest('span').attr("data-m_id")));
            memberLevel[index]++;
            memberLevel[index] %= 3;
            print_members(list_sel, memberList, memberName, memberLevel);
        });
    }

    function createGroup(){

        var memberList = [];
        var memberName = [];
        var memberLevel = [];


         searchTool('#member-box', '#member-res', function(selected){
             var m_id = parseInt(selected.attr("data-m_id"));
             $('#member-box').val("");
             memberList.push(m_id);
             memberName.push(selected.text());
             memberLevel.push(0);
             print_members("#m_list", memberList, memberName, memberLevel);
         }, function(targetRes, output){
             if (memberList.indexOf(output[0]) <= -1)
                 $("#member-res").append("<a data-m_id='" + output[0] + "'>" + output[1] + " " + output[2] + "</a>");
         });

        $('#newGroup').on('hidden.bs.modal', function () {
            memberList = [];
            memberName = [];
            memberLevel = [];
            $('#g-error').hide();
            $('#g-success').hide();
            $('#g_name').val("");
            $('#g_desc').val("");
            $('#m_list').empty();
            $('#member-res').empty();
            $('#member-box').val("");
        });

        $('#btn-create').click(function () {
            if ($('#g_name').val().trim() == "" || $('#g_desc').val().trim() == ""){
                $('#g-error').text("Invalid group name or description");
                $('#g-error').show();
            } else{
                $.post('/new_grp', {name: $('#g_name').val(), desc: $('#g_desc').val(), m_list: JSON.stringify(memberList), m_lvl: JSON.stringify(memberLevel)}, function (res) {
                    $('#newGroup').trigger('hidden.bs.modal');
                    updateGroup();
                    $('#g-success').text("Group "+$('#g_name').val()+" successfully created");
                    $('#g-success').show();
                });
            }
        });
    }

    function editGroup(g_id){
        var memberList = [];
        var memberName = [];
        var memberLevel = [];

        searchTool('#edit-member-box', '#edit-member-res', function(selected){
            var m_id = parseInt(selected.attr("data-m_id"));
            $('#edit-member-box').val("");
            memberList.push(m_id);
            memberName.push(selected.text());
            memberLevel.push(0);
            print_members("#edit-m_list", memberList, memberName, memberLevel);
        }, function(targetRes, output){
            if (memberList.indexOf(output[0]) <= -1)
                $(targetRes).append("<a data-m_id='" + output[0] + "'>" + output[1] + " " + output[2] + "</a>");
        });

        $('#editGroup').on('show.bs.modal', function () {
            memberList = JSON.parse($('#edit-m_list').attr("data-m_list"));
            memberName = JSON.parse($('#edit-m_list').attr("data-m_name"));
            memberLevel = JSON.parse($('#edit-m_list').attr("data-m_lvl"));
            $('#edit-g-error').hide();
            $('#edit-g-success').hide();
            $('#edit-g_name').val($('#edit-g_name').attr("data-val"));
            $('#edit-g_desc').val($('#edit-g_desc').attr("data-val"));
            $('#edit-member-res').empty();
            $('#edit-member-box').val("");
            print_members("#edit-m_list", memberList, memberName, memberLevel);
        });

        $('#btn-edit').click(function () {
            if ($('#edit-g_name').val().trim() == "" || $('#edit-g_desc').val().trim() == ""){
                $('#edit-g-error').text("Invalid group name or description");
                $('#edit-g-error').show();
            } else{
                $.post('/edit_grp', {g_id: g_id, name: $('#edit-g_name').val(), desc: $('#edit-g_desc').val(), m_list: JSON.stringify(memberList), m_lvl: JSON.stringify(memberLevel)}, function (res) {
                    $('#edit-g-success').text("Group "+$('#g_name').val()+" successfully updated");
                    $('#edit-g-success').show();

                    $('#editGroup').on('hidden.bs.modal', function () {
                        loadContent(window.location.pathname);
                    });

                });
            }
        });
    }

    function get_pm(m_id) {
        $("#message").removeAttr('disabled');
        $.post('/get_pm', {m_id: m_id}, function (res) {
            $("#pm-list").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.o.length; i++){
                if (data.o[i].u_from == m_id) {
                    $("#pm-list").append("<li class='right clearfix'><span class='pm-img pull-right'><div class='img-circle avatar-right'><p>"+data.m.f_name.charAt(0).toUpperCase()+data.m.l_name.charAt(0).toUpperCase()+"</p></div></span><div class='pm-body clearfix'><div class='header'><small class='text-muted'><i class='fa fa-clock-o fa-fw'></i> "+ data.o[i].t +"</small><strong class='pull-right primary-font'>"+ data.m.f_name +" " + data.m.l_name+"</strong></div><p class='justify'>"+ data.o[i].data +"</p></div></li>");
                    if (!data.o[i].u_read){
                        $("#pm-list li:last").addClass("to-read");
                    }
                } else{
                    $("#pm-list").append("<li class='left clearfix'><span class='pm-img pull-left'><div class='img-circle avatar-left'><p>"+data.u.f_name.charAt(0).toUpperCase()+data.u.l_name.charAt(0).toUpperCase()+"</p></div></span><div class='pm-body clearfix'><div class='header'><strong class='primary-font'>"+ data.u.f_name +" "+ data.u.l_name+ "</strong><small class='pull-right text-muted'><i class='fa fa-clock-o fa-fw'></i> "+ data.o[i].t +"</small></div><p class='justify'>"+ data.o[i].data +"</p></div></li>");
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
        $(".pm-count").hide();
        $.post('/list_pm', {sel: "unread"}, function (res) {
            $("#pm-nav").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#pm-nav").append("<li><a href='/pm/unread/"+data[i].m_id+"'><div><strong>"+data[i].f_name+" "+data[i].l_name+"</strong><span class='pull-right text-muted'><em>"+data[i].t+"</em></span></div><div>"+data[i].data+"</div></a></li><li class='divider'></li>");
            }

            if (data.length == 0){
                $("#pm-nav").append("<li class='text-center'><em style='cursor:default;'>No new messages</em></li><li class='divider'></li>");
                $("#pm-nav").append("<li><a class='text-center' href='/pm'><strong>View All Conversations </strong><i class='fa fa-angle-right'></i></a></li>");
            } else{
                $("#pm-nav").append("<li><a class='text-center' href='/pm/unread'><strong>View New Messages </strong><i class='fa fa-angle-right'></i></a></li>");
                $(".pm-count").text(data.length);
                $(".pm-count").show();
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
                $("#conv-list").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-right'><p>"+data[i].f_name.charAt(0).toUpperCase()+data[i].l_name.charAt(0).toUpperCase()+"</p></div></span><div class='conv-body clearfix'><div class='header'><strong class='primary-font'>"+ data[i].f_name +" "+ data[i].l_name+ "</strong></div><p class='justify text-muted'>"+ data[i].data +"<span class='pull-right'><i class='fa fa-arrow-circle-right fa-fw'></i></span></p><small class='text-muted pull-left'><i class='fa fa-clock-o fa-fw'></i> "+ data[i].t +"</small></div></li>");
                $("#conv-list li:last").attr("data-m_id", data[i].m_id);
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
                var m_id = $(this).attr("data-m_id");
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
    
    function dateTime(optionNumber){
        // initialize input widgets first
        $("p[data-num='"+optionNumber+"'] .time").timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia'
        });

        $("p[data-num='"+optionNumber+"'] .date").datepicker({
            'format': 'dd-mm-yyyy',
            'autoclose': true
        });

        // initialize datepair
        $("p[data-num='"+optionNumber+"']").datepair();
    }

    function update_notif(){
        $(".notif-count").hide();
        $.post('/list_notif', {}, function (res) {
            $("#notif-nav").empty();
            var data = JSON.parse(res);
            for (var i = 0; i < data.length; i++){
                $("#notif-nav").append("<li><a  href='/group/"+data[i].g_id+"/"+data[i].t_id+"'><div><i class='fa fa-comment fa-fw'></i> "+data[i].data+"<span class='pull-right text-muted small'>"+data[i].t+"</span></div></a></li>");
                if (i != data.length - 1)
                    $("#notif-nav").append("<li class='divider'></li>");
            }

            if (data.length == 0){
                $("#notif-nav").append("<li class='text-center'><em style='cursor:default;'>No new notifications</em></li>");
            } else{
                $(".notif-count").text(data.length);
                $(".notif-count").show();
            }

            $('#notif-nav a[href]').unbind("click");

            $('#notif-nav a[href]').click(function(e) {

                var href = $(this).attr("href");
                loadContent(href);

                e.preventDefault();
            });

        });
    }
    
    function updateProfile(){

        $('#edit-pro').click(function () {

            $('#p-error').hide();
            $('#p-success').hide();

            if ($('#p-n_name').val().trim() == "" || $('#p-email').val().trim() == "" || $('#p-profile').val().trim() == "") {
                $('#p-error').text("Invalid nickname, email, password or description");
                $('#p-error').show();
            } else {

                $.post('/edit_pro', {
                    n_name: $('#p-n_name').val(),
                    email: $('#p-email').val(),
                    password: $('#p-password').val(),
                    profile: $('#p-profile').val()
                }, function (res) {
                    $('#p-success').text("Profile successfully updated!");
                    $('#p-success').show();

                });
            }
        });

        $('#reset-pro').click(function () {
            loadContent("/profile");
        });
        
        
    }

    function newThread(g_id){
        
        var optionNumber = 0;
        var optionList = [];
        var emptyFileList =  $("#t-file")[0].files;

        $('#add-sched').click(function(){
            $("#t-sched").append("<p data-num='"+optionNumber+"'><input type='text' class='form-control date start'><input type='text' class='form-control time start'> to<input type='text' class='form-control time end'><input type='text' class='form-control date end' disabled='disabled'><i style='cursor: pointer;' class='fa fa-times fa-fw'></i></p>");

            dateTime(optionNumber);

            $("p[data-num='"+optionNumber+"'] i").click(function(){
                optionList.splice(optionList.indexOf(parseInt($(this).closest('p').attr("data-num"))), 1);
                $(this).closest('p').remove();
            });

            optionList.push(optionNumber);
            optionNumber++;
        });

        

        $('#newThread').on('resetThread hidden.bs.modal', function () {
            optionList = [];
            optionNumber = 0;
            $("#s_group").prop("checked", true);

            $("#t-sched p").remove();

            $('#t-title').val("");
            $('#t-msg').val("");

            $("#t-file")[0].files = emptyFileList ;

            $('#t-error').hide();
            $('#t-success').hide();
        });



        $('#btn-thread').click(function () {
            if ($('#t-title').val().trim() == "" || $('#t-msg').val().trim() == ""){
                $('#t-error').text("Invalid thread title or message");
                $('#t-error').show();
            } else{


                var schedList = [];

                for (var i = 0; i < optionList.length; i++){
                    var dateStart = $("p[data-num='"+optionList[i]+"'] .date.start");
                    var dateEnd = $("p[data-num='"+optionList[i]+"'] .date.end");
                    var timeStart = $("p[data-num='"+optionList[i]+"'] .time.start");
                    var timeEnd = $("p[data-num='"+optionList[i]+"'] .time.end");

                    var fromDate = new Date(dateStart.datepicker("getDate").getFullYear(),
                        dateStart.datepicker("getDate").getMonth(),
                        dateStart.datepicker("getDate").getDate(),
                        timeStart.timepicker("getTime").getHours(),
                        timeStart.timepicker("getTime").getMinutes(), 0, 0);

                    var toDate = new Date(dateEnd.datepicker("getDate").getFullYear(),
                        dateEnd.datepicker("getDate").getMonth(),
                        dateEnd.datepicker("getDate").getDate(),
                        timeEnd.timepicker("getTime").getHours(),
                        timeEnd.timepicker("getTime").getMinutes(), 0, 0);

                    schedList.push({from: fromDate.getTime(), to: toDate.getTime()});
                }

                var inputFiles = $("#t-file")[0].files;
                var fileList = [];


                for (var j = 0; j < inputFiles.length; j++){
                    var reader = new FileReader();
                    var file = inputFiles[j];
                    reader.readAsDataURL(file);
                    reader.onload = (function(file){
                        return function (event) {
                            fileList.push({name: file.name, data: event.target.result});

                            if (fileList.length == inputFiles.length){
                                $.post('/new_thrd', {g_id: g_id, title: $('#t-title').val(), data: $('#t-msg').val(), s_type: $('input[name="s_options"]:checked').val(), s_list: JSON.stringify(schedList), f_list: JSON.stringify(fileList)}, function (res) {
                                    $('#t-success').text("Thread "+$('#t-title').val()+" successfully created");
                                    $('#newThread').trigger('resetThread');
                                    $('#t-success').show();

                                    $('#newThread').on('hidden.bs.modal', function () {
                                        loadContent(window.location.pathname);
                                    });

                                });
                            }
                        };
                    })(file);
                }

                if (inputFiles.length == 0){
                    $.post('/new_thrd', {g_id: g_id, title: $('#t-title').val(), data: $('#t-msg').val(), s_type: $('input[name="s_options"]:checked').val(), s_list: JSON.stringify(schedList), f_list: JSON.stringify(fileList)}, function (res) {
                        $('#t-success').text("Thread "+$('#t-title').val()+" successfully created");
                        $('#newThread').trigger('show.bs.modal');
                        $('#t-success').show();

                        $('#newThread').on('hidden.bs.modal', function () {
                            loadContent(window.location.pathname);
                        });

                    });
                }
            }
        });
        
    }

    function getThread(t_id){

        $("#s-success").hide();

        $.post('/get_thrd', {t_id: t_id}, function (res) {
            res = JSON.parse(res);
            update_notif();
            
            $("#tc-author-init").text(res.f_name.charAt(0).toUpperCase() + res.l_name.charAt(0).toUpperCase());
            $("#tc-author").text(res.f_name + " " + res.l_name);
            $("#tc-author").attr("href", "/member/"+res.u_id);
            $("#tc-title").text(res.title);
            $("#tc-message").text(res.data);
            $("#tc-timestamp").text(res.t);


            $("#tc-sched").hide();
            $("#tc-file").closest("div").hide();
            $("#tc-file").empty();
            $(".pref-list").remove();

            if (res.file.length != 0) {
                for (var i = 0; i < res.file.length; i++){
                    $("#tc-file").append("<li><a href='/upload/t"+ t_id+ "/" + res.file[i].name+"' target='_blank' ><i class='fa fa-download fa-fw'></i>"+res.file[i].name+"</a></li>");
                }
                $("#tc-file").closest("div").show();
            }

            
            if (res.sched.length != 0){

                var sched_label = $("#tc-sched label");
                var sched_help = $("#tc-sched .help-block");

                if (res.sched[0].s_type == 1) {
                    sched_label.text("Schedule Meeting (Individual)");
                    sched_help.text("Select an available time slot");
                    var pref_type = 'radio';
                } else {
                    sched_label.text("Schedule Meeting (Group)");
                    sched_help.text("Select one or more preferred meeting times");
                    var pref_type = 'checkbox';
                }

                for (i = 0; i < res.sched.length; i++){
                    if (res.sched[0].s_type == 0)
                        $("<div class='"+pref_type+" pref-list' data-tid='"+t_id+"' ><label><input data-id='"+res.sched[i].id+"' type='"+pref_type+"' name='s_prefs'><strong>"+res.sched[i].s_from+"</strong> to <strong>"+res.sched[i].s_to+"</strong> ("+res.sched[i].size+")</label></div>").insertBefore("#btn-pref");
                    else
                        $("<div class='" + pref_type + " pref-list' data-tid='" + t_id + "' ><label><input data-id='" + res.sched[i].id + "' type='" + pref_type + "' name='s_prefs'><strong>" + res.sched[i].s_from + "</strong> to <strong>" + res.sched[i].s_to + "</strong> (<a href='/member/" + res.sched[i].u_id + "'>" + res.sched[i].u_id + "</a>)</label></div>").insertBefore("#btn-pref");

                    if (res.sched[i].checked)
                        $("."+pref_type+" input").last().attr('checked', true);

                    if (res.sched[i].disabled){
                        $("."+pref_type+" input").last().attr('disabled', true);
                        $("."+pref_type+" label").last().attr('style', "cursor:default");
                    }
                }

                if (res.sched[0].s_type == 1){
                    $('.pref-list a[href]').click(function(e) {
                        var href = $(this).attr("href");
                        loadContent(href);

                        e.preventDefault();
                    });
                }

                $("#tc-sched").show();

                $('#btn-pref').unbind("click");
                $('#btn-pref').click(function () {
                    var schedList = $("."+pref_type+" input");
                    var prefList = [];

                    for (var i = 0; i < schedList.length; i++) {
                        if (schedList[i].checked) {
                            prefList.push(parseInt(schedList[i].attributes['data-id'].nodeValue));
                        }
                    }

                    $.post('/edit_pref', {t_id: parseInt($("."+pref_type+"").attr('data-tid')), prefList: JSON.stringify(prefList)}, function (res) {
                        getThread(parseInt($("."+pref_type+"").attr('data-tid')));
                        $("#s-success").text("Preferences successfully updated!")
                        $("#s-success").show();
                    });
                });

            }

            $("#tc-comment").empty();

            for (var j = 0; j < res.cmt.length; j++){
                $("#tc-comment").append("<li class='left clearfix'><span class='pm-img pull-left'> <div class='img-circle avatar-left'><p>"+res.cmt[j].f_name.charAt(0).toUpperCase() + res.cmt[j].l_name.charAt(0).toUpperCase()+"</p></div></span> <div class='pm-body clearfix'> <div class='header'> <strong class='primary-font'>"+res.cmt[j].f_name + " " + res.cmt[j].l_name+"</strong><small class='text-muted'> <i class='fa fa-clock-o fa-fw'></i>" + res.cmt[j].t +"</small></div><p class='justify pull-left'>" + res.cmt[j].data +"</p></div></li>");
            }
        });
    }

    function addComment(t_id){
        if($('#input-comment').val().trim() != ""){
            $.post('/add_cmt', {t_id: t_id, data: $('#input-comment').val()}, function (res) {
                getThread(t_id);
            });
            $('#input-comment').val("");
        }
    }

    function viewThread(t_id){
        var threadList = JSON.parse($('#t-current').attr("data-thread"));

        var currentThread = threadList.indexOf(t_id);

        if (currentThread < 0)
            currentThread = 0;

        $("#t-current").text(currentThread + 1);

        if (currentThread != 0)
            $('#t-prev').removeClass("disabled");

        if (currentThread != threadList.length - 1)
            $('#t-next').removeClass("disabled");

        getThread(threadList[currentThread]);

        $('#t-prev').click(function () {
            if (currentThread != 0){
                $('#t-next').removeClass("disabled");
                currentThread--;
                $("#t-current").text(currentThread + 1);
                getThread(threadList[currentThread]);

                if (currentThread == 0){
                    $(this).addClass("disabled");
                }
            }
        });

        $('#t-next').click(function () {
            if (currentThread != threadList.length - 1) {
                $('#t-prev').removeClass("disabled");
                currentThread++;
                $("#t-current").text(currentThread + 1);
                getThread(threadList[currentThread]);

                if (currentThread == threadList.length - 1) {
                    $(this).addClass("disabled");
                }
            }
        });

        $('#btn-comment').click(function () {
            addComment(threadList[currentThread]);
        });
    }

    function loadContent(href){

        if (href == '/logout'){
            window.location.replace('/logout');
            return;
        }

        update_pm();
        update_notif();
        updateGroup();

        var addHistory = true;

        var input = href.split("/");
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

                        $("#send").unbind("click");
                        $("#refresh").unbind("click");

                        $('#refresh').click(function () {
                            get_pm(input[3]);
                        });

                        $('#send').click(function () {
                            add_pm(input[3]);
                        });
                        addHistory = false;
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
                case 'group':
                    editGroup(input[2]);
                    newThread(input[2]);

                    if (!$('#no-thread-info').length)
                        viewThread(parseInt(input[3]));

                    break;
                case 'profile':
                    updateProfile();
                    break;
                }

            if (href != window.location.pathname && addHistory) {
                window.history.pushState('', 'page: '+href, href);
            }

            });
    }

    function login() {
        var username = $('#u-name').val();
        var password = $('#pw').val();
        $.post('/login', {u_name: username, pw: password}, function (res){
            if (res == "false") {
                $('#login-error').show();
                $('#login-error').text("Invalid Credentials");
            }
            else if (res == "true")
                window.location.replace ('/');
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