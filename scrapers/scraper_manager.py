from pymongo import MongoClient, UpdateOne
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
    
    for script in script_paths:
        process = subprocess.Popen(['python3', script], stdout=None, stderr=subprocess.DEVNULL)
        processes.append(process)
        signals.append(process.pid)
    
    try:
        time.sleep(int(cfg['Scrapers']['timeout']))
        
        for process in processes:
            if process.poll() is None:
                process.send_signal(signal.SIGINT)
        
        print('---- Scraping Ended ----')
    except Exception as e:
        print(e)

def update_products_with_price_history(collection, scraped_products):
    # Prepare bulk operations
    operations = []
    current_timestamp = datetime.datetime.now()
    
    for product in scraped_products:
        # Create a unique identifier for the product
        # Using product_code and online_mag to uniquely identify products
        product_identifier = {
            "product_code": product["product_code"],
            "online_mag": product["online_mag"]
        }
        
        # Create a price history entry
        price_history_entry = {
            "price": product["price"],
            "timestamp": product.get("timestamp", current_timestamp.strftime('%Y_%m_%d_%H_%M'))
        }
        
        # Create an update operation
        update_operation = UpdateOne(
            # Filter criteria to find the document
            product_identifier,
            # Update operations
            {
                # Set all fields from the new product data
                "$set": product,
                # Add the current price to the price_history array
                "$push": {
                    "price_history": price_history_entry
                }
            },
            # If the product doesn't exist, insert it with an initial price_history
            upsert=True
        )
        
        operations.append(update_operation)
    
    # Execute all operations at once
    if operations:
        result = collection.bulk_write(operations)
        print(f"Modified: {result.modified_count}, Upserted: {result.upserted_count}")
    else:
        print("No operations to perform.")

def main():
    cfg = ConfigParser()
    cfg.read('/home/tav/licenta_remastered/cfg.ini')
    
    client = MongoClient('mongodb://localhost:27017/')
    db = client['app']
    collection = db['products']
    
    currentDate = datetime.datetime.now().strftime('%Y_%m_%d')
    
    script_paths = [cfg['Paths']['vexio_scraper'],
                  cfg['Paths']['evomag_scraper']]
    
    scrape_for_interval(script_paths, cfg)
    
    output_paths = [f"{cfg['Paths']['vexio_output']}/vexio_{currentDate}.json",
                  f"{cfg['Paths']['evomag_output']}/evomag_{currentDate}.json"]
    
    scraped_products = read_scraper_outputs(output_paths)
    
    # Instead of insert_many, use our new function
    update_products_with_price_history(collection, scraped_products)

if __name__ == "__main__":
    main()