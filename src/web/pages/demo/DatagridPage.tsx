import { useState, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Button } from '@progress/kendo-react-buttons';
import logger from '@/shared/utils/logger';
import { EumDataGrid, EumDataGridRef } from '@/shared/components/ui/Eum/EumDataGrid';
import { DataGridRequest, useCreateEumDataGridRequest } from '@/shared/api/dataGridApi';
import { formatDateToYYYYMMDD, getToday, getYearsAgo, parseYYYYMMDDToDate } from '@/shared/utils/dateUtils';

export default function DatagridPage() {
    const { t } = useTranslation(['common', 'demo']);
    const [startDate, setStartDate] = useState<string>(getYearsAgo(1));
    const [endDate, setEndDate] = useState<string>(getToday());
    const [loading, setLoading] = useState(false);

    // EumDataGrid ref for data manipulation
    const gridRef = useRef<EumDataGridRef>(null);

    // 데이터 조작 관련 상태들
    const [currentData, setCurrentData] = useState<any[]>([]);
    const [selectedCount, setSelectedCount] = useState(0);

    // 로그인한 유저 정보를 자동으로 사용하는 요청 생성 함수 (안정화됨)
    const createRequest = useCreateEumDataGridRequest();

    // 최초 로딩 시 사용될 안정적인 요청 객체
    const initialRequest = useMemo(() =>
        createRequest('P_1010', [getYearsAgo(1), getToday()]),
        [createRequest]
    );

    // DataGrid에 전달될 요청 상태
    const [gridRequest, setGridRequest] = useState<DataGridRequest>(initialRequest);

    const handleSearch = useCallback(() => {
        logger.info('🔍 검색 버튼 클릭 - 새로운 요청 생성:', { startDate, endDate });

        // 검색 조건에 따라 새로운 요청 생성 (로그인한 유저 ID 자동 사용)
        const newRequest = createRequest(
            'P_1010', // callId
            [startDate, endDate], // parameters
            ['S', 'S'] // parametertype
        );
        setGridRequest(newRequest);
    }, [startDate, endDate, createRequest]);

    // 에러 핸들러 (useCallback으로 참조 안정화)
    const handleError = useCallback((error: string) => {
        logger.error('DataGrid Error:', error);
        alert(`데이터 로드 오류: ${error}`);
    }, []);

    // 데이터 로드 완료 핸들러 (useCallback으로 참조 안정화)
    const handleDataLoad = useCallback((data: any[]) => {
        setCurrentData(data);
        logger.info('✅ DataGrid 데이터 로드 완료:', {
            rowCount: data.length,
            timestamp: new Date().toISOString()
        });
    }, []);

    // 데이터 변경 핸들러 (useCallback으로 참조 안정화)
    const handleDataChange = useCallback((data: any[]) => {
        setCurrentData(data);
    }, []);

    // 행 선택 변경 핸들러 (useCallback으로 참조 안정화)
    const handleRowSelectionChange = useCallback((selectedData: any[]) => {
        setSelectedCount(selectedData.length);
    }, []);

    // keyColumns prop 안정화 (useMemo 사용)
    const keyColumns = useMemo(() => ['td', 'code'], []);

    // gridOptions prop 안정화 (useMemo 사용)
    const gridOptions = useMemo(() => ({
        height: '400px',
        showFilter: true,
        showSort: true,
        showResize: true,
        enablePaging: false,
        selectable: true,
        lockedColumns: [0, 1, 2],
    }), []);

    // ---------------------------------------------------------------------
    // columnOverrides 사용 예시 (주석)
    // 특정 컬럼에 대해 필터 타입, 너비, 스타일 등을 개별적으로 오버라이드할 수 있습니다.
    // 아래 예시는 두 컬럼의 checkboxFilter 값을 제어하는 방법입니다.
    //
    // const columnOverrides = useMemo(() => ({
    //     // 문자열 컬럼이지만 기본 필터(text)로 사용하고 싶은 경우
    //     name: { checkboxFilter: false },
    //	 // 불리언 컬럼을 체크박스 필터로 강제 지정하고 너비도 조정
    //     status: { checkboxFilter: true, width: 120 },
    // }), []);
    // ---------------------------------------------------------------------

    // 데이터 조작 함수들
    const handleGetData = () => {
        const data = gridRef.current?.getData();
        logger.debug('전체 데이터 조회:', data?.length, '건');
        logger.debug('전체 데이터:', data);
    };

    const handleGetSelectedData = () => {
        const data = gridRef.current?.getSelectedData();
        logger.debug('선택된 데이터 조회:', data?.length, '건');
        console.log('선택된 데이터:', data);
    };

    const handleShowSelectedKeys = () => {
        const keys = gridRef.current?.getSelectedKeys();
        if (keys && keys.length > 0) {
            logger.info('선택된 행의 키 값들:', keys.join(', '));
            logger.info('선택된 행의 키 값들:', keys);
        } else {
            logger.info('선택된 행이 없습니다');
        }
    };

    const handleTestSelection = () => {
        // 첫 번째 행을 프로그래밍 방식으로 선택
        gridRef.current?.selectRows([0]);
        logger.info('프로그래밍 방식으로 첫 번째 행 선택 시도');
    };

    const handleRefreshData = () => {
        gridRef.current?.refreshData();
        logger.info('React Query 데이터 새로고침 시작 (refetch)');
    };

    const handleClearFilters = () => {
        gridRef.current?.clearFilters();
        logger.info('필터 초기화 완료');
    };

    const handleClearSort = () => {
        gridRef.current?.clearSort();
        logger.info('정렬 초기화 완료');
    };

    const handleResetState = () => {
        gridRef.current?.resetState();
        logger.info('그리드 상태 초기화 완료');
    };


    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <h1 className="text-2xl font-bold mb-6">
                {t('demo:dataGridPage.title')}
            </h1>


            {/* 상단 검색 영역 */}
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-16">
                            {t('common:common.startDate')}:
                        </label>
                        <DatePicker
                            id="startDate"
                            value={parseYYYYMMDDToDate(startDate)}
                            onChange={(e) => setStartDate(formatDateToYYYYMMDD(e.value))}
                            format="yyyy-MM-dd"
                            className="w-40"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-16">
                            {t('common:common.endDate')}:
                        </label>
                        <DatePicker
                            id="endDate"
                            value={parseYYYYMMDDToDate(endDate)}
                            onChange={(e) => setEndDate(formatDateToYYYYMMDD(e.value))}
                            format="yyyy-MM-dd"
                            min={parseYYYYMMDDToDate(startDate) || undefined}
                            className="w-40"
                        />
                    </div>
                    <Button themeColor="primary" onClick={handleSearch}>
                        {t('common:common.search')}
                    </Button>
                </div>
            </div>

            {/* 데이터 조작 컨트롤 패널 */}
            <div className="mb-6 p-4 border rounded-md bg-blue-50">

                {/* 데이터 조회 버튼들 */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">데이터 조회</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="small" themeColor="info" onClick={handleGetData}>
                            전체 데이터 조회
                        </Button>

                        <Button size="small" themeColor="info" onClick={handleGetSelectedData}>
                            선택된 데이터 조회
                        </Button>

                    </div>
                </div>

                {/* 데이터 변경 버튼들 */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">행 선택 제어</h4>
                    <div className="flex flex-wrap gap-2">


                        <Button size="small" themeColor="info" onClick={handleShowSelectedKeys}>
                            선택된 키 보기
                        </Button>
                        <Button size="small" themeColor="warning" onClick={handleTestSelection}>
                            프로그래밍 선택 테스트
                        </Button>
                    </div>
                </div>

                {/* 그리드 상태 제어 버튼들 */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">그리드 상태 제어</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="small" onClick={handleClearFilters}>
                            필터 초기화
                        </Button>
                        <Button size="small" onClick={handleClearSort}>
                            정렬 초기화
                        </Button>
                        <Button size="small" onClick={handleResetState}>
                            전체 상태 초기화
                        </Button>
                        <Button size="small" themeColor="secondary" onClick={handleRefreshData}>
                            React Query 새로고침
                        </Button>
                    </div>
                </div>

                {/* 현재 상태 정보 */}
                <div className="bg-white p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">현재 상태</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>전체 데이터: {currentData.length}건</div>
                        <div>선택된 행: {selectedCount}건</div>

                    </div>
                </div>

            </div>

            {/* 커스텀 DataGrid */}
            <div className="border rounded-md shadow-sm overflow-hidden">
                <EumDataGrid
                    ref={gridRef}
                    request={gridRequest}
                    loading={loading}
                    onLoadingChange={setLoading}
                    onError={handleError}
                    onDataLoad={handleDataLoad}
                    onDataChange={handleDataChange}
                    onRowSelectionChange={handleRowSelectionChange}

                    // 행 선택 및 키 설정
                    enableRowSelection={true}
                    selectionMode="single"
                    keyColumns={keyColumns}
                    gridOptions={gridOptions}
                    // columnOverrides={columnOverrides} // 필요 시 주석 해제하여 사용
                />
            </div>
        </div>
    );
}
