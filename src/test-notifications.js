// Test file for notification system
// This file can be used to test notification functionality

// Mock notification data for testing
export const mockNotifications = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    type: "transaction_created",
    category: "transaction",
    title: "New Transaction Created",
    message: "Your escrow transaction for 'Web Development Services' has been created successfully. Waiting for seller to accept.",
    isRead: false,
    createdAt: "2026-04-03T14:27:40.916Z",
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    type: "payment_received",
    category: "payment",
    title: "Payment Received",
    message: "You have received ₦50,000 from John Doe for transaction #12345.",
    isRead: false,
    createdAt: "2026-04-03T13:15:30.123Z",
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    type: "dispute_opened",
    category: "dispute",
    title: "Dispute Opened",
    message: "A dispute has been opened for transaction #12344. Please review and respond.",
    isRead: true,
    createdAt: "2026-04-03T12:00:00.000Z",
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    type: "account_verified",
    category: "account",
    title: "Account Verified",
    message: "Your BVN verification has been completed successfully. You can now use all platform features.",
    isRead: true,
    createdAt: "2026-04-02T10:30:00.000Z",
  },
];

// Mock API responses for testing
export const mockApiResponses = {
  getNotifications: {
    success: true,
    data: mockNotifications,
  },
  getUnreadCount: {
    success: true,
    data: { unreadCount: 2 },
  },
  getPreferences: {
    success: true,
    data: {
      emailEnabled: true,
      emailTransactions: true,
      emailPayments: true,
      emailDisputes: true,
      inAppEnabled: true,
      inAppTransactions: true,
      inAppPayments: true,
      inAppDisputes: true,
    },
  },
};

// Test function to validate notification system
export function testNotificationSystem() {
  console.log("🔔 Testing Notification System");
  console.log("================================");
  
  // Test 1: Check mock data structure
  console.log("✅ Test 1: Mock data structure");
  console.log("Notifications:", mockNotifications.length);
  console.log("Unread count:", mockNotifications.filter(n => !n.isRead).length);
  
  // Test 2: Check category distribution
  console.log("\n✅ Test 2: Category distribution");
  const categories = {};
  mockNotifications.forEach(n => {
    categories[n.category] = (categories[n.category] || 0) + 1;
  });
  console.log("Categories:", categories);
  
  // Test 3: Check time formatting
  console.log("\n✅ Test 3: Time formatting");
  mockNotifications.forEach(n => {
    console.log(`${n.title}: ${new Date(n.createdAt).toLocaleString()}`);
  });
  
  console.log("\n🎉 All tests completed!");
  console.log("\nTo test the UI:");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Login to the application");
  console.log("3. Check the notification bell in the header");
  console.log("4. Navigate to /notifications for the full page");
  console.log("5. Test preferences in Settings page");
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && typeof module !== 'undefined') {
  testNotificationSystem();
}
