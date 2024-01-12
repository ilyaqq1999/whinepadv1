import React from "react";

const DataContext = React.createContext({
    data: [],
    updateData: () => {},
})

export default DataContext