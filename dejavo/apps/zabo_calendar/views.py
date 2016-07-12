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
def main(request):
    now = datetime.datetime.now()
    cal = calendar.month(now.year, now.month).strip().split('\n')
    year = cal[0].split(' ')[1]
    # month = cal[0].split(' ')[0]  영어 month
    month = now.month
    weeks = weeks_from_calendar(cal)
    return render(request, 'zabo_calendar/main.html',
                  {'year': year, 'month': month, 'weeks':weeks})

def weeks_from_calendar(cal):
    # [(week, day), (week, day)...] 를 반환한다
    # mon:0 ~ sun:6
    # 달의 시작이 월요일이 아닌 경우 1일 전까지의 day 값은 빈 string이다.
    weeks = list()
    for week in cal[2:]:
        week = [week[i:i+3].strip() for i in range(0, len(week), 3)]
        weeks.append([(i, week[i]) for i in range(0, len(week))])
    return weeks