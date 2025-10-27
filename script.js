// This event listener ensures our code runs only after the full
// HTML page has been loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION ---

    // 🚨 PASTE YOUR API URL HERE
    // This is the "Invoke URL" from your API Gateway in Phase 4.
    const API_URL = 'https://5rh41ecvfd.execute-api.us-east-1.amazonaws.com/predict'; 

    // Get references to all the important HTML elements
    const predictButton = document.getElementById('predict-button');
    const resultElement = document.getElementById('prediction-result');
    const resultContainer = document.getElementById('result-container');

    // --- 2. ADD EVENT LISTENER ---

    // Run the handlePrediction function when the button is clicked
    predictButton.addEventListener('click', handlePrediction);

    
    // --- 3. MAIN PREDICTION HANDLER ---

    async function handlePrediction() {
        // Show a "loading" state
        resultElement.innerText = 'Analyzing...';
        resultElement.style.color = '#333';
        resultContainer.style.borderColor = '#ccc';

        try {
            // Step A: Build the payload string
            const payloadString = buildPayloadString();
            
            // Log the payload to the console for debugging
            // You can compare this to a row in your 'test.csv'
            console.log('Sending payload:', payloadString); 

            // Step B: Call the API
            const result = await callAPI(payloadString);
            
            // Step C: Display the result
            displayResult(result);

        } catch (error) {
            // Display any errors
            resultElement.innerText = `Error: ${error.message}`;
            resultElement.style.color = 'red';
            resultContainer.style.borderColor = 'red';
            console.error('Prediction failed:', error);
        }
    }

    // --- 4. API CALL FUNCTION ---

    async function callAPI(payloadString) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // The body must be in the *exact* format your Lambda expects
            body: JSON.stringify({
                features: payloadString
            })
        });

        if (!response.ok) {
            // Handle API errors (e.g., 500, 502)
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }

        return response.json();
    }

    // --- 5. RESULT DISPLAY FUNCTION ---

    function displayResult(result) {
        if (result.churn_probability === undefined) {
            throw new Error('Invalid response from API. "churn_probability" not found.');
        }

        // Get the probability and convert to percentage
        const probability = parseFloat(result.churn_probability);
        const percentage = (probability * 100).toFixed(2);
        
        // This threshold (0.5) is standard, but you can adjust it.
        if (probability > 0.5) {
            resultElement.innerText = `High Risk (${percentage}%) - Customer is likely to CHURN.`;
            resultElement.style.color = '#D9534F'; // Red
            resultContainer.style.borderColor = '#D9534F';
        } else {
            resultElement.innerText = `Low Risk (${percentage}%) - Customer is likely to STAY.`;
            resultElement.style.color = '#5CB85C'; // Green
            resultContainer.style.borderColor = '#5CB85C';
        }
    }

    // --- 6. PAYLOAD BUILDER FUNCTION ---
    //
    // ‼️ CRITICAL: This function must get all form values and
    //    build a string in the *EXACT* order your model expects.
    //
    //    I have pre-filled this based on your dataset and the
    //    `pd.get_dummies(..., drop_first=True)` logic from Phase 2.
    //
    //    **YOU MUST VERIFY THIS ORDER** against the list you
    //    generated in Step 1 of this guide.
    //
    // -----------------------------------------------------------------

    function buildPayloadString() {
        
        // Helper function to get element values
        const val = (id) => document.getElementById(id).value;
        const num = (id) => parseFloat(val(id)); // Convert to number

        // This array will hold all our feature values
        const features = [];

        // --- Verify this order against your Python output! ---

        // 1. Numeric Features
        features.push(val('senior-citizen') === 'Yes' ? 1 : 0); // SeniorCitizen
        features.push(num('tenure'));                          // tenure
        features.push(num('monthly-charges'));                 // MonthlyCharges
        features.push(num('total-charges'));                   // TotalCharges

        // 2. Dummy Variables (from `pd.get_dummies(..., drop_first=True)`)
        
        // gender_Male (drops 'Female')
        features.push(val('gender') === 'Male' ? 1 : 0);
        
        // Partner_Yes (drops 'No')
        features.push(val('partner') === 'Yes' ? 1 : 0);
        
        // Dependents_Yes (drops 'No')
        features.push(val('dependents') === 'Yes' ? 1 : 0);
        
        // PhoneService_Yes (drops 'No')
        features.push(val('phone-service') === 'Yes' ? 1 : 0);
        
        // MultipleLines_No phone service
        features.push(val('multiple-lines') === 'No phone service' ? 1 : 0);
        // MultipleLines_Yes (drops 'No')
        features.push(val('multiple-lines') === 'Yes' ? 1 : 0);
        
        // InternetService_Fiber optic
        features.push(val('internet-service') === 'Fiber optic' ? 1 : 0);
        // InternetService_No (drops 'DSL')
        features.push(val('internet-service') === 'No' ? 1 : 0);
        
        // OnlineSecurity_No internet service
        features.push(val('online-security') === 'No internet service' ? 1 : 0);
        // OnlineSecurity_Yes (drops 'No')
        features.push(val('online-security') === 'Yes' ? 1 : 0);
        
        // OnlineBackup_No internet service
        features.push(val('online-backup') === 'No internet service' ? 1 : 0);
        // OnlineBackup_Yes (drops 'No')
        features.push(val('online-backup') === 'Yes' ? 1 : 0);
        
        // DeviceProtection_No internet service
        features.push(val('device-protection') === 'No internet service' ? 1 : 0);
        // DeviceProtection_Yes (drops 'No')
        features.push(val('device-protection') === 'Yes' ? 1 : 0);
        
        // TechSupport_No internet service
        features.push(val('tech-support') === 'No internet service' ? 1 : 0);
        // TechSupport_Yes (drops 'No')
        features.push(val('tech-support') === 'Yes' ? 1 : 0);
        
        // StreamingTV_No internet service
        features.push(val('streaming-tv') === 'No internet service' ? 1 : 0);
        // StreamingTV_Yes (drops 'No')
        features.push(val('streaming-tv') === 'Yes' ? 1 : 0);
        
        // StreamingMovies_No internet service
        features.push(val('streaming-movies') === 'No internet service' ? 1 : 0);
        // StreamingMovies_Yes (drops 'No')
        features.push(val('streaming-movies') === 'Yes' ? 1 : 0);
        
        // Contract_One year
        features.push(val('contract') === 'One year' ? 1 : 0);
        // Contract_Two year (drops 'Month-to-month')
        features.push(val('contract') === 'Two year' ? 1 : 0);
        
        // PaperlessBilling_Yes (drops 'No')
        features.push(val('paperless-billing') === 'Yes' ? 1 : 0);
        
        // PaymentMethod_Credit card (automatic)
        features.push(val('payment-method') === 'Credit card (automatic)' ? 1 : 0);
        // PaymentMethod_Electronic check
        features.push(val('payment-method') === 'Electronic check' ? 1 : 0);
        // PaymentMethod_Mailed check (drops 'Bank transfer (automatic)')
        features.push(val('payment-method') === 'Mailed check' ? 1 : 0);
        
        // Join all 27 features into a single, comma-separated string
        return features.join(',');
    }


});


// Forcing a new build - [current time] (e.g., // Forcing a new build - 2:15 PM)
