from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.service_account('tripwise-sdk-key.json')
fb_app = initialize_app(cred)

# Authentication middleware
def autheticate(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        print(e)

# Profile route
@app.route('/profile/<str:userId>', methods=['GET'])
def profile(userId):
    try:

        id_token = request.headers.get("Authorization")
        uid = autheticate(id_token)
        response = {
            "status": 200,
            "msg": "Logged in succesfully",
            "uid": uid
        }
        return make_response(jsonify(response)), 200
    except Exception as e:
        print(e)


# Start the server
if __name__ == '__main__':
    app.run(port=3000, debug=True)