$(document).ready(function(){
    // 请求数据 更新数据-----------------------------------------------------------------
    var contentList = $('.content .content-list')
    //  弹出框
    var modal = $('.modal')
    var modalFooter = $('.modal-content .modal-footer');
    var departmentFooter = $('.modal-body .department span');
    var seeingIdFooter = $('.modal-body .seeing .id');
    var seeingNameFooter = $('.modal-body .seeing .name');


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
    $.get('config.json').done(function(response){
        var type  = typeof response;
        var serverUrl;
        if (type == 'string') {
            serverUrl = JSON.parse(response).serverUrl;
        } else {
            serverUrl = response.serverUrl;
        }
        setInterval(function(){
            $.ajax({
                url: serverUrl,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify({
                    action:"getCallerList",
                    stationID: Number(QueryString.stationID),
                    callerID: [Number(QueryString.callerID0),Number(QueryString.callerID1)]
                })
            })
                .done(function(response) {
                    info = response.detail.list
                    changeInfo(info)
                    showModal(info)
                })
                .fail(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");
                });
        },  1000)

    })

    //格式化输出名字
    var SliceName = function (name) {
        console.log(name)
        if(name.indexOf("（")>-1){
            var tempStr = name.slice(name.indexOf("（"),name.indexOf("）")+1)
            name = name.replace(tempStr,'')
        }
        if(name.indexOf("(")>-1){
            var tempStr = name.slice(name.indexOf("("),name.indexOf(")")+1)
            name = name.replace(tempStr,'')
        }
        var newName = name;
        if(name.length > 4) {
            newName = name.slice(0,4);
        }
        console.log(newName)
        return newName;

    }
    console.log(SliceName("（预约）令狐虫虫.令狐玲玲"))

    //格式化输出病人挂号优先级跟号码
    var ReturnStatus = function (status, num) {
        // status对应 locked: 锁定 VIP: 优先 order: 预约 normal: 普通 emergency: 急诊 review: 复诊 pass: 过号
        //    (复A023)
        var returnStr = '';
        var statusStr = '';
        switch (status){
            case 'order':
                statusStr = '预约';
                break
            case 'emergency':
                statusStr = '急诊';
                break
            case 'review':
                statusStr = '复诊';
                break
            default:
                break
        }
        if(num){
            returnStr = '(' + statusStr + num + ')'
        }else if ((!num)&&(statusStr != '')) {
            returnStr = '(' + statusStr + ')'
        }
        return returnStr;
    }

    // 改变信息
    function changeInfo(info) {
        var html = "";
        for (var i = 0; i < info.length; i++) {
            html+="<div class='list'>"+
                '<div class="worker content-block">' +
                '<div class="worker-info content-info">'+
                '<div class="top">'+
                '<div class="img">'+
                '<img src="'+ info[i].workerInfo.headpic +'" alt="" class="headpic">'+
                '</div>'+
                '<div class="top-info">'+
                '<div class="department">'+info[i].workerInfo.department+'</div>'+
                '<div class="pos">'+info[i].queueInfo.pos+'</div>'+
                '<div class="queuenum">排队人数：<span>'+info[i].queueInfo.listNum+'</span></div>'+
                '</div>'+
                '</div>'+
                '<div class="down">'+
                '<div class="name">'+info[i].workerInfo.name+'</div>'+
                '<div class="title">('+info[i].workerInfo.title+')</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '<div class="seeing content-block">'+
                '<div class="seeing-info content-info">'+
                '<div class="info-inner">'+
                '<div class="name">'+SliceName(info[i].listInfo.seeing.name)+'</div>'+
                '<div class="id seeing-id">'+ReturnStatus(info[i].listInfo.seeing.status,info[i].listInfo.seeing.id)+'</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '<div class="watingList content-block">'+
                '<div class="watingList-info content-info">';
            var watingList = info[i].listInfo.waiting;
            var len = watingList.length> 3?3:watingList.length;
            for (var j = 0; j < len; j++) {
                html +=  '<div class="wait">'+
                    '<span class="name">'+SliceName(watingList[j].name)+'</span>'+
                    '<span class="id">'+ReturnStatus(watingList[j].status,watingList[j].id) +'</span>' +
                    '</div>'
            };

            // 不够三个
            if (len < 3 ) {
                for (var k = 0; k < (3 - len); k++) {
                    html +=  '<div class="wait">'+
                        '<span class="name"></span>'+
                        '<span class="id"></span>' +
                        '</div>'
                }
            }
            html+='</div>'+
                '</div>'+
                '</div>';
        }
        contentList.html(html)
    }



    // 弹出框内容
    function showModal(info) {
        var list = info, flag = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].listInfo.seeing.show == 1) {
                modalFooter.text(list[i].workerInfo.department);
                departmentFooter.text(list[i].queueInfo.pos);
                seeingIdFooter.text(list[i].listInfo.seeing.id);
                seeingNameFooter.text(list[i].listInfo.seeing.name);
                flag = true;
                break;
            }
        }
        if (flag) {
            modal.css('display', 'block');
        } else {
            modal.css('display', 'none');
        }
    }
})