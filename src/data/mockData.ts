import { WorkPlan, ProjectContact } from '../types';

export const MOCK_WORK_PLANS: WorkPlan[] = [
  {
    id: '1',
    department: '북부(수자원)',
    projectName: '봉화댐 건설사업',
    date: '2026-03-21',
    isImplemented: true,
    content: '(본댐) 축조 및 다짐, 심벽재 운반 및 포설(건조), (여수로) 암반청소',
    workers: [
      { name: '강정훈', rank: '토목3급' },
      { name: '박두진', rank: '토목5급' }
    ]
  },
  {
    id: '2',
    department: '북부(수자원)',
    projectName: '안동댐 안전성강화사업',
    date: '2026-03-21',
    isImplemented: true,
    content: '(유입부) 가설작업대 하부파일 천공, 벤트·복공판 설치, (유출부) B/P장 기초 및 세륜기 벽체 거푸집 설치',
    workers: [
      { name: '허진재', rank: '토목4급' }
    ]
  },
  {
    id: '3',
    department: '구미권(수도)',
    projectName: '구미(Ⅱ) 광역상수도 김천계통관로 개량사업',
    date: '2026-03-21',
    isImplemented: true,
    content: '(감천) 감천 추진기지 부근 지반 보강 그라우팅',
    workers: [
      { name: '이정석', rank: '건축3급' }
    ]
  },
  {
    id: '4',
    department: '동부(수자원)',
    projectName: '운문댐 안전성강화사업',
    date: '2026-03-22',
    isImplemented: true,
    content: '(신설취수탑) 슬립폼 인상 및 면정리, 벽체 철근 운반 및 조립 등',
    workers: [
      { name: '김민철', rank: '토목3급' }
    ]
  },
  {
    id: '5',
    department: '동부(수도)',
    projectName: '영천댐 도수로 이설공사',
    date: '2026-03-22',
    isImplemented: true,
    content: '(4구간) 신설관로 되메우기 및 내부 도복장, 플랜지 체결, 밸브실 환기구 설치',
    workers: [
      { name: '김민철', rank: '토목3급' }
    ]
  },
  {
    id: '6',
    department: '동부(수자원)',
    projectName: '안계댐 안전성강화사업',
    date: '2026-03-21',
    isImplemented: false,
    content: '주말 작업 계획 없음 (휴무)',
    workers: []
  },
  {
    id: '7',
    department: '동부(수도)',
    projectName: '울산공업용수도 노후관 개량사업(3차)',
    date: '2026-03-21',
    isImplemented: false,
    content: '주말 작업 계획 없음 (휴무)',
    workers: []
  },
  {
    id: '8',
    department: '남부(수도)',
    projectName: '남해군 지방상수도 비상공급망 구축사업',
    date: '2026-03-21',
    isImplemented: false,
    content: '주말 작업 계획 없음 (휴무)',
    workers: []
  }
];

