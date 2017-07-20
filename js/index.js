$(document).ready(function(){
    // 请求数据 更新数据-----------------------------------------------------------------
    var info, listInfo, queueInfo, workerInfo;
    var headpic = $('.worker-info .headpic');
    var name = $('.worker-info .name');
    var title = $('.worker-info .title');
    var department = $('.worker-info .department');
    var queuenum = $('.worker-info .queuenum span');
    var seeingName = $('.seeing-info .name');
    var seeingId = $('.seeing-info .id');
    var watingListInfo = $('.watingList .watingList-info');
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

    var anonymous = false;
    //匿名函数
    function replaceChat(source,pos,newChar){
        if(pos<0||pos>=source.length||source.length==0){
            return source;
        }
        var iBeginPos= 0, iEndPos=source.length;
        var sFrontPart=source.substr(iBeginPos,pos);
        var sTailPart=source.substr(pos+1,source.length);
        var sRet=sFrontPart+newChar+sTailPart;
        return sRet;
    }
    // console.log(replaceChat("张三丰",1,"*"));
    function nameAnonymous (name) {
        if (anonymous) {
            name = name.length>2?replaceChat(name,1,"*"):replaceChat(name,0,"*");
        }
        return name
    }

    //是否显示患者序号
    var showNumber = true;

    // Note:url参数必须这样写      ?stationID=2&callerID0=8
    $.get('config.json').done(function(response){
        console.log(response)
        var type  = typeof response;
        var serverUrl;
        if (type == 'string') {
            serverUrl = JSON.parse(response).serverUrl;
            anonymous = JSON.parse(response).anonymous;
            showNumber = JSON.parse(response).showNumber;
        } else {
            serverUrl = response.serverUrl;
            anonymous = response.anonymous;
            showNumber = response.showNumber;
        }
        // alert(nameAnonymous("张三丰"))
        setInterval(function(){
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
                .done(function(response) {
                    console.log(response)
                    info = response.detail.list[0];
                    listInfo = info.listInfo;
                    queueInfo = info.queueInfo;
                    workerInfo = info.workerInfo;
                    console.log(listInfo)
                    changeInfo()
                    showModal()
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
        if (!showNumber) num = null;
        if(num){
            returnStr = '(' + statusStr + num + ')'
        }else if ((!num)&&(statusStr != '')) {
            returnStr = '(' + statusStr + ')'
        }
        return returnStr;
    }

    // 改变信息
    function changeInfo() {
        headpic.attr({
            src: workerInfo.headpic
        });
        name.text(workerInfo.name+'('+workerInfo.title.slice(0,5)+')');
        title.text(workerInfo.title);
        department.text(queueInfo.pos+'('+queueInfo.department+')');
        queuenum.text(queueInfo.listNum);
        seeingName.text(queueInfo.listNum);
        queuenum.text(queueInfo.listNum);


        seeingName.text(nameAnonymous(SliceName(listInfo.seeing.name)));
        seeingId.text(ReturnStatus(listInfo.seeing.status,listInfo.seeing.id));

        var html = '', len = listInfo.waiting.length > 3 ? 3 : listInfo.waiting.length;
        for (var i = 0; i < len; i++) {
            html += '<div class="wait"><span class="name">' + nameAnonymous(SliceName(listInfo.waiting[i].name)) + '</span><span class="id">' +
                ReturnStatus(listInfo.waiting[i].status,listInfo.waiting[i].id) + '</span></div>'
        };
        if (len < 3) {
            for (var i = 0; i < (3-len); i++) {
                html += '<div class="wait"><span class="name"></span><span class="id"></span></div>'
            }
        }
        watingListInfo.html(html)
    }


    // 弹出框内容
    function showModal() {
        console.log(workerInfo)
        console.log('modal', listInfo.seeing)
        if (listInfo.seeing.show == 1) {
            modal.css('display', 'block');
            modalFooter.text(workerInfo.department);
            departmentFooter.text(queueInfo.pos);
            seeingIdFooter.text(listInfo.seeing.id);
            seeingNameFooter.text(listInfo.seeing.name);
        } else {
            modal.css('display', 'none');
        }
    }
})
