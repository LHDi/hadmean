/* eslint max-classes-per-file: ["error", 5] */
import { NextApiRequest, NextApiResponse } from "next";

export class CustomError extends Error {
  code: number;

  validations?: Record<string, unknown> = {};

  name: string;

  constructor(code: number, name: string, message = "An Error Occurred") {
    super(message);
    this.code = code;
    this.name = name;
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Resource not found") {
    super(404, "BadRequestError", message);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Access to resource is denied") {
    super(401, "ForbiddenError", message);
  }
}

export class BadRequestError extends CustomError {
  constructor(
    message = "Invalid Request",
    validations: Record<string, unknown> = {}
  ) {
    super(400, "BadRequestError", message);
    this.validations = validations;
  }
}

export const handleResponseError = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) => {
  const baseErrorOptions = {
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof CustomError) {
    return res.status(error.code).json({
      message: error.message,
      statusCode: error.code,
      name: error.name,
      validations: error?.validations,
      ...baseErrorOptions,
    });
  }
  return res
    .status(500)
    .json({ message: error.message, statusCode: 500, ...baseErrorOptions });
};
