import pandas as pd
import numpy as np

class DatasetCleanupManager:
    
    @staticmethod
    def clean_dataset(raw_products: list[dict]) -> list[dict]:
        """
        Clean and transform raw product data to a standardized format.
        
        Args:
            raw_products: List of dictionaries containing raw product data
            
        Returns:
            List of dictionaries with standardized and cleaned data
        """
        # Convert list of dictionaries to DataFrame for easier manipulation
        df = pd.DataFrame(raw_products)
        
        # Define all fields that need to be present in the final output
        required_fields = [
            '5G', '4G', 'resolution width', 'resolution height', 'Diagonala',
            'Numar nuclee', 'Memorie RAM', 'Memorie Flash', 'Incarcare Wireless',
            'Capacitate Baterie', 'Dual SIM'
        ]
        
        # Add any missing columns with default values
        for field in required_fields:
            if field not in df.columns:
                df[field] = 0
        
        # Binary fields - convert 'Da'/'Nu' to 1/0
        binary_fields = ['5G', '4G', 'Incarcare Wireless', 'Dual SIM']
        for field in binary_fields:
            df[field] = df[field].fillna(0)
            df[field] = df[field].replace('Da', 1)
            df[field] = df[field].replace('Nu', 0)
        
        # Numeric fields with direct conversion
        simple_numeric_fields = ['resolution width', 'resolution height', 'Diagonala']
        for field in simple_numeric_fields:
            df[field] = pd.to_numeric(df[field], errors='coerce')
            df[field] = df[field].fillna(0)
        
        # Extract numeric value from 'Numar nuclee' by splitting on '('
        if 'Numar nuclee' in df.columns:
            df['Numar nuclee'] = df['Numar nuclee'].astype(str).str.split('(').str[0]
            df['Numar nuclee'] = pd.to_numeric(df['Numar nuclee'], errors='coerce')
            df['Numar nuclee'] = df['Numar nuclee'].fillna(0)
        
        # Extract numeric value from fields that might have units (like "8 GB")
        unit_fields = ['Memorie RAM', 'Memorie Flash', 'Capacitate Baterie']
        for field in unit_fields:
            df[field] = df[field].astype(str).str.split(' ').str[0]
            df[field] = pd.to_numeric(df[field], errors='coerce')
            df[field] = df[field].fillna(0)
        
        # Convert back to list of dictionaries
        cleaned_products = df.to_dict(orient='records')
        
        return cleaned_products