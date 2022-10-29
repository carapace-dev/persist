import { useState, createContext, useEffect } from "react";

const ScreenSize = createContext();

const getBreakpoint = () => {
  if (window.innerWidth >= 1200 ){
    return 'xl';
  } else if (window.innerWidth >= 992 ){
    return 'lg';
  } else if (window.innerWidth >= 768 ){
    return 'md';
  } else if (window.innerWidth >= 576 ){
    return 'sm';
  };
};

const getVaultSpan = () => {
  if (window.innerWidth >= 1700 ){
    return 6;
  } else if (window.innerWidth >= 1300 ){
    return 8;
  } else if (window.innerWidth >= 900 ){
    return 12;
  } else {
    return 24;
  };
};

const getHeaderLogoSpan = () => {
  if (window.innerWidth >= 1230 ){
    return 4;
  } else if (window.innerWidth >= 1150 ){
    return 6;
  } else {
    return 0;
  };
};

const getManageVaultBreak = () => {
  if (window.innerWidth < 850 ){
    return true;
  } else {
    return false;
  };
};

const getMainContainer = () => {
  if (window.innerWidth < 768 ){
    return 'steps-content-mobile';
  } else {
    return 'steps-content';
  };
};

const getStepsBreak = () => {
  if (window.innerWidth < 1024 ){
    return true;
  } else {
    return false;
  };
};

const ScreenSizeProvider = (props) => {
  
  const [windowSize, setWindowSize] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight,
    breakpoint: getBreakpoint(),
    vaultSpan: getVaultSpan(),
    headerLogo: getHeaderLogoSpan(),
    vaultBreak: getManageVaultBreak(),
    mainContainer: getMainContainer(),
    stepsBreak: getStepsBreak()
  });

  useEffect(() => {
    window.addEventListener('resize', detectSize)

    return () => {
      window.removeEventListener('resize', detectSize)
    }
  }, [windowSize]);

  const detectSize = () => {
    setWindowSize({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
      breakpoint: getBreakpoint(),
      vaultSpan: getVaultSpan(),
      headerLogo: getHeaderLogoSpan(),
      vaultBreak: getManageVaultBreak(),
      mainContainer: getMainContainer(),
      stepsBreak: getStepsBreak()
    })
  };

  return (
    <ScreenSize.Provider value={{ windowSize }}>
      {props.children}
    </ScreenSize.Provider>
  );
};

export { ScreenSize, ScreenSizeProvider };