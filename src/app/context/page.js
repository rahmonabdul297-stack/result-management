"use client";
import { createContext, useContext, useState } from "react";
const ToogleContext = createContext(null);

export const ContextPageProvider = ({ children }) => {
  const [showMenu, setshowMenu] = useState(false);
  const [UrlPath, setUrlPath] = useState("classone");


  return (
    <div>
      <ToogleContext.Provider value={{ showMenu, setshowMenu,UrlPath, setUrlPath }}>
        {children}
      </ToogleContext.Provider>
    </div>
  );
};


export const useToogleContext = () => {
  const context = useContext(ToogleContext);
  if (!context) {
    throw new Error("useToogleContext must be used inside ContextPageProvider");
  }
  return context;
};

const ContextPage = () => null;

export default ContextPage;
