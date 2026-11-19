/**
 * Lightweight validation helper for document module schemas.
 *
 * Schema format:
 * {
 *   required: ['title'],
 *   fields: {
 *     title: { type: 'string', minLength: 1 },
 *     sections: { type: 'array' },
 *   }
 * }
 */
export function validateData(data, schema) {
  if (!schema) return { valid: true, errors: [] };

  const errors = [];
  const payload = data && typeof data === 'object' ? data : {};

  if (Array.isArray(schema.required)) {
    for (const field of schema.required) {
      const value = payload[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`Missing required field: "${field}"`);
      }
    }
  }

  if (schema.fields && typeof schema.fields === 'object') {
    for (const [field, rules] of Object.entries(schema.fields)) {
      const value = payload[field];
      if (value === undefined || value === null) continue;

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`Field "${field}" must be an array`);
      } else if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`Field "${field}" must be an object`);
      } else if (rules.type && rules.type !== 'array' && rules.type !== 'object' && typeof value !== rules.type) {
        errors.push(`Field "${field}" must be of type "${rules.type}"`);
      }

      if (typeof value === 'string' && rules.minLength && value.trim().length < rules.minLength) {
        errors.push(`Field "${field}" must be at least ${rules.minLength} characters`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
