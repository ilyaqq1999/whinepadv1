import {useState, useReducer, useRef} from "react";
import PropTypes from "prop-types";

import Header from "./Header";
import Body from "./Body";
import Dialog from "./Dialog";
import Excel from "./Excel";
import clone from "../modules/clone";
import DataContext from "../contexts/DataContext";
import RouteContext from "../contexts/RouteContext";
import Form from "./Form";
import schema from "../config/schema";

let initialData = JSON.parse(localStorage.getItem('data'))

if (!initialData) {
    initialData = [{}]
    Object.keys(schema).forEach(
        (key) => (initialData[0][key] = schema[key].samples[0])
    )
}

function commitToStorage(data) {
    localStorage.setItem('data', JSON.stringify(data))
}

function DataFlow() {
    const [data, setData] = useState(initialData)
    // const [addNew, setAddNew] = useState(false)
    const [filter, setFilter] = useState(route.filter)

    function onSearch(e) {
        const s = e.target.value
        setFilter(s)
    }

    function updateData(newData) {
        newData = clone(newData)
        commitToStorage(newData)
        setData(newData)
    }

    return (
        <div className="DataFlow">
        <DataContext.Provider value={{data, updateData}}>
            <Header onSearch={onSearch}/>
            <Body>
                <Excel filter={filter}/>
            </Body>
        </DataContext.Provider>
        </div>
    )
}

export default DataFlow