# app.py - minimal dev server (pre-email / pre-deploy state)

import os
from flask import Flask, render_template, jsonify

# Project folders (adjust if your layout differs)
TEMPLATES_DIR = "templates"
STATIC_DIR = "static"

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)


@app.route("/", methods=["GET"])
def index():
    """Serve the main single-page app (index.html in templates/)."""
    return render_template("index.html")


@app.route("/_status", methods=["GET"])
def status():
    """Simple health check for local testing."""
    return jsonify({
        "ok": True,
        "service": "True Designs (dev)",
        "env": os.environ.get("FLASK_ENV", "development")
    })


if __name__ == "__main__":
    # Helpful startup info
    print("Starting True Designs minimal Flask app")
    print(f"TEMPLATE DIR: {TEMPLATES_DIR}")
    print(f"STATIC DIR: {STATIC_DIR}")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
