# Purchase Request (PR) API Documentation

## Overview
This API provides comprehensive functionality for managing Purchase Requests (PRs) in the Vendor Portal system. It includes CRUD operations, workflow management, and advanced features like bulk operations and analytics.

## Base URL
```
http://localhost:3000/api/prs
```

## Authentication
All endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <base64-encoded-token>
```

### Getting Authentication Token
```bash
POST /login
Content-Type: application/json

{
  "email": "buyer@omverro.com",
  "password": "buyer123",
  "role": "buyer"
}
```

Response:
```json
{
  "message": "Login successful",
  "status": "success",
  "token": "YnV5ZXJAb212ZXJyby5jb206YnV5ZXI6MTY5NDUwMDAwMDAwMA==",
  "role": "buyer",
  "email": "buyer@omverro.com"
}
```

## API Endpoints

### 1. Create PR
**POST** `/api/prs`

Creates a new Purchase Request with items, attachments, and approvals.

**Request Body:**
```json
{
  "title": "IT Equipment Procurement",
  "department": "IT",
  "requestor": "John Smith",
  "costCenter": "CC-2025-001",
  "priority": "High",
  "requiredDate": "2025-10-15",
  "estimatedBudget": 150000,
  "currency": "INR",
  "businessJustification": "Need for new development team",
  "preferredVendor": "TechCorp Solutions",
  "vendorContact": "Jane Doe",
  "vendorEmail": "jane@techcorp.com",
  "vendorPhone": "+91-9876543210",
  "vendorNotes": "Preferred vendor for IT equipment",
  "directManager": "Sarah Wilson",
  "financeApprover": "Michael Chen",
  "approverInstructions": "Please review budget allocation",
  "items": [
    {
      "description": "Dell Laptop",
      "category": "IT Hardware",
      "quantity": 5,
      "unit": "Each",
      "unitPrice": 25000,
      "supplier": "Dell India",
      "deliveryDate": "2025-11-01",
      "notes": "High-performance laptops for developers"
    }
  ],
  "attachments": [
    {
      "filename": "vendor_quote.pdf",
      "originalName": "Vendor_Quote.pdf",
      "mimeType": "application/pdf",
      "size": 2048000,
      "path": "/uploads/vendor_quote.pdf",
      "description": "Vendor quotation document",
      "category": "Quote"
    }
  ],
  "approvals": [
    {
      "levelName": "Manager",
      "approver": "Sarah Wilson",
      "approverEmail": "sarah.wilson@company.com",
      "approverDepartment": "IT",
      "dueDate": "2025-09-20",
      "comments": "Please review technical requirements"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "PR created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "prNumber": "PR-2025-001234",
    "title": "IT Equipment Procurement",
    "status": "Draft",
    "items": [...],
    "attachments": [...],
    "approvals": [...]
  }
}
```

### 2. Get PRs (List with Filtering)
**GET** `/api/prs`

Retrieves PRs with optional filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (Draft, Submitted, Approved, Rejected)
- `department`: Filter by department
- `requestor`: Filter by requestor
- `priority`: Filter by priority (Low, Medium, High, Urgent)
- `search`: Search in PR number, title, or justification

**Example:**
```
GET /api/prs?page=1&limit=5&status=Draft&department=IT
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "prNumber": "PR-2025-001234",
      "title": "IT Equipment Procurement",
      "department": "IT",
      "requestor": "John Smith",
      "status": "Draft",
      "estimatedBudget": 150000,
      "createdDate": "2025-09-13T10:00:00.000Z",
      "items": [...],
      "attachments": [...],
      "approvals": [...]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 23,
    "itemsPerPage": 5
  }
}
```

### 3. Get Single PR
**GET** `/api/prs/:id`

Retrieves a specific PR by ID with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "prNumber": "PR-2025-001234",
    "title": "IT Equipment Procurement",
    "department": "IT",
    "status": "Draft",
    "estimatedBudget": 150000,
    "items": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "itemNumber": 1,
        "description": "Dell Laptop",
        "category": "IT Hardware",
        "quantity": 5,
        "unit": "Each",
        "unitPrice": 25000,
        "total": 125000,
        "status": "Pending"
      }
    ],
    "attachments": [...],
    "approvals": [...]
  }
}
```

### 4. Update PR
**PUT** `/api/prs/:id`

Updates an existing PR. Cannot update approved or rejected PRs.

**Request Body:** Same as create PR (partial updates allowed)

### 5. Delete PR
**DELETE** `/api/prs/:id`

Soft deletes a PR. Cannot delete approved PRs.

### 6. Submit PR for Approval
**POST** `/api/prs/:id/submit`

Submits a draft PR for approval workflow.

### 7. Approve PR
**POST** `/api/prs/:id/approve`

Approves a PR at a specific approval level.

**Request Body:**
```json
{
  "level": 1,
  "comments": "Approved for procurement"
}
```

