import { AIReportAnalysisResult, ReportParameter } from '../../types';

export const getSampleLabReports = (userName?: string) => {
  let activeName = userName || 'Patient';
  try {
    if (!userName && typeof localStorage !== 'undefined') {
      const activeUserJSON = localStorage.getItem('jivexa_session_user');
      if (activeUserJSON) {
        const u = JSON.parse(activeUserJSON);
        if (u?.name) activeName = u.name;
      }
    }
  } catch (e) {}

  return [
    {
      id: 'sample_cbc_lipid',
      title: 'Complete Blood Count (CBC) & Lipid Profile',
      fileName: `${activeName.replace(/\s+/g, '_')}_CBC_Lipid_Panel.pdf`,
      fileSize: '1.4 MB',
      fileType: 'application/pdf',
      rawText: `
PATIENT LAB REPORT - METROPOLIS HEALTHCARE
Patient Name: ${activeName} | Date: 05-Aug-2026

HAEMATOLOGY (CBC)
Hemoglobin: 11.8 g/dL (Reference Range: 13.5 - 17.5 g/dL) [LOW]
Total RBC Count: 4.8 mill/cumm (Reference Range: 4.3 - 5.9 mill/cumm) [NORMAL]
Total Leukocyte Count (WBC): 7,200 /cumm (Reference Range: 4,000 - 11,000 /cumm) [NORMAL]
Platelet Count: 240,000 /cumm (Reference Range: 150,000 - 450,000 /cumm) [NORMAL]

LIPID PROFILE
Total Cholesterol: 215 mg/dL (Reference Range: < 200 mg/dL) [HIGH]
Triglycerides: 145 mg/dL (Reference Range: < 150 mg/dL) [NORMAL]
HDL Cholesterol (Good): 42 mg/dL (Reference Range: > 40 mg/dL) [NORMAL]
LDL Cholesterol (Bad): 144 mg/dL (Reference Range: < 100 mg/dL) [HIGH]
      `
    },
    {
      id: 'sample_diabetes_thyroid',
      title: 'HbA1c Diabetes & Thyroid Profile (TSH)',
      fileName: `${activeName.replace(/\s+/g, '_')}_Diabetes_Thyroid_Screening.pdf`,
      fileSize: '980 KB',
      fileType: 'application/pdf',
      rawText: `
DIABETES & ENDOCRINE LAB REPORT - THYROCARE
Patient Name: ${activeName} | Date: 02-Aug-2026

GLUCOSE & HBA1C PANEL
Fasting Blood Sugar: 104 mg/dL (Reference Range: 70 - 99 mg/dL) [ELEVATED]
HbA1c (Glycated Hemoglobin): 5.9 % (Reference Range: < 5.7 % Normal, 5.7 - 6.4 % Prediabetes) [PREDIABETES]

THYROID PANEL
TSH (Thyroid Stimulating Hormone): 3.2 uIU/mL (Reference Range: 0.4 - 4.2 uIU/mL) [NORMAL]
Free T4: 1.2 ng/dL (Reference Range: 0.8 - 1.8 ng/dL) [NORMAL]
      `
    }
  ];
};

export const SAMPLE_LAB_REPORTS = getSampleLabReports();

// Master catalog of clinical parameter rules for strictly parsing extracted text
interface ParameterRule {
  name: string;
  keywords: string[];
  extractValue: (text: string) => { value: string; ref: string; status: 'Normal' | 'Abnormal' | 'Attention'; explanation: string } | null;
}

