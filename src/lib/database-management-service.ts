/**
 * Database Management Service
 * Handles CRUD operations for chemical tests in DatabaseColorTest.json
 */

export interface DatabaseTestEntry {
  id: string;
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
}

class DatabaseManagementService {
  private readonly DATA_URL = '/data/DatabaseColorTest.json';
  private cachedData: DatabaseTestEntry[] | null = null;

  /**
   * Load all tests from the database
   */
  async loadTests(): Promise<DatabaseTestEntry[]> {
    try {
      if (this.cachedData) {
        return this.cachedData;
      }

      const response = await fetch(this.DATA_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      this.cachedData = Array.isArray(data) ? data : [];
      return this.cachedData;
    } catch (error) {
      console.error('Error loading tests:', error);
      return [];
    }
  }

  /**
   * Add a new test to the database
   */
  async addTest(testData: Omit<DatabaseTestEntry, 'id'>): Promise<boolean> {
    try {
      const tests = await this.loadTests();
      const newTest: DatabaseTestEntry = {
        ...testData,
        id: this.generateId(testData.method_name)
      };

      tests.push(newTest);
      return await this.saveTests(tests);
    } catch (error) {
      console.error('Error adding test:', error);
      return false;
    }
  }

  /**
   * Update an existing test
   */
  async updateTest(id: string, testData: Partial<DatabaseTestEntry>): Promise<boolean> {
    try {
      const tests = await this.loadTests();
      const index = tests.findIndex(test => test.id === id);
      
      if (index === -1) {
        throw new Error(`Test with id ${id} not found`);
      }

      tests[index] = { ...tests[index], ...testData };
      return await this.saveTests(tests);
    } catch (error) {
      console.error('Error updating test:', error);
      return false;
    }
  }

  /**
   * Delete a test from the database
   */
  async deleteTest(id: string): Promise<boolean> {
    try {
      const tests = await this.loadTests();
      const filteredTests = tests.filter(test => test.id !== id);
      
      if (filteredTests.length === tests.length) {
        throw new Error(`Test with id ${id} not found`);
      }

      return await this.saveTests(filteredTests);
    } catch (error) {
      console.error('Error deleting test:', error);
      return false;
    }
  }

  /**
   * Get a test by ID
   */
  async getTestById(id: string): Promise<DatabaseTestEntry | null> {
    try {
      const tests = await this.loadTests();
      return tests.find(test => test.id === id) || null;
    } catch (error) {
      console.error('Error getting test by ID:', error);
      return null;
    }
  }

  /**
   * Search tests by various criteria
   */
  async searchTests(query: string): Promise<DatabaseTestEntry[]> {
    try {
      const tests = await this.loadTests();
      const lowercaseQuery = query.toLowerCase();

      return tests.filter(test => 
        test.method_name.toLowerCase().includes(lowercaseQuery) ||
        test.method_name_ar.includes(query) ||
        test.possible_substance.toLowerCase().includes(lowercaseQuery) ||
        test.possible_substance_ar.includes(query) ||
        test.color_result.toLowerCase().includes(lowercaseQuery) ||
        test.color_result_ar.includes(query)
      );
    } catch (error) {
      console.error('Error searching tests:', error);
      return [];
    }
  }

  /**
   * Get tests statistics
   */
  async getStatistics() {
    try {
      const tests = await this.loadTests();
      const uniqueSubstances = new Set(tests.map(t => t.possible_substance));
      const uniqueColors = new Set(tests.map(t => t.color_result));
      const testTypes = tests.reduce((acc, test) => {
        acc[test.test_type] = (acc[test.test_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_tests: tests.length,
        unique_substances: uniqueSubstances.size,
        unique_colors: uniqueColors.size,
        test_types: testTypes
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total_tests: 0,
        unique_substances: 0,
        unique_colors: 0,
        test_types: {}
      };
    }
  }

  /**
   * Save tests to the database (simulated - in real app would use API)
   */
  private async saveTests(tests: DatabaseTestEntry[]): Promise<boolean> {
    try {
      // In a real application, this would make an API call to save the data
      // For now, we'll simulate success and update the cache
      this.cachedData = tests;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Tests saved successfully (simulated):', tests.length);
      return true;
    } catch (error) {
      console.error('Error saving tests:', error);
      return false;
    }
  }

  /**
   * Generate a unique ID for a test
   */
  private generateId(methodName: string): string {
    const timestamp = Date.now();
    const slug = methodName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `${slug}-${timestamp}`;
  }

  /**
   * Clear cache and reload data
   */
  async reloadData(): Promise<void> {
    this.cachedData = null;
    await this.loadTests();
  }

  /**
   * Validate test data
   */
  validateTestData(testData: Partial<DatabaseTestEntry>): string[] {
    const errors: string[] = [];

    if (!testData.method_name?.trim()) {
      errors.push('Method name (English) is required');
    }

    if (!testData.method_name_ar?.trim()) {
      errors.push('Method name (Arabic) is required');
    }

    if (!testData.color_result?.trim()) {
      errors.push('Color result is required');
    }

    if (!testData.possible_substance?.trim()) {
      errors.push('Possible substance is required');
    }

    if (!testData.prepare?.trim()) {
      errors.push('Preparation steps are required');
    }

    if (testData.test_type && !['F/L', 'L'].includes(testData.test_type)) {
      errors.push('Test type must be either F/L or L');
    }

    return errors;
  }

  /**
   * Export tests data as JSON
   */
  async exportTests(): Promise<string> {
    try {
      const tests = await this.loadTests();
      return JSON.stringify(tests, null, 2);
    } catch (error) {
      console.error('Error exporting tests:', error);
      return '[]';
    }
  }

  /**
   * Import tests data from JSON
   */
  async importTests(jsonData: string): Promise<boolean> {
    try {
      const tests = JSON.parse(jsonData);
      if (!Array.isArray(tests)) {
        throw new Error('Invalid JSON format: expected array');
      }

      // Validate each test entry
      for (const test of tests) {
        const errors = this.validateTestData(test);
        if (errors.length > 0) {
          throw new Error(`Invalid test data: ${errors.join(', ')}`);
        }
      }

      return await this.saveTests(tests);
    } catch (error) {
      console.error('Error importing tests:', error);
      return false;
    }
  }
}

export const databaseManagementService = new DatabaseManagementService();
