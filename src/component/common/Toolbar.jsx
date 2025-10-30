import React from "react";
import { useFilters } from "../../context/FilterContext";
import SimpleMenu from "./SimpleMenu";
import MultiFilterDropdown from "./MultiFilterDropdown"; // existing component
import { Row, Col, Button,Input } from "antd";
import SaveViewMenu from "./SaveViewMenu";

const Toolbar = () => {
    const { visibleFilters } = useFilters();

    return (
        <div className="d-flex gap-2 mb-2 w-80">
            <Input
                placeholder="Reg No or Surname"
                style={{ width: "25%", color: "gray" }}
            />
            <div className="d-flex flex-wrap">
            {visibleFilters.map((label) => (
                <div key={label}>
                    <MultiFilterDropdown label={label} />
                </div>
            ))}

            </div>
            <SimpleMenu title="More" />
            <Button
                className="transparent bordr-less"
                style={{ color: "#333333" }}
            // onClick={() => resetFtn()}
            >
                Reset
            </Button>
            <Button
                className="transparent bordr-less"
                style={{ color: "#333333" }}
            // onClick={() => resetFtn()}
            >
                Search
            </Button>
            <div className="ms-auto">
                <SaveViewMenu />
            </div>
        </div>
    );
};

export default Toolbar;