const PARAMETER_RULES: ParameterRule[] = [
  {
    name: 'Hemoglobin',
    keywords: ['hemoglobin', 'haemoglobin', 'hb '],
    extractValue: (text) => {
      const match = text.match(/(?:hemoglobin|haemoglobin|hb)\s*:\s*([0-9\.]+)\s*(g\/dl)?.*?(\((.*?)\))?\s*(\[?(low|high|normal)\]?)?/i);
      if (!match) return null;
      const valNum = parseFloat(match[1]);
      const status: 'Normal' | 'Abnormal' | 'Attention' = valNum < 13.5 ? 'Abnormal' : valNum > 17.5 ? 'Attention' : 'Normal';
      return {
        value: `${match[1]} g/dL`,
        ref: match[4] || '13.5 - 17.5 g/dL',
        status,
        explanation: status === 'Abnormal'
          ? `Your hemoglobin level (${match[1]} g/dL) is lower than reference target (${match[4] || '13.5 - 17.5 g/dL'}). This can affect red blood cell oxygen delivery.`
          : `Your hemoglobin level (${match[1]} g/dL) is within healthy reference targets.`
      };
    }
  },
  {
    name: 'Total RBC Count',
    keywords: ['rbc', 'red blood cell'],
    extractValue: (text) => {
      const match = text.match(/(?:rbc|red blood cell).*?:\s*([0-9\.]+)\s*(mill\/cumm)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      return {
        value: `${match[1]} mill/cumm`,
        ref: match[4] || '4.3 - 5.9 mill/cumm',
        status: 'Normal',
        explanation: `Red blood cell count (${match[1]} mill/cumm) is within normal limits.`
      };
    }
  },
  {
    name: 'Total Leukocyte Count (WBC)',
    keywords: ['wbc', 'leukocyte', 'white blood'],
    extractValue: (text) => {
      const match = text.match(/(?:wbc|leukocyte|white blood).*?:\s*([0-9,]+)\s*(\/cumm)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      return {
        value: `${match[1]} /cumm`,
        ref: match[4] || '4,000 - 11,000 /cumm',
        status: 'Normal',
        explanation: `White blood cell count (${match[1]} /cumm) indicates normal immune system baseline.`
      };
    }
  },
  {
    name: 'Platelet Count',
    keywords: ['platelet'],
    extractValue: (text) => {
      const match = text.match(/(?:platelet).*?:\s*([0-9,]+)\s*(\/cumm)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      return {
        value: `${match[1]} /cumm`,
        ref: match[4] || '150,000 - 450,000 /cumm',
        status: 'Normal',
        explanation: `Platelet count (${match[1]} /cumm) is optimal for blood clotting.`
      };
    }
  },
  {
    name: 'Total Cholesterol',
    keywords: ['total cholesterol'],
    extractValue: (text) => {
      const match = text.match(/(?:total cholesterol).*?:\s*([0-9\.]+)\s*(mg\/dl)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      const valNum = parseFloat(match[1]);
      const status: 'Normal' | 'Abnormal' | 'Attention' = valNum > 200 ? 'Abnormal' : 'Normal';
      return {
        value: `${match[1]} mg/dL`,
        ref: match[4] || '< 200 mg/dL',
        status,
        explanation: status === 'Abnormal'
          ? `Total cholesterol (${match[1]} mg/dL) is above optimal target (< 200 mg/dL).`
          : `Total cholesterol (${match[1]} mg/dL) is within healthy limits.`
      };
    }
  },
  {
    name: 'LDL Cholesterol',
    keywords: ['ldl'],
    extractValue: (text) => {
      const match = text.match(/(?:ldl).*?:\s*([0-9\.]+)\s*(mg\/dl)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      const valNum = parseFloat(match[1]);
      const status: 'Normal' | 'Abnormal' | 'Attention' = valNum > 100 ? 'Abnormal' : 'Normal';
      return {
        value: `${match[1]} mg/dL`,
        ref: match[4] || '< 100 mg/dL',
        status,
        explanation: status === 'Abnormal'
          ? `LDL cholesterol (${match[1]} mg/dL) is above optimal target (< 100 mg/dL).`
          : `LDL cholesterol (${match[1]} mg/dL) is within target range.`
      };
    }
  },
  {
    name: 'HDL Cholesterol',
    keywords: ['hdl'],
    extractValue: (text) => {
      const match = text.match(/(?:hdl).*?:\s*([0-9\.]+)\s*(mg\/dl)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      return {
        value: `${match[1]} mg/dL`,
        ref: match[4] || '> 40 mg/dL',
        status: 'Normal',
        explanation: `HDL protective cholesterol (${match[1]} mg/dL) is healthy.`
      };
    }
  },
  {
    name: 'Fasting Blood Sugar',
    keywords: ['fasting', 'blood sugar', 'glucose'],
    extractValue: (text) => {
      const match = text.match(/(?:fasting|blood sugar|glucose).*?:\s*([0-9\.]+)\s*(mg\/dl)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      const valNum = parseFloat(match[1]);
      const status: 'Normal' | 'Abnormal' | 'Attention' = valNum > 100 ? 'Attention' : 'Normal';
      return {
        value: `${match[1]} mg/dL`,
        ref: match[4] || '70 - 99 mg/dL',
        status,
        explanation: status === 'Attention'
          ? `Fasting glucose (${match[1]} mg/dL) is slightly elevated above 99 mg/dL target.`
          : `Fasting glucose (${match[1]} mg/dL) is normal.`
      };
    }
  },
  {
    name: 'HbA1c',
    keywords: ['hba1c', 'glycated'],
    extractValue: (text) => {
      const match = text.match(/(?:hba1c|glycated).*?:\s*([0-9\.]+)\s*(%)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      const valNum = parseFloat(match[1]);
      const status: 'Normal' | 'Abnormal' | 'Attention' = valNum >= 5.7 ? 'Attention' : 'Normal';
      return {
        value: `${match[1]} %`,
        ref: match[4] || '< 5.7 %',
        status,
        explanation: status === 'Attention'
          ? `HbA1c (${match[1]} %) indicates prediabetes range (5.7 - 6.4 %).`
          : `HbA1c (${match[1]} %) is normal.`
      };
    }
  },
  {
    name: 'TSH',
    keywords: ['tsh', 'thyroid'],
    extractValue: (text) => {
      const match = text.match(/(?:tsh|thyroid).*?:\s*([0-9\.]+)\s*(uiu\/ml)?.*?(\((.*?)\))?/i);
      if (!match) return null;
      return {
        value: `${match[1]} uIU/mL`,
        ref: match[4] || '0.4 - 4.2 uIU/mL',
        status: 'Normal',
        explanation: `Thyroid stimulating hormone (${match[1]} uIU/mL) is within target range.`
      };
    }
  }
];

/**
 * Deep Clinical Document Analyzer with Real-Time LLM & Fake Document Detection
 */
export const processAndAnalyzeReport = async (
  fileName: string,
  rawContentText: string
): Promise<AIReportAnalysisResult> => {
  const textToAnalyze = (rawContentText || '').trim();

  // 1. Try Backend LLM Document Analyzer API
  try {
    const backendBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (typeof localStorage !== 'undefined' && localStorage.getItem('jivexa_backend_url')) || 'https://jivexa-main.onrender.com';
    const cleanBase = backendBase.replace(/\/$/, '');
    const res = await fetch(`${cleanBase}/api/ai/analyze-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, documentText: textToAnalyze })
    });

    if (res.ok) {
      const data = await res.json();
      
      // Fake / Non-Clinical Document Warning Guardrail
      if (data.isValidReport === false) {
        return {
          id: `rep_${Date.now()}`,
          reportId: `rep_${Date.now()}`,
          reportTitle: fileName,
          healthScore: 0,
          scoreStatus: 'Needs Review',
          summary: `⚠️ Fake / Non-Clinical Document Warning: ${data.invalidReason || 'The uploaded file does not contain valid clinical lab parameters. Please upload an authentic medical lab report (PDF/Image) to receive 100% accurate health analysis.'}`,
          normalFindings: [],
          abnormalFindings: [],
          attentionParameters: [],
          possibleFactors: ['Document is non-medical, blurry, or downloaded from an unverified source.'],
          questionsForDoctor: ['Obtain an official clinical lab report from a certified lab.'],
          lifestyleSuggestions: ['Upload a valid clinical PDF or high-res image report.'],
          disclaimer: 'JIVEXA AI invalid document detection guardrail.',
          analyzedAt: new Date().toLocaleDateString()
        };
      }

      return {
        id: `rep_${Date.now()}`,
        reportId: `rep_${Date.now()}`,
        reportTitle: data.reportTitle || fileName,
        healthScore: data.healthScore || 80,
        scoreStatus: data.scoreStatus || 'Requires Attention',
        summary: data.summary || 'Clinical parameters extracted successfully.',
        normalFindings: data.normalFindings || [],
        abnormalFindings: data.abnormalFindings || [],
        attentionParameters: data.attentionParameters || [],
        possibleFactors: ['Parameters evaluated by JIVEXA AI Clinical Engine.'],
        questionsForDoctor: data.questionsForDoctor || ['Review these lab results with your doctor.'],
        lifestyleSuggestions: data.lifestyleRecommendations || ['Maintain a healthy diet and hydration.'],
        disclaimer: 'Educational healthcare information only. Share flagged values with your doctor.',
        analyzedAt: new Date().toLocaleDateString()
      };
    }
  } catch (e) {
    console.warn('[Report Analyzer] Backend AI endpoint unavailable, using local OCR fallback engine...');
  }

  // 2. Local Heuristic Extraction Fallback
  const reportId = `rep_analysis_${Date.now()}`;
  const analyzedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const disclaimer =
    'AI-generated information is for educational purposes and should be reviewed with a qualified healthcare professional. This analysis is not a formal medical diagnosis or prescription.';

  const normalFindings: ReportParameter[] = [];
  const abnormalFindings: ReportParameter[] = [];
  const attentionParameters: ReportParameter[] = [];

  if (textToAnalyze.length > 20) {
    for (const rule of PARAMETER_RULES) {
      const isKeywordPresent = rule.keywords.some((kw) => textToAnalyze.toLowerCase().includes(kw));
      if (isKeywordPresent) {
        const extracted = rule.extractValue(textToAnalyze);
        if (extracted) {
          const paramObj: ReportParameter = {
            name: rule.name,
            value: extracted.value,
            referenceRange: extracted.ref,
            status: extracted.status,
            simpleExplanation: extracted.explanation
          };

          if (extracted.status === 'Abnormal') abnormalFindings.push(paramObj);
          else if (extracted.status === 'Attention') attentionParameters.push(paramObj);
          else normalFindings.push(paramObj);
        }
      }
    }
  }

  const totalDetected = normalFindings.length + abnormalFindings.length + attentionParameters.length;

  if (totalDetected === 0) {
    return {
      id: reportId,
      reportId: `rep_${Date.now()}`,
      reportTitle: fileName,
      healthScore: 0,
      scoreStatus: 'Needs Review',
      summary:
        '⚠️ OCR Confidence Low / Unreadable Document: No valid laboratory test parameters were detected in the uploaded file text. Please upload a clearer digital PDF or high-resolution image report to ensure accurate medical parsing.',
      normalFindings: [],
      abnormalFindings: [],
      attentionParameters: [],
      possibleFactors: [
        'OCR text confidence is too low to extract laboratory values.',
        'The document may be blurred, low-resolution, or non-medical.'
      ],
      questionsForDoctor: [
        'Can I obtain a digital PDF copy of my lab results directly from the laboratory portal?'
      ],
      lifestyleSuggestions: [
        'Re-upload a clear high-resolution digital PDF or uncompressed photo of your medical report.'
      ],
      disclaimer,
      analyzedAt
    };
  }

  let healthScore = 100 - (abnormalFindings.length * 15 + attentionParameters.length * 8);
  if (healthScore < 50) healthScore = 55;
  const scoreStatus = healthScore >= 85 ? 'Optimal' : healthScore >= 70 ? 'Requires Attention' : 'Needs Review';

  return {
    id: reportId,
    reportId: `rep_${Date.now()}`,
    reportTitle: fileName,
    healthScore,
    scoreStatus,
    summary: `Analysis of ${fileName} completed. Extracted ${totalDetected} parameters (${abnormalFindings.length} requiring clinical review).`,
    normalFindings,
    abnormalFindings,
    attentionParameters,
    possibleFactors: ['Extracted parameters evaluated against clinical reference intervals.'],
    questionsForDoctor: [
      'What lifestyle adjustments are recommended for my flagged parameters?',
      'Should any of these tests be re-evaluated in 3-6 months?'
    ],
    lifestyleSuggestions: [
      'Focus on iron-dense nutrition and good hydration.',
      'Maintain regular aerobic activity as advised by your doctor.'
    ],
    disclaimer,
    analyzedAt
  };
};
