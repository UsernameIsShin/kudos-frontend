import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { apiClient } from './client';
import logger from '@/shared/utils/logger';
import { useAuthStore } from '@/shared/stores/authStore';

// API 요청 타입 정의
export interface DataGridRequest {
    callId: string;
    parameters?: (string | number)[];
    parametertype?: string[];
    userId?: string;
    requestId?: string;
    timestamp?: string;
}

// 새로운 API 응답 구조에 맞춘 타입 정의
export interface GridHeader {
    seq: number;
    bandname: string;
    columnname: string;
    columnformat: string;
    columnformatnumber: number;
    comumntype: string;
    width: number;
    footername: string;
    footerformat: string | null;
    protocolFormatString: string;
}

export interface GridDataField {
    name: string;
    type: string;
}

export interface DataGridResponse {
    status: number;
    message: string;
    data: {
        headers: GridHeader[];
        datafield: GridDataField[];
        rows: Record<string, any>[];
    };
    timestamp: number;
    metadata: Record<string, any>;
}

// 내부적으로 사용할 그리드 컬럼 정의 (기존 호환성 유지)
export interface GridColumn {
    field: string;
    title: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    width?: string;
    format?: string;
    filterable?: boolean;
    sortable?: boolean;
    hidden?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    className?: string;
}

/**
 * DataGrid 데이터를 서버에서 가져오는 함수
 * @param request - 요청 데이터
 * @returns Promise<DataGridResponse>
 */
export const fetchDataGridData = async (request: DataGridRequest): Promise<DataGridResponse> => {
    try {
        // parameters와 parametertype이 없는 경우 빈 배열로 설정
        const requestBody = {
            ...request,
            parameters: request.parameters || [],
            parametertype: request.parametertype || [],
        };

        const url = `/eum/stp/getGridData`;

        logger.info('DataGrid API 요청 시작:', {
            url,
            callId: request.callId,
            parametersCount: requestBody.parameters.length,
            userId: request.userId
        });

        const response = await apiClient.post<DataGridResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        logger.info('DataGrid API 응답 성공:', {
            status: response.data.status,
            message: response.data.message,
            rowCount: response.data.data?.rows?.length || 0,
            columnCount: response.data.data?.headers?.length || 0
        });

        return response.data;
    } catch (error: any) {
        logger.error('DataGrid API 에러:', {
            error: error.message,
            url: `/eum/stp/getGridData`,
            callId: request.callId,
            response: error.response?.data
        });

        // 에러 응답 구조화
        return {
            status: 500,
            message: error.response?.data?.message || error.message || '데이터를 가져오는 중 오류가 발생했습니다.',
            data: {
                headers: [],
                datafield: [],
                rows: [],
            },
            timestamp: Date.now() / 1000,
            metadata: {},
        };
    }
};

/**
 * 헤더 정보를 GridColumn으로 변환하는 함수
 */
export const convertHeadersToColumns = (headers: GridHeader[], datafields: GridDataField[]): GridColumn[] => {

    return headers.map((header, index) => {
        const datafield = datafields[index];

        // columnformat에 따른 타입 및 정렬 설정
        let type: GridColumn['type'] = 'string';
        let textAlign: GridColumn['textAlign'] = 'left';
        let className = '';

        switch (header.columnformat.toLowerCase()) {
            case 's': // 문자왼쪽
                type = 'string';
                textAlign = 'left';
                className = 'eum-text-left';
                break;
            case 'S': // 문자가운데  
                type = 'string';
                textAlign = 'center';
                className = 'eum-text-center';
                break;
            case 'sr': // 문자오른쪽
                type = 'string';
                textAlign = 'right';
                className = 'eum-text-right';
                break;
            case 'i': // 숫자오른쪽 (DECIMAL)
            case 'I':
                type = 'number';
                textAlign = 'right';
                className = 'eum-text-right';
                break;
            case 'f': // 숫자오른쪽 (DDECIMAL)
            case 'F':
                type = 'number';
                textAlign = 'right';
                className = 'eum-text-right';
                break;
            case 'fm': // 숫자가운데 (DDECIMAL)
            case 'FM':
                type = 'number';
                textAlign = 'center';
                className = 'eum-text-center';
                break;
            case 'd': // 날짜
            case 'D':
            case 'dd':
            case 'DD':
            case 'dt':
            case 'DT':
            case 'da':
            case 'DA':
                type = 'date';
                textAlign = 'center';
                className = 'eum-text-center';
                break;
            default:
                // 기본값: datafield의 type을 참조
                if (datafield) {
                    switch (datafield.type.toLowerCase()) {
                        case 'number':
                            type = 'number';
                            textAlign = 'right';
                            className = 'eum-text-right';
                            break;
                        case 'date':
                            type = 'date';
                            textAlign = 'center';
                            className = 'eum-text-center';
                            break;
                        case 'boolean':
                            type = 'boolean';
                            textAlign = 'center';
                            className = 'eum-text-center';
                            break;
                        default:
                            type = 'string';
                            textAlign = 'left';
                            className = 'eum-text-left';
                    }
                }
        }

        // 포맷 설정 (숫자 타입일 때)
        let format: string | undefined;
        if ((header.columnformat === 'F' || header.columnformat === 'f') && header.columnformatnumber > 0) {
            format = `{0:n${header.columnformatnumber}}`;
        } else if (header.columnformat === 'F' || header.columnformat === 'f') {
            format = '{0:n}';
        } else if (header.columnformat === 'i' || header.columnformat === 'I') {
            format = '{0:n0}'; // 정수 포맷
        }

        const column: GridColumn = {
            field: (datafield?.name || `col_${index}`).toLowerCase(), // 컬럼명을 소문자로 통일
            title: header.columnname,
            type,
            width: header.width > 0 ? `${header.width}px` : '150px', // width가 0 이하면 기본값 150px 할당
            format,
            filterable: true,
            sortable: true,
            hidden: header.width === 0, // width가 0이면 숨김
            textAlign,
            className,
        };


        return column;
    });
};

