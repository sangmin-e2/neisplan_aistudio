
export interface EducationOffice {
  code: string;
  name: string;
}

export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
}

export interface AcademicSchedule {
  AA_YMD: string;
  EVENT_NM: string;
}

export interface LocalStorageData {
  officeCode: string;
  schoolName: string;
  startDate: string;
  endDate: string;
}

export interface NeisSchoolResponse {
  schoolInfo?: [
    { head: any[] },
    { row: SchoolInfo[] }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

export interface NeisScheduleResponse {
  SchoolSchedule?: [
    { head: any[] },
    { row: AcademicSchedule[] }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}
