from scraper_manager.scraper_manager import ScraperManager
from database_manager.database_manager import MongoManager
from email_manager.mail_manager import MailManager
from utils.os_utils import OsUtils
from utils.logger import get_logger

from regression_manager.regression_manager import RegressionManager
from regression_manager.dataset_cleanup_manager import DatasetCleanupManager

from configparser import ConfigParser
from datetime import datetime

import os
import json

current_date = datetime.now().strftime('%Y_%m_%d')

# Create logger for the overseer
logger = get_logger(
    name="product_overseer",
    log_level="INFO",
    log_to_console=True,
    log_to_file=True,
    log_file_path="logs/overseer/overseer.log",
    rotate_logs=True,
    max_log_size_mb=10,
    backup_count=7
)

def scrape(scraper_manager, global_cfg, current_date):
    logger.info(f"Starting scraping process with timeout: {global_cfg['Scrapers']['timeout']} seconds")
    try:
        scraper_manager.scrape_for_interval(int(global_cfg['Scrapers']['timeout']))
        
        vexio_output = f"{global_cfg['Paths']['vexio_output']}/vexio_{current_date}.json"
        evomag_output = f"{global_cfg['Paths']['evomag_output']}/evomag_{current_date}.json"
        
        logger.info(f"Scraping completed. Output files: {vexio_output}, {evomag_output}")
        
        scraped_data = OsUtils.readFromJsonFile([vexio_output, evomag_output])
        logger.info(f"Retrieved {len(scraped_data)} products from scrapers")
        
        return scraped_data
    except Exception as e:
        logger.exception(f"Error during scraping process: {str(e)}")
        return []

def upsert(database_manager, db_name, collection_name, scraped_products):
    logger.info(f"Upserting {len(scraped_products)} products to {db_name}.{collection_name}")
    try:
        database_manager.upsert_to_collection_from_list(db_name, collection_name, scraped_products)
        logger.info("Database upsert completed successfully")
    except Exception as e:
        logger.exception(f"Error during database upsert: {str(e)}")

def check_products(user_product_list, database_manager, database, collection):
    logger.info(f"Checking price changes for {len(user_product_list)} user products")
    body = ''
    price_change_count = 0
    
    try:
        for product in user_product_list:
            if product['email_notification'] == True:
                logger.debug(f"Checking product with code: {product['product_code']}")
                matching_product_list = database_manager.fetch_collection_filtered(
                    database, collection, {'product_code': product['product_code']}
                )
                
                for matching_product in matching_product_list:
                    # Check if price_history exists and has at least two entries
                    if ('price_history' in matching_product and 
                        len(matching_product['price_history']) >= 2 and
                        'price' in matching_product['price_history'][-1] and
                        'price' in matching_product['price_history'][-2]):
                        
                        old_price = matching_product['price_history'][-2]['price']
                        new_price = matching_product['price_history'][-1]['price']
                        
                        if new_price < old_price:
                            price_change_count += 1
                            logger.info(
                                f"Price drop detected for product {matching_product['product_code']} "
                                f"from {old_price} to {new_price}"
                            )
                            body += f'Noi ofete la produsul ${matching_product["product_code"]} de la magazinul {matching_product["online_mag"]}!\n'
                            body += f'Produsul a ajuns de la pretul de {old_price} la pretul de {new_price}!\n'
                            body += '\n'
        
        logger.info(f"Found {price_change_count} products with price drops")
        return body
    except Exception as e:
        logger.exception(f"Error while checking product prices: {str(e)}")
        return ""

def notify_users_by_mail(mail_manager, database_manager, userList, database, collection):
    logger.info(f"Starting email notification process for {len(userList)} users")
    notifications_sent = 0
    
    try:
        for user in userList:
            logger.debug(f"Processing notifications for user: {user['email']}")
            mail_body = check_products(user['savedProducts'], database_manager, database, collection)
            
            if len(mail_body) > 0:
                logger.info(f"Sending price drop notification to {user['email']}")
                mail_manager.send_email_to_address(
                    'Update pentru produsele tale favorite', 
                    mail_body, 
                    user['email']
                )
                notifications_sent += 1
        
        logger.info(f"Email notification process completed. Sent {notifications_sent} notifications")
    except Exception as e:
        logger.exception(f"Error during email notification process: {str(e)}")

def predict_target_product_prices(db_manager:MongoManager, reg_manager:RegressionManager, cleanup_manager:DatasetCleanupManager, database:str, collection:str, target_category:str):
    logger.info(f"Using regression model to predict prices of products of type: {target_category}")
    filter_criteria = {
        "predicted_price": {"$exists": False},
        "category": target_category,
        "online_mag": "evomag"
    }

    fetched_products = db_manager.fetch_collection_filtered(database, collection, filter_criteria)

    clean_products = cleanup_manager.clean_dataset(fetched_products)

    predicted_prices, final_products = reg_manager.predict_price(clean_products, fetched_products) 

    logger.info(f"Successfully predicted prices of products of type: {target_category}")


    return final_products   


def main():
    logger.info("=== Starting product overseer process ===")
    start_time = datetime.now()
    
    try:
        # Ensure log directory exists
        os.makedirs("logs", exist_ok=True)
        
        # Load configuration files
        logger.info("Loading configuration files")
        global_cfg = ConfigParser()
        global_cfg.read('cfg.ini')
        
        env_cfg = ConfigParser()
        env_cfg.read('cfg-secret.ini')
        
        logger.info(f"Running process for date: {current_date}")
        
        # Initialize managers
        logger.info("Initializing managers")

        logger.info("Initializing Scraper manager")
        scraper_manager = ScraperManager([
            global_cfg['Paths']['vexio_scraper'],
            global_cfg['Paths']['evomag_scraper']
        ])
        
        logger.info("Initializing MongoDB manager")
        database_manager = MongoManager(env_cfg['Mongo']['connection_string'])
        logger.info("Successfully connected to MongoDB")

        logger.info("Initializing Regression managers")
        regression_manager = RegressionManager(global_cfg['Regression']['model_path'])
        cleanup_manager = DatasetCleanupManager()
        logger.info("Successfully initialized regression managers")
            
        logger.info("Initializing MailManager manager... This might take a while....")
        mail_manager = MailManager(
            env_cfg['Email']['address'],
            env_cfg['Email']['password'], 
            'smtp.gmail.com', 
            587
        )
        logger.info("Email manager initialized")
 
        # Scrape data and update database
        logger.info("Starting scraping and database update process")
        scraped_products = scrape(scraper_manager, global_cfg, current_date)
        
        if scraped_products:
            upsert(database_manager, 'app', 'products', scraped_products)
        
        # Notify users
        logger.info("Starting user notification process")
        users = database_manager.fetch_collection('app', 'users')
        logger.info(f"Retrieved {len(users)} users from database")
        
        notify_users_by_mail(
            mail_manager,
            database_manager,
            users,
            'app',
            'products'
        )

        # Predict product prices
        predicted_products = predict_target_product_prices(database_manager, regression_manager, cleanup_manager, 'app', 'products', 'Telefoane')
        logger.info("Updating products with the new recommended price...")
        database_manager.update_recommended_price_from_list('app', 'products', predicted_products)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"=== Product overseer process completed in {execution_time:.2f} seconds ===")
        
    except Exception as e:
        logger.critical(f"Critical error in main process: {str(e)}")
        logger.exception("Stack trace:")
        
        execution_time = (datetime.now() - start_time).total_seconds()  
        logger.info(f"=== Product overseer process failed after {execution_time:.2f} seconds ===")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.critical(f"Unhandled exception in main function: {str(e)}")
        logger.exception("Stack trace:")