import { React, useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";

function Configuratin() {
  const [genderModal, setgenderModal] = useState(false);
  const genderModalOpen = () => {
    setgenderModal(!genderModal);
  };
  return (
    <div>
      <p className="configuratin-titles">Lookups Configuration</p>
      <div className="lookups-main-continer">
        <div onClick={() => genderModalOpen()}>
          <SiActigraph className="icons" />
          <p className="lookups-title">Gender</p>
        </div>
      </div>

      <MyDrawer open={genderModal} onClose={genderModalOpen}/>
    </div>
  );
}

export default Configuratin;