export const MOCK_CONTACTS: ProjectContact[] = [
  {
    id: 'c1',
    department: '북부(수자원)',
    projectName: '봉화댐 건설사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '김상훈', phone: '010-7160-5000' },
      { type: 'internal', category: '사업담당', role: '과장', name: '이희형', phone: '010-8817-6147' },
      { type: 'internal', category: '공사담당', role: '차장', name: '강정훈', phone: '010-8702-9030' },
      { type: 'internal', category: '공사담당', role: '대리', name: '진광민', phone: '010-9141-4819' },
      { type: 'external', category: '시공사', role: '소장', name: '이진만', phone: '010-6244-8185' }
    ]
  },
  {
    id: 'c2',
    department: '북부(수자원)',
    projectName: '안동댐 안전성강화사업',
    contacts: [
      { type: 'internal', category: '공사담당', role: '차장', name: '정종진', phone: '010-7182-3346' },
      { type: 'internal', category: '공사담당', role: '대리', name: '박준호', phone: '010-4755-8805' },
      { type: 'external', category: '감리단', role: '단장', name: '홍지호', phone: '010-9004-3236' },
      { type: 'external', category: '시공사', role: '소장', name: '김유삼', phone: '010-3443-8978' }
    ]
  },
  {
    id: 'c3',
    department: '구미권(수도)',
    projectName: '구미(Ⅱ) 광역상수도 김천계통관로 개량사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '이재헌', phone: '010-3077-1436' },
      { type: 'internal', category: '사업담당', role: '대리', name: '우태경', phone: '010-6395-3988' },
      { type: 'internal', category: '공사담당', role: '차장', name: '이대홍', phone: '010-5515-8519' },
      { type: 'external', category: '감리단', role: '단장', name: '고준영', phone: '010-2500-5252' },
      { type: 'external', category: '시공사', role: '소장', name: '차정훈', phone: '010-9408-3248' }
    ]
  },
  {
    id: 'c4',
    department: '구미권(건축)',
    projectName: '낙동강유역 입상활성탄 국가비축창고 건립사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '이정석', phone: '010-3383-0503' },
      { type: 'internal', category: '사업담당', role: '선임', name: '박준호', phone: '010-3778-8284' },
      { type: 'internal', category: '공사담당', role: '대리', name: '유승아', phone: '010-8010-7351' },
      { type: 'external', category: '감리단', role: '단장', name: '주성일', phone: '010-5071-3131' },
      { type: 'external', category: '시공사', role: '소장', name: '이광영', phone: '010-4532-4419' }
    ]
  },
  {
    id: 'c5',
    department: '동부(수자원)',
    projectName: '운문댐 안전성강화사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '백승환', phone: '010-8579-8130' },
      { type: 'internal', category: '공사담당', role: '차장', name: '김선우', phone: '010-9400-9928' },
      { type: 'external', category: '감리단', role: '단장', name: '안승대', phone: '010-4513-8623' },
      { type: 'external', category: '시공사', role: '소장', name: '현진호', phone: '010-2517-1691' }
    ]
  },
  {
    id: 'c6',
    department: '동부(수자원)',
    projectName: '안계댐 안전성강화사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '과장', name: '나구원', phone: '010-2939-9176' },
      { type: 'internal', category: '공사담당', role: '차장', name: '최현용', phone: '010-2865-5519' },
      { type: 'external', category: '감리단', role: '단장', name: '채동완', phone: '010-4209-5568' },
      { type: 'external', category: '시공사', role: '소장', name: '이병주', phone: '010-4548-3612' }
    ]
  },
  {
    id: 'c7',
    department: '동부(수자원)',
    projectName: '선암댐 안전성강화사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '대리', name: '김기현', phone: '010-8647-4234' },
      { type: 'internal', category: '공사담당', role: '차장', name: '김민철', phone: '010-8569-4686' },
      { type: 'external', category: '감리단', role: '단장', name: '송태섭', phone: '010-8613-6041' },
      { type: 'external', category: '시공사', role: '소장', name: '김영하', phone: '010-2030-5579' }
    ]
  },
  {
    id: 'c8',
    department: '동부(수도)',
    projectName: '울산공업용수도 노후관 개량사업(3차)',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '신현기', phone: '010-9316-4560' },
      { type: 'internal', category: '공사담당', role: '차장', name: '김성중', phone: '010-4002-0063' },
      { type: 'external', category: '감리단', role: '단장', name: '하동수', phone: '010-3887-0650' },
      { type: 'external', category: '시공사', role: '소장', name: '허성만', phone: '010-3958-7021' }
    ]
  },
  {
    id: 'c9',
    department: '동부(수도)',
    projectName: '영천댐 도수로 이설공사',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '신현기', phone: '010-9316-4560' },
      { type: 'internal', category: '공사담당', role: '차장', name: '정지은', phone: '010-6599-8856' },
      { type: 'external', category: '감리단', role: '단장', name: '박현규', phone: '010-9492-3742' },
      { type: 'external', category: '시공사', role: '소장', name: '조수형', phone: '010-9337-2821' }
    ]
  },
  {
    id: 'c10',
    department: '동부(수도)',
    projectName: '포항광역상수도 송수관로 복선화사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '신현기', phone: '010-9316-4560' },
      { type: 'internal', category: '공사담당', role: '차장', name: '정지은', phone: '010-6599-8856' },
      { type: 'external', category: '감리단', role: '단장', name: '이종식', phone: '010-7488-5648' },
      { type: 'external', category: '시공사', role: '소장', name: '이승현', phone: '010-3069-7188' }
    ]
  },
  {
    id: 'c11',
    department: '동부(건축)',
    projectName: '낙동강유역 맑은물 공급 기반시설 조성사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '이정석', phone: '010-3383-0503' },
      { type: 'internal', category: '공사담당', role: '차장', name: '장용해', phone: '010-4661-0408' },
      { type: 'external', category: '감리단', role: '단장', name: '조창근', phone: '010-3400-4991' },
      { type: 'external', category: '시공사', role: '소장', name: '이강년', phone: '010-3588-9637' }
    ]
  },
  {
    id: 'c12',
    department: '남부(수도)',
    projectName: '남해군 지방상수도 비상공급망 구축사업',
    contacts: [
      { type: 'internal', category: '사업담당', role: '차장', name: '이재헌', phone: '010-3077-1436' },
      { type: 'internal', category: '공사담당', role: '차장', name: '신경섭', phone: '010-6799-0584' },
      { type: 'external', category: '감리단', role: '단장', name: '강전백', phone: '010-3702-5843' },
      { type: 'external', category: '시공사', role: '소장', name: '정대석', phone: '010-3637-4693' }
    ]
  }
];
