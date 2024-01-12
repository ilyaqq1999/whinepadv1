import Logo from "./Logo";
import './Header.css'
import {useContext, useState, useRef} from "react";

import Button from "./Button";
import FormInput from "./FormInput";
import Dialog from "./Dialog";
import Form from "./Form";
import schema from "../config/schema";

import DataContext from "../contexts/DataContext";


function Header({onSearch}) {
    const {data, updateData} = useContext(DataContext)
    const count = data.length

    const {addNew, setAddNew} = useState(false)

    const form = useRef(null)

    const placeholder = count > 1 ? `Search ${count} items` : 'Search'

    function saveNew(action) {
        setAddNew(false)
        updateRoute()
        if (action === 'dismiss') return
        const formData = {}
        Array.from(form.current).forEach(
            (input) => (formData[input.id] = input.value)
        )
        data.unshift(formData)
        updateData(data)
    }


    function onAdd(action) {
        setAddNew(true)
    }

    return (
        <div>
            <div className='Header'>
                <Logo/>
                <div>
                    <FormInput placeholder={placeholder} id="search" onChange={onSearch} defaultValue={route.filter}/>
                </div>
                <div>
                    <Button onClick={onAdd}>
                        <b>&#65291;</b> Add whine
                    </Button>
                </div>
            </div>
            {addNew ? (
                <Dialog
                    header="Add new item"
                    modal={true}
                    confirmLabel="Add"
                    onAction={(action) => saveNew(action)}>
                    <Form ref={form} fiedls={schema}/>
                </Dialog>
            ): null }
        </div>
    )
}

export default Header