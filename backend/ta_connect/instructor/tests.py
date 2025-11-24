import requests

url = "http://localhost:8000/api/instructor/upload-csv/7/"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzOTc3MDA2LCJpYXQiOjE3NjM5NzM0MDYsImp0aSI6ImYyYjJiYTQ5ODgxZTRlMWZiYWQ3MTJlYzdkOTY5NzUxIiwidXNlcl9pZCI6IjMifQ.HtoCVCq76Rc7c0sb7RdTLA-ByLFD-lN4zBFAwINJGvk"
}

with open('backend/ta_connect/instructor/test_csv_file.csv', 'rb') as f:
    files = {'file': f}
    response = requests.post(url, headers=headers, files=files)

print(response.status_code)
print(response.json())