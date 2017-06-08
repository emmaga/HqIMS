$(document).ready(function(){
    // 请求数据 更新数据-----------------------------------------------------------------
    var departmentList = $('.department-list');
    //  弹出框
    var modal = $('.modal');
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

    // Note:url参数必须这样写      ?stationID=2
     $.get('config.json').done(function(response){
             var serverUrl = JSON.parse(response).serverUrl;
             // setInterval(function(){
                     $.ajax({
                         url: serverUrl,
                         type: 'POST',
                         dataType: 'json',
                         data: JSON.stringify({
                            action:"getStationList",
                            stationID: Number(QueryString.stationID)
                         })
                     })
                     .done(function(response) {
                         var res = response.detail;
                         changeInfo(res)
                         showModal(res)
                     })
                     .fail(function() {
                         console.log("error");
                     })
                     .always(function() {
                         console.log("complete");
                     });
             // },  1000)

     })
    function changeInfo(res) {
        var html = '', len = res.list.length > 5 ? 5 : res.list.length;
        for (var i = 0; i < len; i++) {
            var waitingNum = res.list[i].listInfo.waiting.length > 3 ? 3 : res.list[i].listInfo.waiting.length;
            html += '<div class="department-info">' +
                '<div class="department info-item">' + res.list[i].queueInfo.department + '</div>' +
                '<div class="seeing info-item">' + res.list[i].listInfo.seeing.name + '</div>' +
                '<div class="waiting info-item">';

            for (var j = 0; j < waitingNum; j++) {
                html += '<span>' + res.list[i].listInfo.waiting[j].name + '</span>'
            }
            html += '</div>' +
                '<div class="listnum info-item">' + res.list[i].queueInfo.listNum + '</div>' +
            '</div>'
        }
        // 若少于五个
        if (len < 5) {
          for (var i = 0; i < 5- len; i++) {
              html += '<div class="department-info">' +
                         '<div class="department info-item"></div>' +
                         '<div class="seeing info-item"></div>' +
                      '<div class="waiting info-item">'+
                      '</div>' +
                  '<div class="listnum info-item"></div>' +
              '</div>'
          }
        }
        departmentList.html(html)
    }
    // 弹出框内容
    function showModal(res) {
        var list = res.list, flag = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].listInfo.seeing.show == 1) {
                   modalFooter.text(list[i].workerInfo.department);
                   departmentFooter.text(list[i].workerInfo.department);
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