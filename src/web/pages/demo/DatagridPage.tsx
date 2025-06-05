import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Button } from '@progress/kendo-react-buttons';
import logger from '@/shared/utils/logger';
import { EumDataGrid, useCreateEumDataGridRequest } from '@/shared/components/ui/Eum/EumDataGrid';
import { DataGridRequest } from '@/shared/api/dataGridApi';

export default function DatagridPage() {
    const { t } = useTranslation(['common', 'demo']);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [loading, setLoading] = useState(false);

    // 로그인한 유저 정보를 자동으로 사용하는 요청 생성 함수
    const createRequest = useCreateEumDataGridRequest();

    // 컬럼 구분선 스타일 테스트용 상태


    // 기본 DataGrid 요청 설정 (로그인한 유저 ID 자동 사용)
    const [gridRequest, setGridRequest] = useState<DataGridRequest>(
        createRequest(
            'P_1010',
            ['ABC', 'DEF'],
            ['S', 'S']
        )
    );

    const handleSearch = () => {
        logger.info('Search clicked', { startDate, endDate });

        // 검색 조건에 따라 새로운 요청 생성 (로그인한 유저 ID 자동 사용)
        const newRequest = createRequest(
            'P_1010', // callId
            [
                startDate?.toISOString().split('T')[0] || '',
                endDate?.toISOString().split('T')[0] || ''
            ], // parameters
            ['S', 'S'] // parametertype
        );

        setGridRequest(newRequest);
    };

    // 다른 데이터 요청 예시들 (로그인한 유저 ID 자동 사용)

    // 에러 핸들러
    const handleError = (error: string) => {
        logger.error('DataGrid Error:', error);
        alert(`데이터 로드 오류: ${error}`);
    };

    // 데이터 로드 완료 핸들러
    const handleDataLoad = (data: any[]) => {
        logger.info('DataGrid 데이터 로드 완료:', data.length, '건');
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <h1 className="text-2xl font-bold mb-6">
                {t('demo:dataGridPage.title')} (커스텀 HOC DataGrid)
            </h1>

            {/* 상단 검색 영역 */}
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                            {t('common:common.startDate')}:
                        </label>
                        <DatePicker
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value)}
                            format="yyyy-MM-dd"
                            className="w-40"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                            {t('common:common.endDate')}:
                        </label>
                        <DatePicker
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value)}
                            format="yyyy-MM-dd"
                            min={startDate || undefined}
                            className="w-40"
                        />
                    </div>
                    <Button themeColor="primary" onClick={handleSearch}>
                        {t('common:common.search')}
                    </Button>
                </div>
            </div>



            {/* 커스텀 DataGrid */}
            <div className="border rounded-md shadow-sm overflow-hidden">
                <EumDataGrid
                    request={gridRequest}
                    loading={loading}
                    onLoadingChange={setLoading}
                    onError={handleError}
                    onDataLoad={handleDataLoad}
                    gridOptions={{
                        height: '500px',
                        showFilter: true,
                        showSort: true,
                        showResize: true,
                        enablePaging: false
                    }}
                    columnOverrides={{
                        // 특정 컬럼 커스터마이징 예시
                        UnitPrice: {
                            format: '{0:c}',
                            width: '120px',
                        },
                        ProductName: {
                            width: '200px',
                        },
                    }}
                    className="custom-company-datagrid"
                // Kendo Grid의 모든 props를 여기에 추가할 수 있음
                // sortable={true}  // gridOptions로 제어되지만 직접 설정도 가능
                // onRowClick={(event) => console.log('Row clicked:', event.dataItem)}
                // onSelectionChange={(event) => console.log('Selection changed:', event.dataItems)}
                />
            </div>
        </div>
    );
} 