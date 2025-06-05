import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Button } from '@progress/kendo-react-buttons';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { process, State } from '@progress/kendo-data-query';
import logger from '@/shared/utils/logger';


// Kendo UI DatePicker를 사용하려면 해당 로케일 데이터도 import 해야 할 수 있습니다.
// 예: import '@progress/kendo-date-math/tz/Europe/Sofia'; // 필요에 따라
// 예: import {IntlProvider, load, LocalizationProvider, loadMessages } from "@progress/kendo-react-intl";
// importlikelySubtags from "cldr-core/supplemental/likelySubtags.json";
// import currencyData from "cldr-core/supplemental/currencyData.json";
// import weekData from "cldr-core/supplemental/weekData.json";
// import numbers from "cldr-numbers-full/main/ko/numbers.json";
// import caGregorian from "cldr-dates-full/main/ko/ca-gregorian.json";
// import dateFields from "cldr-dates-full/main/ko/dateFields.json";
// import timeZoneNames from "cldr-dates-full/main/ko/timeZoneNames.json";
// load(
//   likelySubtags, currencyData, weekData, numbers, caGregorian, dateFields, timeZoneNames
// );

// 샘플 데이터 타입
interface Product {
    ProductID: number;
    ProductName: string;
    UnitPrice?: number;
    UnitsInStock?: number;
    Discontinued: boolean;
}

// 샘플 데이터 생성 함수
const sampleData: Product[] = Array.from({ length: 100 }, (_, i) => ({
    ProductID: i + 1,
    ProductName: `Product ${i + 1}`,
    UnitPrice: Math.floor(Math.random() * 100) + 10,
    UnitsInStock: Math.floor(Math.random() * 100),
    Discontinued: Math.random() > 0.8,
}));

export default function DatagridPage() {
    const { t } = useTranslation(['common', 'demo', 'navigation']);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    // Grid 페이징 및 정렬 등을 위한 상태
    const initialDataState: State = { skip: 0, take: 10, sort: [] };
    const [dataState, setDataState] = useState<State>(initialDataState);
    const [gridData, setGridData] = useState(process(sampleData, initialDataState));

    const handleSearch = () => {
        logger.info('Search clicked', { startDate, endDate });
        // TODO: 실제 데이터 조회 및 gridData 업데이트 로직 구현
        // 예: const newData = await fetchData(startDate, endDate);
        // setGridData(process(newData, dataState));
    };

    const handleDataStateChange = (event: any) => {
        setDataState(event.dataState);
        setGridData(process(sampleData, event.dataState));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">
                {t('demo:dataGridPage.title')} (Kendo UI Components)
            </h1>

            {/* 상단 검색 영역 */}
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                            {t('common:startDate')}:
                        </label>
                        <DatePicker
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value)}
                            format="yyyy-MM-dd"
                            className="w-full md:w-auto"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                            {t('common:endDate')}:
                        </label>
                        <DatePicker
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value)}
                            format="yyyy-MM-dd"
                            min={startDate || undefined} // 시작일 이후만 선택 가능
                            className="w-full md:w-auto"
                        />
                    </div>
                    <Button
                        themeColor={'primary'}
                        onClick={handleSearch}
                        className="w-full md:w-auto"
                    >
                        {t('common:search')}
                    </Button>
                </div>
            </div>

            {/* 데이터 그리드 영역 */}
            <div className="border rounded-md shadow-sm overflow-hidden">
                <Grid
                    style={{ height: '500px' }} // Grid 높이 500px로 설정
                    data={gridData} // 페이징/정렬 처리된 데이터
                    pageable={true}
                    sortable={true}
                    filterable={false} // 필요시 true로 변경하여 필터 사용
                    // onPageChange={handlePageChange} // 직접 페이징 처리 시
                    // onSortChange={handleSortChange} // 직접 정렬 처리 시
                    {...dataState} // 현재 skip, take, sort 정보 전달
                    onDataStateChange={handleDataStateChange} // 페이징, 정렬 변경 시 호출
                    resizable={true} // 컬럼 너비 조절 기능
                >
                    {/*}  <GridToolbar>
                        <div className="p-1 text-right">
                            <Button
                                themeColor={'primary'}
                                onClick={() => logger.info('Export to Excel clicked')} // 실제 엑셀 내보내기 로직 추가
                            >
                                {t('common:exportExcel')}
                            </Button>
                        </div>
                    </GridToolbar>
                    */}
                    <Column field="ProductID" title={t('demo:dataGrid.productId') || "ID"} width="100px" />
                    <Column field="ProductName" title={t('demo:dataGrid.productName') || "Product Name"} width="250px" />
                    <Column field="UnitPrice" title={t('demo:dataGrid.unitPrice') || "Unit Price"} format="{0:c}" width="150px" />
                    <Column field="UnitsInStock" title={t('demo:dataGrid.unitsInStock') || "Units In Stock"} width="150px" />
                    <Column field="Discontinued" title={t('demo:dataGrid.discontinued') || "Discontinued"} width="150px" />
                </Grid>
            </div>
        </div>
    );
} 