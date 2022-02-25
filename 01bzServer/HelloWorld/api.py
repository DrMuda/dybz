'''
Author: LXX
Date: 2022-02-24 16:24:48
LastEditTime: 2022-02-25 17:22:41
LastEditors: LXX
Description: 
FilePath: \dybz\01bzServer\HelloWorld\api.py
'''
from django.http import HttpResponse

import cfscrape
scraper = cfscrape.create_scraper()
baseUrl = "http://www.diyibanzhu111.xyz/"

def getHtml(request,id1,id2, id3):
    url = baseUrl + str(id1) +"/"+ str(id2) +"/"+ str(id3) + ".html"
    print("get html:",url)
    content = scraper.get(url).content
    return HttpResponse(content)

def getImg(request,id1,id2, id3):
    url = baseUrl + id1 +"/"+ id2 +"/"+ id3
    print("get img:",url)
    content = scraper.get(url).content
    return HttpResponse(content)
