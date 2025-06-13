import dayjs from 'dayjs';

/**
 * Date 객체나 dayjs 객체를 'YYYYMMDD' 형식의 문자열로 변환합니다.
 * @param date 변환할 날짜 (Date, dayjs, 또는 null/undefined)
 * @returns 'YYYYMMDD' 형식의 문자열. date가 유효하지 않으면 빈 문자열을 반환합니다.
 */
export const formatDateToYYYYMMDD = (date: Date | dayjs.Dayjs | null | undefined): string => {
    if (!date) return '';
    return dayjs(date).format('YYYYMMDD');
};

/**
 * 'YYYYMMDD' 형식의 문자열을 Date 객체로 변환합니다.
 * @param dateString 'YYYYMMDD' 형식의 날짜 문자열
 * @returns Date 객체. 문자열이 유효하지 않으면 null을 반환합니다.
 */
export const parseYYYYMMDDToDate = (dateString: string): Date | null => {
    if (!dateString || dateString.length !== 8) return null;
    const date = dayjs(dateString, 'YYYYMMDD');
    return date.isValid() ? date.toDate() : null;
};

/**
 * 입력일자 기준의 달의 마지막 날을 가져옵니다.
 * @param date 기준이 될 날짜 (Date, dayjs, 또는 null/undefined). null이면 오늘 날짜를 기준으로 합니다.
 * @returns 해당 달의 마지막 날의 'YYYYMMDD' 형식 문자열
 */
export const getLastDayOfMonth = (date?: Date | dayjs.Dayjs | null): string => {
    const targetDate = date ? dayjs(date) : dayjs();
    return targetDate.endOf('month').format('YYYYMMDD');
};
/**
 * 입력일자 기준의 첫번째 휴일이 아닌 일자를 가져옵니다.
 * @param date 기준이 될 날짜 (Date, dayjs, 또는 null/undefined). null이면 오늘 날짜를 기준으로 합니다.
 * @returns 해당 달의 첫번째 평일의 'YYYYMMDD' 형식 문자열
 */
export const getFirstWeekdayOfMonth = (date?: Date | dayjs.Dayjs | null): string => {
    const targetDate = date ? dayjs(date) : dayjs();
    const firstDayOfMonth = targetDate.startOf('month');

    // 첫번째 날이 주말(토,일)인 경우 다음 평일을 찾습니다
    let currentDay = firstDayOfMonth;
    while (currentDay.day() === 0 || currentDay.day() === 6) { // 0: 일요일, 6: 토요일
        currentDay = currentDay.add(1, 'day');
    }

    return currentDay.format('YYYYMMDD');
};


/**
 * 오늘 날짜를 기준으로 n년 전 날짜를 가져옵니다.
 * @param days n년
 * @returns n년 전 날짜의 'YYYYMMDD' 형식 문자열
 */
export const getYearsAgo = (years: number): string => {
    return dayjs().subtract(years, 'year').format('YYYYMMDD');
};

/**
 * 오늘 날짜를 기준으로 n일일 전 날짜를 가져옵니다.
 * @param days n일
 * @returns n일 전 날짜의 'YYYYMMDD' 형식 문자열
 */
export const getDaysAgo = (days: number): string => {
    return dayjs().subtract(days, 'day').format('YYYYMMDD');
};

/**
 * 오늘 날짜를 기준으로 n개월 전 날짜를 가져옵니다.
 * @param months n개월
 * @returns n개월 전 날짜의 'YYYYMMDD' 형식 문자열
 */
export const getMonthsAgo = (months: number): string => {
    return dayjs().subtract(months, 'month').format('YYYYMMDD');
};

/**
 * 오늘 날짜를 가져옵니다.
 * @returns 오늘 날짜의 'YYYYMMDD' 형식 문자열
 */
export const getToday = (): string => {
    return dayjs().format('YYYYMMDD');
}; 