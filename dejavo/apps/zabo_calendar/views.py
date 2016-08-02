#-*- coding: utf-8 -*-#
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.template import RequestContext, loader
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from django.contrib.sites.requests import RequestSite
from django.db.models import Count, Q

from accept_checker.decorators import require_accept_formats, auth_required
from dejavo.apps.zabo.models import Article, Timeslot, Question, Answer
from dejavo.apps.account.models import Participation
from dejavo.settings import TIME_ZONE

import json
import calendar, datetime

@require_accept_formats(['text/html'])
@require_http_methods(['GET'])
def main(request, year=0, month=0):
    return render(request, 'zabo_calendar/main.html')

def days_at_year_month(year, month):
    # [(week, day), (week, day)...] 를 반환한다
    # mon:0 ~ sun:6
    # 달의 시작이 월요일이 아닌 경우 1일 전까지의 day 값은 빈 string이다.
    # 달의 끝의 남은 부분도 빈 string으로 채워준다.
    cal = calendar.month(year, month).strip().split('\n')
    weeks = list()
    for week in cal[2:]:
        week = [week[i:i + 3].strip() for i in range(0, len(week), 3)]
        weeks.append([(i, week[i]) for i in range(0, len(week))])

    # layout을 위해 달의 끝 부분을 빈 string으로 채운다.
    # zabo_calendar.js 의 render 함수 중 달력의 날짜 생성 부분 참고
    while weeks[-1][-1][0] < 6:
        weeks[-1].append((weeks[-1][-1][0]+1, ''))

    return weeks

# @require_accept_formats(['application/json'])
# @require_http_methods(['GET'])
def get_month_data(request, year, month):
    # result =  [ days : 그 달의 날짜에 대한 정보
    #             articles : 그 달에 붙은 자보들에 대한 정보 ]
    result = dict()

    year = int(year)
    month = int(month)

    result['days'] = days_at_year_month(year, month)

    first_of_month = datetime.date(year, month, 1)
    end_of_month = datetime.date(year, month, calendar.monthrange(year, month)[1])
    start_times = Timeslot.objects.filter(start_time__range=(first_of_month, end_of_month))
    end_times = Timeslot.objects.filter(end_time__range=(first_of_month, end_of_month))

    exclude_list = ['created_date','updated_date','content','contact','attachment']
    result['articles'] = list()

    if start_times:
        if end_times and start_times[0].article != end_times[0].article and end_times[0].article.is_active():
            # 저번 달에 시작해 이번 달에 끝나는 경우
            result['articles'].append(end_times[0].article.as_json(exclude_list))

        for timeslot in start_times:
            if timeslot.article.is_active():
                result['articles'].append(timeslot.article.as_json(exclude_list))

    return JsonResponse(
        status=200,
        data=result
    )