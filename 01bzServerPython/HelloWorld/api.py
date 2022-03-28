'''
Author: LXX
Date: 2022-02-24 16:24:48
LastEditTime: 2022-03-28 11:28:18
LastEditors: LXX
Description: 
FilePath: \dybz\01bzServerPython\HelloWorld\api.py
'''
from django.http import HttpResponse
import cfscrape

scraper = cfscrape.create_scraper()
def getNovelHtml(request, chanel, id1, id2, id3):
    url = "http://"+chanel+"/" + id1 + "/" + id2 + "/" + id3 + ".html"
    print("get html:", url)
    content = scraper.get(url).content
    scraper.close()
    return HttpResponse(content)


def getImg(request, chanel, id1, id2, id3):
    url = "http://"+chanel + "/" + id1 + "/" + id2 + "/" + id3
    print("get img:", url)
    content = scraper.get(url).content
    scraper.close()
    return HttpResponse(content)


def getChapter(request, chanel, id1, id2):
    url = "http://"+chanel + "/" + id1 + "/" + id2 + "/"
    print("get chapter:", url)
    content = scraper.get(url).content
    scraper.close()
    return HttpResponse(content)

def getChanelList(request):
    print("getChanelList")
    content = scraper.get("https://accacc.xyz/").content
    scraper.close()
    return HttpResponse(content)
