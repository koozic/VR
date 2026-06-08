from flask import Flask,jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route("/")
def home():
    return "Hello Flask!"

@app.route("/api/hello" , methods=["get"])
def hello(): 
    return jsonify({'message' : 'good! success~~'})

if __name__ == "__main__":
    app.run(debug=True)