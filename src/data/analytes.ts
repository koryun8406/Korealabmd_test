export type Kind = 'molecular' | 'mass-only' | 'enzyme' | 'hba1c' | 'ratio';

export interface Analyte {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  kind: Kind;
  /** Formula used for molar mass (g/mol). For BUN this is N2 (mass of urea nitrogen per mole of urea). */
  formula?: string;
  /** |charge| for mEq/L conversions. */
  charge?: number;
  units: string[];
  assumption?: string;
  sources?: { label: string; url: string }[];
  /** Ratio analytes (uACR/uPCR): the denominator analyte formula (creatinine). */
}

const CREAT = 'C4H7N3O';

export const ANALYTES: Analyte[] = [
  { id: 'glucose', en: 'Glucose', ko: '포도당(혈당)', synonyms: ['blood sugar', '혈당', 'glu'], kind: 'molecular', formula: 'C6H12O6', units: ['mg/dL', 'mmol/L', 'g/L'] },
  { id: 'cholesterol', en: 'Cholesterol (total / HDL / LDL)', ko: '콜레스테롤', synonyms: ['total cholesterol', 'hdl', 'ldl', 'tc', '총콜레스테롤', '고밀도', '저밀도'], kind: 'molecular', formula: 'C27H46O', units: ['mg/dL', 'mmol/L', 'g/L'] },
  {
    id: 'triglyceride', en: 'Triglycerides', ko: '중성지방', synonyms: ['triacylglycerol', 'tg', 'trig', '트리글리세라이드'], kind: 'molecular', formula: 'C57H104O6', units: ['mg/dL', 'mmol/L', 'g/L'],
    assumption: '중성지방은 단일 분자가 아니므로 대표 분자 triolein(C57H104O6, ≈885.4 g/mol)을 가정한 관례적 환산입니다.',
  },
  { id: 'creatinine', en: 'Creatinine', ko: '크레아티닌', synonyms: ['creat', 'cr'], kind: 'molecular', formula: CREAT, units: ['mg/dL', 'umol/L', 'mmol/L', 'mg/L'] },
  { id: 'urate', en: 'Uric acid (urate)', ko: '요산', synonyms: ['uric acid', 'ua', 'urate'], kind: 'molecular', formula: 'C5H4N4O3', units: ['mg/dL', 'umol/L', 'mmol/L'] },
  { id: 'urea', en: 'Urea', ko: '요소', synonyms: ['urea'], kind: 'molecular', formula: 'CH4N2O', units: ['mg/dL', 'mmol/L', 'g/L'] },
  {
    id: 'bun', en: 'Blood urea nitrogen (BUN)', ko: '혈액요소질소', synonyms: ['bun', 'urea nitrogen', '요소질소'], kind: 'molecular', formula: 'N2', units: ['mg/dL', 'mmol/L'],
    assumption: 'BUN(mg/dL)은 요소의 질소(N) 질량 기준입니다. 요소 1 mol에 질소 2 mol(28.014 g)이 들어 있으므로 mmol/L은 요소 농도입니다.',
  },
  { id: 'sodium', en: 'Sodium', ko: '나트륨', synonyms: ['na', 'na+'], kind: 'molecular', formula: 'Na', charge: 1, units: ['mmol/L', 'meq/L', 'mg/dL'] },
  { id: 'potassium', en: 'Potassium', ko: '칼륨(포타슘)', synonyms: ['k', 'k+', '포타슘'], kind: 'molecular', formula: 'K', charge: 1, units: ['mmol/L', 'meq/L', 'mg/dL'] },
  { id: 'chloride', en: 'Chloride', ko: '염소(클로라이드)', synonyms: ['cl', 'cl-', '클로라이드'], kind: 'molecular', formula: 'Cl', charge: 1, units: ['mmol/L', 'meq/L', 'mg/dL'] },
  { id: 'bicarbonate', en: 'Bicarbonate (HCO3-)', ko: '중탄산염', synonyms: ['hco3', 'co2', 'total co2', '중탄산'], kind: 'molecular', formula: 'HCO3', charge: 1, units: ['mmol/L', 'meq/L'] },
  { id: 'calcium', en: 'Calcium', ko: '칼슘', synonyms: ['ca', 'ca2+', 'total calcium'], kind: 'molecular', formula: 'Ca', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'] },
  { id: 'magnesium', en: 'Magnesium', ko: '마그네슘', synonyms: ['mg', 'mg2+'], kind: 'molecular', formula: 'Mg', charge: 2, units: ['mg/dL', 'mmol/L', 'meq/L'] },
  {
    id: 'phosphate', en: 'Inorganic phosphorus (phosphate)', ko: '무기인(인산염)', synonyms: ['phosphorus', 'phos', 'po4', '인'], kind: 'molecular', formula: 'P', units: ['mg/dL', 'mmol/L'],
    assumption: 'mg/dL은 원소 인(P) 질량 기준(관례)입니다. 인산염의 전하는 pH에 따라 달라 mEq/L 변환은 제공하지 않습니다.',
  },
  { id: 'iron', en: 'Iron', ko: '철', synonyms: ['fe', 'serum iron'], kind: 'molecular', formula: 'Fe', units: ['ug/dL', 'umol/L'] },
  { id: 'bilirubin', en: 'Bilirubin', ko: '빌리루빈', synonyms: ['tbil', 'total bilirubin', 'dbil', '총빌리루빈'], kind: 'molecular', formula: 'C33H36N4O6', units: ['mg/dL', 'umol/L'] },
  { id: 'lactate', en: 'Lactate', ko: '젖산(락테이트)', synonyms: ['lactic acid', '락트산', '락테이트'], kind: 'molecular', formula: 'C3H6O3', units: ['mg/dL', 'mmol/L'] },
  { id: 'ammonia', en: 'Ammonia', ko: '암모니아', synonyms: ['nh3', 'nh4'], kind: 'molecular', formula: 'NH3', units: ['ug/dL', 'umol/L'] },
  { id: 'albumin', en: 'Albumin', ko: '알부민', synonyms: ['alb'], kind: 'mass-only', units: ['g/dL', 'g/L'], assumption: '단백질은 질량 농도(g/dL↔g/L)만 변환합니다. 몰 환산은 분자량 근거가 없어 제공하지 않습니다.' },
  { id: 'protein', en: 'Total protein', ko: '총단백', synonyms: ['tp', 'total protein'], kind: 'mass-only', units: ['g/dL', 'g/L'], assumption: '혼합 단백질이므로 질량 농도만 변환합니다.' },
  { id: 'hemoglobin', en: 'Hemoglobin', ko: '헤모글로빈', synonyms: ['hb', 'hgb'], kind: 'mass-only', units: ['g/dL', 'g/L'], assumption: '질량 농도만 변환합니다(mmol/L 환산에는 분자량 정의 선택이 필요하여 제외).' },
  { id: 'alt', en: 'ALT (alanine aminotransferase)', ko: 'ALT(알라닌 아미노전이효소)', synonyms: ['sgpt', 'gpt'], kind: 'enzyme', units: ['U/L', 'ukat/L'] },
  { id: 'ast', en: 'AST (aspartate aminotransferase)', ko: 'AST(아스파르트산 아미노전이효소)', synonyms: ['sgot', 'got'], kind: 'enzyme', units: ['U/L', 'ukat/L'] },
  { id: 'ggt', en: 'GGT (gamma-glutamyltransferase)', ko: 'GGT(감마글루타밀전이효소)', synonyms: ['gamma gt', 'ggtp'], kind: 'enzyme', units: ['U/L', 'ukat/L'] },
  { id: 'alp', en: 'ALP (alkaline phosphatase)', ko: 'ALP(알칼리 인산분해효소)', synonyms: ['alkaline phosphatase'], kind: 'enzyme', units: ['U/L', 'ukat/L'] },
  { id: 'ldh', en: 'LDH (lactate dehydrogenase)', ko: 'LDH(젖산탈수소효소)', synonyms: ['lactate dehydrogenase'], kind: 'enzyme', units: ['U/L', 'ukat/L'] },
  { id: 'hba1c', en: 'Hemoglobin A1c (HbA1c)', ko: '당화혈색소', synonyms: ['a1c', 'glycated hemoglobin', 'glycohemoglobin', 'hba1c'], kind: 'hba1c', units: ['%', 'mmol/mol'] },
  { id: 'uacr', en: 'Urine albumin-to-creatinine ratio (uACR)', ko: '소변 알부민/크레아티닌 비(uACR)', synonyms: ['acr', 'albumin creatinine ratio', 'microalbumin', '알부민뇨', '미세알부민'], kind: 'ratio', formula: CREAT, units: ['mg/g', 'mg/mmol'] },
  { id: 'upcr', en: 'Urine protein-to-creatinine ratio (uPCR)', ko: '소변 단백/크레아티닌 비(uPCR)', synonyms: ['pcr', 'protein creatinine ratio', '단백뇨'], kind: 'ratio', formula: CREAT, units: ['mg/g', 'mg/mmol'] },
];

export function findAnalytes(query: string): Analyte[] {
  const q = query.trim().toLowerCase();
  if (!q) return ANALYTES;
  return ANALYTES.filter((a) => [a.en, a.ko, a.id, ...a.synonyms].some((s) => s.toLowerCase().includes(q)));
}
export const getAnalyte = (id: string) => ANALYTES.find((a) => a.id === id);
