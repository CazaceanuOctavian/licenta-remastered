"""
Category Standardization Based on Product Code Matching

This script standardizes product categories across multiple retailers by:
1. Designating a reference retailer whose categories are the standard
2. Finding products with matching product codes across retailers
3. Updating categories based on these matches
"""

from pymongo import MongoClient
from collections import Counter
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGO_URI = "mongodb://localhost:27017/"  # Replace with your MongoDB URI
DB_NAME = "products_db"  # Replace with your database name
COLLECTION_NAME = "products"

# Reference retailer whose categories will be the standard
REFERENCE_RETAILER = "vexio"  # Replace with your chosen retailer

class CategoryStandardizer:
    def __init__(self, mongo_uri, db_name, collection_name, reference_retailer):
        """Initialize the standardizer with MongoDB connection and settings."""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]
        self.reference_retailer = reference_retailer
        
    def initialize_reference_products(self):
        """Set standardized_category for all reference retailer products."""
        update_result = self.collection.update_many(
            {"online_mag": self.reference_retailer},
            [
                {
                    "$set": {
                        "standardized_category": "$category",
                        "original_category": "$category"
                    }
                }
            ]
        )
        logger.info(f"Updated {update_result.modified_count} reference retailer products")
        
    def build_reference_product_map(self):
        """Create a map of product_code to reference category."""
        product_code_to_category = {}
        reference_products = self.collection.find(
            {"online_mag": self.reference_retailer}
        )
        
        for product in reference_products:
            product_code_to_category[product["product_code"]] = product["category"]
            
        logger.info(f"Built reference map with {len(product_code_to_category)} product codes")
        return product_code_to_category
        
    def standardize_categories(self):
        """Standardize categories based on product code matching."""
        # Build the reference product map
        product_code_to_category = self.build_reference_product_map()
        
        # Get all retailers except the reference one
        retailers = self.collection.distinct(
            "online_mag", 
            {"online_mag": {"$ne": self.reference_retailer}}
        )
        
        total_updated = 0
        
        # For each retailer
        for retailer in retailers:
            logger.info(f"Processing retailer: {retailer}")
            
            # Get all categories from this retailer
            retailer_categories = self.collection.distinct(
                "category", 
                {"online_mag": retailer}
            )
            
            # For each category
            for category in retailer_categories:
                # Get products in this category from this retailer
                products_in_category = list(self.collection.find(
                    {"online_mag": retailer, "category": category}
                ))
                
                # Skip if no products found
                if not products_in_category:
                    continue
                
                # Look for matching product codes in the reference retailer
                matching_codes = []
                matching_categories = []
                
                for product in products_in_category:
                    if product["product_code"] in product_code_to_category:
                        matching_codes.append(product["product_code"])
                        matching_categories.append(product_code_to_category[product["product_code"]])
                
                if matching_codes:
                    # Find the most common reference category for these product codes
                    category_counter = Counter(matching_categories)
                    standard_category = category_counter.most_common(1)[0][0]
                    
                    # Calculate match percentage
                    match_percentage = (len(matching_codes) / len(products_in_category)) * 100
                    
                    logger.info(
                        f"Updating category '{category}' to '{standard_category}' "
                        f"based on {len(matching_codes)} matching products "
                        f"({match_percentage:.2f}% of category)"
                    )
                    
                    # Update all products in this category to the standard category
                    update_result = self.collection.update_many(
                        {"online_mag": retailer, "category": category},
                        {
                            "$set": {
                                "standardized_category": standard_category,
                                "original_category": category
                            }
                        }
                    )
                    
                    total_updated += update_result.modified_count
                else:
                    logger.info(f"No matching product codes found for category '{category}' from retailer '{retailer}'")
        
        logger.info(f"Total products updated: {total_updated}")
        return total_updated
    
    def handle_unmatched_products(self):
        """Process products without direct matches."""
        # Find all products that don't have a standardized_category yet
        unmatched_products = list(self.collection.find({
            "standardized_category": {"$exists": False},
            "online_mag": {"$ne": self.reference_retailer}
        }))
        
        logger.info(f"Found {len(unmatched_products)} products without category matches")
        
        inferred_count = 0
        unmatched_count = 0
        
        # For each unmatched product
        for product in unmatched_products:
            # Check if other products from the same retailer in the same category have been matched
            matched_products = list(self.collection.find({
                "online_mag": product["online_mag"],
                "category": product["category"],
                "standardized_category": {"$exists": True}
            }))
            
            if matched_products:
                # Use the most common standardized category
                category_counter = Counter([p["standardized_category"] for p in matched_products])
                best_category = category_counter.most_common(1)[0][0]
                
                # Update this product with the inferred standardized category
                self.collection.update_one(
                    {"_id": product["_id"]},
                    {
                        "$set": {
                            "standardized_category": best_category,
                            "original_category": product["category"],
                            "category_inferred": True
                        }
                    }
                )
                inferred_count += 1
            else:
                # Check if this product code exists in the reference retailer
                reference_product = self.collection.find_one({
                    "online_mag": self.reference_retailer,
                    "product_code": product["product_code"]
                })
                
                if reference_product:
                    self.collection.update_one(
                        {"_id": product["_id"]},
                        {
                            "$set": {
                                "standardized_category": reference_product["category"],
                                "original_category": product["category"],
                                "category_inferred": True
                            }
                        }
                    )
                    inferred_count += 1
                else:
                    # Keep original category but mark it as unmatched
                    self.collection.update_one(
                        {"_id": product["_id"]},
                        {
                            "$set": {
                                "standardized_category": product["category"],
                                "original_category": product["category"],
                                "category_unmatched": True
                            }
                        }
                    )
                    unmatched_count += 1
        
        logger.info(f"Inferred categories for {inferred_count} products")
        logger.info(f"Marked {unmatched_count} products as unmatched")
        
        return {"inferred": inferred_count, "unmatched": unmatched_count}
    
    def generate_report(self):
        """Generate a report of standardization results."""
        total_products = self.collection.count_documents({})
        standardized_products = self.collection.count_documents({"standardized_category": {"$exists": True}})
        unmatched_products = self.collection.count_documents({"category_unmatched": True})
        inferred_categories = self.collection.count_documents({"category_inferred": True})
        
        # Get category counts by retailer
        retailer_breakdown = {}
        retailers = self.collection.distinct("online_mag")
        
        for retailer in retailers:
            original_categories = self.collection.distinct("category", {"online_mag": retailer})
            standardized_categories = self.collection.distinct("standardized_category", {"online_mag": retailer})
            
            retailer_breakdown[retailer] = {
                "original_categories": len(original_categories),
                "standardized_categories": len(standardized_categories),
                "category_list": standardized_categories
            }
        
        # Calculate percentage standardized
        standardization_percentage = (standardized_products / total_products) * 100 if total_products > 0 else 0
        
        report = {
            "summary": {
                "total_products": total_products,
                "standardized_products": standardized_products,
                "standardization_percentage": f"{standardization_percentage:.2f}%",
                "unmatched_products": unmatched_products,
                "inferred_categories": inferred_categories
            },
            "retailer_breakdown": retailer_breakdown
        }
        
        return report
    
    def create_standardized_view(self):
        """Create a database view with standardized categories."""
        try:
            self.db.create_collection(
                "products_standardized",
                viewOn="products",
                pipeline=[
                    {
                        "$project": {
                            "name": 1,
                            "product_code": 1,
                            "online_retailer": 1,
                            "original_category": "$category",
                            "category": "$standardized_category",
                            # Include other fields as needed
                            "_id": 1
                        }
                    }
                ]
            )
            logger.info("Created standardized products view")
            return True
        except Exception as e:
            logger.error(f"Error creating view: {str(e)}")
            return False


def main():
    """Main function to run the standardization process."""
    # Initialize the standardizer
    standardizer = CategoryStandardizer(
        MONGO_URI, 
        DB_NAME, 
        COLLECTION_NAME, 
        REFERENCE_RETAILER
    )
    
    # Step 1: Initialize reference products
    standardizer.initialize_reference_products()
    
    # Step 2: Standardize categories based on product code matching
    updated_count = standardizer.standardize_categories()
    
    # Step 3: Handle products without direct matches
    unmatched_stats = standardizer.handle_unmatched_products()
    
    # Step 4: Generate report
    report = standardizer.generate_report()
    
    # Print the report
    logger.info("Standardization Report:")
    logger.info(f"Total products: {report['summary']['total_products']}")
    logger.info(f"Standardized products: {report['summary']['standardized_products']} ({report['summary']['standardization_percentage']})")
    logger.info(f"Products with inferred categories: {report['summary']['inferred_categories']}")
    logger.info(f"Unmatched products: {report['summary']['unmatched_products']}")
    
    # Step 5: Create standardized view (optional)
    standardizer.create_standardized_view()
    
    return report


if __name__ == "__main__":
    main()