/**
 * 현재 타임스탬프를 ISO 형식으로 생성하는 헬퍼 함수
 */
export const generateTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * React Query를 사용한 DataGrid 데이터 로드 훅
 * 자동으로 중복 요청 제거 및 로딩 상태 관리를 제공합니다. (캐싱 비활성화)
 * 
 * @param request - DataGrid 요청 객체
 * @param options - React Query 옵션
 * @returns UseQueryResult with DataGrid data
 */
export const useDataGridQuery = (
    request: DataGridRequest,
    options?: {
        enabled?: boolean;
    }
): UseQueryResult<DataGridResponse, Error> => {
    // React Query의 키는 직렬화 가능하고 안정적인 값의 배열이어야 합니다.
    // request 객체 또는 그 안의 배열/객체의 참조가 변경되더라도
    // 내용이 같으면 동일한 쿼리로 인식되도록 useMemo와 JSON.stringify를 사용합니다.
    const queryKey: QueryKey = useMemo(() => [
        'dataGrid',
        request.callId,
        request.userId || 'admin',
        // parameters와 parametertype 배열을 문자열로 만들어 키의 안정성 확보
        JSON.stringify(request.parameters || []),
        JSON.stringify(request.parametertype || []),
    ], [
        request.callId,
        request.userId,
        request.parameters,
        request.parametertype
    ]);

    return useQuery({
        queryKey,
        queryFn: () => {
            // API를 호출할 때는 항상 최신 타임스탬프와 요청 ID를 사용합니다.
            // queryKey는 캐시 식별용, 실제 요청 파라미터는 여기서 최종 조립합니다.
            const apiRequest: DataGridRequest = {
                ...request,
                parameters: request.parameters || [],
                parametertype: request.parametertype || [],
                timestamp: generateTimestamp(),
                userId: request.userId || 'admin',
                requestId: `REQ-${Date.now()}` // 매 호출마다 고유한 ID 생성
            };

            logger.debug('🔄 React Query API Fetched', {
                queryKey,
                callId: apiRequest.callId,
            });

            return fetchDataGridData(apiRequest);
        },
        enabled: options?.enabled ?? true,
        staleTime: 1000, // 1초간 동일 요청에 대해 캐시된 데이터 반환
        gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
        refetchOnMount: false, // 마운트 시 자동 리페치 비활성화
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
        refetchOnReconnect: true, // 네트워크 재연결 시만 자동 갱신
        networkMode: 'always', // 네트워크 상태와 관계없이 실행
        retry: (failureCount, error: any) => {
            // 401, 403 에러는 재시도하지 않음
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 2; // 재시도 횟수 줄임
        },
    });
};

/**
 * 편의 함수: 빠른 DataGrid 요청 생성
 */
export const createEumDataGridRequest = (
    callId: string,
    parameters?: (string | number)[],
    parameterTypes?: string[],
    userId: string = 'admin'
): DataGridRequest => {
    return {
        callId,
        parameters,
        parametertype: parameterTypes,
        userId,
        requestId: `REQ-${Date.now()}`,
        timestamp: generateTimestamp(),
    };
};

/**
 * 로그인한 유저 정보를 자동으로 사용하는 DataGrid 요청 생성 훅
 * 현재 로그인한 유저의 userId를 자동으로 기본값으로 사용합니다.
 * @returns DataGrid 요청 객체 생성 함수 (useCallback으로 메모이제이션됨)
 */
export const useCreateEumDataGridRequest = () => {
    const { user } = useAuthStore();

    return useCallback((
        callId: string,
        parameters?: (string | number)[],
        parameterTypes?: string[]
    ): DataGridRequest => {
        const userId = user?.userId || 'admin'; // 로그인 유저가 없으면 기본값 사용

        return {
            callId,
            parameters,
            parametertype: parameterTypes,
            userId,
            requestId: `REQ-${Date.now()}`,
            timestamp: generateTimestamp(),
        };
    }, [user?.userId]); // user.userId가 변경될 때만 함수 재생성
}; 