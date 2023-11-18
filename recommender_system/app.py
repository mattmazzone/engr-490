from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from firebase_admin import initialize_app, auth, credentials, firestore

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.Certificate('tripwise-sdk-key.json')
fb_app = initialize_app(cred)
db = firestore.client()

# Authentication middleware
def autheticate(id_token):
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token['uid']

# Profile route
@app.route('/api/profile/<userId>', methods=['GET'])
def profile(userId):
    try:
        id_token = request.headers.get("Authorization")
        autheticate(id_token)
        
        doc = db.collection("users").document(userId).get()
        if not doc.exists:
            return make_response(jsonify({"status": 404, "msg": "User not found" })), 404
        userData = doc.to_dict()
        print(userData)

        return make_response(jsonify(userData)), 200
    except Exception as e:
        print(e)
        return make_response(jsonify({"status": 500, "msg": e.__doc__})), 500


# Start the server
if __name__ == '__main__':
    app.run(port=3000, debug=True)