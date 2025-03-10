from pymongo import MongoClient
from configparser import ConfigParser
import json
import datetime

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

def main():
    cfg = ConfigParser()
    cfg.read('/home/tav/licenta_remastered/cfg.ini')

    client = MongoClient('mongodb://localhost:27017/')
    db = client['products_db']
    collection = db['products']

    currentDate = datetime.datetime.now().strftime('%Y_%m_%d')

    paths = [f"{cfg['Paths']['vexio_output']}/vexio_{currentDate}.json", 
             f"{cfg['Paths']['evomag_output']}/evomag_{currentDate}.json"]
    
    scraped_products = read_scraper_outputs(paths)
    print(scraped_products)

    collection.insert_many(scraped_products)

if __name__ == "__main__":
    main()

