from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)

API_KEY = "ecd11802d8ac5298b4b9249af7367dc7"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/weather', methods=['POST'])
def api_weather():
    data = request.json
    city = data.get('city')
    lat = data.get('lat')
    lon = data.get('lon')

    if not city and not (lat and lon):
        return jsonify({"error": "Please enter a city name or allow location access."}), 400

    try:
        if city:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        else:
            url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"

        response = requests.get(url)
        weather_data = response.json()

        if weather_data.get("cod") != 200:
            message = weather_data.get("message", "Error retrieving data.")
            return jsonify({"error": message}), 400

        weather = {
            "city": weather_data["name"],
            "temperature": weather_data["main"]["temp"],
            "feels_like": weather_data["main"]["feels_like"],
            "pressure": weather_data["main"]["pressure"],
            "description": weather_data["weather"][0]["description"].capitalize(),
            "icon": weather_data["weather"][0]["icon"],
            "wind_speed": weather_data["wind"]["speed"],
            "humidity": weather_data["main"]["humidity"],
            "sunrise": datetime.utcfromtimestamp(weather_data["sys"]["sunrise"]).strftime('%H:%M:%S'),
            "sunset": datetime.utcfromtimestamp(weather_data["sys"]["sunset"]).strftime('%H:%M:%S'),
            "lat": weather_data["coord"]["lat"],
            "lon": weather_data["coord"]["lon"]
        }
        return jsonify({"weather": weather}), 200

    except Exception as e:
        return jsonify({"error": "Unable to connect to the weather service."}), 500


if __name__ == '__main__':
    app.run(debug=True)