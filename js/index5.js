$(document).ready(function () {
    // 请求数据 更新数据-----------------------------------------------------------------
    var contentList = $('.content')
    //  弹出框
    var modal = $('.modal')


    var QueryString = function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }();

    // Note:url参数必须这样写      ?stationID=2&callerID0=8&callerID1=10
    $.get('config.json').done(function (response) {
        // return
        var type  = typeof response;
        var serverUrl;
        if (type == 'string') {
            serverUrl = JSON.parse(response).serverUrl;
        } else {
            serverUrl = response.serverUrl;
        }
        setInterval(function () {
            $.ajax({
                url: serverUrl,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify({
                    action:"getCallerList",
                    stationID: Number(QueryString.stationID),
                    callerID: [Number(QueryString.callerID0)]
                })
            })
                .done(function (response) {
                    info = response.detail.list[0]
                    changeInfo(info)
                    showModal(info)
                })
                .fail(function () {
                    console.log("error");
                })
                .always(function () {
                    console.log("complete");
                });
        }, 1000)

    })


    // var json = 0
    // var num = 0
    // setInterval(function () {
    //     var url = json == 0 ? 'mockData/index5.json' : 'mockData/index6.json'
    //     json = json == 0 ? 1 : 0
    //     num++
    //     return
    //     $.get(url).done(function (response) {
    //         info = response.detail.list[0]
    //         changeInfo(info)
    //     })
    //     console.log(num % 5)
    //     if (num % 5 == 0) {
    //         $(".modal").css("display", $(".modal").css("display") == "block" ? "none" : 'block')
    //     }
    // }, 1000)

    // 改变信息
    function changeInfo (info) {
        var html = "";
        var seeingList = "";
        var waitingList = "";

        if (info.listInfo.waiting.length > 0) {
            var tempHtml = "";
            var length = info.listInfo.waiting.length > 1?2:1;
            for (var i = 0; i < length; i++) {
                tempHtml += '<div class="waiting_name">'
                    + '<span>' + info.listInfo.waiting[i].name + '(' + info.listInfo.waiting[i].id + ')' + '</span>'
                    + '</div>';
            }
            waitingList = tempHtml;
        }

        if(info.listInfo.seeing.name !=""){
            seeingList = '<span>' + info.listInfo.seeing.name + '(' + info.listInfo.seeing.id + ')' + '</span>'
        }

        html = '<div class="content-inner">'
            + '<div class="content-head">'
            + '<div class="head-item department">' + info.queueInfo.pos + '</div>'
            + '</div>'
            + '<div class="doctorInfo bg-waite">'
            + '<div class="TxtAnC WIDTH35 DISIL docImg">'
            + '<div class=" BORDER-B PADDING-X-20 ">'
            + '<img class="WIDTH80" src="'+ info.workerInfo.headpic +'">'
            + '</div>'
            + '</div><div class="DISIL WIDTH65 BORDER-B docDetail">'
            + '<div>'
            + '<div class="margin_b14">'
            + '<span>姓名：' + info.workerInfo.name + '</span>'
            + '</div>'
            + '<div class="margin_b14">'
            + '<span>' + '职称：' + info.workerInfo.title + '</span>'
            + '</div>'
            + '<div class="margin_b14">'
            + '<span>科室： ' + info.workerInfo.department + '</span>'
            + '</div>'
            + '<div class="margin_b14">'
            + '<span>排队人数： ' + info.queueInfo.listNum + '</span>'
            + '</div><div>'
            + '<div class="DISIL profession_title">擅长： </div><div class="DISIL profession_info">' + info.workerInfo.descText
            + '</div> </div> </div> </div> </div>'
            + '<div class="TxtAnC FSW_B bg-waite seeingList">'
            + '<div class="listInfo   seeing_title">'
            + '正在就诊'
            + '</div>'
            + '<div class="seeing_name">'
            + seeingList
            + '</div> </div>'
            + '<div class="TxtAnC FSW_B bg-waite">'
            + '<div class="listInfo  waiting_title ">正在排队</div>'
            + waitingList
            +' </div> </div>'
        contentList.html(html)
    }


    // 弹出框内容
    function showModal (info) {
        var flag = info.listInfo.seeing.show;
        $(".modal").css("display", flag == 0 ? "none" : 'block');
        if (flag == 1) {
            var html = '<div class="modal-content">'
                + '<div class="modal-body">'
                + '<div class="modal_num">'
                + '请&nbsp;&nbsp;<span>' + info.listInfo.seeing.id + '</span>&nbsp;&nbsp;号'
                + '</div>'
                + '<div class="modal_name">'
                + info.listInfo.seeing.name
                + '</div>'
                + '<div class="modal_to">到 </div> <div class="modal_pos">'
                + info.queueInfo.pos
                + '</div> <div class="modal_department">'
                + info.queueInfo.department
                + '</div> </div> </div>';
            modal.html(html);
        }
    }
})