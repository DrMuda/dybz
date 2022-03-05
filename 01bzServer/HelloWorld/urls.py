"""HelloWorld URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/dev/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from . import api

urlpatterns = [
    path('getNovelHtml/<str:chanel>/<str:id1>/<str:id2>/<str:id3>', api.getNovelHtml),
    path('getImg/<str:chanel>/<str:id1>/<str:id2>/<str:id3>', api.getImg),
    path("getChapter/<str:chanel>/<str:id1>/<str:id2>/", api.getChapter)
]
