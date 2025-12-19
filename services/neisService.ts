
import { NEIS_API_KEY } from '../constants';
import { NeisSchoolResponse, NeisScheduleResponse, SchoolInfo, AcademicSchedule } from '../types';

export const fetchSchoolInfo = async (officeCode: string, schoolName: string): Promise<SchoolInfo | null> => {
  const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SCHUL_NM=${encodeURIComponent(schoolName)}`;
  
  try {
    const response = await fetch(url);
    const data: NeisSchoolResponse = await response.json();
    
    if (data.schoolInfo && data.schoolInfo[1].row) {
      return data.schoolInfo[1].row[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching school info:", error);
    return null;
  }
};

export const fetchSchedule = async (
  officeCode: string, 
  schoolCode: string, 
  startDate: string, 
  endDate: string
): Promise<AcademicSchedule[]> => {
  // Dates must be in YYYYMMDD format
  const start = startDate.replace(/-/g, '');
  const end = endDate.replace(/-/g, '');
  
  const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&AA_FROM_YMD=${start}&AA_TO_YMD=${end}`;
  
  try {
    const response = await fetch(url);
    const data: NeisScheduleResponse = await response.json();
    
    if (data.SchoolSchedule && data.SchoolSchedule[1].row) {
      return data.SchoolSchedule[1].row;
    }
    return [];
  } catch (error) {
    console.error("Error fetching academic schedule:", error);
    return [];
  }
};
