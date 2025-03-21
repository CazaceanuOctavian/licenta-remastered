import re

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from bs4 import BeautifulSoup

options = Options()
options.add_argument('--headless')
options.add_argument("--incognito")
options.add_argument("--nogpu")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1280,1280")
options.add_argument("--no-sandbox")
options.add_argument("--enable-javascript")
options.add_argument('--disable-blink-features=AutomationControlled')

options.binary_location = '/nix/store/7psrwkv3nsiflpfx07hf49795abn71y9-firefox-136.0/bin/firefox'

driver = webdriver.Firefox(options=options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
start_url = "https://www.vexio.ro/"
driver.get(start_url)

page_source = driver.page_source
soup = BeautifulSoup(page_source, 'html.parser')
html_content = soup.prettify()
with open('htmldump.txt', 'w') as file:
    file.write(html_content)

li_items = soup.find_all('strong')
raw_hrefs = []
for elemet in li_items:
    raw_hrefs.append(elemet.find_previous('a'))

print(raw_hrefs)
string_hrefs = []

for href in raw_hrefs:
    string_hrefs.append(href['href'])

print(string_hrefs)

with open('vexio_tree_new.txt', 'w') as treefile:
    for href in string_hrefs:
        treefile.write(href + '\n')

driver.quit()