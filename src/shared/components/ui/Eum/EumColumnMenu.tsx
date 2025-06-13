import {
    GridColumnMenuFilter,
    GridColumnMenuCheckboxFilter,
    GridColumnMenuProps,
    GridColumnMenuSort
} from '@progress/kendo-react-grid';

interface EumColumnMenuProps extends GridColumnMenuProps {
    gridData?: any[]; // 그리드 전체 데이터
    originalData?: any[]; // 원본 데이터
}

export const EumColumnMenu = (props: EumColumnMenuProps) => {
    // GridColumnProps.filter 값으로 타입 확인
    const columnFilterType = (props.column as any)?.filter as string | undefined;

    // 사용자가 명시적으로 checkboxFilter 여부를 설정한 경우 우선 적용
    const checkboxFilterOverride = (props.column as any)?.checkboxFilter as boolean | undefined;

    // 체크박스 필터 사용 여부 결정
    const shouldUseCheckboxFilter = () => {
        // 명시적으로 설정된 경우 해당 값 사용
        if (checkboxFilterOverride !== undefined) {
            return checkboxFilterOverride;
        }

        // string(text), boolean 타입은 체크박스 필터 사용
        return columnFilterType === 'text' || columnFilterType === 'boolean';
    };

    // 체크박스 필터용 데이터 준비
    const getFilterData = () => {
        const dataToUse = props.originalData || props.gridData;
        return dataToUse || [];
    };

    const useCheckboxFilter = shouldUseCheckboxFilter();
    const filterData = getFilterData();

    // 체크박스 필터 렌더링
    if (useCheckboxFilter) {
        return (
            <div>
                <GridColumnMenuCheckboxFilter
                    {...props as any}
                    data={filterData}
                />
                <GridColumnMenuSort {...props} />
            </div>
        );
    }

    // 기본 필터 렌더링
    return (
        <div>
            <GridColumnMenuFilter {...props} />
            <GridColumnMenuSort {...props} />
        </div>
    );
};