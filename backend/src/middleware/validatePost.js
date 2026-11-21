export const validatePost = (req, res, next) => {
  const { title, content } = req.body;

  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Title is required and must not be empty");
  } else if (title.trim().length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    errors.push("Content is required and must not be empty");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
