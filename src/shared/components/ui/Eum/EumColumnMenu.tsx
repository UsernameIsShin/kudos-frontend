import {
    GridColumnMenuSort,
    GridColumnMenuFilter,
    GridColumnMenuProps
} from '@progress/kendo-react-grid';

export const EumColumnMenu = (props: GridColumnMenuProps) => {
    return (
        <div>
            <GridColumnMenuFilter {...props} />
            <GridColumnMenuSort {...props} />
        </div>
    );
};