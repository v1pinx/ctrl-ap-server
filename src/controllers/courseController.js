import { query } from "../config/database.js";
import { paginate, formatResponse } from "../utils/helpers.js";
import { AppError } from "../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";

const getAllCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, department } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let whereClause = "WHERE is_active = true";
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (department) {
      paramCount++;
      whereClause += ` AND department ILIKE $${paramCount}`;
      queryParams.push(`%${department}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM courses ${whereClause}`,
      queryParams
    );
    const totalCount = Number.parseInt(countResult.rows[0].count);

    const coursesResult = await query(
      `SELECT id, name, description, department, duration, capacity, enrolled_count, fees, start_date, end_date, created_at
       FROM courses ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...queryParams, queryLimit, offset]
    );

    const totalPages = Math.ceil(totalCount / queryLimit);

    res.json(
      formatResponse(
        true,
        {
          courses: coursesResult.rows,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Courses retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1 AND c.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError("Course not found", 404);
    }

    res.json(
      formatResponse(
        true,
        { course: result.rows[0] },
        "Course retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const {
      name,
      description,
      department,
      duration,
      capacity,
      fees,
      startDate,
      endDate,
    } = req.body;
    const createdBy = req.user.id;

    const result = await query(
      `INSERT INTO courses (name, description, department, duration, capacity, fees, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        description,
        department,
        duration,
        capacity,
        fees,
        startDate,
        endDate,
        createdBy,
      ]
    );

    logger.info(`Course created: ${name} by ${req.user.email}`);

    res
      .status(201)
      .json(
        formatResponse(
          true,
          { course: result.rows[0] },
          "Course created successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if course exists
    const existingCourse = await query(
      "SELECT id FROM courses WHERE id = $1 AND is_active = true",
      [id]
    );

    if (existingCourse.rows.length === 0) {
      throw new AppError("Course not found", 404);
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id);
    const result = await query(
      `UPDATE courses SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    logger.info(`Course updated: ${id} by ${req.user.email}`);

    res.json(
      formatResponse(
        true,
        { course: result.rows[0] },
        "Course updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existingCourse = await query(
      "SELECT id FROM courses WHERE id = $1 AND is_active = true",
      [id]
    );

    if (existingCourse.rows.length === 0) {
      throw new AppError("Course not found", 404);
    }

    // Soft delete
    await query(
      "UPDATE courses SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    logger.info(`Course deleted: ${id} by ${req.user.email}`);

    res.json(formatResponse(true, null, "Course deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
