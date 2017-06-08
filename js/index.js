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

   // Note:url参数必须这样写      ?stationID=2&callerID0=8
    $.get('config.json').done(function(response){
            var serverUrl = JSON.parse(response).serverUrl;
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

    // 改变信息
    function changeInfo() {
        headpic.attr({
            src: workerInfo.headpic
        });
        name.text(workerInfo.name);
        title.text(workerInfo.title);
        department.text(queueInfo.department);
        queuenum.text(queueInfo.listNum);
        seeingName.text(queueInfo.listNum);
        queuenum.text(queueInfo.listNum);
        

        seeingName.text(listInfo.seeing.name);
        seeingId.text(listInfo.seeing.id);

        var html = '', len = listInfo.waiting.length > 3 ? 3 : listInfo.waiting.length;
        for (var i = 0; i < len; i++) {
            html += '<div class="wait"><span class="name">' + listInfo.waiting[i].name + '</span><span class="id">' +
                   listInfo.waiting[i].id + '</span></div>'
        }
        watingListInfo.html(html)
    }


    // 弹出框内容
    function showModal() {
        console.log('modal', listInfo.seeing)
        if (listInfo.seeing.show == 1) {
            modal.css('display', 'block');
            modalFooter.text(workerInfo.department);
            departmentFooter.text(workerInfo.department);
            seeingIdFooter.text(listInfo.seeing.id);
            seeingNameFooter.text(listInfo.seeing.name);
        } else {
            modal.css('display', 'none');
        }
    }
})
