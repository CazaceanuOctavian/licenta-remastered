from scraper_manager.scraper_manager import ScraperManager
from database_manager.database_manager import MongoManager
from utils.os_utils import OsUtils

from configparser import ConfigParser
from datetime import datetime

def main():
    global_cfg = ConfigParser()
    global_cfg.read('cfg.ini')
    env_cfg = ConfigParser()
    env_cfg.read('cfg-secret.ini')

    current_date = datetime.now().strftime('%Y_%m_%d')

    scraper_manager = ScraperManager([global_cfg['Paths']['vexio_scraper'], global_cfg['Paths']['evomag_scraper']])
    database_manager = MongoManager(env_cfg['Mongo']['connection_string'])
    scraper_manager.scrape_for_interval(int(global_cfg['Scrapers']['timeout']))

    vexio_output = f"{global_cfg['Paths']['vexio_output']}/vexio_{current_date}.json"
    evomag_output = f"{global_cfg['Paths']['evomag_output']}/evomag_{current_date}.json"

    scraped_products = OsUtils.readFromJsonFile([vexio_output, evomag_output])
    database_manager.upsert_to_collection_from_list('app', 'products', scraped_products)



if __name__ == '__main__':
    main()