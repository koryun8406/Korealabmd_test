# 임상검사 단위 변환 · 참고구간

React + TypeScript + Vite 정적 사이트 (GitHub Pages).

**Pages URL:** https://koryun8406.github.io/Korealabmd_test/

## 기능
- **변환 탭**: 분석물 검색(영문·한글·동의어) → 값/원본/대상 단위 → 결과 + "계산 근거"(방법·계수·수식·가정·출처). 스왑·복사 지원. 근거 없는 변환(예: mg/dL→U/L)은 이유와 함께 거부.
- **참고구간 탭**: 분석물+나이+성별+검체 → 공표된 구간만 표시(외삽 없음), 값 입력 시 low/normal/high 판정.

## 데이터 출처 / 설계
| 역할 | 출처 | 앱 포함 |
|---|---|---|
| 단위 변환 엔진 | UCUM (`@lhncbc/ucum-lhc`) + IUPAC 원자량으로 계산한 분자량, 이온 전하 | 예 (계수는 계산, 표 복사 없음) |
| HbA1c | NGSP–IFCC 마스터 방정식 | 예 |
| uACR/uPCR | KDIGO 2024 (크레아티닌 분자량으로 mg/g↔mg/mmol 계산) | 예 |
| BUN↔요소, 중성지방 | 원자량 기반 계산 (BUN=질소 질량, TG=triolein 가정) | 예 |
| 참고구간 | RCPA Harmonised Reference Intervals Table 6 (일부) | 예 (**원문 대조 미완료**) |
| 소아 | CALIPER — 링크 안내만 | 안내만 |
| 교차검증 | Labcorp / CMEinfo / NBME | 앱 미포함, 테스트만 (아래 참조) |

## 확보하지 못한 자료와 이유 (TODO(verify))
개발 환경의 네트워크 정책이 외부 사이트(rcpa.edu.au, ngsp.org, ciaaw.org, caliperproject.ca, labcorp.com 등) 접속을 차단하여 **원문을 직접 열람하지 못했습니다.**
1. **RCPA Table 6**: 원문 미열람. 검색 결과 발췌에서 확인된 Na, K, Ca, 크레아티닌(남/여) 성인 구간만 수록하고 모두 `verified:false`로 UI에 경고 표시. 나머지(ALT, GGT, 요산, 알부민, 요소, 혈당, 지질 등)와 정확한 검체 표기는 **의도적으로 비워 둠**.
2. **CALIPER**: 수치 미수록, 링크만 제공.
3. **NGSP–IFCC 식**(`10.93×NGSP−23.50`, `0.09148×IFCC+2.152`): 기억 기반, 페이지 미열람.
4. **KDIGO 2024** mg/g↔mg/mmol: 분모(크레아티닌) 분자량으로 계산한 값. KDIGO 표의 반올림 수치(예: 30 mg/g ≈ 3 mg/mmol)와의 대조는 미수행.
5. **IUPAC 원자량**: 기억 기반 abridged 값, ciaaw.org 대조 필요.
6. **교차검증(Labcorp/CMEinfo/NBME)**: 세 문서를 열람하지 못해, 테스트(`src/__tests__/convert.test.ts`)는 널리 쓰이는 관례적 SI 계수(기억 기반, ±0.5%)와 대조함. 세 문서와의 직접 대조는 미수행.
7. 중성지방 환산(triolein 885.4 g/mol 가정), 인(P 원소 질량 기준)은 관례적 가정이며 근거 문서 대조 필요.

## 개발
```
npm ci
npm test       # Vitest
npm run dev
npm run build
```
`main` 푸시 시 GitHub Actions(`.github/workflows/pages.yml`)가 테스트·빌드 후 Pages에 배포합니다.
(Settings → Pages → Source: **GitHub Actions** 필요)

교육·참고용이며 임상 판단을 대체하지 않습니다.
