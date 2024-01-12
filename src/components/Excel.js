import React from 'react';
import PropTypes from "prop-types";
import {useReducer, useState, useRef} from "react";
import clone from '../modules/clone'
import './Excel.css';
import classNames from "classnames";
import Actions from "./Actions";
import Rating from "./Rating";
import Dialog from "./Dialog";
import Form from "./Form";

function dataMangler(data, action, payload) {
    if (action === 'sort') {
        const {column, descending} = payload;
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
    if (action === 'save') {
        const {int, edit} = payload
        data[edit.row][edit.column] = int
        ? parseInt(payload.value, 10)
        : payload.value
        return data;
    }
    if (action === 'delete') {
        data = clone(data)
        data.splice(payload.rowidx, 1)
    }
    if (action === 'saveForm') {
        Array.from(payload.form.current).forEach((input) =>
            (data[payload.rowidx][input.id] = input.value))
    }
    return data
}

function Excel({schema, initialData, onDataChange, filter}) {
    const [data, dispatch] = useReducer(dataMangler, initialData);
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
        dispatch({type: 'sort', payload: {column, descending}});//todo тут остановился
    }

    function showEditor(e) {
        const config = e.target.dataset.schema
        if (!config || config === 'rating') return
        setEdit({
            row: parseInt(e.target.parentNode.dataset.row, 10),
            column: config,
        });
    }

    function save(e) {
        e.preventDefault();
        const value = e.target.firstChild.value;
        const valueType = schema[e.target.parentNode.dataset.schema].type
        dispatch({
            type: 'save',
            payload: {
                edit,
                value,
                onDataChange,
                int: valueType === 'year' || valueType === 'rating'
            },
        });
        setEdit(null);
    }

    function handleAction(rowidx, type) {
        if (type === 'delete') {
            setDialog(
                <Dialog
                    modal
                    header="Confirm deletion"
                    confirmLabel="Delete"
                    onAction={(action) => {
                        setDialog(null)
                        if (action === 'confirm') {
                            dispatch({
                                type: 'delete',
                                payload: {
                                    rowidx,
                                    onDataChange
                                }
                            })
                        }
                    }}>
                    {`Реально хочешь удалить "${data[rowidx].name}"`}
                </Dialog>
            )
        }
        const isEdit = type === 'edit';
        if (type === 'info' || isEdit) {
            const formPrefill = data[rowidx]
            setDialog(
                <Dialog
                    modal
                    extendedDismiss={!isEdit}
                    header={isEdit ? 'Edit item': 'Item details'}
                    confirmLabel={isEdit ? 'Save': 'ok'}
                    hasCancel={isEdit}
                    onAction={(action) => {
                        setDialog(null)
                        if (isEdit && action === 'confirm') {
                            dispatch({
                                type: 'saveForm',
                                payload: {
                                    rowidx,
                                    onDataChange,
                                    form,
                                }
                            })
                        }
                    }}>
                    <Form
                        ref={form}
                        fiedls={schema}
                        initialData={formPrefill}
                        readonly={!isEdit}
                    />
                </Dialog>
            )
        }
    }

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
                    if (filter) {
                        const needle = filter.toLowerCase()
                        let match = false
                        const fileds= Object.keys(schema)
                        for (let f = 0; f < fileds.length; f++) {
                            if (row[fileds[f]].toString().toLowerCase().includes(needle)) match = true
                        }
                        if (!match) return null
                    }
                    return (
                        <tr key={rowidx} data-row={rowidx}>
                            {Object.keys(row).map((cell, columnidx) => {
                                const config = schema[cell]
                                if (!config.show) {
                                    return null
                                }
                                let content = row[cell]

                                if (edit && edit.row === rowidx && edit.column === cell) {
                                    content = (
                                        <form onSubmit={save}>
                                            <input type="text" defaultValue={content}/>
                                        </form>
                                    )
                                } else if (config.type === 'rating') {
                                    content = (
                                        <Rating
                                            id={cell}
                                            readonly
                                            key={content}
                                            defaultValue={Number(content)}
                                        />
                                    )
                                }

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