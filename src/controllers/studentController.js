import { query } from "../config/database.js";
import { formatResponse } from "../utils/helpers.js";
import { AppError } from "../middleware/errorHandler.js";

const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, address, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    res.json(
      formatResponse(
        true,
        { profile: result.rows[0] },
        "Profile retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getMyAdmissions = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
         a.*,
         c.name as course_name,
         c.department,
         c.fees,
         c.start_date,
         c.end_date
       FROM admissions a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    res.json(
      formatResponse(
        true,
        { admissions: result.rows },
        "Admissions retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export { getProfile, getMyAdmissions };
