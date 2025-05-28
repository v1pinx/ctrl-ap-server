import { query } from "../config/database.js";
import { paginate, formatResponse } from "../utils/helpers.js";

const getDashboard = async (req, res, next) => {
  try {
    // Get basic statistics
    const stats = await Promise.all([
      query(
        "SELECT COUNT(*) as total_students FROM users WHERE role = $1 AND is_active = true",
        ["student"]
      ),
      query(
        "SELECT COUNT(*) as total_courses FROM courses WHERE is_active = true"
      ),
      query("SELECT COUNT(*) as total_admissions FROM admissions"),
      query(
        "SELECT COUNT(*) as pending_admissions FROM admissions WHERE status = $1",
        ["pending"]
      ),
      query(
        "SELECT COUNT(*) as approved_admissions FROM admissions WHERE status = $1",
        ["approved"]
      ),
    ]);

    // Get recent admissions
    const recentAdmissions = await query(
      `SELECT 
         a.id, a.status, a.applied_at,
         c.name as course_name,
         u.first_name || ' ' || u.last_name as student_name
       FROM admissions a
       JOIN courses c ON a.course_id = c.id
       JOIN users u ON a.student_id = u.id
       ORDER BY a.applied_at DESC
       LIMIT 10`
    );

    const dashboard = {
      statistics: {
        totalStudents: Number.parseInt(stats[0].rows[0].total_students),
        totalCourses: Number.parseInt(stats[1].rows[0].total_courses),
        totalAdmissions: Number.parseInt(stats[2].rows[0].total_admissions),
        pendingAdmissions: Number.parseInt(stats[3].rows[0].pending_admissions),
        approvedAdmissions: Number.parseInt(
          stats[4].rows[0].approved_admissions
        ),
      },
      recentAdmissions: recentAdmissions.rows,
    };

    res.json(
      formatResponse(true, dashboard, "Dashboard data retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = "WHERE role = $1";
    const queryParams = ["student"];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      queryParams
    );
    const totalCount = Number.parseInt(countResult.rows[0].count);

    // Get students
    const studentsResult = await query(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...queryParams, queryLimit, offset]
    );

    const totalPages = Math.ceil(totalCount / queryLimit);

    res.json(
      formatResponse(
        true,
        {
          students: studentsResult.rows,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Students retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getAllAdmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, courseId } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = "WHERE 1=1";
    const queryParams = [];
    let paramCount = 0;

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
    const totalCount = Number.parseInt(countResult.rows[0].count);

    // Get admissions
    const admissionsResult = await query(
      `SELECT 
         a.*,
         c.name as course_name,
         c.department,
         u.first_name || ' ' || u.last_name as student_name,
         u.email as student_email
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
        "Admissions retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export { getDashboard, getAllStudents, getAllAdmissions };
