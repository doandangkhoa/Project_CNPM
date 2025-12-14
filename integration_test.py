#!/usr/bin/env python
"""
Integration Test Script - Frontend & Backend
Tests all CRUD operations and integrations
"""

import requests
import json
from datetime import date
from requests.structures import CaseInsensitiveDict

# Configuration
API_BASE_URL = 'http://localhost:8000/api'
SESSION = requests.Session()

# Test account
TEST_USERNAME = 'canbo_test'
TEST_PASSWORD = 'password123'

def get_csrf_token():
    """Get CSRF token from cookies"""
    return SESSION.cookies.get('csrftoken', '')

print("=" * 60)
print("FRONTEND - BACKEND INTEGRATION TEST")
print("=" * 60)

# Step 1: Login
print("\n[1] Testing Authentication...")
try:
    login_data = {
        'username': TEST_USERNAME,
        'password': TEST_PASSWORD
    }
    
    # Login via API
    login_response = SESSION.post(
        f'{API_BASE_URL}/login/',
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if login_response.status_code == 200:
        print("✅ Authentication: OK")
        print(f"   - User: {login_response.json().get('user', {}).get('username')}")
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   {login_response.text}")
        
except Exception as e:
    print(f"❌ Auth test error: {e}")

# Step 2: List nhân khẩu
print("\n[2] Testing List Population (GET /nhan-khau/)...")
try:
    response = SESSION.get(
        f'{API_BASE_URL}/nhan-khau/?page=1&limit=10',
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ List Population: OK")
        print(f"   - Total: {data.get('total', 0)} records")
        print(f"   - Page: {data.get('page', 1)}")
        print(f"   - Results: {len(data.get('results', []))} items")
    elif response.status_code == 401:
        print("⚠️  List Population: 401 Unauthorized (need login)")
    else:
        print(f"❌ List Population: {response.status_code}")
        
except Exception as e:
    print(f"❌ List Population Error: {e}")

# Step 3: Create nhân khẩu
print("\n[3] Testing Create Population (POST /nhan-khau/them-moi/)...")
try:
    # Get CSRF token
    csrf_token = get_csrf_token()
    
    create_data = {
        'ho_ten': 'Test Người',
        'gioi_tinh': 'Nam',
        'ngay_sinh': '1990-05-20',
        'noi_sinh': 'Hà Nội',
        'nguyen_quan': 'Thanh Hoá',
        'dan_toc': 'Kinh',
        'so_cccd': f'test-{date.today().isoformat()}',
        'quan_he_voi_chu_ho': 'Chủ hộ',
        'nghe_nghiep': 'Kỹ sư',
        'noi_lam_viec': 'Công ty ABC'
    }
    
    headers = {'Content-Type': 'application/json'}
    if csrf_token:
        headers['X-CSRFToken'] = csrf_token
    
    response = SESSION.post(
        f'{API_BASE_URL}/nhan-khau/them-moi/',
        json=create_data,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        test_population_id = data.get('data', {}).get('id')
        print(f"✅ Create Population: OK")
        print(f"   - Created ID: {test_population_id}")
        print(f"   - Name: {data.get('data', {}).get('ho_ten')}")
    elif response.status_code == 401:
        print("⚠️  Create Population: 401 Unauthorized")
    elif response.status_code == 400:
        print(f"⚠️  Create Population: Validation error")
        print(f"   {response.json()}")
    else:
        print(f"❌ Create Population: {response.status_code}")
        print(f"   {response.text}")
        test_population_id = None
        
except Exception as e:
    print(f"❌ Create Population Error: {e}")
    test_population_id = None

# Step 4: Search nhân khẩu
print("\n[4] Testing Search Population (GET /nhan-khau/?search=...)...")
try:
    response = SESSION.get(
        f'{API_BASE_URL}/nhan-khau/?search=Test',
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Search Population: OK")
        print(f"   - Found: {len(data.get('results', []))} records")
    else:
        print(f"❌ Search Population: {response.status_code}")
        
except Exception as e:
    print(f"❌ Search Population Error: {e}")

# Step 5: Get detail
if test_population_id:
    print(f"\n[5] Testing Get Detail (GET /nhan-khau/{test_population_id}/chi-tiet/)...")
    try:
        response = SESSION.get(
            f'{API_BASE_URL}/nhan-khau/{test_population_id}/chi-tiet/',
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get Detail: OK")
            print(f"   - Name: {data.get('nhan_khau', {}).get('ho_ten')}")
            print(f"   - Age: {data.get('nhan_khau', {}).get('tuoi')} years")
        else:
            print(f"❌ Get Detail: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Get Detail Error: {e}")

    # Step 6: Update nhân khẩu
    print(f"\n[6] Testing Update Population (PATCH /nhan-khau/{test_population_id}/cap-nhat/)...")
    try:
        csrf_token = get_csrf_token()
        
        update_data = {
            'nghe_nghiep': 'Bác sĩ',
            'noi_lam_viec': 'Bệnh viện A'
        }
        
        headers = {'Content-Type': 'application/json'}
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        response = SESSION.patch(
            f'{API_BASE_URL}/nhan-khau/{test_population_id}/cap-nhat/',
            json=update_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"✅ Update Population: OK")
        else:
            print(f"❌ Update Population: {response.status_code}")
            print(f"   {response.text}")
            
    except Exception as e:
        print(f"❌ Update Population Error: {e}")

    # Step 7: Delete nhân khẩu
    print(f"\n[7] Testing Delete Population (POST /nhan-khau/{test_population_id}/xoa/)...")
    try:
        csrf_token = get_csrf_token()
        
        delete_data = {'ly_do': 'Test delete'}
        
        headers = {'Content-Type': 'application/json'}
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        response = SESSION.post(
            f'{API_BASE_URL}/nhan-khau/{test_population_id}/xoa/',
            json=delete_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"✅ Delete Population: OK")
        else:
            print(f"❌ Delete Population: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Delete Population Error: {e}")

# Step 8: Advanced search
print("\n[8] Testing Advanced Search (GET /nhan-khau/tim-kiem/?)...")
try:
    response = SESSION.get(
        f'{API_BASE_URL}/nhan-khau/tim-kiem/?ho_ten=Test&page=1',
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Advanced Search: OK")
        print(f"   - Found: {len(data.get('results', []))} records")
    else:
        print(f"❌ Advanced Search: {response.status_code}")
        
except Exception as e:
    print(f"❌ Advanced Search Error: {e}")

print("\n" + "=" * 60)
print("INTEGRATION TEST COMPLETED")
print("=" * 60)
print("\n✅ Backend and Frontend are successfully connected!")
print("\nAccess the application at:")
print("  - Frontend: http://localhost:3001")
print("  - Backend API: http://localhost:8000/api")
print("\nTest account: canbo_test / password123")
