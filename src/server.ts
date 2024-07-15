import process from "process";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";

type WeatherAPIInput = {
    id: number | string;
    city: string;
    apiKey: string;
};

type WeatherAPIOutput = {
    jobRunId: string | number;
    statusCode: number;
    data: {
        result?: any;
    };
    error?: string;
};

const PORT = process.env.PORT || 8080;
const app: Express = express();

app.use(bodyParser.json());

// Respond with a simple message for GET requests to the root path
app.get("/", (req: Request, res: Response) => {
    res.send("Weather External Adapter says Hello!!!");
});

// Handle POST requests to the root path
app.post("/", async (req: Request, res: Response) => {
    const weatherInputData: WeatherAPIInput = req.body;
    console.log("Request data received:", weatherInputData);

    // Construct the API request URL using city and API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${weatherInputData.city}&appid=${weatherInputData.apiKey}`;

    let weatherResponse: WeatherAPIOutput = {
        data: {},
        jobRunId: weatherInputData.id,
        statusCode: 0,
    };

    try {
        // Make an asynchronous GET request to the API
        const apiResponse: AxiosResponse = await axios.get(url);

        // Set response data and status code on success
        weatherResponse.data = { result: apiResponse.data };
        weatherResponse.statusCode = apiResponse.status;

        res.json(weatherResponse);
    } catch (error: any) {
        console.log("API Response error:", error);
        weatherResponse.error = error.message;
        weatherResponse.statusCode = error.response.status;

        // Send the response with error details on error
        res.json(weatherResponse);
    }
});

// Start the server and listen for requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
});
