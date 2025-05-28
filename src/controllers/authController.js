import { query } from "../config/database.js";
import {
  comparePassword,
  formatResponse,
  generateToken,
  hashPassword,
} from "../utils/helpers.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";

const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
    } = req.body;

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      throw new AppError("User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, created_at`,
      [email, passwordHash, firstName, lastName, phone, dateOfBirth, address]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    logger.info(`New user registered: ${email}`);
    res.status(201).json(
      formatResponse(
        true,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at,
          },
          token,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      "SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError("Account is deactivated", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }
    const token = generateToken(user.id, user.role);

    logger.info(`User logged in: ${email}`);

    res.json(
      formatResponse(
        true,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
          },
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

export { register, login };
