import { query, getClient } from "../config/database.js";
import { paginate, formatResponse } from "../utils/helpers.js";
import { AppError } from "./../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";

const applyForAdmission = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const { courseId, personalStatement, previousEducation, documents } =
      req.body;
    const studentId = req.user.id;

    // Check if course exists and is active
    const courseResult = await client.query(
      "SELECT id, name, capacity, enrolled_count FROM courses WHERE id = $1 AND is_active = true",
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      throw new AppError("Course not found", 404);
    }

    const course = courseResult.rows[0];

    // Check if student already applied
    const existingApplication = await client.query(
      "SELECT id FROM admissions WHERE student_id = $1 AND course_id = $2",
      [studentId, courseId]
    );

    if (existingApplication.rows.length > 0) {
      throw new AppError("You have already applied for this course", 409);
    }

    // Create admission application
    const admissionResult = await client.query(
      `INSERT INTO admissions (student_id, course_id, personal_statement, previous_education, documents)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, courseId, personalStatement, previousEducation, documents]
    );

    await client.query("COMMIT");

    res
      .status(201)
      .json(
        formatResponse(
          true,
          { admission: admissionResult.rows[0] },
          "Application submitted successfully"
        )
      );
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

const getAdmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, courseId } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = "";
    const queryParams = [];
    let paramCount = 0;

    // Build WHERE clause
    if (req.user.role === "student") {
      paramCount++;
      whereClause += `WHERE a.student_id = $${paramCount}`;
      queryParams.push(req.user.id);
    } else {
      whereClause += "WHERE 1=1";
    }

    if (status) {
      paramCount++;
      whereClause += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (courseId) {
      paramCount++;
      whereClause += ` AND a.course_id = $${paramCount}`;
      queryParams.push(courseId);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM admissions a ${whereClause}`,
      queryParams
    );

    const totalCount = Number(countResult.rows[0].count);

    // Get paginated data
    const admissionsResult = await query(
      `SELECT 
     a.*,
     c.name AS course_name,
     c.department,
     u.first_name || ' ' || u.last_name AS student_name,
     u.email AS student_email
   FROM admissions a
   JOIN courses c ON a.course_id = c.id
   JOIN users u ON a.student_id = u.id
   ${whereClause}
   ORDER BY a.applied_at DESC
   LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...queryParams, queryLimit, offset]
    );

    const totalPages = Math.ceil(totalCount / queryLimit);

    res.json(
      formatResponse(
        true,
        {
          admissions: admissionsResult.rows,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Admissions retrieved successfully",
      ),
    )
  } catch (error) {
    next(error);
  }
};

export { applyForAdmission, getAdmissions };
