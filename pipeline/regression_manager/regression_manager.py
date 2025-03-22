from sklearn.ensemble import RandomForestRegressor
import pickle
import pandas as pd

class RegressionManager:
    __model : RandomForestRegressor = None
    
    def __init__(self, model_path):
        try:
            with open(model_path, 'rb') as model_file:
                self.__model = pickle.load(model_file)
        except Exception as e:
            print(e)
    
    def __prepare_features(self, df_dataset: pd.DataFrame) -> pd.DataFrame:
        """
        Private method to order columns in the required format for prediction.
        
        Args:
            df_dataset: DataFrame containing input features
            
        Returns:
            DataFrame with columns properly ordered for model prediction
        """
        # Define the required column order
        required_column_order = [
            '5G', 
            '4G', 
            'resolution width', 
            'resolution height', 
            'Diagonala', 
            'Numar nuclee', 
            'Memorie Flash', 
            'Memorie RAM', 
            'Incarcare Wireless', 
            'Capacitate Baterie', 
            'Dual SIM'
        ]
        
        # Ensure all required columns exist (with default 0 if missing)
        for col in required_column_order:
            if col not in df_dataset.columns:
                df_dataset[col] = 0
        
        # Reorder columns according to required order
        return df_dataset[required_column_order]
    
    def predict_price(self, df_features:pd.DataFrame, attach_to:list[dict] = None):        
        # Make predictions
        predicted_prices = self.__model.predict(df_features)
        
        # If attach_to is provided, add the predictions to each dictionary in the list
        if attach_to is not None:
            for i, item_dict in enumerate(attach_to):
                # Make sure we don't go out of bounds of the predictions array
                if i < len(predicted_prices):
                    item_dict["recommended_price"] = predicted_prices[i]
        
        return predicted_prices, attach_to