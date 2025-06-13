import { v7 as uuidv7 } from 'uuid';

/**
 * 타임스탬프 기반의 정렬 가능한 UUID v7을 생성합니다.
 * @returns {string} UUID v7 문자열
 */
export const generateUUIDv7 = (): string => {
    return uuidv7();
}; 