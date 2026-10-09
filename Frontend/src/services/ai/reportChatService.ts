import { AIReportAnalysisResult, ReportParameter } from '../../types';

export interface StructuredSection {
  directAnswer: string;
  explanation?: string;
  lifestyleAdvice?: string[];
  doctorAdvice?: string[];
  disclaimer?: string;
}

export interface ReportChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sections?: StructuredSection;
}

export const AI_PROVIDER_MODE: 'MOCK_LOCAL' | 'GEMINI_EXTERNAL' = 'MOCK_LOCAL';

const STANDARD_DISCLAIMER =
  'AI-generated information is for educational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.';

/**
 * Report-Specific Conversational AI Engine with Structured Section Cards
 */
export const sendReportChatMessage = async (
  reportContext: AIReportAnalysisResult,
  userQuery: string,
  messageHistory: ReportChatMessage[] = []
): Promise<ReportChatMessage> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const q = userQuery.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const allParams: ReportParameter[] = reportContext.normalFindings
    .concat(reportContext.abnormalFindings, reportContext.attentionParameters);

  const findParam = (keywords: string[]) => {
    return allParams.find((p) => keywords.some((kw) => p.name.toLowerCase().includes(kw)));
  };

  let sections: StructuredSection;

  // 1. "Do I need medicine?"
  if (q.includes('medicine') || q.includes('medication') || q.includes('prescription') || q.includes('drug')) {
    const abnormalList = reportContext.abnormalFindings.concat(reportContext.attentionParameters);
    const names = abnormalList.map((p) => `${p.name} (${p.value})`).join(', ');

    sections = {
      directAnswer: 'Only a licensed physician can prescribe or evaluate prescription medication based on your clinical history and lab results.',
      explanation: abnormalList.length > 0
        ? `Based on your ${reportContext.reportTitle}, parameters requiring clinical review include ${names}. Mild deviations are often managed first with targeted dietary improvements and physical activity before medication is considered.`
        : `All detected parameters in your ${reportContext.reportTitle} fall within normal reference targets. Lifestyle maintenance is usually sufficient.`,
      lifestyleAdvice: [
        'Do not start or stop any medication without medical supervision.',
        'Discuss these lab values during your next doctor appointment to determine if dietary supplements (like Iron) or prescriptions are necessary.'
      ],
      doctorAdvice: [
        'Schedule a routine follow-up with your doctor.',
        'Share this analyzed report with your practitioner using the button above.'
      ],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 2. "Is this dangerous?"
  else if (q.includes('dangerous') || q.includes('critical') || q.includes('serious') || q.includes('emergency') || q.includes('scared')) {
    sections = {
      directAnswer: `Your overall report health score is ${reportContext.healthScore}/100 (${reportContext.scoreStatus}). ${reportContext.healthScore >= 80 ? 'This indicates a generally healthy report without acute abnormalities.' : 'Some values fall outside standard targets and require routine clinical attention, but this does not automatically indicate an emergency.'}`,
      explanation: 'Laboratory parameters fluctuate naturally based on hydration, recent meals, exercise, and stress levels. Mildly abnormal values are common and highly manageable.',
      lifestyleAdvice: [
        'Schedule a routine consultation with your doctor to review preventative adjustments.',
        'Emergency Notice: If you experience chest tightness, shortness of breath, severe dizziness, or sudden weakness, seek emergency medical care immediately.'
      ],
      doctorAdvice: [
        'Bring this report summary to your doctor visit.'
      ],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 3. "What foods should I eat?" / Dietary advice
  else if (q.includes('food') || q.includes('eat') || q.includes('diet') || q.includes('nutrition') || q.includes('meal')) {
    const dietaryTips: string[] = [];
    const hb = findParam(['hemoglobin', 'haemoglobin']);
    if (hb && hb.status === 'Abnormal') {
      dietaryTips.push(`For Hemoglobin (${hb.value}): Increase iron-rich foods (spinach, lentils, beetroot, pomegranates) paired with Vitamin C (citrus fruits).`);
    }
    const ldl = findParam(['ldl', 'cholesterol']);
    if (ldl && (ldl.status === 'Abnormal' || ldl.status === 'Attention')) {
      dietaryTips.push(`For Cholesterol (${ldl.value}): Reduce saturated fats (fried foods, butter) and add soluble fiber (oats, chia seeds, almonds).`);
    }
    const sugar = findParam(['glucose', 'hba1c', 'sugar']);
    if (sugar && (sugar.status === 'Abnormal' || sugar.status === 'Attention')) {
      dietaryTips.push(`For Blood Sugar (${sugar.value}): Swap refined sugars and white flour with complex whole grains (quinoa, oats, legumes).`);
    }
    if (dietaryTips.length === 0) {
      dietaryTips.push('Maintain a balanced diet rich in leafy greens, whole grains, lean proteins, and stay well-hydrated (2.5 - 3 liters daily).');
    }

    sections = {
      directAnswer: `Here are dietary recommendations tailored specifically to your ${reportContext.reportTitle} findings:`,
      explanation: 'Targeted nutrition helps optimize metabolic parameters, blood glucose regulation, and lipid balance.',
      lifestyleAdvice: dietaryTips,
      doctorAdvice: ['Consult a registered clinical dietitian for a personalized meal plan.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 4. "Can I exercise?"
  else if (q.includes('exercise') || q.includes('workout') || q.includes('gym') || q.includes('walking') || q.includes('activity')) {
    sections = {
      directAnswer: 'Yes, moderate physical activity (such as brisk walking, swimming, or cycling for 30 minutes 5 days a week) is safe and highly beneficial.',
      explanation: 'Regular exercise improves cardiovascular endurance, enhances protective HDL cholesterol, and aids glucose clearance in muscle cells.',
      lifestyleAdvice: [
        'Start with brisk 20–30 minute daily walking sessions.',
        'Maintain good hydration before and after workouts.',
        'Stop immediately if you experience dizziness, shortness of breath, or chest discomfort.'
      ],
      doctorAdvice: ['Discuss high-intensity training with your doctor before starting heavy routines.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 5. "Should I consult a doctor?"
  else if (q.includes('consult') || q.includes('see a doctor') || q.includes('appointment') || q.includes('physician')) {
    sections = {
      directAnswer: 'Yes, discussing your analyzed lab report with a qualified healthcare professional is always recommended.',
      explanation: 'An AI analysis provides educational breakdown, but only a physician can evaluate test results alongside your physical examination, clinical history, and lifestyle.',
      lifestyleAdvice: ['Prepare a list of your top health questions before your visit.'],
      doctorAdvice: [
        'Use the "Share Report With Doctor" button above to send your report directly to your connected doctor.',
        'Bring the "Questions to Ask Your Doctor" checklist from this dashboard.'
      ],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 6. Parameter Explanations (MCH, Hemoglobin, Cholesterol, Glucose, Thyroid)
  else if (q.includes('explain mch') || q.includes('mch') || q.includes('mcv')) {
    const param = findParam(['mch', 'mcv']);
    sections = {
      directAnswer: param ? `Your report includes ${param.name} (${param.value}) (Reference: ${param.referenceRange}).` : 'This report does not contain MCH.',
      explanation: param ? param.simpleExplanation : 'In general hematology, MCH (Mean Corpuscular Hemoglobin) measures the average amount of hemoglobin inside a single red blood cell. Normal ranges typically fall between 27 – 33 pg.',
      lifestyleAdvice: ['Red blood cell indices reflect iron availability and oxygen transport.'],
      doctorAdvice: ['Review complete blood count indices during your routine health checkup.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  else if (q.includes('hemoglobin') || q.includes('anemia')) {
    const param = findParam(['hemoglobin', 'haemoglobin']);
    sections = {
      directAnswer: param ? `Your Hemoglobin level is ${param.value} (Reference: ${param.referenceRange}).` : 'This report does not contain Hemoglobin.',
      explanation: param ? param.simpleExplanation : 'Hemoglobin is the iron-rich protein in red blood cells responsible for transporting oxygen from lungs to body tissues.',
      lifestyleAdvice: ['Focus on iron-rich foods (spinach, lentils, beetroot) paired with Vitamin C.'],
      doctorAdvice: ['Consult your doctor if you experience fatigue or unusual shortness of breath.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  else if (q.includes('cholesterol') || q.includes('ldl') || q.includes('hdl') || q.includes('lipid')) {
    const param = findParam(['ldl', 'cholesterol', 'hdl']);
    sections = {
      directAnswer: param ? `Regarding your ${param.name} (${param.value}) (Reference: ${param.referenceRange}):` : 'This report does not contain Cholesterol or Lipid profile parameters.',
      explanation: param ? param.simpleExplanation : 'Lipid panels measure Total Cholesterol, HDL (good), LDL (bad), and Triglycerides to evaluate heart health.',
      lifestyleAdvice: ['Incorporate soluble fiber (oats, chia seeds) and reduce saturated fats.'],
      doctorAdvice: ['Track your lipid profile annually with your physician.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  else if (q.includes('glucose') || q.includes('hba1c') || q.includes('sugar') || q.includes('diabetes')) {
    const param = findParam(['glucose', 'hba1c', 'sugar']);
    sections = {
      directAnswer: param ? `Regarding your ${param.name} (${param.value}) (Reference: ${param.referenceRange}):` : 'This report does not contain Fasting Glucose or HbA1c values.',
      explanation: param ? param.simpleExplanation : 'HbA1c and Fasting Sugar tests evaluate blood glucose control and insulin sensitivity.',
      lifestyleAdvice: ['Choose complex fiber carbohydrates over refined sugars.'],
      doctorAdvice: ['Schedule routine metabolic screenings as advised by your physician.'],
      disclaimer: STANDARD_DISCLAIMER
    };
  }

  // 7. General Custom Question Fallback
  else {
    const lastUserMsg = messageHistory.filter((m) => m.sender === 'user').slice(-1)[0]?.text.toLowerCase() || '';

    if (lastUserMsg.includes('diet') || lastUserMsg.includes('food')) {
      sections = {
        directAnswer: `Following up on your dietary questions for ${reportContext.reportTitle}:`,
        explanation: 'Proper nutrition directly impacts parameter targets like blood hemoglobin and lipid levels.',
        lifestyleAdvice: ['Drink 2.5 - 3 liters of water daily.', 'Eat whole unrefined foods and fresh vegetables.'],
        doctorAdvice: ['Consult a clinical nutritionist for a structured meal chart.'],
        disclaimer: STANDARD_DISCLAIMER
      };
    } else {
      const detected = allParams.map((p) => `${p.name} (${p.value})`).join(', ');

      sections = {
        directAnswer: `Thank you for your question regarding ${reportContext.reportTitle}.`,
        explanation: `Parameters detected in your report include: ${detected || 'None'}. You can ask specific questions about your findings, diet, exercise, or doctor consultation.`,
        lifestyleAdvice: ['Review your parameters regularly to maintain optimal health.'],
        doctorAdvice: ['Bring this report analysis to your next physician visit.'],
        disclaimer: STANDARD_DISCLAIMER
      };
    }
  }

  const plainText = `${sections.directAnswer}\n\n${sections.explanation || ''}`;

  return {
    id: `msg_${Date.now()}`,
    sender: 'ai',
    text: plainText,
    timestamp,
    sections
  };
};
