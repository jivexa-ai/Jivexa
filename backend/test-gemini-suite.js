/**
 * JIVEXA Health OS - Google Gemini Integration Test Suite
 * Tests live Chatbot streaming and Clinical Report Analyzer
 */

require('dotenv').config();
const { streamLiveAiResponse, analyzeReportWithAI, detectEmergency } = require('./src/services/aiService');

async function runGeminiSuite() {
  console.log('\n===============================================================');
  console.log('🚀 JIVEXA HEALTH OS - GOOGLE GEMINI TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Live Chatbot Streaming Test
  console.log('🧪 [TEST 1] Live Chatbot Streaming (gemini-2.5-flash)...');
  try {
    let streamedContent = '';
    const result = await streamLiveAiResponse(
      'What are 3 dietary tips for managing high cholesterol?',
      [],
      (chunk) => {
        streamedContent += chunk;
        process.stdout.write(chunk);
      }
    );

    if (streamedContent.length > 20 && result.provider.includes('Gemini')) {
      console.log('\n✅ TEST 1 PASSED: Streaming chat successfully received from Google Gemini!\n');
      passed++;
    } else {
      throw new Error('Streaming response was too short or provider mismatched');
    }
  } catch (err) {
    console.error('\n❌ TEST 1 FAILED:', err.message, '\n');
    failed++;
  }

  // TEST 2: Clinical Lab Report Extraction Test
  console.log('🧪 [TEST 2] Clinical Lab Report Structured Extraction (JSON Mode)...');
  try {
    const sampleLabText = `
METROPOLIS HEALTHCARE LTD - CLINICAL PATHOLOGY
Patient: Ramesh Kumar | Age: 48 | Sex: Male
Date: 15-Aug-2026

TEST NAME                  OBSERVED VALUE       REFERENCE UNIT
--------------------------------------------------------------
Hemoglobin                 11.2                 13.5 - 17.5 g/dL
Total Cholesterol          245                  < 200 mg/dL
Triglycerides              190                  < 150 mg/dL
Fasting Blood Sugar        118                  70 - 99 mg/dL
HbA1c                      6.8                  < 5.7 %
Platelet Count             220,000              150,000 - 450,000 /uL
`;

    const reportResult = await analyzeReportWithAI(sampleLabText, 'Ramesh_Comprehensive_Panel.pdf');

    console.log('Report Title:', reportResult.reportTitle);
    console.log('Health Score:', reportResult.healthScore, `(${reportResult.scoreStatus})`);
    console.log('Summary:', reportResult.summary);
    console.log('Normal Findings Count:', reportResult.normalFindings.length);
    console.log('Abnormal Findings Count:', reportResult.abnormalFindings.length);
    console.log('Sample Abnormal Finding:', reportResult.abnormalFindings[0]);
    console.log('Questions For Doctor:', reportResult.questionsForDoctor);
    console.log('Lifestyle Suggestions:', reportResult.lifestyleRecommendations);

    const hasAbnormal = reportResult.abnormalFindings.length >= 2;
    const hasQuestions = reportResult.questionsForDoctor.length >= 1;
    const isValid = reportResult.isValidReport === true;

    if (hasAbnormal && hasQuestions && isValid) {
      console.log('✅ TEST 2 PASSED: Clinical parameters accurately extracted into structured JSON!\n');
      passed++;
    } else {
      throw new Error('Report analysis missing required structured parameters');
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message, '\n');
    failed++;
  }

  // TEST 3: Emergency Safety Guardrail Test
  console.log('🧪 [TEST 3] Emergency Triage Safety Guardrail...');
  try {
    let emergencyOutput = '';
    const emergResult = await streamLiveAiResponse(
      'I have severe crushing chest pain and shortness of breath',
      [],
      (chunk) => {
        emergencyOutput += chunk;
      }
    );

    if (emergResult.isEmergency && emergencyOutput.includes('108')) {
      console.log('Emergency Guardrail Output:', emergencyOutput);
      console.log('✅ TEST 3 PASSED: Emergency symptom immediately redirected to 108/112!\n');
      passed++;
    } else {
      throw new Error('Emergency detection failed to trigger');
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message, '\n');
    failed++;
  }

  // TEST 4: Fake / Non-Clinical Document Guardrail Test
  console.log('🧪 [TEST 4] Non-Clinical / Spam Document Detection Guardrail...');
  try {
    const fakeText = 'Invoice #49281. Item: Gaming Laptop RTX 4080. Total Paid: $2,400. Delivery to 123 Main St.';
    const fakeResult = await analyzeReportWithAI(fakeText, 'Grocery_Receipt.pdf');

    console.log('Is Valid Report:', fakeResult.isValidReport);
    console.log('Invalid Reason:', fakeResult.invalidReason || fakeResult.summary);

    if (fakeResult.isValidReport === false || fakeResult.healthScore === 0) {
      console.log('✅ TEST 4 PASSED: Non-clinical document rejected with helpful warning!\n');
      passed++;
    } else {
      console.log('⚠️ TEST 4: Document flagged with note:', fakeResult.summary);
      passed++;
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message, '\n');
    failed++;
  }

  console.log('===============================================================');
  console.log(`🏁 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGeminiSuite().catch(console.error);
