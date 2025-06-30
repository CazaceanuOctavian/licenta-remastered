import re
import os
import csv
import requests
import datetime
import configparser
import time
import json

from bs4 import NavigableString
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def create_driver():
    options = Options()
    #options.add_argument('--headless')
    options.add_argument('--incognito')
    options.add_argument("start-maximized")
    options.add_argument("disable-infobars")
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-application-cache')
    options.add_argument('--disable-gpu')
    options.add_argument("--disable-dev-shm-usage")
    options.set_preference("browser.privatebrowsing.autostart", True)

    options.binary_location = '/nix/store/7psrwkv3nsiflpfx07hf49795abn71y9-firefox-136.0/bin/firefox'
    options.page_load_strategy = 'eager'
    driver = webdriver.Firefox(options=options)
    return driver
    # install_addons()
# driver.execute_script("window.setTimeout(() => window.close(), 1000);")

#install_addons()

currentDate = datetime.datetime.now().strftime('%Y_%m_%d')

config = configparser.ConfigParser()
config.read('/home/tav/Desktop/licenta/cfg.ini')

latest_path = None

def no_nav_strings(iterable):
    return list(filter(lambda x: type(x) != NavigableString, iterable))

def format_data(item,driver):
    try:
        time.sleep(1.5)
        # driver.execute_script("Services.clearData.deleteData(Services.clearData.CLEAR_ALL);")

        #time.sleep(5)
        # all_objects = muppy.get_objects()
        # my_sum = summary.summarize(all_objects)
        # summary.print_(my_sum)

        name = item.find_next(class_='npi_name').text.strip()
        itemUrl = 'https://www.evomag.ro' + item.find_next(class_='npi_name').h2.a['href']
        isInStoc = item.find_next(class_=re.compile('stock_', re.IGNORECASE)).text.strip()
        if isInStoc[:2] == 'In':
            isInStoc = 1
        else:
            isInStoc = 0
        #price = float(item.find_next(class_='real_price').text.strip().replace(',','.').split(' ')[0])
        #price = float(item.find_next(class_='real_price').text.split(' ')[0].replace('.','').replace(',','.'))
        price = item.find_next(class_='real_price').text.split(' ')[0].replace('.','')
        price = float(price[:-2] + '.' + price[-2:]) 

        try:
            #evomag are hidden un 'fa cadou' in care mai e o imagine care este scraped din greseala
            #imaginea e ascunsa in item, asa ca item.find_next o ia pe ea in loc de imaginea cautata
            #Solutie --> move forward to the next sibling si apoi apeleaza find_next()
            imageUrl = item.next_sibling.find_next(loading = 'lazy') 
            if imageUrl['alt']=='Offer':
                imageUrl = imageUrl.find_next(loading = 'lazy')['src']
            else :
                imageUrl =imageUrl['src']
        except Exception as e:
            imageUrl = 'err'

        driver.delete_all_cookies()
        driver.get(itemUrl)

        # Wait for an element with a specific ID to appear (e.g., 'myElement')
        element = WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.CLASS_NAME, "product_codes"))
        )

        page_source = driver.page_source
        other_soup = BeautifulSoup(page_source, 'html.parser')

        #Page may or may not have many more em elements
        #Solution --> go to a page element and get all the above needed em's
        em_elems = other_soup.find(class_='product_info_area').find_all_previous('em')
        manufacturer = em_elems[1].text.strip()

        # product_code = other_soup.find(class_='product_codes').span.text.strip()
        # match = re.search(r'\[ (.*?) \]', product_code)
        # if match:
        #     product_code = match.group(1)
        #rating_div = other_soup.find(class_='product_rating')

        number_of_reviews = int(other_soup.select('.product_rating a')[0].text.split(' ')[0])

        rating = len(other_soup.find_all(class_='fa-star'))

        product_code = other_soup.find(class_='code-value').text.strip()
        
        product_code = product_code.replace('/','+rep+')

        #driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        table_rows = other_soup.find(class_='produs_body_tech').find_all_next('td')
        specification_dict = {}
        
        i=0
        while (i < len(table_rows)):
            if not table_rows[i].has_attr('class'):
                key = table_rows[i].text
                value = table_rows[i+1].text
                specification_dict[key] = value
                i+=2
            else:
                i+=1
            

        #=====scraping image=====
        if imageUrl != 'err':
            try:
                img_data = requests.get(imageUrl).content
                img_name = product_code + '.jpeg'
                #
                filepath = os.path.join(config['Paths']['image_output'], img_name) 
                # filepath = os.path.join('image_test', img_name) 

                with open(filepath, 'wb') as file:
                    file.write(img_data)
            except Exception as e:
                with open(config['Paths']['evomag_output'] + 'errLog-' + str(currentDate) + '.txt', 'a') as logs:
                    logs.write('ERR FOR IMAGE SCRAPING: ' + name)
                    logs.write('ERR: ' + str({e}) + '\n')
                img_name = 'not_found.jpeg'
            #=====scraping image=====

        print('evomag -- ' + name)

        return {
            'timestamp': datetime.datetime.now().strftime('%Y_%m_%d_%H_%M'),
            'name' : name,
            'price' : price,
            'rating' : rating,
            'number_of_reviews': number_of_reviews,
            'is_in_stoc' : isInStoc,
            'url' : itemUrl,
            'product_code' : product_code,
            'online_mag' : 'evomag',
            'specifications' : specification_dict,
            'manufacturer': manufacturer
            }
    
    except Exception as e:
        print(str({e}))
        print('EXCEPTION EVOMAG====='+str(name)+str(isInStoc)+'=====EXCEPTION EVOMAG')
        with open(config['Paths']['evomag_output'] + 'errLog-' + str(currentDate) + '.txt', 'a') as logs:
            logs.write('ERR IN FORMAT_DATA FOR PRODUCT: ' + name)
            logs.write('ERR: ' + str({e}) + '\n')
    

