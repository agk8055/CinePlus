import { createContext, useState, useContext } from "react";

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState("");

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
