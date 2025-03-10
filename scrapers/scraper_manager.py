from pymongo import MongoClient
from configparser import ConfigParser
import json
import datetime
import subprocess
import signal
import time

def read_scraper_outputs(output_paths:list[str]):
    products_list = []
    for path in output_paths:
        try:
            with open(path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if isinstance(data, list):
                    products_list.extend(data)
                elif isinstance(data, dict):
                    products_list.append(data)
                
            print(f"Processed: {path}")
        except json.JSONDecodeError:
            print(f"Error: Could not parse JSON in {path}")
        except Exception as e:
            print(f"Error processing {path}: {str(e)}")
    return products_list

def scrape_for_interval(script_paths:list[str], cfg:ConfigParser):
    processes = []
    signals = []
    start_time = time.time()
    elapsed_time = 0

    for script in script_paths:
        process = subprocess.Popen(['python3', script], stdout=None, stderr=subprocess.DEVNULL)
        processes.append(process)
        signals.append(process.pid)

    try:
        while elapsed_time < cfg['Scrapers']['timeout']:
            current_time = time.time()
            elapsed_time = current_time - start_time

        for process in processes:
            if process.poll() is None:  
                process.send_signal(signal.SIGINT)

        print('---- Scraping Ended ----')
    except Exception as e:
        print(e)

def main():
    cfg = ConfigParser()
    cfg.read('/home/tav/licenta_remastered/cfg.ini')

    client = MongoClient('mongodb://localhost:27017/')
    db = client['products_db']
    collection = db['products']

    currentDate = datetime.datetime.now().strftime('%Y_%m_%d')

    script_paths = [cfg['Paths']['vexio_scraper'], cfg['Paths']['evomag_scraper']]

    scrape_for_interval(script_paths)

    output_paths = [f"{cfg['Paths']['vexio_output']}/vexio_{currentDate}.json", 
                f"{cfg['Paths']['evomag_output']}/evomag_{currentDate}.json"]

    read_scraper_outputs(output_paths)

    collection.insert_many(output_paths)

if __name__ == "__main__":
    main()

