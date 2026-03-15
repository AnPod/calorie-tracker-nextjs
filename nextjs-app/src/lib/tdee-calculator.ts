const VALIDATION_LIMITS = {
  age: { min: 13, max: 120 },
  weightKg: { min: 20, max: 300 },
  heightCm: { min: 50, max: 250 },
} as const;

export type Gender = 'male' | 'female';

export interface TDEEInput {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
}

export interface TDEEValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTDEEInput(input: TDEEInput): TDEEValidationResult {
  const errors: string[] = [];

  if (!['male', 'female'].includes(input.gender)) {
    errors.push('Gender must be "male" or "female"');
  }

  if (!Number.isFinite(input.age) || input.age < VALIDATION_LIMITS.age.min || input.age > VALIDATION_LIMITS.age.max) {
    errors.push(`Age must be between ${VALIDATION_LIMITS.age.min} and ${VALIDATION_LIMITS.age.max}`);
  }

  if (!Number.isFinite(input.weightKg) || input.weightKg < VALIDATION_LIMITS.weightKg.min || input.weightKg > VALIDATION_LIMITS.weightKg.max) {
    errors.push(`Weight must be between ${VALIDATION_LIMITS.weightKg.min}kg and ${VALIDATION_LIMITS.weightKg.max}kg`);
  }

  if (!Number.isFinite(input.heightCm) || input.heightCm < VALIDATION_LIMITS.heightCm.min || input.heightCm > VALIDATION_LIMITS.heightCm.max) {
    errors.push(`Height must be between ${VALIDATION_LIMITS.heightCm.min}cm and ${VALIDATION_LIMITS.heightCm.max}cm`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateBMR(input: TDEEInput): number {
  const validation = validateTDEEInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
  }

  const { age, gender, weightKg, heightCm } = input;

  if (gender === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

export function calculateTDEE(input: TDEEInput, activityMultiplier: number = 1.2): number {
  const bmr = calculateBMR(input);
  return Math.round(bmr * activityMultiplier);
}

export function calculateMaintenanceCalories(input: TDEEInput): number {
  return calculateTDEE(input, 1.2);
}