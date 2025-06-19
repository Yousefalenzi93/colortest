'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  SwatchIcon,
  XMarkIcon,
  CheckIcon,
  DocumentTextIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { databaseColorTestService, GroupedTest } from '@/lib/database-color-test-service';
import { databaseManagementService, DatabaseTestEntry } from '@/lib/database-management-service';
import toast from 'react-hot-toast';

interface TestsManagementProps {
  lang: Language;
}

interface TestFormData {
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

type ModalMode = 'add' | 'edit' | 'view' | null;

export function TestsManagement({ lang }: TestsManagementProps) {
  const [tests, setTests] = useState<GroupedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedTest, setSelectedTest] = useState<TestFormData | null>(null);
  const [formData, setFormData] = useState<TestFormData>({
    id: '',
    method_name: '',
    method_name_ar: '',
    color_result: '',
    color_result_ar: '',
    possible_substance: '',
    possible_substance_ar: '',
    prepare: '',
    prepare_ar: '',
    test_type: '',
    test_number: '',
    reference: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total_tests: 0,
    total_results: 0,
    unique_substances: 0,
    unique_colors: 0
  });
  const [managementStats, setManagementStats] = useState({
    total_tests: 0,
    unique_substances: 0,
    unique_colors: 0,
    test_types: {} as Record<string, number>
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      // Use the database color test service to get tests from DatabaseColorTest.json
      const groupedTests = await databaseColorTestService.getGroupedTests();
      const stats = await databaseColorTestService.getTestsStatistics();

      // Also get management statistics
      const mgmtStats = await databaseManagementService.getStatistics();

      setTests(groupedTests);
      setStatistics(stats);
      setManagementStats(mgmtStats);

      console.log('✅ Loaded database color tests:', groupedTests.length);
      console.log('📊 Statistics:', stats);
      console.log('🔧 Management Statistics:', mgmtStats);

    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('خطأ في تحميل الاختبارات | Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (testName: string) => {
    setShowDetails(showDetails === testName ? null : testName);
  };

  const handleReloadData = async () => {
    setLoading(true);
    try {
      await databaseColorTestService.reloadData();
      await loadTests();
      toast.success(lang === 'ar' ? 'تم تحديث البيانات' : 'Data refreshed');
    } catch (error) {
      console.error('Error reloading data:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحديث البيانات' : 'Error refreshing data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      method_name: '',
      method_name_ar: '',
      color_result: '',
      color_result_ar: '',
      possible_substance: '',
      possible_substance_ar: '',
      prepare: '',
      prepare_ar: '',
      test_type: '',
      test_number: '',
      reference: ''
    });
  };

  const handleAddTest = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      id: `test-${Date.now()}`,
      test_number: `Test ${tests.length + 1}`
    }));
    setModalMode('add');
  };

  const handleEditTest = (test: GroupedTest) => {
    // Convert GroupedTest to TestFormData for editing
    const firstResult = test.results[0];
    setFormData({
      id: test.method_name.toLowerCase().replace(/\s+/g, '-'),
      method_name: test.method_name,
      method_name_ar: test.method_name_ar,
      color_result: firstResult?.color_result || '',
      color_result_ar: firstResult?.color_result_ar || '',
      possible_substance: firstResult?.possible_substance || '',
      possible_substance_ar: firstResult?.possible_substance_ar || '',
      prepare: test.prepare,
      prepare_ar: test.prepare_ar || '',
      test_type: test.test_type,
      test_number: test.test_number,
      reference: test.reference || ''
    });
    setModalMode('edit');
  };

  const handleDeleteTest = (testName: string) => {
    setDeleteConfirm(testName);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      // Find the test to delete by method name
      const testToDelete = tests.find(test => test.method_name === deleteConfirm);
      if (!testToDelete) {
        toast.error(lang === 'ar' ? 'لم يتم العثور على الاختبار' : 'Test not found');
        return;
      }

      // Generate ID for deletion (using the same logic as in edit)
      const testId = testToDelete.method_name.toLowerCase().replace(/\s+/g, '-');
      const success = await databaseManagementService.deleteTest(testId);

      if (success) {
        toast.success(lang === 'ar' ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully');
        setDeleteConfirm(null);
        await loadTests();
      } else {
        toast.error(lang === 'ar' ? 'خطأ في حذف الاختبار' : 'Error deleting test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الاختبار' : 'Error deleting test');
    }
  };

  const handleSaveTest = async () => {
    try {
      // Validate form data using the service
      const errors = databaseManagementService.validateTestData(formData);
      if (errors.length > 0) {
        toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : errors.join(', '));
        return;
      }

      let success = false;

      if (modalMode === 'add') {
        // Add new test
        const { id, ...testDataWithoutId } = formData;
        success = await databaseManagementService.addTest(testDataWithoutId);
      } else if (modalMode === 'edit') {
        // Update existing test
        success = await databaseManagementService.updateTest(formData.id, formData);
      }

      if (success) {
        const message = modalMode === 'add'
          ? (lang === 'ar' ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully')
          : (lang === 'ar' ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully');

        toast.success(message);
        setModalMode(null);
        resetForm();
        await loadTests();
      } else {
        toast.error(lang === 'ar' ? 'خطأ في حفظ الاختبار' : 'Error saving test');
      }
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ الاختبار' : 'Error saving test');
    }
  };

  const handleInputChange = (field: keyof TestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportTests = async () => {
    try {
      const jsonData = await databaseManagementService.exportTests();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chemical-tests-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(lang === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting tests:', error);
      toast.error(lang === 'ar' ? 'خطأ في تصدير البيانات' : 'Error exporting data');
    }
  };

  const handleImportTests = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = await databaseManagementService.importTests(jsonData);

        if (success) {
          toast.success(lang === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully');
          await loadTests();
        } else {
          toast.error(lang === 'ar' ? 'خطأ في استيراد البيانات' : 'Error importing data');
        }
      } catch (error) {
        console.error('Error importing tests:', error);
        toast.error(lang === 'ar' ? 'ملف غير صالح' : 'Invalid file format');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = searchQuery === '' ||
      test.method_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.method_name_ar.includes(searchQuery) ||
      test.results.some(result =>
        result.possible_substance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.possible_substance_ar.includes(searchQuery) ||
        result.color_result.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.color_result_ar.includes(searchQuery)
      );

    const matchesTestType = selectedTestType === 'all' || test.test_type === selectedTestType;

    return matchesSearch && matchesTestType;
  });



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management'}
          </h2>
          <p className="text-muted-foreground">
            {lang === 'ar'
              ? 'عرض وإدارة الاختبارات المستخرجة من النتائج اللونية'
              : 'View and manage tests extracted from color results'
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleAddTest}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test'}</span>
          </Button>
          <Button
            onClick={handleExportTests}
            variant="outline"
            className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تصدير البيانات' : 'Export Data'}</span>
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTests}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file"
            />
            <Button
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse text-purple-600 border-purple-600 hover:bg-purple-50"
              as="label"
              htmlFor="import-file"
            >
              <SwatchIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'استيراد البيانات' : 'Import Data'}</span>
            </Button>
          </div>
          <Button
            onClick={handleReloadData}
            variant="outline"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في الاختبارات والمواد...' : 'Search tests and substances...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع أنواع الاختبارات' : 'All Test Types'}</option>
            <option value="F/L">{lang === 'ar' ? 'F/L - فلورسنت/ضوئي' : 'F/L - Fluorescent/Light'}</option>
            <option value="L">{lang === 'ar' ? 'L - ضوئي' : 'L - Light'}</option>
            <option value="">{lang === 'ar' ? 'غير محدد' : 'Unspecified'}</option>
          </select>
        </div>
        <div className="relative">
          <SwatchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع أنواع الاختبارات' : 'All Test Types'}</option>
            <option value="F/L">{lang === 'ar' ? 'F/L - فلورسنت/ضوئي' : 'F/L - Fluorescent/Light'}</option>
            <option value="L">{lang === 'ar' ? 'L - ضوئي' : 'L - Light'}</option>
            <option value="">{lang === 'ar' ? 'غير محدد' : 'Unspecified'}</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BeakerIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.total_tests}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <SwatchIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'إجمالي النتائج' : 'Total Results'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.total_results}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'المواد الفريدة' : 'Unique Substances'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.unique_substances}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <TagIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'الألوان الفريدة' : 'Unique Colors'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{statistics.unique_colors}</p>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الاختبار' : 'Test'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'رقم الاختبار' : 'Test Number'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'النتائج' : 'Results'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTests.map((test) => (
                <React.Fragment key={test.method_name}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <BeakerIcon className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {lang === 'ar' ? test.method_name_ar : test.method_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {test.test_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        test.test_type === 'F/L' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        test.test_type === 'L' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {test.test_type || (lang === 'ar' ? 'غير محدد' : 'Unspecified')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm font-medium text-foreground">{test.test_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm font-medium text-foreground">{test.total_results}</span>
                        <span className="text-xs text-muted-foreground">
                          {lang === 'ar' ? 'نتيجة' : 'results'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(test.method_name)}
                          className="text-blue-600 hover:text-blue-700"
                          title={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                          className="text-green-600 hover:text-green-700"
                          title={lang === 'ar' ? 'تعديل الاختبار' : 'Edit Test'}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTest(test.method_name)}
                          className="text-red-600 hover:text-red-700"
                          title={lang === 'ar' ? 'حذف الاختبار' : 'Delete Test'}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Details Row */}
                  {showDetails === test.method_name && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">
                            {lang === 'ar' ? 'تفاصيل الاختبار:' : 'Test Details:'}
                          </h4>

                          {/* Test Preparation */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
                            <h5 className="text-sm font-semibold text-foreground mb-2">
                              {lang === 'ar' ? 'خطوات التحضير:' : 'Preparation Steps:'}
                            </h5>
                            <div className="text-sm text-muted-foreground whitespace-pre-line">
                              {lang === 'ar' ? test.prepare_ar || test.prepare : test.prepare}
                            </div>
                          </div>

                          {/* Test Results */}
                          <div>
                            <h5 className="text-sm font-semibold text-foreground mb-3">
                              {lang === 'ar' ? 'النتائج المحتملة:' : 'Possible Results:'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {test.results.map((result, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-border">
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                                    <div className="w-4 h-4 rounded-full border border-gray-300 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                                    <span className="text-sm font-medium text-foreground">
                                      {lang === 'ar' ? result.color_result_ar || result.color_result : result.color_result}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {lang === 'ar' ? result.possible_substance_ar || result.possible_substance : result.possible_substance}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reference */}
                          {test.reference && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                {lang === 'ar' ? 'المرجع العلمي:' : 'Scientific Reference:'}
                              </h5>
                              <div className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                                {test.reference}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredTests.length === 0 && !loading && (
        <div className="text-center py-12">
          <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar'
              ? 'لم يتم العثور على اختبارات تطابق معايير البحث'
              : 'No tests match the search criteria'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Test Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {modalMode === 'add'
                    ? (lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test')
                    : (lang === 'ar' ? 'تعديل الاختبار' : 'Edit Test')
                  }
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalMode(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Names */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground border-b pb-2">
                    {lang === 'ar' ? 'أسماء الاختبار' : 'Test Names'}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'اسم الاختبار (إنجليزي) *' : 'Test Name (English) *'}
                    </label>
                    <input
                      type="text"
                      value={formData.method_name}
                      onChange={(e) => handleInputChange('method_name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Marquis Test"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'اسم الاختبار (عربي) *' : 'Test Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      value={formData.method_name_ar}
                      onChange={(e) => handleInputChange('method_name_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: اختبار ماركيز"
                      required
                    />
                  </div>
                </div>

                {/* Test Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground border-b pb-2">
                    {lang === 'ar' ? 'تفاصيل الاختبار' : 'Test Details'}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
                    </label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => handleInputChange('test_type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{lang === 'ar' ? 'اختر نوع الاختبار' : 'Select Test Type'}</option>
                      <option value="F/L">F/L - {lang === 'ar' ? 'فلورسنت/ضوئي' : 'Fluorescent/Light'}</option>
                      <option value="L">L - {lang === 'ar' ? 'ضوئي' : 'Light'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'رقم الاختبار' : 'Test Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.test_number}
                      onChange={(e) => handleInputChange('test_number', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Test 1"
                    />
                  </div>
                </div>

                {/* Color Results */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground border-b pb-2">
                    {lang === 'ar' ? 'النتائج اللونية' : 'Color Results'}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'النتيجة اللونية (إنجليزي)' : 'Color Result (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.color_result}
                      onChange={(e) => handleInputChange('color_result', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Purple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'النتيجة اللونية (عربي)' : 'Color Result (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.color_result_ar}
                      onChange={(e) => handleInputChange('color_result_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: بنفسجي"
                    />
                  </div>
                </div>

                {/* Possible Substances */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground border-b pb-2">
                    {lang === 'ar' ? 'المواد المحتملة' : 'Possible Substances'}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'المادة المحتملة (إنجليزي)' : 'Possible Substance (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.possible_substance}
                      onChange={(e) => handleInputChange('possible_substance', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., MDMA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'المادة المحتملة (عربي)' : 'Possible Substance (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={formData.possible_substance_ar}
                      onChange={(e) => handleInputChange('possible_substance_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="مثال: إم دي إم إيه"
                    />
                  </div>
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-foreground border-b pb-2">
                  {lang === 'ar' ? 'خطوات التحضير' : 'Preparation Steps'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'خطوات التحضير (إنجليزي)' : 'Preparation Steps (English)'}
                    </label>
                    <textarea
                      value={formData.prepare}
                      onChange={(e) => handleInputChange('prepare', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {lang === 'ar' ? 'خطوات التحضير (عربي)' : 'Preparation Steps (Arabic)'}
                    </label>
                    <textarea
                      value={formData.prepare_ar}
                      onChange={(e) => handleInputChange('prepare_ar', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="1. الخطوة الأولى&#10;2. الخطوة الثانية&#10;3. الخطوة الثالثة"
                    />
                  </div>
                </div>
              </div>

              {/* Scientific Reference */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-1">
                  {lang === 'ar' ? 'المرجع العلمي' : 'Scientific Reference'}
                </label>
                <textarea
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Author, A. (Year). Title. Journal, Volume(Issue), pages."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalMode(null)}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleSaveTest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {modalMode === 'add'
                    ? (lang === 'ar' ? 'إضافة الاختبار' : 'Add Test')
                    : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <h3 className="text-lg font-semibold text-foreground">
                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              {lang === 'ar'
                ? `هل أنت متأكد من حذف الاختبار "${deleteConfirm}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the test "${deleteConfirm}"? This action cannot be undone.`
              }
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {lang === 'ar' ? 'حذف الاختبار' : 'Delete Test'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


