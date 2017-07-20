$(document).ready(function () {
    // 请求数据 更新数据-----------------------------------------------------------------
    var contentList = $('.content')
    //科室名字
    var department = $('.department')
    //医生头像
    var docImg = $('.docImg div')
    //医生信息
    var docDetail = $('.docDetail')
    //正在就诊
    var seeingListHtml = $('.seeingList')
    //等待就诊
    var waitListHtml = $('.waitList')
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

    // Note:url参数必须这样写      ?stationID=2&callerID0=8&callerID1=10
    $.get('config.json').done(function (response) {
        // return
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


    var imgSrc = null;

    // 改变信息
    function changeInfo (info) {
        var html = "";

        var seeingList = "";
        var waitingList = "";

        department.html(info.workerInfo.department)

        if (imgSrc != info.workerInfo.headpic) {
            imgSrc = info.workerInfo.headpic;
            docImg.html('<img class="WIDTH80" src="'+ imgSrc +'">')
        }

        var docInfoHtml = '<div>'
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
            + '</div> </div> </div>'

        docDetail.html(docInfoHtml)

        if(info.listInfo.seeing.name !=""){
            seeingList = '<span>' + nameAnonymous(SliceName(info.listInfo.seeing.name)) + ReturnStatus(info.listInfo.seeing.status,info.listInfo.seeing.id) + '</span>'
        }
        seeingList = '<div class="listInfo   seeing_title">'
            + '正在就诊'
            + '</div>'
            + '<div class="seeing_name">'
            + seeingList
            + '</div>';
        seeingListHtml.html(seeingList);

        if (info.listInfo.waiting.length > 0) {
            var tempHtml = "";
            var length = info.listInfo.waiting.length > 1?2:1;
            for (var i = 0; i < length; i++) {
                tempHtml += '<div class="waiting_name">'
                    + '<span>' + nameAnonymous(SliceName(info.listInfo.waiting[i].name)) + ReturnStatus(info.listInfo.waiting[i].status,info.listInfo.waiting[i].id) + '</span>'
                    + '</div>';
            }
            waitingList = tempHtml;
        }
        waitingList = '<div class="listInfo  waiting_title ">等待就诊</div>'+ waitingList

        waitListHtml.html(waitingList)


        // html = '<div class="content-inner">'
        //     + '<div class="content-head">'
        //     + '<div class="head-item department">' + info.queueInfo.pos + '</div>'
        //     + '</div>'
        //     + '<div class="doctorInfo bg-waite">'
        //     + '<div class="TxtAnC WIDTH35 DISIL docImg">'
        //     + '<div class=" BORDER-B PADDING-X-20 ">'
        //     + '<img class="WIDTH80" src="'+ info.workerInfo.headpic +'">'
        //     + '</div>'
        //     + '</div><div class="DISIL WIDTH65 BORDER-B docDetail">'
        //     + '<div>'
        //     + '<div class="margin_b14">'
        //     + '<span>姓名：' + info.workerInfo.name + '</span>'
        //     + '</div>'
        //     + '<div class="margin_b14">'
        //     + '<span>' + '职称：' + info.workerInfo.title + '</span>'
        //     + '</div>'
        //     + '<div class="margin_b14">'
        //     + '<span>科室： ' + info.workerInfo.department + '</span>'
        //     + '</div>'
        //     + '<div class="margin_b14">'
        //     + '<span>排队人数： ' + info.queueInfo.listNum + '</span>'
        //     + '</div><div>'
        //     + '<div class="DISIL profession_title">擅长： </div><div class="DISIL profession_info">' + info.workerInfo.descText
        //     + '</div> </div> </div> </div> </div>'
        //     + '<div class="TxtAnC FSW_B bg-waite seeingList">'
        //     + '<div class="listInfo   seeing_title">'
        //     + '正在就诊'
        //     + '</div>'
        //     + '<div class="seeing_name">'
        //     + seeingList
        //     + '</div> </div>'
        //     + '<div class="TxtAnC FSW_B bg-waite waitList">'
        //     + '<div class="listInfo  waiting_title ">等待就诊</div>'
        //     + waitingList
        //     +' </div> </div>'
        // contentList.html(html)
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