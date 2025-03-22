from sklearn.ensemble import RandomForestRegressor
import pickle
import pandas as pd

class RegressionManager:
    __model : RandomForestRegressor = None

    def __init__(self, model_path):
        try:
            with open(model_path, 'rb') as model_file:
                pickle.dump(self.__model, model_file)
        except Exception as e:
            print(e)

    def predict_price(self, dataset:list[dict]):
        df_dataset = pd.DataFrame(dataset)
        predicted_prices = self.__model.predict(df_dataset)
        
        for i, dataset in enumerate(dataset):
            dataset['predicted_price'] = float(predicted_prices[i])

        return dataset  

              
        
