'''
Author: LXX
Date: 2022-02-24 16:24:48
LastEditTime: 2022-03-11 18:02:22
LastEditors: LXX
Description: 
FilePath: \dybz\01bzServer\HelloWorld\api.py
'''
from django.http import HttpResponse
import json
import os
import cfscrape

scraper = cfscrape.create_scraper()
def getNovelHtml(request, chanel, id1, id2, id3):
    url = "http://"+chanel+"/" + id1 + "/" + id2 + "/" + id3 + ".html"
    print("get html:", url)
    content = scraper.get(url).content
    return HttpResponse(content)


def getImg(request, chanel, id1, id2, id3):
    url = "http://"+chanel + "/" + id1 + "/" + id2 + "/" + id3
    print("get img:", url)
    content = scraper.get(url).content
    return HttpResponse(content)


def getChapter(request, chanel, id1, id2):
    url = "http://"+chanel + "/" + id1 + "/" + id2 + "/"
    print("get chapter:", url)
    content = scraper.get(url).content
    return HttpResponse(content)

def pushCache(request):
    data = json.loads(request.body).data
    os.mknod("../data/01bzCache.txt")
    fp = open("../data/01bzCache.txt",w)
    fp.write(data)
    
