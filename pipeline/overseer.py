from scraper_manager.scraper_manager import ScraperManager
from database_manager.database_manager import MongoManager
from email_manager.mail_manager import MailManager
from utils.os_utils import OsUtils

from configparser import ConfigParser
from datetime import datetime

def scrape(scraper_manager, global_cfg, current_date):
    scraper_manager.scrape_for_interval(int(global_cfg['Scrapers']['timeout']))
    vexio_output = f"{global_cfg['Paths']['vexio_output']}/vexio_{current_date}.json"
    evomag_output = f"{global_cfg['Paths']['evomag_output']}/evomag_{current_date}.json"

    return OsUtils.readFromJsonFile([vexio_output, evomag_output])

def upsert(database_manager, db_name, collection_name, scraped_products):
    database_manager.upsert_to_collection_from_list(db_name, collection_name, scraped_products)

def check_products(user_product_list, database_manager, database, collection):
    body = ''
    for product in user_product_list:
        if(product['email_notification'] == True):
            matching_product_list = database_manager.fetch_collection_filtered(database, collection, {'product_code' : product['product_code']})
            for matching_product in matching_product_list:
                # Check if price_history exists and has at least two entries
                if ('price_history' in matching_product and 
                    len(matching_product['price_history']) >= 2 and
                    'price' in matching_product['price_history'][-1] and
                    'price' in matching_product['price_history'][-2]):
                    
                    if(matching_product['price_history'][-1]['price'] < matching_product['price_history'][-2]['price']):
                        body += f'Noi ofete la produsul ${matching_product["product_code"]} de la magazinul {matching_product["online_mag"]}!'
                        body += f'Produsul a ajuns de la pretul de {matching_product["price_history"][-2]["price"]} la pretul de {matching_product["price_history"][-1]["price"]}!'
                        body += '\n'
    return body


def notify_users_by_mail(mail_manager, database_manager, userList, database, collection):
    for user in userList:
        mail_body = check_products(user['savedProducts'], database_manager, database, collection)
        if len(mail_body)>0:
            mail_manager.send_email_to_address('Update pentru produsele tale favorite', mail_body, user['email'])

def main():
    global_cfg = ConfigParser()
    global_cfg.read('cfg.ini')
    env_cfg = ConfigParser()
    env_cfg.read('cfg-secret.ini')

    current_date = datetime.now().strftime('%Y_%m_%d')

    scraper_manager = ScraperManager([global_cfg['Paths']['vexio_scraper'],
                                       global_cfg['Paths']['evomag_scraper']])
    
    database_manager = MongoManager(env_cfg['Mongo']['connection_string'])

    mail_manager = MailManager(env_cfg['Email']['address'],
                                env_cfg['Email']['password'], 'smtp.gmail.com', 587) 

    database_manager.upsert_to_collection_from_list('app',
                                                    'products',
                                                    scrape(scraper_manager, global_cfg, current_date))

    notify_users_by_mail(mail_manager, 
                        database_manager, 
                        database_manager.fetch_collection('app', 'users'),
                        'app',
                        'products')

if __name__ == '__main__':
    main()