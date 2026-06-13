import cloudinary
import cloudinary.uploader
import cloudinary.utils
import urllib.request
import os

cloudinary.config(
    cloud_name="dglohgr89",
    api_key="565754366748113",
    api_secret="b5-yOZr6qmcw7MbAARCLExGUIDQ"
)

url, options = cloudinary.utils.cloudinary_url("qbniqlftbgymizgieoqz.pdf", sign_url=True, resource_type="raw")
print("Signed URL:", url)

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla'})
    print("Status:", urllib.request.urlopen(req).getcode())
except Exception as e:
    print("Error:", e)
