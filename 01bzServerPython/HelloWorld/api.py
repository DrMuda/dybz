'''
Author: LXX
Date: 2022-02-24 16:24:48
LastEditTime: 2022-04-18 17:34:11
LastEditors: LXX
Description: 
FilePath: \dybz\01bzServerPython\HelloWorld\api.py
'''
from django.http import HttpResponse
import cfscrape
import json

scraper = cfscrape.create_scraper()

def proxyRequest(request):
    print("proxyRequest")
    data = {}
    if request.body:
        data = json.loads(request.body.decode())
    print(data)
    content = ""
    targetMethod = "get"
    if data["method"]:
        targetMethod = data["method"]
    targetUrl = data["url"]
    params = None
    try:
        params = data["params"]
    except KeyError:
        None

    if targetMethod == "get":
        print(targetMethod)
        content = scraper.get(targetUrl, data=params).content

    if targetMethod == "post":
        print(targetMethod)
        content = scraper.post(targetUrl, data=params).content

    scraper.close()
    return HttpResponse(content)
