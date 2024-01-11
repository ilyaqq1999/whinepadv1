import React from 'react';
import PropTypes from "prop-types";
import {useReducer, useState, useRef} from "react";
import clone from '../modules/clone'
import './Excel.css';
import classNames from "classnames";
import Actions from "./Actions";

let originalData = null;

function reducer(data, action) {
    if (action.type === 'sort') {
        const {column, descending} = action.payload;
        return clone(data).sort((a, b) => {
            if (a[column] === b[column]) {
                return 0;
            }
            return descending
                ? a[column] < b[column]
                    ? 1
                    : -1
                : a[column] > b[column]
                    ? 1
                    : -1;
        });
    }
    if (action.type === 'save') {
        data[action.payload.edit.row][action.payload.edit.column] =
            action.payload.value;
        return data;
    }
    if (action.type === 'startSearching') {
        originalData = data;
        return originalData;
    }
    if (action.type === 'doneSearching') {
        return originalData;
    }
    if (action.type === 'search') {
        return originalData.filter((row) => {
            return (
                row[action.payload.column]
                    .toString()
                    .toLowerCase()
                    .indexOf(action.payload.needle.toLowerCase()) > -1
            );
        });
    }
}

function Excel({schema, initialData, onDataChange, filter}) {
    const [data, dispatch] = useReducer(reducer, initialData);
    const [sorting, setSorting] = useState({
        column: '',
        descending: false,
    });
    const [edit, setEdit] = useState(null);
    const [dialog, setDialog] = useState(false);
    const form = useRef(null)

    function sort(e) {
        const column = e.target.dataset.id;
        if (!column) { // последний столбец "Action" не подлежит сортировке
            return
        }
        const descending = sorting.column === column && !sorting.descending;
        setSorting({column, descending});
        dispatch({type: 'sort', payload: {column, descending}});
    }

    function showEditor(e) {
        setEdit({
            row: parseInt(e.target.parentNode.dataset.row, 10),
            column: e.target.cellIndex,
        });
    }

    function save(e) {
        e.preventDefault();
        const value = e.target.firstChild.value;
        dispatch({
            type: 'save',
            payload: {
                edit,
                value,
            },
        });
        setEdit(null);
    }

    function toggleSearch() {
        if (!search) {
            dispatch({
                type: 'startSearching',
            });
        } else {
            dispatch({
                type: 'doneSearching',
            });
        }
        setSearch(!search);
    }

    function filter(e) {
        const needle = e.target.value;
        const column = e.target.dataset.idx;
        dispatch({
            type: 'search',
            payload: {needle, column},
        });
        setEdit(null);
    }

    const searchRow = !search ? null : (
        <tr onChange={filter}>
            {headers.map((_, idx) => (
                <td key={idx}>
                    <input type="text" data-idx={idx}/>
                </td>
            ))}
        </tr>
    );

    return (
        <div className="Excel">
            <table>
                <thead onClick={sort}>
                <tr>
                    {Object.keys(schema).map((key) => {
                        let {label, show} = schema[key];
                        if (!show) return null;
                        if (sorting.column === key) {
                            label += sorting.descending ? ' \u2191' : ' \u2193';
                        }
                        return (
                            <th key={key} data-id={key}>
                                {label}
                            </th>
                        )
                    })}
                    <th className="ExcelNotSortable">Actions</th>
                </tr>
                </thead>
                <tbody onDoubleClick={showEditor}>
                {data.map((row, rowidx) => {
                        //todo
                        return (
                            <tr key={rowidx} data-row={rowidx}>
                                {Object.keys(row).map((cell, columnidx) => {
                                    const config = schema[cell]
                                    let content = row[cell]
                                    //todo

                                    return (
                                        <td
                                            key={columnidx}
                                            data-schema={cell}
                                            className={classNames({
                                                [`schema-${cell}`]: true,
                                                ExcelEditTable: config.type !== 'rating',
                                                ExcelDataLeft: config.align !== 'left',
                                                ExcelDataRight: config.align !== 'right',
                                                ExcelDataCenter:
                                                    config.align !== 'right'
                                                    &&
                                                    config.align !== 'left',
                                            })}>
                                            {content}
                                        </td>
                                    )
                                })}
                                <td>
                                    <Actions onAction={handleAction.bind(null, rowidx)}/>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {dialog}
        </div>
    );
}

Excel.propTypes = {
    schema: PropTypes.object,
    initialData: PropTypes.arrayOf(PropTypes.object),
    onDataChange: PropTypes.func,
    filter: PropTypes.string,
};


export default Excel