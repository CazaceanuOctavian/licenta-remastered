from database_manager.database_manager import MongoManager
from configparser import ConfigParser
from utils.os_utils import OsUtils
from regression_manager.dataset_cleanup_manager import DatasetCleanupManager
from regression_manager.regression_manager import RegressionManager
import json

config = ConfigParser()
config.read('cfg-secret.ini')
config_util = ConfigParser()
config_util.read('cfg.ini')

def write_to_json_file(data, file_path):
    """
    Write data to a JSON file.
    
    Args:
        data: The data to write to the file
        file_path: The path to the file to write to
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def main():
    db_manager = MongoManager(config['Mongo']['connection_string'])

    cleanup_manager = DatasetCleanupManager()

    # fetched_products = OsUtils.readFromJsonFile(['regression/datasets/evomag_2024_11_13.json'])
    
    # db_manager.upsert_to_collection_from_list('app', 'products_test', fetched_products)

    filter_criteria = {
        "predicted_price": {"$exists": False},
        "category": "Telefoane",
        "online_mag": "evomag"
    }

    fetched_products = db_manager.fetch_collection_filtered('app', 'products', filter_criteria)

    clean_products = cleanup_manager.clean_dataset(fetched_products)

    regression_manager = RegressionManager(config_util['Regression']['model_path'])

    predicted_prices, final_products = regression_manager.predict_price(clean_products, fetched_products)
    
    # Write final_products to myTest.json
    write_to_json_file(final_products, 'myTest.json')

    print("Final products written to myTest.json")

if __name__ == '__main__':
    main()