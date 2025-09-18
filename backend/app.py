from flask import Flask, jsonify
try:
    from flask_cors import CORS
except Exception:
    CORS = None

app = Flask(__name__)

# Enable CORS if flask-cors is installed (handy for direct calls without proxy)
if CORS is not None:
    CORS(app)


@app.get("/api/hello")
def hello():
    return jsonify(message="Hello from Flask!")


if __name__ == "__main__":
    # Default dev server on http://127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)

