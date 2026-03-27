import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    // Strip unknown fields automatically
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true  // This removes fields not in schema
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return res.status(400).json({ error: 'Validation failed', errors });
    }
    
    // Replace body with validated and stripped data
    req.body = value;
    next();
  };
};

// Validation Schemas
export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password'
  }),
  organizationName: Joi.string().min(2).required().messages({
    'string.min': 'Organization name must be at least 2 characters long',
    'any.required': 'Organization name is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  sku: Joi.string().min(1).required(),
  description: Joi.string().allow('', null),
  quantityOnHand: Joi.number().integer().min(0).default(0),
  costPrice: Joi.number().min(0).allow(null).positive(),
  sellingPrice: Joi.number().min(0).allow(null).positive(),
  lowStockThreshold: Joi.number().integer().min(0).allow(null)
});

export const stockAdjustmentSchema = Joi.object({
  adjustment: Joi.number().integer().required().messages({
    'any.required': 'Adjustment amount is required'
  }),
  note: Joi.string().allow('', null)
});

export const settingSchema = Joi.object({
  defaultLowStockThreshold: Joi.number().integer().min(0).required().messages({
    'number.min': 'Threshold must be 0 or greater',
    'any.required': 'Default low stock threshold is required'
  })
});