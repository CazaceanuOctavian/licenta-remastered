import pandas as pd
import numpy as np
from pandas import json_normalize


class DatasetCleanupManager:
    def clean_dataset(self, raw_products):
        """
        Main method to clean the dataset.
        
        Parameters:
        -----------
        raw_products : list of dictionaries or JSON string
            The raw product data to be cleaned
            
        Returns:
        --------
        pandas.DataFrame
            A cleaned DataFrame ready for analysis
        """
        # Convert to DataFrame if input is a list of dictionaries
        if isinstance(raw_products, list):
            df_smartphone = pd.DataFrame(raw_products)
        else:
            # Assume it's a JSON string
            df_smartphone = pd.read_json(raw_products)
            
        df_smartphone_flattened = self.__flatten_json_column(df_smartphone, 'specifications')
        df_smartphone_extracted = self.__extract_features(df_smartphone_flattened)
        df_smartphone_cleaned = self.__clean_features(df_smartphone_extracted)
        return df_smartphone_cleaned

    def __clean_features(self, df_model_training):
        """
        Clean and standardize all the extracted features
        """
        # Create a copy to avoid modifying the original
        df_cleaned = df_model_training.copy()
        
        # Clean 5G field
        df_cleaned['5G'].fillna(0, inplace=True)
        df_cleaned['5G'].replace('Da', 1, inplace=True)
        df_cleaned['5G'].replace('Nu', 0, inplace=True)

        # Clean 4G field
        df_cleaned['4G'].fillna(0, inplace=True)
        df_cleaned['4G'].replace('Da', 1, inplace=True)
        df_cleaned['4G'].replace('Nu', 0, inplace=True)

        # Clean resolution fields
        df_cleaned['resolution width'] = pd.to_numeric(df_cleaned['resolution width'], errors='coerce')
        df_cleaned['resolution height'] = pd.to_numeric(df_cleaned['resolution height'], errors='coerce')
        df_cleaned['resolution height'].fillna(0, inplace=True)
        df_cleaned['resolution width'].fillna(0, inplace=True)

        # Clean diagonal size
        df_cleaned['Diagonala'] = pd.to_numeric(df_cleaned['Diagonala'], errors='coerce')
        df_cleaned['Diagonala'].fillna(0, inplace=True)

        # Clean core count
        df_cleaned['Numar nuclee'] = df_cleaned['Numar nuclee'].str.split('(').str[0]
        df_cleaned['Numar nuclee'] = pd.to_numeric(df_cleaned['Numar nuclee'], errors='coerce')
        df_cleaned['Numar nuclee'].fillna(0, inplace=True)

        # Clean RAM
        df_cleaned['Memorie RAM'] = df_cleaned['Memorie RAM'].str.split(' ').str[0]
        df_cleaned['Memorie RAM'] = pd.to_numeric(df_cleaned['Memorie RAM'], errors='coerce')
        df_cleaned['Memorie RAM'].fillna(0, inplace=True)

        # Clean flash memory
        df_cleaned['Memorie Flash'] = df_cleaned['Memorie Flash'].str.split(' ').str[0]
        df_cleaned['Memorie Flash'] = pd.to_numeric(df_cleaned['Memorie Flash'], errors='coerce')
        df_cleaned['Memorie Flash'].fillna(0, inplace=True)

        # Clean wireless charging
        df_cleaned['Incarcare Wireless'].fillna(0, inplace=True)
        df_cleaned['Incarcare Wireless'].replace('Da', 1, inplace=True)
        df_cleaned['Incarcare Wireless'].replace('Nu', 0, inplace=True)

        # Clean battery capacity
        df_cleaned['Capacitate Baterie'] = df_cleaned['Capacitate Baterie'].str.split(' ').str[0]
        df_cleaned['Capacitate Baterie'] = pd.to_numeric(df_cleaned['Capacitate Baterie'], errors='coerce')
        df_cleaned['Capacitate Baterie'].fillna(0, inplace=True)

        # Clean Dual SIM
        df_cleaned['Dual SIM'].fillna(0, inplace=True)
        df_cleaned['Dual SIM'].replace('Da', 1, inplace=True)
        df_cleaned['Dual SIM'].replace('Nu', 0, inplace=True)

        # Uncomment if you want to encode manufacturer
        # manufacturers = df_cleaned['Manufacturer'].unique()
        # manufacturer_mapping = {manufacturer: i for i, manufacturer in enumerate(sorted(manufacturers))}
        # df_cleaned['Manufacturer'] = df_cleaned['Manufacturer'].map(manufacturer_mapping)

        df_final = df_cleaned.drop('price', axis=1)
        return df_final

    def __extract_features(self, df_smartphone_normalised):
        """
        Extract relevant features from the normalized DataFrame
        """
        df_model_training = pd.DataFrame()
        df_model_training['5G'] = df_smartphone_normalised['5G']
        df_model_training['4G'] = df_smartphone_normalised['4G']

        # Split resolution into width and height
        df_model_training[['resolution width', 'resolution height']] = df_smartphone_normalised['Rezolutie maxima (px)'].str.split(' x ', expand=True)

        df_model_training['Diagonala'] = df_smartphone_normalised['Diagonala (inch)']
        df_model_training['Numar nuclee'] = df_smartphone_normalised['Numar nuclee']
        df_model_training['Memorie Flash'] = df_smartphone_normalised['Memorie Flash']
        df_model_training['Memorie RAM'] = df_smartphone_normalised['Memorie RAM']
        df_model_training['Incarcare Wireless'] = df_smartphone_normalised['Incarcare Wireless']
        df_model_training['Capacitate Baterie'] = df_smartphone_normalised['Capacitate'] 
        df_model_training['Dual SIM'] = df_smartphone_normalised['Dual SIM']
        # df_model_training['Manufacturer'] = df_smartphone_normalised['manufacturer']
        df_model_training['price'] = df_smartphone_normalised['price']

        return df_model_training
    
    def __flatten_json_column(self, df, json_column):
        """
        Flatten a JSON column in a DataFrame so that the fields become separate columns.
        
        Parameters:
        -----------
        df : pandas.DataFrame
            The DataFrame containing the JSON column to flatten
        json_column : str
            The name of the column containing the JSON data to flatten
            
        Returns:
        --------
        pandas.DataFrame
            A new DataFrame with the JSON column flattened into separate columns
        """
        # Create a copy to avoid modifying the original DataFrame
        result_df = df.copy()
        
        # Check if the JSON column exists in the DataFrame
        if json_column not in result_df.columns:
            raise ValueError(f"Column '{json_column}' not found in DataFrame")
        
        # Normalize the JSON column
        try:
            # Handle cases where some rows might have None/NaN values in the JSON column
            mask = result_df[json_column].notna()
            
            if mask.any():
                # Apply json_normalize only to rows that have valid JSON
                normalized_df = json_normalize(result_df.loc[mask, json_column])
                
                # Drop the original JSON column from the result
                result_subset = result_df.loc[mask].drop(json_column, axis=1)
                
                # Combine the original DataFrame (minus the JSON column) with the normalized data
                flattened_subset = pd.concat([result_subset.reset_index(drop=True), 
                                           normalized_df.reset_index(drop=True)], 
                                           axis=1)
                
                # Merge back with rows that had None/NaN values
                if (~mask).any():
                    result_df = pd.concat([flattened_subset, 
                                        result_df.loc[~mask]]).sort_index()
                else:
                    result_df = flattened_subset
            
            return result_df
            
        except Exception as e:
            raise ValueError(f"Error flattening JSON column: {str(e)}")