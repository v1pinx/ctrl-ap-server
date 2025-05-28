
# Admission Portal API Documentation

## Overview

The Admission Portal API is a comprehensive RESTful API built with Node.js and Express.js for managing student admissions, courses, and administrative functions. The API supports role-based access control with student and admin roles.
## Table of Contents

1.  [Authentication](#authentication)
2.  [Response Format](#response-format)
3.  [Error Handling](#error-handling)
4.  [Rate Limiting](#rate-limiting)
5.  [API Endpoints](#api-endpoints)
    -   [Health Check](#health-check)
    -   [Authentication Routes](#authentication-routes)
    -   [Course Routes](#course-routes)
    -   [Admission Routes](#admission-routes)
    -   [Student Routes](#student-routes)
    -   [Admin Routes](#admin-routes)

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles

-   **student**: Regular users who can apply for admissions and view their profile
-   **admin**: Administrative users with full access to manage courses, view all admissions, and access dashboard

## Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "error": string (only on errors)
}

```

### Pagination Format

For paginated endpoints:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Data retrieved successfully"
}

```

## Error Handling

### HTTP Status Codes

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request
-   `401` - Unauthorized
-   `403` - Forbidden
-   `404` - Not Found
-   `409` - Conflict
-   `500` - Internal Server Error

### Error Response Example

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}

```

## Rate Limiting

Rate limiting is available but currently disabled. When enabled, it limits to 100 requests per 15 minutes per IP address.

----------

## API Endpoints

### Health Check

#### GET /health

Check if the API server is running.

**Authentication:** Not required

**Response:**

```json
{
  "success": true,
  "message": "Admission Portal API is running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "version": "1.0.0"
}

```

----------

## Authentication Routes

### Register User

#### POST /api/auth/register

Register a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1995-05-15",
  "address": "123 Main St, City, State"
}

```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "createdAt": "2025-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}

```

### Login User

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}

```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}

```

----------

## Course Routes

### Get All Courses

#### GET /api/courses

Retrieve all active courses with pagination and filtering.

**Authentication:** Not required

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `search` (optional): Search in course name or description
-   `department` (optional): Filter by department

**Example:** `/api/courses?page=1&limit=5&search=computer&department=engineering`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "name": "Computer Science",
        "description": "Bachelor's degree in Computer Science",
        "department": "Engineering",
        "duration": "4 years",
        "capacity": 100,
        "enrolled_count": 75,
        "fees": 50000,
        "start_date": "2025-09-01",
        "end_date": "2029-06-30",
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Courses retrieved successfully"
}

```

### Get Course by ID

#### GET /api/courses/:id

Retrieve a specific course by ID.

**Authentication:** Not required

**Path Parameters:**

-   `id`: Course ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "name": "Computer Science",
      "description": "Bachelor's degree in Computer Science",
      "department": "Engineering",
      "duration": "4 years",
      "capacity": 100,
      "enrolled_count": 75,
      "fees": 50000,
      "start_date": "2025-09-01",
      "end_date": "2029-06-30",
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2025-01-01T12:00:00.000Z"
    }
  },
  "message": "Course retrieved successfully"
}

```

### Create Course

#### POST /api/courses

Create a new course (Admin only).

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "Data Science",
  "description": "Master's degree in Data Science",
  "department": "Engineering",
  "duration": "2 years",
  "capacity": 50,
  "fees": 75000,
  "startDate": "2025-09-01",
  "endDate": "2027-06-30"
}

```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 2,
      "name": "Data Science",
      "description": "Master's degree in Data Science",
      "department": "Engineering",
      "duration": "2 years",
      "capacity": 50,
      "enrolled_count": 0,
      "fees": 75000,
      "start_date": "2025-09-01",
      "end_date": "2027-06-30",
      "created_by": 1,
      "is_active": true,
      "created_at": "2025-01-01T12:00:00.000Z"
    }
  },
  "message": "Course created successfully"
}

```

### Update Course

#### PUT /api/courses/:id

Update an existing course (Admin only).

**Authentication:** Required (Admin)

**Path Parameters:**

-   `id`: Course ID

**Request Body (partial update allowed):**

```json
{
  "name": "Advanced Data Science",
  "fees": 80000,
  "capacity": 60
}

```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 2,
      "name": "Advanced Data Science",
      "description": "Master's degree in Data Science",
      "department": "Engineering",
      "duration": "2 years",
      "capacity": 60,
      "enrolled_count": 0,
      "fees": 80000,
      "start_date": "2025-09-01",
      "end_date": "2027-06-30",
      "updated_at": "2025-01-01T13:00:00.000Z"
    }
  },
  "message": "Course updated successfully"
}

```

### Delete Course

#### DELETE /api/courses/:id

Soft delete a course (Admin only).

**Authentication:** Required (Admin)

**Path Parameters:**

-   `id`: Course ID

**Response (200):**

```json
{
  "success": true,
  "data": null,
  "message": "Course deleted successfully"
}

```

----------

## Admission Routes

### Apply for Admission

#### POST /api/admissions/apply

Submit an admission application.

**Authentication:** Required (Student)

**Request Body:**

```json
{
  "courseId": 1,
  "personalStatement": "I am passionate about computer science and want to pursue my career in this field...",
  "previousEducation": "Bachelor's in Mathematics from XYZ University",
  "documents": ["transcript.pdf", "recommendation_letter.pdf"]
}

```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "admission": {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "status": "pending",
      "personal_statement": "I am passionate about computer science...",
      "previous_education": "Bachelor's in Mathematics from XYZ University",
      "documents": ["transcript.pdf", "recommendation_letter.pdf"],
      "applied_at": "2025-01-01T12:00:00.000Z"
    }
  },
  "message": "Application submitted successfully"
}

