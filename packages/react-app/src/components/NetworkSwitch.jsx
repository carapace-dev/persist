import React from "react";
import { Button, Dropdown, Menu } from "antd";

function NetworkSwitch({ networkOptions, selectedNetwork, setSelectedNetwork }) {

  const getItems = () => {
    return networkOptions
      .filter(i => i !== selectedNetwork)
      .map(i => (
        { key: i,
          label: 
          (
            <a onClick={() => setSelectedNetwork(i)}>
              <span style={{ textTransform: "capitalize" }}>{i}</span>
            </a>
          )
        }
      ))
  }

  const menu = (
    <Menu 
      items={getItems()}
    />
  );

  return (
    <div>
      <Dropdown.Button 
        // size="large" 
        overlay={menu} 
        placement="bottomRight" 
        trigger={["click"]}>
          <span style={{ textTransform: "capitalize" }}>{selectedNetwork}</span>
      </Dropdown.Button>
    </div>
  );
}

export default NetworkSwitch;
