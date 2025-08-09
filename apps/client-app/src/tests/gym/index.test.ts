// Test index file for gym functionality
// This file imports and runs all gym-related tests

// Import all test files
import './GymDirectory.test';
import './GymDetail.test';
import './GymMap.test';
import './gymService.test';

// Test configuration
describe('Gym Discovery Test Suite', () => {
  beforeAll(() => {
    // Setup global test environment
    console.log('Starting Gym Discovery Test Suite...');
  });

  afterAll(() => {
    // Cleanup global test environment
    console.log('Gym Discovery Test Suite completed.');
  });

  // This is just a placeholder - actual tests are in individual files
  test('Test suite is properly configured', () => {
    expect(true).toBe(true);
  });
}); 