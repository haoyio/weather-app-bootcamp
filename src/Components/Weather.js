import { useState } from 'react';
import axios from "axios";
import {
  LineChart,
  Line,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';

const weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function WeatherOutput({
  weatherCity,
  weatherDesc,
  weatherIcon,
  weatherTemp,
  weatherTempFeel,
}) {
  if (!weatherCity) return;
  return (
    <>
      <h2>City: {weatherCity}</h2>
      <h3>
        Actual: {weatherTemp.toFixed(1)}°C
        <img
          src={`https://openweathermap.org/img/wn/${weatherIcon}.png`}
          alt={weatherDesc}
        />
        &emsp;Feels like: {weatherTempFeel.toFixed(1)}°C
      </h3>
    </>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}: ${payload[0].value.toFixed(1)}°C`}</p>
      </div>
    );
  }
  return null;
};

function ForecastChart({ forecastData }) {
  if (forecastData.length === 0) return;
  const sortedForecastData = forecastData.slice();
  sortedForecastData.sort((a, b) => a.dt - b.dt);

  return (
    <>
      <h3>5-days forecast:</h3>
      <LineChart
        width={1000}
        height={600}
        data={sortedForecastData}
        margin={{
          top: 0,
          right: 100,
          left: 100,
          bottom: 200,
        }}
      >
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <XAxis
          dataKey="dt_hour"
          angle={-45}
          textAnchor="end"
        />
        <YAxis
          domain={[
            Math.round(Math.min(...sortedForecastData.map(e => e.temp))) - 1,
            Math.round(Math.max(...sortedForecastData.map(e => e.temp))) + 1,
          ]}
        />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </>
  )
}

function Weather() {

  const [city, setCity] = useState("");
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherDesc, setWeatherDesc] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherTemp, setWeatherTemp] = useState(null);
  const [weatherTempFeel, setWeatherTempFeel] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  const handleSubmit = (e) => {
    // don't trigger page refresh
    e.preventDefault();

    // do nothing if no input
    if (city === "") return;

    // call geocoding api to get lat/lng for city
    axios
      .get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.REACT_APP_API_KEY}`
      )
      .then((response) => response.data[0])
      .then(({ lat, lon }) => {

        // call weather api for resolved city
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_API_KEY}`
          )
          .then((response) => {
            const { data: weatherData } = response;

            setWeatherCity(weatherData.name);
            setWeatherDesc(weatherData.weather[0].description);
            setWeatherIcon(weatherData.weather[0].icon);
            setWeatherTemp(weatherData.main.temp);
            setWeatherTempFeel(weatherData.main.feels_like)
          })

        // call api for resolved city forecast
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_API_KEY}`
          )
          .then((response) => {
            const { data: rawForecastData } = response;
            setForecastData(rawForecastData.list.map(forecast => {
              const dt_date = new Date(forecast.dt * 1000);
              return {
                  dt: forecast.dt,
                  dt_hour: `${dt_date.getMonth() + 1}/${dt_date.getDate()} (${weekday[dt_date.getDay()]}) ${dt_date.getHours() % 12} ${dt_date.getHours() < 12 ? "am" : "pm"}`,
                  temp: forecast.main.temp,
                  humidity: forecast.main.humidity,
                  icon: forecast.weather.icon,
                }
              }
            ));
          })
      })
      .catch(e => alert(`Error: invalid city name "${city}"`));

  };

  return (
    <div>
      <h1>Weather app</h1>
      <Input
        name="city"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="e.g., San Francisco"
        endDecorator={
          <Button
            onClick={handleSubmit}
          >
            Submit
          </Button>
        }
      />
      <WeatherOutput
        weatherCity={weatherCity}
        weatherDesc={weatherDesc}
        weatherTemp={weatherTemp}
        weatherIcon={weatherIcon}
        weatherTempFeel={weatherTempFeel}
      />
      <ForecastChart
        weatherCity={weatherCity}
        forecastData={forecastData}
      />
    </div>
  )
}

export default Weather;
