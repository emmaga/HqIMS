$(document).ready(function(){
    // 请求数据 更新数据-----------------------------------------------------------------
    //诊室名
    var pos = $(".pos")
    //科室名
    var department = $(".department")
    //医生
    var docName = $(".docName")

    //患者信息
    var patientInfo = $(".patientInfo")

    // //患者名字
    // var patientName = $(".patientName")
    // //患者号码
    // var patientID = $(".patientID")

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
        setInterval(function(){
            $.ajax({
                url: serverUrl,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify({
                    action:"getStationList",
                    stationID: Number(QueryString.stationID)
                    // ,
                    // callerID: [Number(QueryString.callerID0)]
                })
            })
                .done(function(response) {
                    // console.log(response)
                    info = response.detail.list;
                    changeInfo(info)
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
        // console.log(name)
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
        // console.log(newName)
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
            if(statusStr != ''){
                returnStr = statusStr + '&nbsp;&nbsp;&nbsp;' + num
            }else{
                returnStr = num
            }

        }else if ((!num)&&(statusStr != '')) {
            returnStr = statusStr
        }
        return returnStr;
    }

    // 改变信息
    function changeInfo(info) {
        // var flag = info.listInfo.seeing.show;
        // if (flag == 1) {
        // console.log(1)
        var flag = false;
        var num = null;
        for(var i = 0 ; i<info.length;i++){
            if(info[i].listInfo.seeing.show == 1){
                flag = true;
                num = i
                break
            }
        }
        // console.log(num)
        // console.log(flag)
        if(flag){
            info = info[num]
            //诊室名
            pos.html(info.queueInfo.pos)
            //科室名
            department.html(info.queueInfo.department)
            //医生
            docName.html(SliceName(info.workerInfo.name))

            var tempHtml = "";
            if(ReturnStatus(info.listInfo.seeing.status, info.listInfo.seeing.id) != ""){
                tempHtml ='<div>'
                    +'<div class=" FS-3 patientName Txt-center">'
                    +nameAnonymous(SliceName(info.listInfo.seeing.name))
                    +'</div>'
                    +'<div class=" FS-2 patientID Txt-center">'
                    +ReturnStatus(info.listInfo.seeing.status, info.listInfo.seeing.id)
                    +'</div></div>'
            }else{
                tempHtml ='<div>'
                    +'<div class=" FS-3 patientName Txt-center">'
                    +nameAnonymous(SliceName(info.listInfo.seeing.name))
                    +'</div>'
                    +'</div>'
            }


            patientInfo.html(tempHtml)
            // //患者名字
            // patientName.html(nameAnonymous(SliceName(info.listInfo.seeing.name)))
            // //患者号码
            // patientID.html(ReturnStatus(info.listInfo.seeing.status, info.listInfo.seeing.id))
            // // }
        }
    }

})
