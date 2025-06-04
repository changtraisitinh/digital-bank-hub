from flask import Flask, jsonify, request
import stripe
import os

app = Flask(__name__)

# Set your secret key. Remember to switch to your live secret key in production.
stripe.api_key = "sk_test_51RR4FeI5sqndwyBEktkcPBHDhrFAk2M0Bagfu06PbPdv0XJb5VF0LA5GZSh4ck2f9rMwj4PnkWpsmvYwxCr3Zxla00Shd8GGsQ"

@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.get_json()
        
        # Create a PaymentIntent with the order amount and currency
        payment_intent = stripe.PaymentIntent.create(
            payment_method_types=["card"],
            amount=199,  # Amount in cents
            currency=data.get('currency', 'usd'),
        )

        return jsonify({
            'clientSecret': payment_intent.client_secret
        })

    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    app.run(port=5000)