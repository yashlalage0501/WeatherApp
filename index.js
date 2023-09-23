import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// to hide api key
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

const url = "https://api.openweathermap.org/data/2.5/weather";
// put api key from open weather map 
const apiKey = process.env.API_KEY; 

// middleweares
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// i) globle middleware
// II) it will run every time when we make http req or hit any route  and they run before the route handlers
//     associated with a particular HTTP method..
//     it will run  for every incoming HTTP request, regardless of the route or HTTP method
// iii) The global middleware you've defined using app.use will run for every incoming HTTP request,
//      regardless of the route or HTTP method. This means it will execute when you start your server
//      and whenever a user submits the form.
app.use(async (req, res, next) => {
  try {
    const pune = await axios.get(
      url + "?q=pune" + "&appid=" + apiKey + "&units=metric"
    );
    const mumbai = await axios.get(
      url + "?q=mumbai" + "&appid=" + apiKey + "&units=metric"
    );
    const delhi = await axios.get(
      url + "?q=delhi" + "&appid=" + apiKey + "&units=metric"
    );
    // i) assigning pune weather data as an object to res.locals.puneWeather
    // ii) Attach the weather data to res.locals
    // iii) res.locals.puneWeather = The weather data is assigned to res.locals.weatherData,
    //      making it accessible to all subsequent middleware functions and route handlers for the current request.
    // iv) IMP - This approach allows you to fetch data once, store it in res.locals, and then use it across multiple
    //     routes and middleware functions within the " same request-response cycle " without having to fetch it again.
    //     It's a way to make data available consistently throughout the lifecycle of a single HTTP request.
    res.locals.puneWeather = {
      city: pune,
      temp: pune.data.main.temp,
      humidity: pune.data.main.humidity,
      visibility: pune.data.visibility,
      windSpeed: pune.data.wind.speed,
      clouds: pune.data.clouds.all,
      desc: pune.data.weather[0].description,
    };
    res.locals.mumbaiWeather = {
      city: mumbai,
      temp: mumbai.data.main.temp,
      humidity: mumbai.data.main.humidity,
      visibility: mumbai.data.visibility,
      windSpeed: mumbai.data.wind.speed,
      clouds: mumbai.data.clouds.all,
      desc: mumbai.data.weather[0].description,
    };
    res.locals.delhiWeather = {
      city: delhi,
      temp: delhi.data.main.temp,
      humidity: delhi.data.main.humidity,
      visibility: delhi.data.visibility,
      windSpeed: delhi.data.wind.speed,
      clouds: delhi.data.clouds.all,
      desc: delhi.data.weather[0].description,
    };
  } catch (error) {
    console.log(error);
    res.locals.weatherData = null; // Set data to null in case of an error
  }
  //   to pass to next middleware or route
  next();
});

const date = new Date();
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

// full date to show in website and pass as an object
const fullDate = {
  day: days[date.getDay()], //current day
  month: months[date.getMonth()], //current month
  date: date.getDate(), //today date
  year: date.getFullYear(),
};
// console.log(fullDate);

app.get("/", (req, res) => {
  // Inside the "index.ejs" template (or any other template where these variables are used), you can directly
  // access the data from puneWeather, mumbaiWeather,
  // and delhiWeather because they were made available globally in res.locals.
  // Since the data is stored in res.locals, it can be accessed throughout the request-response cycle within the same
  // route handling context without the need to pass it explicitly in each route handler.
  // also same in post route
  res.render("index.ejs", { fullDate: fullDate });
  // -----------  OR  -----------
  //  res.render("index.ejs",{
  //                          puneWeather : res.locals.puneWeather,
  //                          mumbaiWeather : res.locals.mumbaiWeather,
  //                          delhiWeather:res.locals.delhiWeather
  //        });
});

app.post("/", async (req, res) => {
  var city = req.body.city;
  try {
    // to fetch weather details from openweather map api for perticular city that user type in the
    const result = await axios.get(
      url + "?q=" + city + "&appid=" + apiKey + "&units=metric"
    );
    // icon for perticular weather desc
    var id = result.data.weather[0].icon;
    var icon = "http://openweathermap.org/img/wn/" + id + "@2x.png";

    var content = {
      city: city,
      temp: result.data.main.temp,
      tempFeelsLike: result.data.main.feels_like,
      minTemp: result.data.main.temp_min,
      maxTemp: result.data.main.temp_max,
      humidity: result.data.main.humidity,
      visibility: result.data.visibility,
      windSpeed: result.data.wind.speed,
      clouds: result.data.clouds.all,
      desc: result.data.weather[0].description,
      icon: icon,
    };

    // weather details for other common cities are passed aotomatically
    // and access directly in index.ejs by puneWeather, mumbaiWeather ... (look in index.ejs)
    res.render("index.ejs", { content: content, fullDate: fullDate });
  } catch (error) {
    console.log(error.response.data);
    var errorCode = error.response.data.cod;
    var errormessage = error.response.data.message;
    res.render("error.ejs", { code: errorCode, message: errormessage });
    // res.sendStatus(500); or res.status(404).send("citynotfound");
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
