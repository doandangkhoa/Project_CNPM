import requests
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time

print("=" * 60)
print("FRONTEND CRUD TEST")
print("=" * 60)

# Start Chrome
try:
    driver = webdriver.Chrome()
    
    # 1. Load page
    print("\n1. Loading page...")
    driver.get('http://localhost:3001')
    time.sleep(3)
    print("   Status: Loaded")
    
    # 2. Check if list is visible
    print("\n2. Checking population list...")
    try:
        table = driver.find_element(By.CLASS_NAME, 'populations-table')
        print("   Status: Table found")
    except:
        print("   Status: Table NOT found")
    
    # 3. Try to open Add form
    print("\n3. Testing Add new button...")
    try:
        add_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Thêm Nhân Khẩu')]")
        add_btn.click()
        time.sleep(1)
        print("   Status: Form opened")
    except Exception as e:
        print(f"   Status: Error - {e}")
    
    # 4. Fill form
    print("\n4. Filling form...")
    try:
        name_input = driver.find_element(By.NAME, 'ho_ten')
        name_input.clear()
        name_input.send_keys('Test Selenium')
        
        date_input = driver.find_element(By.NAME, 'ngay_sinh')
        date_input.clear()
        date_input.send_keys('01/01/1990')
        
        print("   Status: Form filled")
    except Exception as e:
        print(f"   Status: Error - {e}")
    
    # 5. Submit
    print("\n5. Submitting form...")
    try:
        save_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Luu')]")
        save_btn.click()
        time.sleep(2)
        print("   Status: Form submitted")
    except Exception as e:
        print(f"   Status: Error - {e}")
    
    driver.quit()
    print("\n" + "=" * 60)
    print("FRONTEND TEST COMPLETE")
    print("=" * 60)

except Exception as e:
    print(f"Error: {e}")
    print("Selenium/Chrome not available - skipping browser test")
