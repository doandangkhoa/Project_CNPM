import requests
import json

API_URL = 'http://localhost:8000/api'
session = requests.Session()

print("=" * 60)
print("API ENDPOINT TESTS")
print("=" * 60)

# 1. Login test
print("\n1. Testing Login...")
login_data = {'username': 'canbo_test', 'password': 'password123'}
resp = session.post(f'{API_URL}/login/', data=login_data)
print(f"   Status: {resp.status_code}")

# 2. List populations
print("\n2. Testing GET /nhan-khau/...")
resp = session.get(f'{API_URL}/nhan-khau/')
print(f"   Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"   Count: {len(data.get('results', []))}")

# 3. Get CSRF token
print("\n3. Checking CSRF token...")
csrf = session.cookies.get('csrftoken')
print(f"   CSRF Token found: {bool(csrf)}")

# 4. Create population
print("\n4. Testing POST /nhan-khau/them-moi/...")
headers = {'X-CSRFToken': csrf or ''}
data = {
    'ho_ten': 'Test User',
    'gioi_tinh': 'Nam',
    'ngay_sinh': '1990-01-01',
    'noi_sinh': 'HN',
    'nguyen_quan': 'HN',
    'dan_toc': 'Kinh',
    'quan_he_voi_chu_ho': 'Con trai'
}
resp = session.post(f'{API_URL}/nhan-khau/them-moi/', json=data, headers=headers)
print(f"   Status: {resp.status_code}")
if resp.status_code != 201:
    print(f"   Error: {resp.text[:200]}")

# 5. Delete population
print("\n5. Testing POST /nhan-khau/{id}/xoa/...")
if resp.status_code == 201:
    nhan_khau_id = resp.json().get('data', {}).get('id')
    if nhan_khau_id:
        resp2 = session.post(f'{API_URL}/nhan-khau/{nhan_khau_id}/xoa/', json={'ly_do': 'Test'}, headers=headers)
        print(f"   Status: {resp2.status_code}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