### 8. Reject PR
**POST** `/api/prs/:id/reject`

Rejects a PR with reason.

**Request Body:**
```json
{
  "reason": "Budget constraints"
}
```

### 9. Add Item to PR
**POST** `/api/prs/:id/items`

Adds a new item to an existing PR.

**Request Body:**
```json
{
  "description": "Wireless Mouse",
  "category": "IT Hardware",
  "quantity": 10,
  "unit": "Each",
  "unitPrice": 1500,
  "supplier": "Logitech"
}
```

### 10. Update PR Item
**PUT** `/api/prs/:id/items/:itemId`

Updates a specific item in a PR.

### 11. Remove Item from PR
**DELETE** `/api/prs/:id/items/:itemId`

Removes an item from a PR.

### 12. Add Attachment to PR
**POST** `/api/prs/:id/attachments`

Adds an attachment to a PR.

**Request Body:**
```json
{
  "filename": "specification.pdf",
  "originalName": "Product_Specification.pdf",
  "mimeType": "application/pdf",
  "size": 1536000,
  "path": "/uploads/specification.pdf",
  "description": "Product specifications",
  "category": "Specification"
}
```

### 13. Remove Attachment from PR
**DELETE** `/api/prs/:id/attachments/:attachmentId`

Removes an attachment from a PR.

### 14. Get PR Statistics
**GET** `/api/prs/stats/overview`

Retrieves PR statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPRs": 45,
      "draftPRs": 12,
      "submittedPRs": 15,
      "approvedPRs": 10,
      "rejectedPRs": 8,
      "totalValue": 2500000,
      "avgValue": 55555.56
    },
    "byDepartment": [
      {
        "_id": "IT",
        "count": 15,
        "totalValue": 850000
      }
    ]
  }
}
```

### 15. Bulk Operations

#### Bulk Status Update
**POST** `/api/prs/bulk/status`

Updates status for multiple PRs.

**Request Body:**
```json
{
  "prIds": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"],
  "status": "submit",
  "reason": "Bulk submission"
}
```

#### Bulk Delete
**POST** `/api/prs/bulk/delete`

Deletes multiple PRs.

**Request Body:**
```json
{
  "prIds": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"]
}
```

### 16. Advanced Search
**GET** `/api/prs/search/advanced`

Advanced search with multiple filters.

**Query Parameters:**
- `query`: General search term
- `department`: Department filter
- `status`: Status filter
- `priority`: Priority filter
- `dateFrom`: Start date
- `dateTo`: End date
- `budgetMin`: Minimum budget
- `budgetMax`: Maximum budget
- `requestor`: Requestor filter

### 17. Export PRs
**GET** `/api/prs/export/csv`

Exports PRs to CSV format.

**Query Parameters:**
- `status`: Filter by status
- `department`: Filter by department
- `dateFrom`: Start date
- `dateTo`: End date

### 18. Dashboard Summary
**GET** `/api/prs/dashboard/summary`

Gets dashboard data including status counts, recent PRs, and pending approvals.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Data Models

### PR Status Flow
```
Draft → Submitted → Under Review → Approved/Rejected
```

### Approval Levels
1. Manager
2. Finance
3. Director
4. CEO
5. Department Head
6. Budget Owner
7. Legal
8. Compliance
9. Procurement
10. Executive

### Item Categories
- IT Hardware
- Software
- Office Supplies
- Services
- Equipment
- Maintenance

### Attachment Categories
- Quote
- Specification
- Drawing
- Contract
- Other

## Usage Examples

### JavaScript (Frontend Integration)
```javascript
// Create PR
const createPR = async (prData) => {
  const response = await fetch('/api/prs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(prData)
  });
  return response.json();
};

// Get PRs with filtering
const getPRs = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/prs?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### cURL Examples
```bash
# Create PR
curl -X POST http://localhost:3000/api/prs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Office Supplies",
    "department": "HR",
    "requestor": "John Doe",
    "estimatedBudget": 50000,
    "businessJustification": "Monthly office supplies",
    "items": [{
      "description": "Notebooks",
      "category": "Office Supplies",
      "quantity": 50,
      "unit": "Each",
      "unitPrice": 100
    }]
  }'

# Get PRs
curl -X GET "http://localhost:3000/api/prs?page=1&limit=10&status=Draft" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. **Authentication**: All endpoints require valid Bearer token
2. **Role-based Access**: Some operations require buyer role
3. **Soft Delete**: Deleted PRs are marked as deleted, not physically removed
4. **Validation**: Comprehensive validation on all inputs
5. **Audit Trail**: All changes are logged with user information
6. **Pagination**: List endpoints support pagination
7. **Population**: Related data (items, attachments, approvals) is automatically populated
8. **Error Handling**: Consistent error response format
9. **File Uploads**: Attachments support file uploads with metadata
10. **Workflow**: Complete approval workflow with escalation and delegation
