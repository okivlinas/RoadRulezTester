
# API Documentation

This document provides an overview of the backend API endpoints and their usage for the quiz application.

## Authentication

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

### POST /api/auth/login

Log in an existing user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

### GET /api/auth/me

Get the current user's information.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Users

### GET /api/users

Get a list of all users (admin only).

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- search (optional): Filter users by name or email
- role (optional): Filter users by role
- page (optional): Page number for pagination
- limit (optional): Items per page for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    ],
    "totalCount": 0
  }
}
```

### PUT /api/users/:id/role

Update a user's role (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "role": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### DELETE /api/users/:id

Delete a user (admin only).

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": null
}
```

## Tests

### GET /api/tests

Get a list of all tests/topics.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- search (optional): Filter by title or description
- mode (optional): Filter by test mode
- page (optional): Page number for pagination
- limit (optional): Items per page for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "questionCount": 0,
        "mode": "string",
        "imageBase64": "string"
      }
    ],
    "totalCount": 0
  }
}
```

### GET /api/tests/:id

Get a specific test by ID.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "questionCount": 0,
    "mode": "string",
    "imageBase64": "string"
  }
}
```

### POST /api/tests

Create a new test (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "questionCount": 0,
  "mode": "string",
  "imageBase64": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "questionCount": 0,
    "mode": "string",
    "imageBase64": "string"
  }
}
```

### PUT /api/tests/:id

Update a test (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "questionCount": 0,
  "mode": "string",
  "imageBase64": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "questionCount": 0,
    "mode": "string",
    "imageBase64": "string"
  }
}
```

### DELETE /api/tests/:id

Delete a test (admin only).

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": null
}
```

## Questions

### GET /api/questions

Get a list of questions.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- testId (optional): Filter by test ID
- search (optional): Filter by question text
- page (optional): Page number for pagination
- limit (optional): Items per page for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "string",
        "text": "string",
        "imageBase64": "string",
        "options": [
          {
            "_id": "string",
            "text": "string",
            "isCorrect": true
          }
        ],
        "explanation": "string",
        "testId": "string",
        "isMultipleChoice": false
      }
    ],
    "totalCount": 0
  }
}
```

### GET /api/questions/:id

Get a specific question by ID.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "text": "string",
    "imageBase64": "string",
    "options": [
      {
        "_id": "string",
        "text": "string",
        "isCorrect": true
      }
    ],
    "explanation": "string",
    "testId": "string",
    "isMultipleChoice": false
  }
}
```

### GET /api/questions/random

Get random questions for practice mode.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- count: Number of questions to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "text": "string",
      "imageBase64": "string",
      "options": [
        {
          "_id": "string",
          "text": "string",
          "isCorrect": true
        }
      ],
      "explanation": "string",
      "testId": "string",
      "isMultipleChoice": false
    }
  ]
}
```

### POST /api/questions

Create a new question (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "text": "string",
  "imageBase64": "string (optional)",
  "options": [
    {
      "id": "string",
      "text": "string",
      "isCorrect": true
    }
  ],
  "explanation": "string",
  "testId": "string (optional)",
  "isMultipleChoice": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "text": "string",
    "imageBase64": "string",
    "options": [
      {
        "_id": "string",
        "text": "string",
        "isCorrect": true
      }
    ],
    "explanation": "string",
    "testId": "string",
    "isMultipleChoice": false
  }
}
```

### PUT /api/questions/:id

Update a question (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "text": "string",
  "imageBase64": "string (optional)",
  "options": [
    {
      "id": "string",
      "text": "string",
      "isCorrect": true
    }
  ],
  "explanation": "string",
  "testId": "string (optional)",
  "isMultipleChoice": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "text": "string",
    "imageBase64": "string",
    "options": [
      {
        "_id": "string",
        "text": "string",
        "isCorrect": true
      }
    ],
    "explanation": "string",
    "testId": "string",
    "isMultipleChoice": false
  }
}
```

### DELETE /api/questions/:id

Delete a question (admin only).

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": null
}
```

### POST /api/questions/upload-image

Upload an image for a question (admin only).

**Headers:**
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Request Body:**
- image: File

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "string"
  }
}
```

## Results

### GET /api/results

Get the current user's test results.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- mode (optional): Filter by test mode
- startDate (optional): Filter by start date
- endDate (optional): Filter by end date
- page (optional): Page number for pagination
- limit (optional): Items per page for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "string",
        "userId": "string",
        "testMode": "string",
        "date": "string",
        "totalQuestions": 0,
        "correctAnswers": 0,
        "score": 0,
        "passed": true,
        "timeSpent": 0,
        "answers": [
          {
            "questionId": "string",
            "selectedOptionId": "string",
            "isCorrect": true
          }
        ]
      }
    ],
    "totalCount": 0
  }
}
```

### GET /api/results/latest

Get the user's latest test result.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- mode (optional): Filter by test mode ('practice', 'thematic', or 'exam')

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": "string",
    "testMode": "string",
    "date": "string",
    "totalQuestions": 0,
    "correctAnswers": 0,
    "score": 0,
    "passed": true,
    "timeSpent": 0,
    "answers": [
      {
        "questionId": "string",
        "selectedOptionId": "string",
        "isCorrect": true
      }
    ]
  }
}
```

### GET /api/results/stats

Get the current user's test statistics.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- mode (optional): Filter by test mode or 'all'
- startDate (optional): Filter by start date
- endDate (optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTests": 0,
    "averageScore": 0,
    "correctAnswerPercentage": 0,
    "testsPassed": 0
  }
}
```

### POST /api/results

Create a new test result.

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "testMode": "string",
  "totalQuestions": 0,
  "correctAnswers": 0,
  "score": 0,
  "passed": true,
  "timeSpent": 0,
  "date": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedOptionId": "string",
      "isCorrect": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": "string",
    "testMode": "string",
    "date": "string",
    "totalQuestions": 0,
    "correctAnswers": 0,
    "score": 0,
    "passed": true,
    "timeSpent": 0,
    "answers": [
      {
        "questionId": "string",
        "selectedOptionId": "string",
        "isCorrect": true
      }
    ]
  }
}
```

## Exam Settings

### GET /api/settings/exam

Get exam settings.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": {
    "timeLimit": 0,
    "questionCount": 0,
    "passingScore": 0
  }
}
```

### PUT /api/settings/exam

Update exam settings (admin only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "timeLimit": 0,
  "questionCount": 0,
  "passingScore": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeLimit": 0,
    "questionCount": 0,
    "passingScore": 0
  }
}
```

## Health Check

### GET /health

Check the API server health.

**Response:**
```json
{
  "success": true
}
```
