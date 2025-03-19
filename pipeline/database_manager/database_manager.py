from pymongo import MongoClient, UpdateOne
from datetime import datetime

class MongoManager:
    __clinet : MongoClient

    def __init__(self, conn_string:str):
        self.__clinet = MongoClient(conn_string)

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