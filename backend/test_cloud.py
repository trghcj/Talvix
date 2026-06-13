import cloudinary
import cloudinary.uploader
import urllib.request
import os

cloudinary.config(
    cloud_name="dglohgr89",
    api_key="565754366748113",
    api_secret="b5-yOZr6qmcw7MbAARCLExGUIDQ"
)

# test upload pdf
with open("test.pdf", "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n291\n%%EOF\n")

print("Uploading as auto...")
try:
    res1 = cloudinary.uploader.upload("test.pdf", resource_type="auto")
    print("Auto URL:", res1.get('secure_url'))
    req = urllib.request.Request(res1.get('secure_url'), headers={'User-Agent': 'Mozilla'})
    print("Status:", urllib.request.urlopen(req).getcode())
except Exception as e:
    print("Auto error:", e)

print("Uploading as image...")
try:
    res2 = cloudinary.uploader.upload("test.pdf", resource_type="image")
    print("Image URL:", res2.get('secure_url'))
    req = urllib.request.Request(res2.get('secure_url'), headers={'User-Agent': 'Mozilla'})
    print("Status:", urllib.request.urlopen(req).getcode())
except Exception as e:
    print("Image error:", e)

print("Uploading as raw...")
try:
    res3 = cloudinary.uploader.upload("test.pdf", resource_type="raw")
    print("Raw URL:", res3.get('secure_url'))
    req = urllib.request.Request(res3.get('secure_url'), headers={'User-Agent': 'Mozilla'})
    print("Status:", urllib.request.urlopen(req).getcode())
except Exception as e:
    print("Raw error:", e)
