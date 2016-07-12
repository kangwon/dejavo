from django.conf.urls import patterns, include, url
from dejavo.apps.zabo_calendar import views

urlpatterns = patterns('',
    url(r'^$', views.main),
)
