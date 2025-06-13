import { apiClient } from './client';
import logger from '@/shared/utils/logger';
import { useAuthStore } from '@/shared/stores/authStore';
import { generateUUIDv7 } from '@/shared/utils/uuid';

/**
 * 표준 API 응답 구조
 */
export interface ApiResponse<T = any> {
    status: number;
    message: string;
    data: T | null;
    timestamp: number;
    metadata?: any;
    requestId?: string;
    userId?: string;
    success: boolean; // 성공 여부 플래그 추가
}

/**
 * 범용 API 호출 함수
 * @param url API 엔드포인트 URL
 * @param requestBody POST 요청 본문
 * @returns 표준화된 ApiResponse 객체를 담은 Promise
 */
export const callApi = async <T = any>(
    url: string,
    requestBody: Record<string, any>
): Promise<ApiResponse<T>> => {
    const startTime = Date.now();
    const { user } = useAuthStore.getState();

    // userId와 requestId를 요청 본문에 자동으로 추가
    const finalRequestBody = {
        ...requestBody,
        userId: user?.userId || 'null',
        requestId: generateUUIDv7(),
    };

    try {
        const response = await apiClient.post<any>(url, finalRequestBody);

        const endTime = Date.now();
        logger.info(`✅ API 호출 성공: ${url}`, {
            status: response.status,
            duration: `${endTime - startTime}ms`,
            requestId: response.data?.metadata?.requestId,
        });

        // 성공 응답을 표준 형식으로 래핑
        return {
            status: response.status,
            message: response.data.message || 'Success',
            data: response.data.data || null,
            timestamp: response.data.timestamp || startTime / 1000,
            metadata: response.data.metadata,
            requestId: response.data.metadata?.requestId,
            success: true,
        };

    } catch (error: any) {
        const endTime = Date.now();
        logger.error(`❌ API 호출 실패: ${url}`, {
            status: error.response?.status,
            message: error.message,
            duration: `${endTime - startTime}ms`,
            requestBody: finalRequestBody,
            response: error.response?.data
        });

        // 실패 응답을 표준 형식으로 래핑
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message || 'An unknown error occurred',
            data: null,
            timestamp: startTime / 1000,
            requestId: finalRequestBody.requestId,
            userId: finalRequestBody.userId,
            success: false,
        };
    }
};