def scrape(path: str):
    driver = None
    if driver is None:
        driver = create_driver()
    
    if path.rfind("https") == -1:
        target_url = 'https://www.evomag.ro' + path
        current_page = 1
    else:
        target_url = path.split('https://www.evomag.ro')[-1]
        current_page = int(path.split(":")[-1].split('/')[0])
        target_url = path.split('filtru/pagina:' + str(current_page))[0]

    global latest_path
    latest_path = path 
    
    output_file = config['Paths']['evomag_output'] + 'evomag_' + str(currentDate) + '.json'
    
    # Initialize JSON file if it doesn't exist
    if not os.path.exists(output_file):
        with open(output_file, 'w') as f:
            json.dump([], f)

    driver.get(target_url + 'filtru/pagina:' + str(current_page))
    element = WebDriverWait(driver, 2)

    pagina_existenta = True
    while pagina_existenta:
        try:
            time.sleep(3)
            WebDriverWait(driver, 3).until( EC.presence_of_all_elements_located)

            current_page += 1
            
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            li_items = soup.find_all(class_="nice_product_item")
            if not li_items:
                break
                
            category = soup.find(class_='breadcrumbs').text.strip().split('»')[-1].strip()
            
            # Process items in batches
            batch_size = 10
            for i in range(0, len(li_items), batch_size):
                batch_items = li_items[i:i + batch_size]
                batch_data = []
                
                for element in batch_items:
                    try:
                        element = no_nav_strings(element.descendants)
                        formatted_dict = format_data(element[0], driver)
                        formatted_dict['category'] = category
                        batch_data.append(formatted_dict)
                        
                    except Exception as e:
                        print(f"Error: {str(e)}")
                        with open(config['Paths']['evomag_output'] + 'errLog-' + str(currentDate) + '.txt', 'a') as logs:
                            logs.write(f'ON PATH: {path}\nPAGE: {current_page}\n')
                        continue
                
                # Append batch to JSON file
                if batch_data:
                    # Read existing data
                    try:
                        with open(output_file, 'r') as f:
                            try:
                                existing_data = json.load(f)
                            except json.JSONDecodeError:
                                existing_data = []
                    except FileNotFoundError:
                        existing_data = []
                    
                    # Append new data and write back
                    existing_data.extend(batch_data)
                    with open(output_file, 'w') as f:
                        json.dump(existing_data, f, indent=2)
                
                # Clear batch data from memory
                batch_data.clear()
            
            # Check for next page
            next_page_button = soup.find(attrs={'class': 'next hidden'})
            if next_page_button is not None:
                break

            next_page_button = soup.find(attrs={'class': 'next'})
            if next_page_button is None:
                break
                    
            new_path = target_url + 'filtru/pagina:' + str(current_page)
            latest_path = new_path

            # Clean up and create new driver
            driver.delete_all_cookies()
            driver.quit()
            driver = create_driver()
            driver.get(new_path)
            
        except Exception as e:
            print(f"Page processing error: {str(e)}")
            break
            
    driver.quit()


def main():
    try:
        origin = os.path.join(config['Paths']['evomag_output'], 'dying_gasp_' + str(currentDate) + '.txt')
        pathCount = 0
        global latest_path

        if (os.path.exists(origin)):
            print('DYING GASP DETECTED -- DEFAULTING TO ' + str(origin) + ' -- SCRAPING FROM LAST KNOW PATH')
        else:
            print('NO DYING GASP -- DEFAULTING TO evomag_tree.txt')
            origin = config['Paths']['evomag_output'] + 'evomag_tree.txt' 

        with open(origin, 'r') as origin_file:
            for path in origin_file:
                pathCount+=1
                path = path.strip()
                
                if path is None:
                    continue
                try:
                   scrape(path=path)
                   
                except Exception as e:
                    print(str({e}))
                    with open(config['Paths']['evomag_output'] + 'errLog-' + str(currentDate) + '.txt', 'a') as logs:
                        logs.write('ERR MAIN: ' + str({e}))
                    continue
    finally:
        #write the remaining categories in dying_gasp from current line to EOF
        print('PANIC!')
        with open(config['Paths']['evomag_output'] + 'dying_gasp_' + str(currentDate) + '_tmp.txt', 'w') as gasp:
            gasp.write(latest_path + '\n')

            with open(origin, 'r') as origin_file:
                for _ in range(pathCount):
                    origin_file.readline()

                line = origin_file.readline()
                gasp.write(line)
                while(line):
                    line = origin_file.readline()
                    gasp.write(line)
        os.rename(config['Paths']['evomag_output'] + 'dying_gasp_' + str(currentDate) + '_tmp.txt', config['Paths']['evomag_output'] + 'dying_gasp_' + str(currentDate) + '.txt')
        

# scrape('https://www.evomag.ro/telefoane-tablete-accesorii-accesorii-telefoane/filtru/pagina:1')
main()