```

### Get Admissions

#### GET /api/admissions

Get admission applications with filtering and pagination.

**Authentication:** Required

-   Students: See only their own applications
-   Admins: See all applications

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `status` (optional): Filter by status (pending, approved, rejected)
-   `courseId` (optional): Filter by course ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "admissions": [
      {
        "id": 1,
        "student_id": 1,
        "course_id": 1,
        "status": "pending",
        "personal_statement": "I am passionate about computer science...",
        "previous_education": "Bachelor's in Mathematics",
        "documents": ["transcript.pdf"],
        "applied_at": "2025-01-01T12:00:00.000Z",
        "course_name": "Computer Science",
        "department": "Engineering",
        "student_name": "John Doe",
        "student_email": "student@example.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Admissions retrieved successfully"
}

```

----------

## Student Routes

### Get Student Profile

#### GET /api/students/profile

Get current student's profile information.

**Authentication:** Required (Student)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "email": "student@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "date_of_birth": "1995-05-15",
      "address": "123 Main St, City, State",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  },
  "message": "Profile retrieved successfully"
}

```

### Get My Admissions

#### GET /api/students/admissions

Get current student's admission applications.

**Authentication:** Required (Student)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "admissions": [
      {
        "id": 1,
        "student_id": 1,
        "course_id": 1,
        "status": "pending",
        "personal_statement": "I am passionate about computer science...",
        "previous_education": "Bachelor's in Mathematics",
        "documents": ["transcript.pdf"],
        "applied_at": "2025-01-01T12:00:00.000Z",
        "course_name": "Computer Science",
        "department": "Engineering",
        "fees": 50000,
        "start_date": "2025-09-01",
        "end_date": "2029-06-30"
      }
    ]
  },
  "message": "Admissions retrieved successfully"
}

```

----------

## Admin Routes

### Get Dashboard

#### GET /api/admin/dashboard

Get administrative dashboard statistics.

**Authentication:** Required (Admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalStudents": 150,
      "totalCourses": 25,
      "totalAdmissions": 200,
      "pendingAdmissions": 45,
      "approvedAdmissions": 120
    },
    "recentAdmissions": [
      {
        "id": 1,
        "status": "pending",
        "applied_at": "2025-01-01T12:00:00.000Z",
        "course_name": "Computer Science",
        "student_name": "John Doe"
      }
    ]
  },
  "message": "Dashboard data retrieved successfully"
}

```

### Get All Students

#### GET /api/admin/students

Get all students with pagination and search.

**Authentication:** Required (Admin)

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `search` (optional): Search in first name, last name, or email

**Response (200):**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "email": "student@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890",
        "date_of_birth": "1995-05-15",
        "is_active": true,
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Students retrieved successfully"
}

```

### Get All Admissions (Admin)

#### GET /api/admin/admissions

Get all admission applications with filtering and pagination.

**Authentication:** Required (Admin)

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10)
-   `status` (optional): Filter by status (pending, approved, rejected)
-   `courseId` (optional): Filter by course ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "admissions": [
      {
        "id": 1,
        "student_id": 1,
        "course_id": 1,
        "status": "pending",
        "personal_statement": "I am passionate about computer science...",
        "previous_education": "Bachelor's in Mathematics",
        "documents": ["transcript.pdf"],
        "applied_at": "2025-01-01T12:00:00.000Z",
        "reviewed_at": null,
        "reviewed_by": null,
        "course_name": "Computer Science",
        "department": "Engineering",
        "student_name": "John Doe",
        "student_email": "student@example.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalCount": 75,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Admissions retrieved successfully"
}

```

----------

## Security Features

-   **Helmet.js**: Security headers protection
-   **CORS**: Cross-origin resource sharing enabled
-   **Rate Limiting**: Configurable request limits (currently disabled)
-   **JWT Authentication**: Secure token-based authentication
-   **Password Hashing**: Secure password storage
-   **SQL Injection Protection**: Parameterized queries
-   **Input Validation**: Request validation middleware
-   **Error Handling**: Centralized error management

## Database Schema

The API works with the following main entities:

-   **users**: User accounts (students and admins)
-   **courses**: Available courses
-   **admissions**: Admission applications linking students to courses

## Logging

All API requests and important operations are logged using a custom logger utility for monitoring and debugging purposes.

## Environment Variables

Required environment variables:

-   `PORT`: Server port (default: 3000)
-   `JWT_SECRET`: Secret key for JWT token generation
-   `DATABASE_URL`: PostgreSQL database connection string
