const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
let authToken = '';

// Test user credentials
const testUser = {
  email: 'buyer@omverro.com',
  password: 'buyer123',
  role: 'buyer'
};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const runTests = async () => {
  console.log('🚀 Starting PR API Tests...\n');

  // 1. Login
  console.log('1. 🔐 Logging in...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/login`, testUser);
    if (loginResponse.data.status === 'success') {
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log('📧 User:', loginResponse.data.email);
      console.log('👤 Role:', loginResponse.data.role);
    } else {
      console.log('❌ Login failed');
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. Create a new PR
  console.log('2. 📝 Creating a new PR...');
  const prData = {
    title: 'Test PR - Office Supplies',
    department: 'HR',
    requestor: 'John Smith',
    costCenter: 'CC-2025-001',
    priority: 'Medium',
    requiredDate: '2025-10-15',
    estimatedBudget: 25000,
    currency: 'INR',
    businessJustification: 'Monthly office supplies for Q4',
    preferredVendor: 'Office Depot',
    vendorContact: 'Jane Doe',
    vendorEmail: 'jane@officedepot.com',
    vendorPhone: '+91-9876543210',
    directManager: 'Sarah Wilson',
    financeApprover: 'Michael Chen',
    items: [
      {
        description: 'A4 Notebooks',
        category: 'Office Supplies',
        quantity: 50,
        unit: 'Each',
        unitPrice: 120,
        supplier: 'Local Supplier',
        notes: 'Standard office notebooks'
      },
      {
        description: 'Blue Pens',
        category: 'Office Supplies',
        quantity: 100,
        unit: 'Each',
        unitPrice: 25,
        supplier: 'Local Supplier',
        notes: 'Blue ink pens'
      }
    ],
    attachments: [
      {
        filename: 'vendor_quote.pdf',
        originalName: 'Vendor_Quote.pdf',
        mimeType: 'application/pdf',
        size: 2048000,
        path: '/uploads/vendor_quote.pdf',
        description: 'Vendor quotation for office supplies',
        category: 'Quote'
      }
    ],
    approvals: [
      {
        levelName: 'Manager',
        approver: 'Sarah Wilson',
        approverEmail: 'sarah.wilson@company.com',
        approverDepartment: 'HR',
        dueDate: '2025-09-20',
        comments: 'Please review office supplies requirements'
      },
      {
        levelName: 'Finance',
        approver: 'Michael Chen',
        approverEmail: 'michael.chen@company.com',
        approverDepartment: 'Finance',
        dueDate: '2025-09-25',
        comments: 'Please verify budget allocation'
      }
    ]
  };

  const createResponse = await apiRequest('POST', '/api/prs', prData);
  if (createResponse?.success) {
    console.log('✅ PR created successfully');
    console.log('🆔 PR Number:', createResponse.data.prNumber);
    console.log('📊 Status:', createResponse.data.status);
    console.log('💰 Budget:', createResponse.data.estimatedBudget);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. Get PRs list
  console.log('3. 📋 Getting PRs list...');
  const prsResponse = await apiRequest('GET', '/api/prs?page=1&limit=5');
  if (prsResponse?.success) {
    console.log('✅ PRs retrieved successfully');
    console.log('📊 Total PRs:', prsResponse.pagination.totalItems);
    console.log('📄 Current Page:', prsResponse.pagination.currentPage);
    console.log('📋 PRs on this page:', prsResponse.data.length);

    if (prsResponse.data.length > 0) {
      console.log('\n📝 Recent PRs:');
      prsResponse.data.forEach((pr, index) => {
        console.log(`${index + 1}. ${pr.prNumber} - ${pr.title} (${pr.status})`);
      });
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. Get PR statistics
  console.log('4. 📊 Getting PR statistics...');
  const statsResponse = await apiRequest('GET', '/api/prs/stats/overview');
  if (statsResponse?.success) {
    console.log('✅ Statistics retrieved successfully');
    const overview = statsResponse.data.overview;
    console.log('📈 Total PRs:', overview.totalPRs || 0);
    console.log('📝 Draft PRs:', overview.draftPRs || 0);
    console.log('📤 Submitted PRs:', overview.submittedPRs || 0);
    console.log('✅ Approved PRs:', overview.approvedPRs || 0);
    console.log('❌ Rejected PRs:', overview.rejectedPRs || 0);
    console.log('💰 Total Value:', overview.totalValue ? `₹${overview.totalValue.toLocaleString()}` : '₹0');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 5. Get dashboard summary
  console.log('5. 📊 Getting dashboard summary...');
  const dashboardResponse = await apiRequest('GET', '/api/prs/dashboard/summary');
  if (dashboardResponse?.success) {
    console.log('✅ Dashboard data retrieved successfully');
    console.log('📈 Status Counts:');
    dashboardResponse.data.statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    console.log('\n📝 Recent PRs:', dashboardResponse.data.recentPRs.length);
    console.log('⏳ Pending Approvals:', dashboardResponse.data.pendingApprovals.length);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 6. Advanced search example
  console.log('6. 🔍 Testing advanced search...');
  const searchResponse = await apiRequest('GET', '/api/prs/search/advanced?department=HR&status=Draft&page=1&limit=3');
  if (searchResponse?.success) {
    console.log('✅ Advanced search successful');
    console.log('📊 Results found:', searchResponse.data.length);
    if (searchResponse.data.length > 0) {
      console.log('📝 Search results:');
      searchResponse.data.forEach((pr, index) => {
        console.log(`${index + 1}. ${pr.prNumber} - ${pr.title} (${pr.department})`);
      });
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 7. Test with a specific PR (if we have one)
  if (createResponse?.data?._id) {
    const prId = createResponse.data._id;
    console.log('7. 📋 Getting specific PR details...');

    const prDetailsResponse = await apiRequest('GET', `/api/prs/${prId}`);
    if (prDetailsResponse?.success) {
      console.log('✅ PR details retrieved successfully');
      const pr = prDetailsResponse.data;
      console.log('🆔 PR Number:', pr.prNumber);
      console.log('📝 Title:', pr.title);
      console.log('🏢 Department:', pr.department);
      console.log('👤 Requestor:', pr.requestor);
      console.log('📊 Status:', pr.status);
      console.log('💰 Budget:', pr.estimatedBudget);
      console.log('📦 Items:', pr.items?.length || 0);
      console.log('📎 Attachments:', pr.attachments?.length || 0);
      console.log('✅ Approvals:', pr.approvals?.length || 0);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 8. Add an item to the PR
    console.log('8. ➕ Adding item to PR...');
    const newItem = {
      description: 'Red Pens',
      category: 'Office Supplies',
      quantity: 50,
      unit: 'Each',
      unitPrice: 30,
      supplier: 'Local Supplier',
      notes: 'Red ink pens for marking'
    };

    const addItemResponse = await apiRequest('POST', `/api/prs/${prId}/items`, newItem);
    if (addItemResponse?.success) {
      console.log('✅ Item added successfully');
      console.log('📦 Total items now:', addItemResponse.data.items?.length || 0);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 9. Submit PR for approval
    console.log('9. 📤 Submitting PR for approval...');
    const submitResponse = await apiRequest('POST', `/api/prs/${prId}/submit`);
    if (submitResponse?.success) {
      console.log('✅ PR submitted successfully');
      console.log('📊 New status:', submitResponse.data.status);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 All tests completed!');
  console.log('\n📚 API Documentation: Check server/README.md');
  console.log('🔗 Base URL:', BASE_URL);
  console.log('🔑 Auth Token:', authToken ? 'Set' : 'Not set');
};

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, apiRequest };
