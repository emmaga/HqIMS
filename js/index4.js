$(document).ready(function(){
    // 请求数据 更新数据-----------------------------------------------------------------
    var waitingList = $('.content .content-list .wating.content-block');
    var hasseenList = $('.content .content-list .seeing.content-block .hasseen');
    // 显示数量
    var waitingMax = 3*5;
    var hasSeenMax = 3*3;

    var seeingName = $('.isseeing .seeing-name');
    var seeingPos = $('.isseeing .seeing-pos .pos');

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

    //格式化输出病人挂号优先级跟号码
    var ReturnStatus = function (status, num) {
        // status对应 locked: 锁定 VIP: 优先 order: 预约 normal: 普通 emergency: 急诊 review: 复诊 pass: 过号
        //    (复A023)
        var returnStr = '';
        var statusStr = '';
        switch (status){
            case 'order':
                statusStr = '预';
                break
            case 'emergency':
                statusStr = '急';
                break
            case 'review':
                statusStr = '复';
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

    // Note:url参数必须这样写      ?stationID=2&callerID0=8
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
                    action:"getWinList",
                    stationID: Number(QueryString.stationID),
                    callerID: [Number(QueryString.callerID0)]
                })
            })
                .done(function(response) {
                    var info = response.detail.list[0];
                    changeWaiting(info.watingList)
                    changeSeeing(info.seeingList, info.calling)
                })
                .fail(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");
                });
        },  1000)
    })

    // 正在配药
    function changeWaiting(watingList) {
        console.log(watingList)
        var html = "";
        for (var i = 0; i < waitingMax; i++) {
            if ((i + 1)%3 === 1) {
                html += '<div class="row">';
            }
            if (watingList[i] ) {
                html += '<div class="row-item">'+watingList[i].name+'</div>';
            } else {
                html += '<div class="row-item"></div>';
            }

            if ((i + 1)%3 === 0) {
                html += '</div>';
            }
        }
        console.log(html)
        waitingList.html(html)
    }
    // 正在取药
    function changeSeeing(seeingList, calling) {
        console.log(calling)
        var html = "";
        for (var i = 0; i < hasSeenMax; i++) {
            if ((i + 1)%3 === 1) {
                html += '<div class="row">';
            }
            if (seeingList[i] ) {
                html += '<div class="row-item">'+seeingList[i].name+'</div>';
            } else {
                html += '<div class="row-item"></div>';
            }

            if ((i + 1)%3 === 0) {
                html += '</div>';
            }
        }
        hasseenList.html(html);

        seeingName.text(SliceName(calling.name)+'('+calling.id+')');
        seeingPos.text(calling.pos);
    }
})