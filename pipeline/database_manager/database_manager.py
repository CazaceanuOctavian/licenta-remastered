import json
from bson import json_util
from pymongo import MongoClient, UpdateOne
from datetime import datetime

class MongoManager:
    __clinet : MongoClient

    def __init__(self, conn_string:str):
        self.__clinet = MongoClient(conn_string)

    def fetch_collection(self, db_name:str, collection_name:str):
        db = self.__clinet[db_name]
        collection = db[collection_name]
        cursor = collection.find()
        documents = list(cursor)
        return json.loads(json_util.dumps(documents))
    
    def fetch_collection_filtered(self, db_name:str, collection_name:str, filter_field:dict):
        db = self.__clinet[db_name]
        collection = db[collection_name]
        cursor = collection.find(filter_field)
        documents = list(cursor)
        return json.loads(json_util.dumps(documents))


    def upsert_to_collection_from_list(self, db_name:str, collection_name:str, products:list[dict]):
        db = self.__clinet[db_name]
        collection = db[collection_name]
          # Prepare bulk operations
        operations = []
        current_timestamp = datetime.now()
        
        for product in products:
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

    def update_recommended_price_from_list(self, db_name:str, collection_name:str, products:list[dict]):
        """
        Updates the recommended_price field for a list of products.
        
        Parameters:
        db_name (str): The name of the database
        collection_name (str): The name of the collection
        products (list[dict]): List of product dictionaries containing at least product_code, online_mag, and recommended_price
        
        Returns:
        None
        """
        db = self.__clinet[db_name]
        collection = db[collection_name]
        
        # Prepare bulk operations
        operations = []
        
        for product in products:
            # Ensure the product has the required fields
            if not all(key in product for key in ["product_code", "online_mag", "recommended_price"]):
                print(f"Skipping product due to missing required fields: {product.get('product_code', 'Unknown')}")
                continue
                
            # Create a unique identifier for the product
            product_identifier = {
                "product_code": product["product_code"],
                "online_mag": product["online_mag"]
            }
            
            # Create an update operation to set only the recommended_price field
            update_operation = UpdateOne(
                # Filter criteria to find the document
                product_identifier,
                # Update only the recommended_price field
                {
                    "$set": {
                        "recommended_price": product["recommended_price"]
                    }
                }
            )
            
            operations.append(update_operation)
        
        # Execute all operations at once
        if operations:
            result = collection.bulk_write(operations)
            print(f"Modified: {result.modified_count}")
        else:
            print("No operations to perform.")