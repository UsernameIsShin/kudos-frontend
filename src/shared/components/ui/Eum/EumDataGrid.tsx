import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid,
  GridColumn as Column,
  GridProps,
} from "@progress/kendo-react-grid";
import {
  process,
  State,
  SortDescriptor,
  CompositeFilterDescriptor,
} from "@progress/kendo-data-query";
import {
  useDataGridQuery,
  DataGridRequest,
  GridColumn,
  convertHeadersToColumns,
} from "@/shared/api/dataGridApi";
import { EumColumnMenu } from "./EumColumnMenu";
import logger from "@/shared/utils/logger";

export interface EumDataGridProps
  extends Omit<
    GridProps,
    "data" | "children" | "onSortChange" | "onFilterChange"
  > {
  // 필수 props
  request: DataGridRequest;

  // 선택적 props
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: string) => void;
  onDataLoad?: (data: any[]) => void;

  // 데이터 변경 이벤트 콜백들
  onDataChange?: (data: any[]) => void;
  onRowAdd?: (newRow: any, allData: any[]) => void;
  onRowUpdate?: (updatedRow: any, index: number, allData: any[]) => void;
  onRowRemove?: (removedRow: any, index: number, allData: any[]) => void;
  onRowSelectionChange?: (selectedRows: number[], selectedData: any[]) => void;

  // 행 선택 및 키 설정
  keyColumns?: string[]; // 여러 컬럼 조합으로 unique key 생성
  enableRowSelection?: boolean; // 행 선택 활성화 (기본: false)
  selectionMode?: "single"; // 선택 모드

  // 그리드 설정 props
  gridOptions?: {
    height?: string | number;
    rowheight?: string | number;
    showFilter?: boolean;
    showSort?: boolean;
    showResize?: boolean;
    defaultPageSize?: number;
    enablePaging?: boolean;
    isSelectable?: boolean;
    lockedColumns?: number[]; // 고정 컬럼 인덱스 배열
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

// EumDataGrid에 사용될 props의 안정적인 기본값
const defaultGridOptions: EumDataGridProps["gridOptions"] = {};
const defaultColumnOverrides: EumDataGridProps["columnOverrides"] = {};

// EumDataGrid 인스턴스 메서드 타입
export interface EumDataGridRef {
  // SHW 신규추가
  focusCell?: (rowIndex: number, columnKey: string) => void;

  // 기존 기능들
  clearFilters: () => void;
  clearSort: () => void;
  resetState: () => void;
  getCurrentState: () => State;

  // 데이터 조회 기능들
  getData: () => any[];
  getFilteredData: () => any[];
  getSelectedData: () => any[];
  getColumns: () => GridColumn[];
  // 키 관련 기능들
  generateRowKey: (row: any) => string;
  getSelectedKeys: () => string[];

  exportDataWithHeaders: () => { columns: any[]; data: any[] };
  exportSelectedWithHeaders: () => { columns: any[]; data: any[] };

  // 선택 관련 기능들
  refreshData: () => Promise<void>;
  selectRows: (indices: number[]) => void;
  selectAll: () => void;
  unselectAll: () => void;
  getRowCount: () => number;
}

export const EumDataGrid = React.memo(
  React.forwardRef<EumDataGridRef, EumDataGridProps>(
    (
      {
        request,
        loading: externalLoading,
        onLoadingChange,
        onError,
        onDataLoad,
        onDataChange,
        onRowSelectionChange,
        keyColumns = [],
        enableRowSelection = false,
        selectionMode = "single",
        gridOptions = defaultGridOptions,
        columnOverrides = defaultColumnOverrides,
        className = "",
        containerStyle = {},
        onStateChange,
        onSortStateChange,
        onFilterStateChange,
        ...kendoGridProps // 나머지 모든 Kendo Grid props
      },
      ref
    ) => {
      // React Query를 사용한 데이터 로드 (자동 중복 요청 제거 및 캐싱)
      const {
        data: queryResponse,
        isLoading: queryLoading,
        error: queryError,
        refetch,
      } = useDataGridQuery(request);

      // 로컬 상태 관리
      const [columns, setColumns] = useState<GridColumn[]>([]);
      const [data, setData] = useState<any[]>([]);
      const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
      const [dataState, setDataState] = useState<State>({
        skip: 0,
        take: gridOptions.defaultPageSize || 50,
        sort: [] as SortDescriptor[],
        filter: undefined as CompositeFilterDescriptor | undefined,
      });

      // 헬퍼 함수들을 ref를 통해 노출
      React.useImperativeHandle(ref, () => ({
        // 기존 기능들
        clearFilters: () => {
          setDataState((prev) => ({ ...prev, filter: undefined }));
          onFilterStateChange?.(undefined);
        },
        clearSort: () => {
          setDataState((prev) => ({ ...prev, sort: [] }));
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
          // setSelectedRows([]);
          onSortStateChange?.([]);
          onFilterStateChange?.(undefined);
        },
        getCurrentState: () => dataState,

        // 데이터 조작 기능들
        getData: () => data,
        getFilteredData: () => processedData.data || [],
        getSelectedData: () =>
          data.filter((item) => selectedKeys.has(item.__dataItemKey)),
        getColumns: () => columns,

        // 키 관련 기능들 (소문자 기준)
        generateRowKey: (row: any) => {
          if (keyColumns.length === 0) {
            // keyColumns가 지정되지 않으면 모든 컬럼값을 조합
            return Object.values(row).join("|");
          }
          // 지정된 keyColumns의 값들을 조합하여 키 생성 (소문자 기준)
          return keyColumns
            .map((col) => {
              const lowerCol = col.toLowerCase();
              return row[lowerCol] || "";
            })
            .join("|");
        },
        getSelectedKeys: () => {
          // const selectedData = selectedRows.map(index => data[index]).filter(Boolean);
          return Array.from(selectedKeys);
        },

        exportDataWithHeaders: () => {
          return {
            columns: columns
              .filter((col) => !col.hidden)
              .map((col) => ({
                field: col.field,
                title: col.title,
                type: col.type,
                width: col.width,
              })),
            data: data,
          };
        },
        exportSelectedWithHeaders: () => {
          const selectedData = data.filter((item) =>
            selectedKeys.has(item.__dataItemKey)
          );
          return {
            columns: columns
              .filter((col) => !col.hidden)
              .map((col) => ({
                field: col.field,
                title: col.title,
                type: col.type,
                width: col.width,
              })),
            data: selectedData,
          };
        },

        // 선택 관련 기능들
        refreshData: async () => {
          refetch();
        },
        selectRows: (indices: number[]) => {
          const keysToSelect = new Set(
            indices.map((i) => data[i]?.__dataItemKey).filter(Boolean)
          );
          setSelectedKeys(keysToSelect);
        },
        selectAll: () => {
          if (enableRowSelection) {
            const allKeys = new Set(data.map((item) => item.__dataItemKey));
            setSelectedKeys(allKeys);
          }
        },
        unselectAll: () => {
          setSelectedKeys(new Set());
        },
        getRowCount: () => data.length,
      }));

      // 로딩 상태 (외부에서 제어 가능하거나 React Query에서 관리)
      const isLoading =
        externalLoading !== undefined ? externalLoading : queryLoading;

      // 그리드 옵션 기본값
      const {
        height = "500px",
        rowheight = 25,
        showFilter = false,
        showSort = true,
        showResize = true,
        isSelectable = true,
        lockedColumns = [], // 고정 컬럼 인덱스 배열
      } = gridOptions;

      const filterTypeMap = {
        number: "numeric",
        date: "date",
        boolean: "boolean",
        string: "text",
      };

      // React Query 응답 처리
      useEffect(() => {
        if (
          queryResponse &&
          queryResponse.status === 200 &&
          queryResponse.data
        ) {
          const { headers, datafield, rows } = queryResponse.data;

          logger.info("🔄 React Query 데이터 로드 성공:", {
            callId: request.callId,
            rowCount: rows.length,
            columnCount: headers.length,
            optimized: true, // 1초 단기 캐싱으로 최적화
            deduplication: "active", // 중복 요청 제거 활성화
          });

          // 헤더 정보를 GridColumn으로 변환
          const serverColumns = convertHeadersToColumns(headers, datafield);

          // 컬럼 오버라이드 적용
          const processedColumns = serverColumns.map((col) => ({
            ...col,
            ...columnOverrides[col.field],
          }));

          // dataItemKey를 위한 키 생성 함수 (소문자 통일)
          const generateDataItemKey = (lowerCaseRow: Record<string, any>) => {
            const keyValues =
              keyColumns.length > 0
                ? keyColumns.map((col) =>
                    (lowerCaseRow[col.toLowerCase()] || "").toString()
                  )
                : Object.values(lowerCaseRow).map((val) =>
                    (val || "").toString()
                  );

            // keyColumns만으로 키 생성 (rowId 제외)
            return keyValues.join("|");
          };

          // 데이터 처리 - 모든 키를 소문자로 통일
          const processedRows = rows.map((row: any, rowIndex: number) => {
            // 원본 row 데이터를 소문자 키로 변환
            const lowerCaseRow: Record<string, any> = {};
            Object.keys(row).forEach((key: string) => {
              const lowerKey = key.toLowerCase();
              lowerCaseRow[lowerKey] = row[key];
            });

            // processedRow 초기화
            const processedRow: Record<string, any> = {
              __rowId: rowIndex,
              __dataItemKey: generateDataItemKey(lowerCaseRow),
            };

            // 각 컬럼에 대해 데이터 매핑 및 타입 변환
            processedColumns.forEach((col) => {
              const lowerColField = col.field;

              if (lowerCaseRow.hasOwnProperty(lowerColField)) {
                let value = lowerCaseRow[lowerColField];

                // 컬럼 타입에 따른 데이터 변환
                switch (col.type) {
                  case "number":
                    if (value !== null && value !== undefined && value !== "") {
                      const numValue =
                        typeof value === "string" ? parseFloat(value) : value;
                      processedRow[lowerColField] = isNaN(numValue)
                        ? 0
                        : numValue;
                    } else {
                      processedRow[lowerColField] = 0;
                    }
                    break;
                  case "date":
                    if (value && typeof value === "string") {
                      if (value.length === 8 && /^\d{8}$/.test(value)) {
                        const year = parseInt(value.substring(0, 4));
                        const month = parseInt(value.substring(4, 6)) - 1;
                        const day = parseInt(value.substring(6, 8));
                        processedRow[lowerColField] = new Date(
                          year,
                          month,
                          day
                        );
                      } else {
                        processedRow[lowerColField] = new Date(value);
                      }
                    } else {
                      processedRow[lowerColField] = value;
                    }
                    break;
                  case "boolean":
                    processedRow[lowerColField] = Boolean(value);
                    break;
                  default:
                    processedRow[lowerColField] =
                      value !== null && value !== undefined
                        ? String(value)
                        : "";
                }
              } else {
                // 매칭되는 키가 없으면 타입에 따른 기본값
                switch (col.type) {
                  case "number":
                    processedRow[lowerColField] = 0;
                    break;
                  case "date":
                    processedRow[lowerColField] = null;
                    break;
                  case "boolean":
                    processedRow[lowerColField] = false;
                    break;
                  default:
                    processedRow[lowerColField] = "";
                }
              }
            });

            return processedRow;
          });

          setColumns(processedColumns);
          setData(processedRows);
          onDataLoad?.(processedRows);
          onLoadingChange?.(false);

          logger.info("✅ React Query 데이터 로드 완료:", {
            columnCount: processedColumns.length,
            rowCount: processedRows.length,
          });
          logger.debug(
            "🔑 생성된 데이터 키 샘플 (상위 3개):",
            processedRows.slice(0, 3).map((r) => r.__dataItemKey)
          );
        }
      }, [
        queryResponse,
        keyColumns,
        columnOverrides,
        onDataLoad,
        onLoadingChange,
      ]);

      // React Query 에러 처리
      useEffect(() => {
        if (queryError) {
          const errorMsg =
            queryError.message || "데이터를 가져오는 중 오류가 발생했습니다.";
          logger.error("React Query 에러:", errorMsg);
          onError?.(errorMsg);
          onLoadingChange?.(false);
        }
      }, [queryError, onError, onLoadingChange]);

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

      // Grid에 표시할 데이터 (useMemo를 사용하여 선택 상태를 동적으로 주입)
      const dataWithSelection = useMemo(() => {
        return data.map((item) => ({
          ...item,
          selected: selectedKeys.has(item.__dataItemKey),
        }));
      }, [data, selectedKeys]);

      // 처리된 데이터 (정렬, 필터링, 페이징 적용)
      const processedData = useMemo(() => {
        const result = dataWithSelection;

        // kendo-data-query의 process 함수를 사용하여 정렬, 필터링, 페이징 적용
        if (showSort || showFilter) {
          const processConfig = {
            sort: showSort ? dataState.sort : undefined,
            filter: showFilter ? dataState.filter : undefined,
          };
          const processResult = process(result, processConfig);
          return processResult;
        }

        return {
          data: result,
          total: result.length,
        };
      }, [dataWithSelection, dataState, showSort, showFilter]);

      // 컬럼 렌더링 (hidden 컬럼 처리 추가)
      const renderColumns = () => {
        const ColumnAny = Column as any; // 타입 우회용

        return columns
          .filter((col) => !col.hidden) // hidden 컬럼 제외
          .map((col, index) => {
            const isLocked = lockedColumns.includes(index);

            // 컬럼 메뉴 컴포넌트 (필터가 활성화된 경우)
            const columnMenuComponent =
              showFilter && col.filterable !== false
                ? (props: any) => (
                    <EumColumnMenu
                      {...props}
                      gridData={processedData.data || data}
                      originalData={data}
                    />
                  )
                : undefined;

            return (
              <ColumnAny
                key={col.field}
                field={col.field}
                title={col.title}
                width={col.width}
                format={col.format}
                sortable={showSort && col.sortable !== false}
                columnMenu={columnMenuComponent}
                headerClassName={`eum-text-center ${
                  isLocked ? "eum-locked-header" : ""
                }`}
                className={`${col.className || ""} ${
                  isLocked ? "eum-locked-column" : ""
                }`.trim()}
                locked={isLocked}
                filter={(() => {
                  return (
                    filterTypeMap[col.type as keyof typeof filterTypeMap] ||
                    "text"
                  );
                })()}
                checkboxFilter={(col as any).checkboxFilter}
              />
            );
          });
      };

      // 에러 상태 렌더링
      if (queryError) {
        return (
          <div
            className={`custom-datagrid-error ${className}`}
            style={{
              padding: "20px",
              textAlign: "center",
              border: "1px solid #dc3545",
              borderRadius: "4px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              ...containerStyle,
            }}
          >
            <h4>데이터 로드 오류</h4>
            <p>{queryError.message}</p>
            <button
              onClick={() => refetch()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
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
              height: typeof height === "string" ? height : `${height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              ...containerStyle,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                className="animate-spin"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #007bff",
                  borderRadius: "50%",
                  margin: "0 auto 10px",
                }}
              />
              <p>데이터를 불러오는 중...</p>
            </div>
          </div>
        );
      }

      // Kendo Grid 선택 상태 변경 핸들러 (onRowClick 기반으로 변경)
      const handleRowClick = useCallback(
        (event: any) => {
          if (!isSelectable) return;

          const clickedKey = event.dataItem?.__dataItemKey;
          if (!clickedKey) {
            logger.warn(
              "🖱️ handleRowClick: 클릭된 행의 키(__dataItemKey)를 찾을 수 없습니다.",
              { event }
            );
            return;
          }

          const newSelectedKeys = new Set(selectedKeys);
          if (newSelectedKeys.has(clickedKey)) {
            newSelectedKeys.delete(clickedKey); // 이미 선택된 경우 -> 해제
          } else {
            if (selectionMode === "single") {
              newSelectedKeys.clear(); // 단일 선택 모드에서는 기존 선택 모두 해제
            }
            newSelectedKeys.add(clickedKey); // 새로 선택
          }

          logger.debug("🖱️ handleRowClick (개선된 토글)", {
            clickedKey,
            beforeCount: selectedKeys.size,
            afterCount: newSelectedKeys.size,
          });
          setSelectedKeys(newSelectedKeys);
        },
        [isSelectable, selectedKeys, selectionMode]
      );

      // selectedKeys 상태가 변경될 때마다 부모 컴포넌트에 알림
      useEffect(() => {
        const newSelectedData = data.filter((item) =>
          selectedKeys.has(item.__dataItemKey)
        );
        const newSelectedIndices = newSelectedData.map((item) => item.__rowId);

        logger.debug("📞 onRowSelectionChange 콜백 실행", {
          selectedKeysInEffect: Array.from(selectedKeys).slice(0, 3),
          dataKeysInEffect: data.slice(0, 3).map((i) => i.__dataItemKey),
          finalSelectedCount: newSelectedIndices.length,
        });

        onRowSelectionChange?.(newSelectedIndices, newSelectedData);
      }, [data, selectedKeys, onRowSelectionChange]);

      // 메인 그리드 렌더링
      const GridComponent = Grid as any; // 타입 에러 우회

      return (
        <div
          className={`eum-grid-container ${className}`.trim()}
          style={containerStyle}
        >
          <GridComponent
            style={{ height }}
            data={processedData}
            dataItemKey="__dataItemKey"
            selectedField="selected" // Kendo Grid가 'selected' 필드를 사용하여 선택 상태를 관리하도록 함
            {...dataState}
            onDataStateChange={handleDataStateChange}
            selectable={{
              enabled: isSelectable,
              mode: selectionMode === "single" ? "single" : "multiple",
            }}
            sortable={
              showSort
                ? {
                    allowUnsort: true,
                    mode: "single", // 'multiple'로 변경 가능
                  }
                : false
            }
            rowHeight={Number(rowheight)}
            resizable={showResize}
            sort={dataState.sort}
            onRowClick={handleRowClick}
            scrollable="virtual" // 가상 스크롤 활성화
            {...kendoGridProps}
          >
            {renderColumns()}
          </GridComponent>
        </div>
      );
    }
  )
);

// displayName 설정 (개발 도구에서 컴포넌트 이름 표시)
EumDataGrid.displayName = "EumDataGrid";

export default EumDataGrid;
