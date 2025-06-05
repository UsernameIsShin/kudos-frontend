import React, { useState, useEffect, useMemo } from 'react';
import { Grid, GridColumn as Column, GridProps } from '@progress/kendo-react-grid';
import { process, State, SortDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import {
    fetchDataGridData,
    DataGridRequest,
    GridColumn,
    generateTimestamp,
    createDefaultMetadata,
    convertHeadersToColumns
} from '@/shared/api/dataGridApi';
import { EumColumnMenu } from './EumColumnMenu';
import { useAuthStore } from '@/shared/stores/authStore'
import logger from '@/shared/utils/logger';

export interface EumDataGridProps extends Omit<GridProps, 'data' | 'children' | 'onSortChange' | 'onFilterChange'> {
    // 필수 props
    request: DataGridRequest;

    // 선택적 props
    loading?: boolean;
    onLoadingChange?: (loading: boolean) => void;
    onError?: (error: string) => void;
    onDataLoad?: (data: any[]) => void;

    // 그리드 설정 props
    gridOptions?: {
        height?: string | number;
        rowheight?: string | number;
        showFilter?: boolean;
        showSort?: boolean;
        showResize?: boolean;
        defaultPageSize?: number;
        enablePaging?: boolean;

    };

    // 컬럼 커스터마이징
    columnOverrides?: Record<string, Partial<GridColumn>>;

    // 스타일링
    className?: string;
    containerStyle?: React.CSSProperties;

    // 상태 관리 콜백 (커스텀)
    onStateChange?: (state: State) => void;
    onSortStateChange?: (sort: SortDescriptor[]) => void;
    onFilterStateChange?: (filter: CompositeFilterDescriptor | undefined) => void;
}

// EumDataGrid 인스턴스 메서드 타입
export interface EumDataGridRef {
    clearFilters: () => void;
    clearSort: () => void;
    resetState: () => void;
    getCurrentState: () => State;
}

/**
 * 커스텀 DataGrid HOC 컴포넌트
 * Kendo DataGrid를 감싸서 서버 데이터 통신과 추가 기능을 제공합니다.
 */
export const EumDataGrid = React.forwardRef<EumDataGridRef, EumDataGridProps>(({
    request,
    loading: externalLoading,
    onLoadingChange,
    onError,
    onDataLoad,
    gridOptions = {},
    columnOverrides = {},
    className = '',
    containerStyle = {},
    onStateChange,
    onSortStateChange,
    onFilterStateChange,
    ...kendoGridProps // 나머지 모든 Kendo Grid props
}, ref) => {
    // 상태 관리
    const [internalLoading, setInternalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [columns, setColumns] = useState<GridColumn[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [dataState, setDataState] = useState<State>({
        skip: 0,
        take: gridOptions.defaultPageSize || 50,
        sort: [] as SortDescriptor[],
        filter: undefined as CompositeFilterDescriptor | undefined,
    });

    // 헬퍼 함수들을 ref를 통해 노출
    React.useImperativeHandle(ref, () => ({
        clearFilters: () => {
            setDataState(prev => ({ ...prev, filter: undefined }));
            onFilterStateChange?.(undefined);
        },
        clearSort: () => {
            setDataState(prev => ({ ...prev, sort: [] }));
            onSortStateChange?.([]);
        },
        resetState: () => {
            const initialState = {
                skip: 0,
                take: gridOptions.defaultPageSize || 50,
                sort: [] as SortDescriptor[],
                filter: undefined as CompositeFilterDescriptor | undefined,
            };
            setDataState(initialState);
            onSortStateChange?.([]);
            onFilterStateChange?.(undefined);
        },
        getCurrentState: () => dataState,
    }));

    // 로딩 상태 (외부에서 제어 가능)
    const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

    // 그리드 옵션 기본값
    const {
        height = '400px',
        rowheight = 25,
        showFilter = false,
        showSort = true,
        showResize = true,
        enablePaging = false
    } = gridOptions;

    // 데이터 로드 함수
    const loadData = async () => {
        if (!request.callId) {
            const errorMsg = 'callId는 필수입니다.';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        try {
            setInternalLoading(true);
            onLoadingChange?.(true);
            setError(null);

            logger.info('EumDataGrid 데이터 로드 시작:', request);

            const response = await fetchDataGridData(request);

            // 새로운 API 응답 구조 처리
            if (response.status === 200 && response.data) {
                const { headers, datafield, rows } = response.data;

                // 헤더 정보를 GridColumn으로 변환
                const serverColumns = convertHeadersToColumns(headers, datafield);

                // 디버깅: 컬럼 정보 출력
                logger.info('컬럼 변환 결과:', {
                    headers: headers.map(h => ({
                        seq: h.seq,
                        columnname: h.columnname,
                        columnformat: h.columnformat,
                        width: h.width
                    })),
                    convertedColumns: serverColumns.map(c => ({
                        field: c.field,
                        title: c.title,
                        type: c.type,
                        textAlign: c.textAlign,
                        className: c.className,
                        hidden: c.hidden,
                        width: c.width
                    }))
                });

                // 컬럼 오버라이드 적용
                const processedColumns = serverColumns.map(col => ({
                    ...col,
                    ...columnOverrides[col.field],
                }));

                // 데이터 처리 - 컬럼에 매핑되지 않는 필드는 빈 값으로 처리
                const processedRows = rows.map(row => {
                    const processedRow: Record<string, any> = {};

                    // 각 컬럼에 대해 데이터 매핑 및 타입 변환
                    processedColumns.forEach(col => {
                        if (row.hasOwnProperty(col.field)) {
                            let value = row[col.field];

                            // 컬럼 타입에 따른 데이터 변환
                            switch (col.type) {
                                case 'number':
                                    // 숫자 타입인 경우 숫자로 변환 (정렬이 제대로 되도록)
                                    if (value !== null && value !== undefined && value !== '') {
                                        const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                        processedRow[col.field] = isNaN(numValue) ? 0 : numValue;
                                    } else {
                                        processedRow[col.field] = 0;
                                    }
                                    break;
                                case 'date':
                                    // 날짜 타입인 경우 Date 객체로 변환
                                    if (value && typeof value === 'string') {
                                        // YYYYMMDD 형식을 Date로 변환
                                        if (value.length === 8 && /^\d{8}$/.test(value)) {
                                            const year = parseInt(value.substring(0, 4));
                                            const month = parseInt(value.substring(4, 6)) - 1; // 월은 0부터 시작
                                            const day = parseInt(value.substring(6, 8));
                                            processedRow[col.field] = new Date(year, month, day);
                                        } else {
                                            processedRow[col.field] = new Date(value);
                                        }
                                    } else {
                                        processedRow[col.field] = value;
                                    }
                                    break;
                                case 'boolean':
                                    // 불린 타입 변환
                                    processedRow[col.field] = Boolean(value);
                                    break;
                                default:
                                    // 문자열 타입 (기본값)
                                    processedRow[col.field] = value !== null && value !== undefined ? String(value) : '';
                            }
                        } else {
                            // 컬럼 ID에 해당하는 값이 없으면 타입에 따른 기본값
                            switch (col.type) {
                                case 'number':
                                    processedRow[col.field] = 0;
                                    break;
                                case 'date':
                                    processedRow[col.field] = null;
                                    break;
                                case 'boolean':
                                    processedRow[col.field] = false;
                                    break;
                                default:
                                    processedRow[col.field] = '';
                            }
                        }
                    });

                    return processedRow;
                });

                setColumns(processedColumns);
                setData(processedRows);
                onDataLoad?.(processedRows);

                logger.info('EumDataGrid 데이터 로드 완료:', {
                    columnCount: processedColumns.length,
                    rowCount: processedRows.length,
                    hiddenColumns: processedColumns.filter(col => col.hidden).length,
                    visibleColumns: processedColumns.filter(col => !col.hidden).map(c => ({
                        field: c.field,
                        title: c.title,
                        textAlign: c.textAlign,
                        className: c.className,
                        type: c.type,
                        width: c.width
                    }))
                });



            } else {
                const errorMsg = response.message || '데이터를 가져오는데 실패했습니다.';
                setError(errorMsg);
                onError?.(errorMsg);
            }
        } catch (err: any) {
            const errorMsg = err.message || '예상치 못한 오류가 발생했습니다.';
            setError(errorMsg);
            onError?.(errorMsg);
            logger.error('EumDataGrid 데이터 로드 에러:', err);
        } finally {
            setInternalLoading(false);
            onLoadingChange?.(false);
        }
    };

    // request 변경 시 데이터 다시 로드
    useEffect(() => {
        loadData();
    }, [request.callId, JSON.stringify(request.parameters)]);

    // 데이터 상태 변경 핸들러 (정렬, 필터, 페이징 통합 처리)
    const handleDataStateChange = (event: any) => {
        const newDataState = event.dataState;


        setDataState(newDataState);

        // 외부 콜백 호출
        onStateChange?.(newDataState);

        if (onSortStateChange && newDataState.sort !== dataState.sort) {
            onSortStateChange(newDataState.sort || []);
        }
        if (onFilterStateChange && newDataState.filter !== dataState.filter) {
            onFilterStateChange(newDataState.filter);
        }
    };

    // 처리된 데이터 (정렬, 필터링, 페이징 적용)
    const processedData = useMemo(() => {
        let result = data;

        // kendo-data-query의 process 함수를 사용하여 정렬, 필터링, 페이징 적용
        if (showSort || showFilter || enablePaging) {
            const processConfig = {
                sort: showSort ? dataState.sort : undefined,
                filter: showFilter ? dataState.filter : undefined,
                skip: enablePaging ? dataState.skip : undefined,
                take: enablePaging ? dataState.take : undefined,
            };
            const processResult = process(result, processConfig);
            return processResult;
        }

        return {
            data: result,
            total: result.length,
        };
    }, [data, dataState, showSort, showFilter, enablePaging]);

    // 컬럼 렌더링 (hidden 컬럼 처리 추가)
    const renderColumns = () => {
        return columns
            .filter(col => !col.hidden) // hidden 컬럼 제외
            .map((col) => (
                <Column
                    key={col.field}
                    field={col.field}
                    title={col.title}
                    width={col.width}
                    format={col.format}
                    sortable={showSort && (col.sortable !== false)}
                    columnMenu={showFilter && (col.filterable !== false) ? EumColumnMenu : undefined}
                    headerClassName="eum-text-center"
                    className={col.className}
                />
            ));
    };

    // 에러 상태 렌더링
    if (error) {
        return (
            <div
                className={`custom-datagrid-error ${className}`}
                style={{
                    padding: '20px',
                    textAlign: 'center',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    ...containerStyle,
                }}
            >
                <h4>데이터 로드 오류</h4>
                <p>{error}</p>
                <button
                    onClick={loadData}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    // 로딩 상태 렌더링
    if (isLoading) {
        return (
            <div
                className={`custom-datagrid-loading ${className}`}
                style={{
                    height: typeof height === 'string' ? height : `${height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    ...containerStyle,
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        className="animate-spin"
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #007bff',
                            borderRadius: '50%',
                            margin: '0 auto 10px',
                        }}
                    />
                    <p>데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 메인 그리드 렌더링
    return (
        <div
            className={`custom-datagrid-container eum-grid-container ${className}`.trim()}
            style={containerStyle}
        >
            <Grid
                style={{ height }}
                data={processedData}
                {...dataState}
                onDataStateChange={handleDataStateChange}
                sortable={showSort ? {
                    allowUnsort: true,
                    mode: 'single'
                } : false}
                rowHeight={Number(rowheight)}
                resizable={showResize}
                pageable={enablePaging}
                sort={dataState.sort}
                {...kendoGridProps} // 모든 Kendo Grid props 전달
            >
                {renderColumns()}
            </Grid>
        </div>
    );
});

// displayName 설정 (개발 도구에서 컴포넌트 이름 표시)
EumDataGrid.displayName = 'EumDataGrid';

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
        metadata: createDefaultMetadata(userId),
        timestamp: generateTimestamp(),
    };
};

/**
 * 로그인한 유저 정보를 자동으로 사용하는 DataGrid 요청 생성 훅
 * 현재 로그인한 유저의 userId를 자동으로 기본값으로 사용합니다.
 * @returns DataGrid 요청 객체 생성 함수
 */
export const useCreateEumDataGridRequest = () => {
    const { user } = useAuthStore();

    return (
        callId: string,
        parameters?: (string | number)[],
        parameterTypes?: string[]
    ): DataGridRequest => {
        const userId = user?.userId || 'admin'; // 로그인 유저가 없으면 기본값 사용

        return {
            callId,
            parameters,
            parametertype: parameterTypes,
            metadata: createDefaultMetadata(userId),
            timestamp: generateTimestamp(),
        };
    };
};

export default EumDataGrid; 