from django.conf.urls import patterns, include, url
from dejavo.apps.zabo_calendar import views

urlpatterns = patterns('',
    url(r'^$', views.main),
    url(r'^at/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$', views.get_month_data),
)