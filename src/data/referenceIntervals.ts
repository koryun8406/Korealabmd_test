// Published reference intervals ONLY. No extrapolation, no gap filling.
//
// Source: RCPA Harmonised Reference Intervals for Chemical Pathology (Table 6)
// https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem
//
// TODO(verify): rcpa.edu.au is unreachable from the build environment (DNS/proxy blocked), so the rows below were
// NOT read from the table itself. They were taken from a web-search excerpt that quoted the RCPA page. Each row carries
// verified:false until a human compares it with Table 6. Rows not found in any excerpt (e.g. ALT, GGT, urate,
// albumin, urea, glucose, lipids) are deliberately absent.
export interface RefInterval {
  analyteId: string;
  specimen: string;
  sex: 'M' | 'F' | 'any';
  ageMin: number; // years, inclusive
  ageMax: number; // years, exclusive
  low: number;
  high: number;
  unit: string;
  source: string;
  sourceUrl: string;
  verified: boolean;
  note?: string;
}

const RCPA = 'RCPA Harmonised Reference Intervals, Table 6';
const URL6 = 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem';
const base = { source: RCPA, sourceUrl: URL6, verified: false };

export const REFERENCE_INTERVALS: RefInterval[] = [
  { ...base, analyteId: 'sodium', specimen: '혈청/혈장 (TODO(verify): 원문 검체 미확인)', sex: 'any', ageMin: 18, ageMax: 120, low: 135, high: 145, unit: 'mmol/L' },
  { ...base, analyteId: 'potassium', specimen: '혈청', sex: 'any', ageMin: 18, ageMax: 120, low: 3.5, high: 5.2, unit: 'mmol/L', note: '성인 혈장 구간은 표에 없음(검색 발췌 기준, TODO(verify))' },
  { ...base, analyteId: 'calcium', specimen: '혈청/혈장 (TODO(verify): 원문 검체 미확인)', sex: 'any', ageMin: 18, ageMax: 120, low: 2.1, high: 2.6, unit: 'mmol/L' },
  { ...base, analyteId: 'creatinine', specimen: '혈청/혈장 (TODO(verify): 원문 검체 미확인)', sex: 'M', ageMin: 18, ageMax: 60, low: 60, high: 110, unit: 'umol/L', note: '공표 구간은 60세까지 (TODO(verify): 하한 연령 18세 여부)' },
  { ...base, analyteId: 'creatinine', specimen: '혈청/혈장 (TODO(verify): 원문 검체 미확인)', sex: 'F', ageMin: 18, ageMax: 60, low: 45, high: 90, unit: 'umol/L', note: '공표 구간은 60세까지 (TODO(verify): 하한 연령 18세 여부)' },
];

export const CALIPER = { label: 'CALIPER Project (소아 참고구간)', url: 'https://caliperproject.ca' };
