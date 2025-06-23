import React, { useState, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Button } from "@progress/kendo-react-buttons";
import logger from "@/shared/utils/logger";
import {
  EumDataGrid,
  EumDataGridRef,
} from "@/shared/components/ui/Eum/EumDataGrid";
import {
  DataGridRequest,
  useCreateEumDataGridRequest,
} from "@/shared/api/dataGridApi";
import {
  formatDateToYYYYMMDD,
  getToday,
  getYearsAgo,
  parseYYYYMMDDToDate,
} from "@/shared/utils/dateUtils";
import PageHeader from "@/shared/components/common/PageHeader";
import EditForm from "./components/editForm.tsx";
import { Product } from "./components/gd-interfaces.ts";
import products from "./components/gd-products.ts";

export type GridProduct = Record<string, any>;

export default function DatagridPage() {
  const { t } = useTranslation(["common", "contents"]);
  const [startDate, setStartDate] = useState<string>(getYearsAgo(1));
  const [endDate, setEndDate] = useState<string>(getToday());
  const [loading, setLoading] = useState(false);

  // EumDataGrid ref for data manipulation
  const gridRef = useRef<EumDataGridRef>(null);

  // 데이터 조작 관련 상태들
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  // 🔥 선택된 행 데이터 상태 추가
  const [selectedRow, setSelectedRow] = useState<Product | null>(null);
  // EditForm 오픈 상태
  const [editFormOpen, setEditFormOpen] = useState(false);

  // 검색 관련 상태
  const [searchText, setSearchText] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  // 로그인한 유저 정보를 자동으로 사용하는 요청 생성 함수 (안정화됨)
  const createRequest = useCreateEumDataGridRequest();

  // 최초 로딩 시 사용될 안정적인 요청 객체
  const initialRequest = useMemo(
    () => createRequest("P_1010", [getYearsAgo(1), getToday()]),
    [createRequest]
  );

  // DataGrid에 전달될 요청 상태
  const [gridRequest, setGridRequest] =
    useState<DataGridRequest>(initialRequest);

  const handleSearch = useCallback(() => {
    logger.info("🔍 검색 버튼 클릭 - 새로운 요청 생성:", {
      startDate,
      endDate,
    });

    // 검색 조건에 따라 새로운 요청 생성 (로그인한 유저 ID 자동 사용)
    const newRequest = createRequest(
      "P_1010", // callId
      [startDate, endDate], // parameters
      ["S", "S"] // parametertype
    );
    setGridRequest(newRequest);
  }, [startDate, endDate, createRequest]);

  // 에러 핸들러 (useCallback으로 참조 안정화)
  const handleError = useCallback((error: string) => {
    logger.error("DataGrid Error:", error);
    alert(`데이터 로드 오류: ${error}`);
  }, []);

  // 데이터 로드 완료 핸들러 (useCallback으로 참조 안정화)
  const handleDataLoad = useCallback((data: any[]) => {
    setCurrentData(data);
    logger.info("✅ DataGrid 데이터 로드 완료:", {
      rowCount: data.length,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // 데이터 변경 핸들러 (useCallback으로 참조 안정화)
  const handleDataChange = useCallback((data: any[]) => {
    setCurrentData(data);
  }, []);

  // 행 선택 변경 핸들러 (useCallback으로 참조 안정화)
  //const handleRowSelectionChange = useCallback((selectedData: Product[]) => {
  const handleRowSelectionChange = useCallback(
    (selectedData: GridProduct[]) => {
      setSelectedCount(selectedData.length);
      setSelectedRow(
        selectedData && selectedData.length > 0 ? selectedData[0] : null
      );
    },
    []
  );

  // keyColumns prop 안정화 (useMemo 사용)
  const keyColumns = useMemo(() => ["td", "code"], []);

  // gridOptions prop 안정화 (useMemo 사용)
  const gridOptions = useMemo(
    () => ({
      height: "400px",
      showFilter: true,
      showSort: true,
      showResize: true,
      enablePaging: false,
      selectable: true,
      lockedColumns: [0, 1, 2],
    }),
    []
  );

  // 추천어 입력 핸들러
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (!value.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const targetColumns = ["code", "f_kn"]; // 원하는 컬럼들
    const matches = currentData
      .flatMap((row, rowIndex) =>
        Object.entries(row).flatMap(([key, cellValue]) => {
          if (
            targetColumns.includes(key) &&
            cellValue?.toString().toLowerCase().includes(value.toLowerCase())
          ) {
            return [{ rowIndex, columnKey: key, value: cellValue }];
          }
          return [];
        })
      )
      .slice(0, 5);

    setSearchSuggestions(matches);
  };

  // 추천어 선택 핸들러
  const handleSuggestionSelect = (rowIndex: number, columnKey: string) => {
    setSearchSuggestions([]);
    setSearchText("");

    if (gridRef.current?.focusCell) {
      gridRef.current.focusCell(rowIndex, columnKey);
    } else {
      logger.warn("focusCell 메서드가 gridRef에 구현되어 있어야 합니다.");
    }
  };

  // 데이터 조회 등 컨트롤 함수
  const handleGetData = () => {
    const data = gridRef.current?.getData();
    logger.debug("전체 데이터 조회:", data?.length, "건");
    logger.debug("전체 데이터:", data);
  };

  const handleGetSelectedData = () => {
    const data = gridRef.current?.getSelectedData();
    logger.debug("선택된 데이터 조회:", data?.length, "건");
    console.log("선택된 데이터:", data);
  };

  const handleShowSelectedKeys = () => {
    const keys = gridRef.current?.getSelectedKeys();
    if (keys && keys.length > 0) {
      logger.info("선택된 행의 키 값들:", keys.join(", "));
      logger.info("선택된 행의 키 값들:", keys);
    } else {
      logger.info("선택된 행이 없습니다");
    }
  };

  const handleTestSelection = () => {
    gridRef.current?.selectRows([0]);
    logger.info("프로그래밍 방식으로 첫 번째 행 선택 시도");
  };

  const handleRefreshData = () => {
    gridRef.current?.refreshData();
    logger.info("React Query 데이터 새로고침 시작 (refetch)");
  };

  const handleClearFilters = () => {
    gridRef.current?.clearFilters();
    logger.info("필터 초기화 완료");
  };

  const handleClearSort = () => {
    gridRef.current?.clearSort();
    logger.info("정렬 초기화 완료");
  };

  const handleResetState = () => {
    gridRef.current?.resetState();
    logger.info("그리드 상태 초기화 완료");
  };

  // '데이터 추가'(=선택 행 수정) 버튼 클릭 시
  const handleEditSelectedRow = () => {
    if (selectedRow) {
      setEditFormOpen(true);
    } else {
      alert("수정할 행을 먼저 선택하세요!");
    }
  };

  // EditForm에서 저장/취소 시 EditForm 닫기
  const handleSubmit = (newDataItem: Product) => {
    // 데이터 업데이트 로직 (간단히 예시)
    setCurrentData((prev) =>
      prev.map((row) =>
        row.ProductID === newDataItem.ProductID ? newDataItem : row
      )
    );
    setEditFormOpen(false);
  };
  const handleCancelEdit = () => setEditFormOpen(false);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <section>
        <PageHeader />
      </section>

      {/* -- 팝업 EditForm -- */}
      {editFormOpen && selectedRow && (
        <EditForm
          cancelEdit={handleCancelEdit}
          onSubmit={handleSubmit}
          item={selectedRow}
        />
      )}

      <h1 className="text-2xl font-bold mb-6">
        {t("demo:dataGridPage.title")}
      </h1>

      {/* -- 상단 검색 영역 -- */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50 relative">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-16"
            >
              {t("common:common.startDate")}:
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
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-16"
            >
              {t("common:common.endDate")}:
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
            {t("common:common.search")}
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            id="searchInput"
            name="searchInput"
            type="text"
            value={searchText}
            onChange={handleSearchInputChange}
            className="border rounded px-2 py-1 w-150"
            placeholder="검색어를 입력하세요"
            autoComplete="on"
          />
          <Button
            themeColor="primary"
            onClick={handleSearch}
            disabled={loading}
          >
            검색
          </Button>
        </div>
        {searchSuggestions.length > 0 && (
          <div
            ref={suggestionBoxRef}
            className="absolute top-full left-0 w-full bg-white border shadow z-10 max-h-48 overflow-y-auto"
          >
            {searchSuggestions.map((sug, idx) => (
              <div
                key={idx}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-800"
                onClick={() =>
                  handleSuggestionSelect(sug.rowIndex, sug.columnKey)
                }
              >
                [{sug.columnKey}] {sug.value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -- 데이터 조작 컨트롤 패널 -- */}
      <div className="mb-6 p-4 border rounded-md bg-blue-50">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            데이터 조회
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button size="small" themeColor="info" onClick={handleGetData}>
              전체 데이터 조회
            </Button>

            <Button
              size="small"
              themeColor="info"
              onClick={handleGetSelectedData}
            >
              선택된 데이터 조회
            </Button>
            <Button
              size="small"
              themeColor="info"
              onClick={handleEditSelectedRow}
            >
              데이터 수정
            </Button>
            <Button
              size="small"
              themeColor="info"
              onClick={handleEditSelectedRow}
            >
              데이터 추가
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            행 선택 제어
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              themeColor="info"
              onClick={handleShowSelectedKeys}
            >
              선택된 키 보기
            </Button>
            <Button
              size="small"
              themeColor="warning"
              onClick={handleTestSelection}
            >
              프로그래밍 선택 테스트
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            그리드 상태 제어
          </h4>
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
            <Button
              size="small"
              themeColor="secondary"
              onClick={handleRefreshData}
            >
              React Query 새로고침
            </Button>
          </div>
        </div>
        <div className="bg-white p-3 rounded border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">현재 상태</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>전체 데이터: {currentData.length}건</div>
            <div>선택된 행: {selectedCount}건</div>
          </div>
        </div>
      </div>

      {/* -- 데이터 그리드 -- */}
      <div>
        <EumDataGrid
          ref={gridRef}
          request={gridRequest}
          loading={loading}
          onLoadingChange={setLoading}
          onError={handleError}
          onDataLoad={handleDataLoad}
          onDataChange={handleDataChange}
          onRowSelectionChange={handleRowSelectionChange}
          enableRowSelection={true}
          selectionMode="single"
          keyColumns={keyColumns}
          gridOptions={gridOptions}
        />
      </div>
    </div>
  );
}
