import joblib
import os
import pandas as pd
import xgboost as xgb

def model_fn(model_dir):
    """
    Loads the model from the disk
    """
    model = joblib.load(os.path.join(model_dir, "churn-model.joblib"))
    return model

def input_fn(request_body, request_content_type):
    """
    Parses the input data. We're expecting CSV.
    """
    if request_content_type == 'text/csv':
        # request_body is a string like "0,4,77.85,299.2,True,False..."

        # THIS IS THE NEW, FIXED FUNCTION
        def convert_value(val):
            # Handle the 'True'/'False' strings
            if val.lower() == 'true':
                return 1.0
            if val.lower() == 'false':
                return 0.0
            # Handle regular numbers
            return float(val)

        # Need to convert it to a 2D array for sklearn
        data = [convert_value(x) for x in request_body.split(',')]
        return [data] # Return as a 2D list
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model):
    """
    Makes a prediction
    """
    # We want the probability of Churn (which is the 1st class)
    prediction = model.predict_proba(input_data)
    return [prediction[0][1]] # Return just the probability of '1' (Churn)

def output_fn(prediction, accept):
    """
    Formats the output.
    """
    # Convert prediction to string (as required by CSVDeserializer in notebook)
    return str(prediction[0])