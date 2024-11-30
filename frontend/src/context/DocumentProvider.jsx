import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const DocumentContext = createContext();

// eslint-disable-next-line react/prop-types
export const DocumentProvider = ({children}) => {
    const [documentId, setDocumentId] = useState(null);

    return (
        <DocumentContext.Provider value={{documentId, setDocumentId}}>
            {children}
        </DocumentContext.Provider>
    );
};
