import json

class OsUtils:

    @staticmethod
    def readFromJsonFile(output_paths:list[str]):
        products_list = []
        for path in output_paths:
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    if isinstance(data, list):
                        products_list.extend(data)
                    elif isinstance(data, dict):
                        products_list.append(data)
                        
                print(f"Processed: {path}")
            except json.JSONDecodeError:
                print(f"Error: Could not parse JSON in {path}")
            except Exception as e:
                print(f"Error processing {path}: {str(e)}")
        return products_list
