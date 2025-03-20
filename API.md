# YoloFarm API Documentation

## Overview
This API provides endpoints for IoT data management and real-time streaming. The API is built using Flask and supports MQTT communication through Adafruit IO.

## Base URL
```
http://localhost:5000
```

## Feed System

### Available Feeds
The system supports the following feeds:
- `temp`: Temperature sensor data
- `humidity`: Humidity sensor data
- `moisture`: Soil moisture sensor data
- `light`: Light sensor data

### Feed Data Format
All feed data is transmitted as string values and converted to float when received.

## Endpoints

### 1. Health Check
```http
GET /
```

**Description**: Check if the API is running

**Response**:
```json
"IoT Backend API"
```

### 2. Stream Data
```http
GET /stream
```

**Description**: Server-Sent Events (SSE) endpoint for real-time data streaming

**Response Format**:
```json
data: {"type": "feed_name", "value": "data_value"}
```

**Example Response**:
```
data: {"type": "temp", "value": "25.5"}
```

**Notes**:
- This endpoint uses Server-Sent Events (SSE)
- The connection stays open and streams data in real-time
- Data is pushed whenever new MQTT messages are received
- Values are automatically converted to float type

### 3. Post Data to Feed
```http
POST /<feed>
```

**Description**: Publish data to a specific MQTT feed

**Parameters**:
- `feed` (path parameter): The name of the feed to publish to. Must be one of: `temp`, `humidity`, `moisture`, `light`

**Request Body**:
```json
{
    "value": "your_value"
}
```

**Response**:
```json
"value your_value added to feed feed_name"
```

**Example Requests**:
```bash
# Publish temperature data
curl -X POST http://localhost:5000/temp \
     -H "Content-Type: application/json" \
     -d '{"value": "25.5"}'

# Publish humidity data
curl -X POST http://localhost:5000/humidity \
     -H "Content-Type: application/json" \
     -d '{"value": "60"}'

# Publish soil moisture data
curl -X POST http://localhost:5000/moisture \
     -H "Content-Type: application/json" \
     -d '{"value": "45"}'

# Publish light data
curl -X POST http://localhost:5000/light \
     -H "Content-Type: application/json" \
     -d '{"value": "800"}'
```

**Notes**:
- Values are automatically converted to strings before publishing
- Invalid feed names will result in a 404 error
- The system maintains a real-time connection to Adafruit IO MQTT broker

## Error Handling
- All endpoints return appropriate HTTP status codes
- 400 Bad Request: Invalid request body
- 404 Not Found: Feed not found
- 500 Internal Server Error: Server-side errors

## CORS
Cross-Origin Resource Sharing (CORS) is enabled for all endpoints.

## Rate Limiting
Currently, there are no rate limits implemented on the API endpoints.

## Dependencies
- Flask
- Flask-CORS
- Adafruit IO MQTT Client 