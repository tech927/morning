import Joi from 'joi';

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    pseudo: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validatePost = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().max(1000).allow(''),
    type: Joi.string().valid('photo', 'video').required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateComment = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    pseudo: Joi.string().min(3).max(20),
    bio: Joi.string().max(500).allow(''),
    password: Joi.string().min(6)
  }).min(1);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
