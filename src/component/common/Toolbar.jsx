import React from "react";
import { useFilters } from "../../context/FilterContext";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown";
import { Button, Input } from "antd";
import SaveViewMenu from "./SaveViewMenu";

const Toolbar = () => {
  const { visibleFilters } = useFilters();

  return (
    <div
      className="d-flex justify-content-between align-items-center flex-wrap mb-2"
      style={{ rowGap: "10px" }}
    >
      {/* Left section: search + filters + buttons */}
      <div className="d-flex align-items-center flex-wrap gap-2">
        {/* Search input */}
        <div style={{ flex: "0 0 250px" }}>
          <Input
          className="my-input-field"
            placeholder="Reg No or Surname"
            style={{
              height: "30px",
              borderRadius:'4px',
              color: "gray",
            }}
          />
        </div>

        {/* Dynamic filters */}
        {visibleFilters.map((label) => (
          <div key={label}>
            <MultiFilterDropdown label={label} />
          </div>
        ))}

        <SimpleMenu title="More" />

        <Button
          className="border-0 bg-transparent text-dark"
          style={{ height: "40px" }}
        >
          Reset
        </Button>

        <Button
          className="border-0 bg-transparent text-dark"
          style={{ height: "40px" }}
        >
          Search
        </Button>
      </div>

      {/* Right section: SaveViewMenu always at end */}
      
    </div>
  );
};

export default Toolbar;
