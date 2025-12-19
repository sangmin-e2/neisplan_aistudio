
import React, { useState, useEffect, useCallback } from 'react';
import { EDUCATION_OFFICES, STORAGE_KEY } from './constants';
import { AcademicSchedule, LocalStorageData } from './types';
import { fetchSchoolInfo, fetchSchedule } from './services/neisService';

const App: React.FC = () => {
  const [officeCode, setOfficeCode] = useState<string>('B10');
  const [schoolName, setSchoolName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14).toISOString().split('T')[0]);
  const [results, setResults] = useState<AcademicSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load last search from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: LocalStorageData = JSON.parse(saved);
        setOfficeCode(parsed.officeCode);
        setSchoolName(parsed.schoolName);
        setStartDate(parsed.startDate);
        setEndDate(parsed.endDate);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save current search to LocalStorage
  const saveSearch = useCallback((data: LocalStorageData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const handleSearch = async () => {
    if (!schoolName.trim()) {
      alert("학교명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const school = await fetchSchoolInfo(officeCode, schoolName);
      if (!school) {
        setError("해당 학교를 찾을 수 없습니다. 교육청과 학교명을 다시 확인해주세요.");
        setIsLoading(false);
        return;
      }

      const schedule = await fetchSchedule(officeCode, school.SD_SCHUL_CODE, startDate, endDate);
      
      if (schedule.length === 0) {
        setError("해당 기간의 학사일정이 없습니다.");
      } else {
        setResults(schedule);
        // Persist the successful search
        saveSearch({
          officeCode,
          schoolName,
          startDate,
          endDate
        });
      }
    } catch (err) {
      setError("조회 도중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date YYYYMMDD to YYYY-MM-DD
  const formatDate = (dateStr: string) => {
    if (dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Title Bar Placeholder for Win GUI style */}
      <div className="flex justify-between items-center bg-[#f0f0f0] border-b border-gray-300 pb-2 mb-4">
        <h1 className="text-sm font-bold text-gray-700">학사력 조회 프로그램(by sangmin)</h1>
      </div>

      {/* Control Panel */}
      <div className="bg-[#f0f0f0] border border-gray-300 p-4 shadow-sm">
        <div className="text-xs mb-2 font-semibold">조회 조건</div>
        <div className="border border-gray-300 p-4 space-y-2 bg-[#f9f9f9]">
          
          <div className="flex items-center gap-2">
            <label className="w-20 text-xs text-right">교육청:</label>
            <select 
              className="win-input flex-1 bg-white"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
            >
              {EDUCATION_OFFICES.map(office => (
                <option key={office.code} value={office.code}>{office.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-20 text-xs text-right">학교명:</label>
            <input 
              type="text" 
              className="win-input flex-1 bg-white"
              placeholder="예: 오금중학교"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="w-20 text-xs text-right">시작일:</label>
              <input 
                type="date" 
                className="win-input bg-white w-32"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-16 text-xs text-right">종료일:</label>
              <input 
                type="date" 
                className="win-input bg-white w-32"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            className="win-button w-full mt-4 flex items-center justify-center gap-2"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : null}
            조회
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-4 bg-[#f0f0f0] border border-gray-300 p-1 min-h-[300px]">
        {error && (
          <div className="p-4 text-center text-red-600 text-xs bg-white mb-2">
            {error}
          </div>
        )}
        <div className="overflow-x-auto bg-white border border-gray-400">
          <table className="win-table">
            <thead>
              <tr>
                <th className="w-12">번호</th>
                <th className="w-40">학사일자</th>
                <th>행사명</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((item, idx) => (
                  <tr key={`${item.AA_YMD}-${idx}`} className="hover:bg-[#e8f2ff]">
                    <td className="text-center text-gray-500">{idx + 1}</td>
                    <td className="text-center">{formatDate(item.AA_YMD)}</td>
                    <td className="px-4">{item.EVENT_NM}</td>
                  </tr>
                ))
              ) : (
                !isLoading && !error && (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400 italic">
                      조회된 학사일정이 없습니다.
                    </td>
                  </tr>
                )
              )}
              {isLoading && (
                <tr>
                  <td colSpan={3} className="text-center py-10">
                    <i className="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-gray-400 text-right">
        Data provided by NEIS Open Portal (Public API)
      </div>
    </div>
  );
};

export default App;
