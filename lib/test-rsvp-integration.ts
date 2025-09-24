// Test file for RSVP lookup functionality
// This file tests the RSVP lookup utility and integration with the chatbot

import { lookupRSVP, extractRSVPSearchParams, generateRSVPStatusMessage, handleRSVPStatusRequest } from '@/lib/rsvp-lookup';

// Mock test data
const mockRSVPData = [
  {
    guest_name: "John Smith",
    email: "john.smith@example.com",
    attendance: "yes",
    guest_count: 2,
    dietary_restrictions: "Vegetarian",
    special_message: "Looking forward to the celebration!",
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    guest_name: "Sarah Johnson",
    email: "sarah.johnson@example.com", 
    attendance: "yes",
    guest_count: 1,
    dietary_restrictions: null,
    special_message: null,
    wallet_address: null,
    created_at: "2024-01-20T14:45:00Z",
  },
  {
    guest_name: "Michael Brown",
    email: "michael.brown@example.com",
    attendance: "no",
    guest_count: 0,
    dietary_restrictions: null,
    special_message: "Sorry, can't make it due to work commitments.",
    wallet_address: "0x9876543210fedcba9876543210fedcba98765432",
    created_at: "2024-01-25T09:15:00Z",
  },
];

// Test cases
const testCases = [
  {
    name: "Email search - exact match",
    message: "Can you check my RSVP status? My email is john.smith@example.com",
    expectedEmail: "john.smith@example.com",
  },
  {
    name: "Email search - different case",
    message: "Please check if I've RSVP'd with email JOHN.SMITH@EXAMPLE.COM",
    expectedEmail: "john.smith@example.com",
  },
  {
    name: "Name search - exact match",
    message: "Check RSVP status for Sarah Johnson",
    expectedName: "Sarah Johnson",
  },
  {
    name: "Name search - partial match",
    message: "Did Michael RSVP for the wedding?",
    expectedName: "Michael Brown",
  },
  {
    name: "Wallet address search",
    message: "Check my RSVP with wallet address 0x1234567890abcdef1234567890abcdef12345678",
    expectedWallet: "0x1234567890abcdef1234567890abcdef12345678",
  },
  {
    name: "Casual RSVP check",
    message: "Have I registered for the wedding yet?",
    expectedType: "general",
  },
  {
    name: "Multiple search parameters",
    message: "My name is John Smith and my email is john.smith@example.com, can you check if I RSVP'd?",
    expectedEmail: "john.smith@example.com",
    expectedName: "John Smith",
  },
];

// Test functions
export async function testRSVPExtraction() {
  console.log("🧪 Testing RSVP parameter extraction...\n");
  
  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`💬 Message: "${testCase.message}"`);
    
    const params = extractRSVPSearchParams(testCase.message);
    
    console.log("🔍 Extracted parameters:");
    if (params.email) console.log(`   📧 Email: ${params.email}`);
    if (params.name) console.log(`   👤 Name: ${params.name}`);
    if (params.wallet_address) console.log(`   💳 Wallet: ${params.wallet_address}`);
    
    // Validate expectations
    if (testCase.expectedEmail && params.email !== testCase.expectedEmail) {
      console.log(`❌ Expected email: ${testCase.expectedEmail}, got: ${params.email}`);
    } else if (testCase.expectedName && params.name !== testCase.expectedName) {
      console.log(`❌ Expected name: ${testCase.expectedName}, got: ${params.name}`);
    } else if (testCase.expectedWallet && params.wallet_address !== testCase.expectedWallet) {
      console.log(`❌ Expected wallet: ${testCase.expectedWallet}, got: ${params.wallet_address}`);
    } else {
      console.log("✅ Extraction successful!");
    }
    
    console.log("---\n");
  }
}

export async function testRSVPLookup() {
  console.log("🧪 Testing RSVP lookup functionality...\n");
  
  // Test with mock data (in a real implementation, this would hit the database)
  const testEmail = "john.smith@example.com";
  const testName = "Sarah Johnson";
  const testWallet = "0x1234567890abcdef1234567890abcdef12345678";
  
  try {
    // Email lookup test
    console.log("📧 Testing email lookup...");
    const emailResult = await lookupRSVP({ email: testEmail });
    console.log(`Result: ${emailResult.found ? "Found" : "Not found"}`);
    console.log(`Message: ${emailResult.message}`);
    console.log(`Confidence: ${emailResult.confidence}`);
    console.log("---\n");
    
    // Name lookup test
    console.log("👤 Testing name lookup...");
    const nameResult = await lookupRSVP({ name: testName });
    console.log(`Result: ${nameResult.found ? "Found" : "Not found"}`);
    console.log(`Message: ${nameResult.message}`);
    console.log(`Confidence: ${nameResult.confidence}`);
    console.log("---\n");
    
    // Wallet lookup test
    console.log("💳 Testing wallet lookup...");
    const walletResult = await lookupRSVP({ wallet_address: testWallet });
    console.log(`Result: ${walletResult.found ? "Found" : "Not found"}`);
    console.log(`Message: ${walletResult.message}`);
    console.log(`Confidence: ${walletResult.confidence}`);
    console.log("---\n");
    
    // Not found test
    console.log("❌ Testing not found scenario...");
    const notFoundResult = await lookupRSVP({ email: "nonexistent@example.com" });
    console.log(`Result: ${notFoundResult.found ? "Found" : "Not found"}`);
    console.log(`Message: ${notFoundResult.message}`);
    console.log(`Confidence: ${notFoundResult.confidence}`);
    console.log("---\n");
    
  } catch (error) {
    console.error("❌ RSVP lookup test failed:", error);
  }
}

export async function testMessageGeneration() {
  console.log("🧪 Testing message generation...\n");
  
  // Mock result for testing
  const mockResult = {
    found: true,
    rsvp: mockRSVPData[0],
    message: "Found RSVP for John Smith (john.smith@example.com)",
    confidence: "high" as const,
  };
  
  const message = generateRSVPStatusMessage(mockResult);
  console.log("📄 Generated message:");
  console.log(message);
  console.log("---\n");
}

export async function testFullIntegration() {
  console.log("🧪 Testing full integration...\n");
  
  const testMessages = [
    "Can you check my RSVP status? My email is john.smith@example.com",
    "Did Sarah Johnson RSVP for the wedding?",
    "Check my RSVP with wallet 0x1234567890abcdef1234567890abcdef12345678",
    "Have I registered for the wedding?",
  ];
  
  for (const message of testMessages) {
    console.log(`💬 Testing message: "${message}"`);
    
    try {
      const response = await handleRSVPStatusRequest(message);
      console.log("🤖 Response:");
      console.log(response);
    } catch (error) {
      console.error("❌ Integration test failed:", error);
    }
    
    console.log("---\n");
  }
}

// Run all tests
export async function runAllTests() {
  console.log("🎯 Starting RSVP Chatbot Integration Tests\n");
  console.log("=" .repeat(50));
  
  await testRSVPExtraction();
  console.log("=".repeat(50));
  
  await testRSVPLookup();
  console.log("=".repeat(50));
  
  await testMessageGeneration();
  console.log("=".repeat(50));
  
  await testFullIntegration();
  console.log("=".repeat(50));
  
  console.log("✅ All tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}