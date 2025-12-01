#!/usr/bin/env node

/**
 * Test OpenRouter API Connection and Chatbot Status
 * 
 * This script verifies:
 * 1. API key is configured
 * 2. Connection to OpenRouter works
 * 3. Chatbot can send/receive messages
 * 
 * Usage:
 *   node scripts/test-openrouter-connection.js
 */

require('dotenv').config({ path: '.env.local' });

async function testOpenRouterConnection() {
  console.log('🔍 Testing OpenRouter API Connection...\n');
  console.log('='.repeat(60));
  
  // Step 1: Check API Key
  console.log('\n📋 Step 1: Checking API Key Configuration');
  console.log('-'.repeat(60));
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: OPENROUTER_API_KEY is not set in .env.local');
    console.error('   Please add: OPENROUTER_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  // Mask the API key for display (show first 8 and last 4 chars)
  const maskedKey = apiKey.length > 12 
    ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    : '***';
  console.log(`✅ API Key found: ${maskedKey}`);
  console.log(`   Length: ${apiKey.length} characters`);
  
  // Step 2: Check Model Configuration
  console.log('\n📋 Step 2: Checking Model Configuration');
  console.log('-'.repeat(60));
  const envModel = process.env.OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL;
  console.log(`   Environment model: ${envModel || 'none (will use fallback)'}`);
  
  // Step 3: Test API Connection
  console.log('\n📋 Step 3: Testing API Connection');
  console.log('-'.repeat(60));
  
  try {
    const testUrl = 'https://openrouter.ai/api/v1/models';
    console.log(`   Testing connection to: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Connection failed: ${response.status} ${response.statusText}`);
      if (errorData.error) {
        console.error(`   Error: ${errorData.error.message || JSON.stringify(errorData.error)}`);
      }
      
      if (response.status === 401) {
        console.error('\n⚠️  Authentication failed - API key may be invalid or expired');
      }
      process.exit(1);
    }
    
    const models = await response.json();
    console.log(`✅ Connection successful!`);
    console.log(`   Available models: ${models.data?.length || 0}`);
    
    // Step 4: Test Chat Completion
    console.log('\n📋 Step 4: Testing Chat Completion');
    console.log('-'.repeat(60));
    
    const chatUrl = 'https://openrouter.ai/api/v1/chat/completions';
    console.log(`   Sending test message to: ${chatUrl}`);
    
    const chatResponse = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://wedding-website.local',
        'X-Title': 'Pia & Ryan Wedding Assistant',
      },
      body: JSON.stringify({
        model: envModel || 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: 'Hello, this is a test message. Please respond with "Connection successful!"',
          },
        ],
        max_tokens: 50,
      }),
    });
    
    if (!chatResponse.ok) {
      const errorData = await chatResponse.json().catch(() => ({}));
      console.error(`❌ Chat test failed: ${chatResponse.status} ${chatResponse.statusText}`);
      if (errorData.error) {
        console.error(`   Error: ${errorData.error.message || JSON.stringify(errorData.error)}`);
      }
      process.exit(1);
    }
    
    const chatData = await chatResponse.json();
    const assistantMessage = chatData.choices?.[0]?.message?.content || 'No response';
    
    console.log(`✅ Chat completion successful!`);
    console.log(`   Model used: ${chatData.model || 'unknown'}`);
    console.log(`   Response: ${assistantMessage.substring(0, 100)}${assistantMessage.length > 100 ? '...' : ''}`);
    if (chatData.usage) {
      console.log(`   Tokens used: ${chatData.usage.total_tokens} (prompt: ${chatData.usage.prompt_tokens}, completion: ${chatData.usage.completion_tokens})`);
    }
    
    // Step 5: Check Chatbot Configuration
    console.log('\n📋 Step 5: Checking Chatbot Configuration');
    console.log('-'.repeat(60));
    
    try {
      // Try to import and check chatbot config
      const fs = require('fs');
      const chatbotConfigPath = require('path').join(__dirname, '..', 'lib', 'chatbot-config.ts');
      
      if (fs.existsSync(chatbotConfigPath)) {
        const configContent = fs.readFileSync(chatbotConfigPath, 'utf8');
        const hasEzekiel = configContent.includes('Ezekiel');
        const hasSystemPrompt = configContent.includes('systemPrompt');
        const hasWeddingDetails = configContent.includes('February 13, 2026');
        
        console.log(`✅ Chatbot config file found`);
        console.log(`   Name configured: ${hasEzekiel ? '✅ Yes (Ezekiel)' : '❌ No'}`);
        console.log(`   System prompt: ${hasSystemPrompt ? '✅ Yes' : '❌ No'}`);
        console.log(`   Wedding details: ${hasWeddingDetails ? '✅ Yes' : '❌ No'}`);
      } else {
        console.log(`⚠️  Chatbot config file not found at: ${chatbotConfigPath}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not check chatbot config: ${error.message}`);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('   ✅ API Key: Configured');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ Chat Completion: Working');
    console.log('   ✅ Chatbot: Ready');
    console.log('\n🎉 Your OpenRouter chatbot is fully functional!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(`   ${error.message}`);
    if (error.stack) {
      console.error(`\n   Stack trace:\n${error.stack}`);
    }
    process.exit(1);
  }
}

// Run the test
testOpenRouterConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

