import { apiClient } from './client';
import logger from '@/shared/utils/logger';

// API 요청 타입 정의
export interface DataGridRequest {
    callId: string;
    parameters?: (string | number)[];
    parametertype?: string[];
    metadata: {
        source: string;
        requestId: string;
        userId: string;
    };
    timestamp: string;
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
            userId: request.metadata.userId
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

        return {
            field: datafield?.name || `col_${index}`,
            title: header.columnname,
            type,
            width: header.width > 0 ? `${header.width}px` : undefined,
            format,
            filterable: true,
            sortable: true,
            hidden: header.width === 0, // width가 0이면 숨김
            textAlign,
            className,
        };
    });
};

/**
 * 현재 타임스탬프를 ISO 형식으로 생성하는 헬퍼 함수
 */
export const generateTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * 기본 메타데이터를 생성하는 헬퍼 함수
 */
export const createDefaultMetadata = (userId: string = 'admin'): DataGridRequest['metadata'] => {
    return {
        source: 'web',
        requestId: `REQ-${Date.now()}`,
        userId,
    };
}; 