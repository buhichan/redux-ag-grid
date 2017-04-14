/// <reference types="react" />
/**
 * Created by buhi on 2017/3/10.
 */
import * as React from "react";
export declare class DateRangePicker extends React.PureComponent<{
    onChange: (from: Date | null, to: Date | null) => void;
    from: Date | null;
    to: Date | null;
    type?;
}, {}> {
    state: {
        from: Date;
        to: Date;
    };
    onChange: () => void;
    onSetFrom: (e: any) => void;
    onSetTo: (e: any) => void;
    render(): JSX.Element;
}
