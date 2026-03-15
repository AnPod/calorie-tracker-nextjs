import {
  calculateBMR,
  calculateTDEE,
  calculateMaintenanceCalories,
  validateTDEEInput,
  type TDEEInput,
} from '../src/lib/tdee-calculator';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertThrows(fn: () => void, message: string) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(`${message}: expected function to throw`);
  }
}

function runTests() {
  console.log('Running TDEE Calculator Tests...\n');

  console.log('Test 1: Calculate BMR for male');
  const maleInput: TDEEInput = { age: 30, gender: 'male', weightKg: 70, heightCm: 175 };
  const maleBMR = calculateBMR(maleInput);
  const expectedMaleBMR = (10 * 70) + (6.25 * 175) - (5 * 30) + 5;
  assertEqual(maleBMR, expectedMaleBMR, 'Male BMR calculation');
  console.log(`  ✓ BMR for 30yo male, 70kg, 175cm: ${maleBMR} kcal`);

  console.log('Test 2: Calculate BMR for female');
  const femaleInput: TDEEInput = { age: 25, gender: 'female', weightKg: 60, heightCm: 165 };
  const femaleBMR = calculateBMR(femaleInput);
  const expectedFemaleBMR = (10 * 60) + (6.25 * 165) - (5 * 25) - 161;
  assertEqual(femaleBMR, expectedFemaleBMR, 'Female BMR calculation');
  console.log(`  ✓ BMR for 25yo female, 60kg, 165cm: ${femaleBMR} kcal`);

  console.log('Test 3: Calculate TDEE with sedentary multiplier');
  const tdee = calculateTDEE(maleInput, 1.2);
  const expectedTDEE = Math.round(maleBMR * 1.2);
  assertEqual(tdee, expectedTDEE, 'TDEE calculation');
  console.log(`  ✓ TDEE (sedentary): ${tdee} kcal`);

  console.log('Test 4: Calculate maintenance calories');
  const maintenance = calculateMaintenanceCalories(maleInput);
  console.log(`  ✓ Maintenance calories: ${maintenance} kcal`);

  console.log('Test 5: Validate valid input');
  const validResult = validateTDEEInput(maleInput);
  assertEqual(validResult.valid, true, 'Valid input validation');
  assertEqual(validResult.errors.length, 0, 'No errors for valid input');
  console.log(`  ✓ Valid input passes validation`);

  console.log('Test 6: Validate invalid age (too young)');
  const youngInput: TDEEInput = { ...maleInput, age: 10 };
  const youngResult = validateTDEEInput(youngInput);
  assertEqual(youngResult.valid, false, 'Young age validation fails');
  console.log(`  ✓ Age 10 fails validation`);

  console.log('Test 7: Validate invalid age (too old)');
  const oldInput: TDEEInput = { ...maleInput, age: 150 };
  const oldResult = validateTDEEInput(oldInput);
  assertEqual(oldResult.valid, false, 'Old age validation fails');
  console.log(`  ✓ Age 150 fails validation`);

  console.log('Test 8: Validate invalid weight (too light)');
  const lightInput: TDEEInput = { ...maleInput, weightKg: 10 };
  const lightResult = validateTDEEInput(lightInput);
  assertEqual(lightResult.valid, false, 'Light weight validation fails');
  console.log(`  ✓ Weight 10kg fails validation`);

  console.log('Test 9: Validate invalid weight (too heavy)');
  const heavyInput: TDEEInput = { ...maleInput, weightKg: 500 };
  const heavyResult = validateTDEEInput(heavyInput);
  assertEqual(heavyResult.valid, false, 'Heavy weight validation fails');
  console.log(`  ✓ Weight 500kg fails validation`);

  console.log('Test 10: Validate invalid height (too short)');
  const shortInput: TDEEInput = { ...maleInput, heightCm: 30 };
  const shortResult = validateTDEEInput(shortInput);
  assertEqual(shortResult.valid, false, 'Short height validation fails');
  console.log(`  ✓ Height 30cm fails validation`);

  console.log('Test 11: Validate invalid height (too tall)');
  const tallInput: TDEEInput = { ...maleInput, heightCm: 300 };
  const tallResult = validateTDEEInput(tallInput);
  assertEqual(tallResult.valid, false, 'Tall height validation fails');
  console.log(`  ✓ Height 300cm fails validation`);

  console.log('Test 12: Validate invalid gender');
  const invalidGenderInput = { ...maleInput, gender: 'other' as 'male' };
  const genderResult = validateTDEEInput(invalidGenderInput as TDEEInput);
  assertEqual(genderResult.valid, false, 'Invalid gender validation fails');
  console.log(`  ✓ Invalid gender fails validation`);

  console.log('Test 13: BMR throws on invalid input');
  const invalidInput: TDEEInput = { age: 0, gender: 'male', weightKg: 70, heightCm: 175 };
  assertThrows(() => calculateBMR(invalidInput), 'BMR throws on age 0');
  console.log(`  ✓ BMR throws on invalid input`);

  console.log('Test 14: Validate NaN weight');
  const nanInput: TDEEInput = { ...maleInput, weightKg: NaN };
  const nanResult = validateTDEEInput(nanInput);
  assertEqual(nanResult.valid, false, 'NaN weight validation fails');
  console.log(`  ✓ NaN weight fails validation`);

  console.log('Test 15: Edge case - minimum valid age');
  const minAgeInput: TDEEInput = { ...maleInput, age: 13 };
  const minAgeResult = validateTDEEInput(minAgeInput);
  assertEqual(minAgeResult.valid, true, 'Age 13 passes validation');
  console.log(`  ✓ Age 13 (minimum) passes validation`);

  console.log('Test 16: Edge case - maximum valid age');
  const maxAgeInput: TDEEInput = { ...maleInput, age: 120 };
  const maxAgeResult = validateTDEEInput(maxAgeInput);
  assertEqual(maxAgeResult.valid, true, 'Age 120 passes validation');
  console.log(`  ✓ Age 120 (maximum) passes validation`);

  console.log('\n✅ All 16 tests passed!\n');
}

runTests();