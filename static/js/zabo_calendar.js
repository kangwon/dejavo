var day_enum = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function leadingZeros(num, size) {
    var s = "00" + num;
    return s.substr(s.length-size);
}

var now = new Date();
var year = now.getFullYear();
var month = now.getMonth()+1;


$(document).ready(function() {
    getMonthData(year, month);
});

function render(data) {
    console.log(data);

    // 달력 상단 제목 설정
    $('#calendar #year').html(year+"년");
    $('#calendar #month').html(month+"월");


    // 달력의 날짜 부분 생성
    tbody_html = "";

    for (var i in data.days) {
        var week = data.days[i];
        tbody_html += "<tr>";
        for (var j in week) {
            var day = week[j];
            if (day[1]) {
                tbody_html += "<td id='day_" + day[1] + "' class='" + day_enum[day[0]] + "'>" + day[1] + "</td>";
            }
            else {  // 그 달에 속하는 날짜가 아닐 때 (1일 이전 마지막날(ex 31일) 이후)
                tbody_html += "<td></td>";
            }
        }
        tbody_html += "</tr>";
    }

    $('#calendar tbody').html(tbody_html);


    // 달력에 article 부착
    for (var i in data.articles) {
        var article = data.articles[i];
        for (var j in article.timeslot) {
            var timeslot = article.timeslot[j];
            var start_time = timeslot.start_time;
            var start_date = start_time.split('-')[2].split('T')[0] / 1;
            var start_hour = start_time.split('T')[1].split(':')[0];
            var start_minute = start_time.split(':')[1];

            article_html = "<br/><span class='article'>";
            article_html += "[" + start_hour + ":" + start_minute + "] ";
            article_html += article.title;
            article_html += "</span>";

            $('#calendar #day_'+start_date).append(article_html);

            if (timeslot.exist_end) {
                var end_time = timeslot.end_time;
                var end_month = end_time.split('-')[2];
                var end_date = end_time.split('-')[2].split('T')[0];
                var end_hour = end_time.split('T')[1].split(':')[0];
                var end_minute = end_time.split(':')[1];

                if (end_month < month) {
                    end_date = 31;
                }

                for (var i=start_date+1; i<end_date; i++) {
                    article_html = "<br/><span class='article'></span>";
                    $('#calendar #day_'+i).append(article_html);
                }

                article_html = "<br/><span class='article'>";
                article_html += "[" + end_hour + ":" + end_minute + "] ";
                article_html += article.title;
                article_html += "</span>";

                $('#calendar #day_'+end_date).append(article_html);
            }
        }
    }
}
function getMonthData(year, month) {
    $.ajax({
        'method' : 'GET',
        'url' : '/calendar/at/'+year+'/'+leadingZeros(month, 2),
        'dataType' : 'json',
        'success' : function(data, textStatus, jqXHR) {
            render(data);
        },
        'error' : function(jqXHR, textStatus, errorThrown) {
            alert('receive error!');
        },
    });
}

$('#calendar #prev_month').click(function() {
    month -= 1;
    if (month <= 0) {
        year -= 1;
        month = 12;
    }
    getMonthData(year, month)
});
$('#calendar #next_month').click(function() {
    month += 1;
    if (month >= 12) {
        year += 1;
        month = 1;
    }
    getMonthData(year, month)
});

$('#calendar tbody tr').click(function() {
    $(this).animate({
        height: ($(this).height() == 115 ? 315 : 115)
    }, 200);
});