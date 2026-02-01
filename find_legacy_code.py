
import requests

url = "https://gray-trout-987932.hostingersite.com/assets/index-D2smqVKP.js"
response = requests.get(url)
content = response.text

index = content.find("popstate")
if index != -1:
    start = max(0, index - 500)
    end = min(len(content), index + 1000)
    print(f"Found 'popstate' at index {index}")
    print("--- Context ---")
    print(content[start:end])
else:
    print("'popstate' not found")

index2 = content.find("pushState")
if index2 != -1:
    start = max(0, index2 - 500)
    end = min(len(content), index2 + 1000)
    print(f"\nFound 'pushState' at index {index2}")
    print("--- Context ---")
    print(content[start:end])
