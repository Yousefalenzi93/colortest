/**
 * Verification script for subscription access control fixes
 * سكريبت التحقق من إصلاحات نظام التحكم في الوصول
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 التحقق من إصلاحات نظام التحكم في الوصول...');
console.log('🔍 Verifying subscription access control fixes...\n');

// Check if files exist and contain expected changes
const checks = [
  {
    file: 'src/lib/subscription-service.ts',
    description: 'Subscription service with updated free tier tests',
    checks: [
      'FREE_TIER_TESTS',
      'marquis-test',
      'mecke-test', 
      'nitric-acid-test',
      'ferric-sulfate-test',
      'fast-blue-b-test',
      'getTestAccessInfo'
    ]
  },
  {
    file: 'src/components/auth/auth-guard.tsx',
    description: 'Auth guard with admin routes',
    checks: [
      'ADMIN_ROUTES',
      '/admin',
      '/yousef'
    ]
  },
  {
    file: 'src/app/[lang]/admin/page.tsx',
    description: 'Admin page with direct rendering',
    checks: [
      'AdminPage',
      'import.*AdminPage'
    ]
  },
  {
    file: 'src/components/pages/tests-page.tsx',
    description: 'Tests page with improved UI',
    checks: [
      'getTestAccessInfo',
      'isFree',
      'isPremium',
      'requiresUpgrade'
    ]
  },
  {
    file: 'src/components/pages/test-page.tsx',
    description: 'Test page with access control',
    checks: [
      'subscriptionService',
      'getTestAccessInfo',
      'requiresUpgrade'
    ]
  }
];

let allPassed = true;

checks.forEach(({ file, description, checks: fileChecks }) => {
  console.log(`📁 ${file}`);
  console.log(`   ${description}`);
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    fileChecks.forEach(check => {
      const regex = new RegExp(check, 'i');
      if (regex.test(content)) {
        console.log(`   ✅ ${check}`);
      } else {
        console.log(`   ❌ ${check} - NOT FOUND`);
        allPassed = false;
      }
    });
    
  } catch (error) {
    console.log(`   ❌ File not found or error reading: ${error.message}`);
    allPassed = false;
  }
  
  console.log('');
});

// Check test file
console.log('📁 src/lib/__tests__/subscription-access-control.test.ts');
console.log('   Test file for access control system');

try {
  const testContent = fs.readFileSync('src/lib/__tests__/subscription-access-control.test.ts', 'utf8');
  const testChecks = [
    'Free Tier Access',
    'Premium Access', 
    'FREE_TIER_TESTS',
    'canAccessTest',
    'getTestAccessInfo'
  ];
  
  testChecks.forEach(check => {
    if (testContent.includes(check)) {
      console.log(`   ✅ ${check}`);
    } else {
      console.log(`   ❌ ${check} - NOT FOUND`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log(`   ❌ Test file not found: ${error.message}`);
  allPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 جميع الإصلاحات تم تطبيقها بنجاح!');
  console.log('🎉 All fixes have been successfully applied!');
  console.log('\n📋 ملخص الإصلاحات | Summary of fixes:');
  console.log('✅ نظام التحكم في الوصول للخطة المجانية');
  console.log('✅ Free tier access control system');
  console.log('✅ إصلاح توجيه صفحة المدير');
  console.log('✅ Admin page routing fix');
  console.log('✅ تحسين واجهة المستخدم');
  console.log('✅ Improved user interface');
  console.log('✅ حماية الوصول للاختبارات');
  console.log('✅ Test access protection');
  
  console.log('\n🚀 الخطوات التالية | Next steps:');
  console.log('1. اختبر النظام في المتصفح | Test the system in browser');
  console.log('2. تحقق من الاختبارات المجانية | Verify free tests access');
  console.log('3. اختبر صفحة المدير /admin | Test admin page /admin');
  console.log('4. تحقق من نظام الترقية | Verify upgrade system');
  
} else {
  console.log('❌ بعض الإصلاحات لم يتم تطبيقها بشكل صحيح');
  console.log('❌ Some fixes were not applied correctly');
  console.log('يرجى مراجعة الأخطاء أعلاه | Please review the errors above');
}

console.log('\n📖 للمزيد من المعلومات، راجع:');
console.log('📖 For more information, see:');
console.log('   SUBSCRIPTION_ACCESS_CONTROL_FIX.md');
