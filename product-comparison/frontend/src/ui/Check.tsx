import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Check = () => (
  <FontAwesomeIcon
    icon={faCheck}
    color={"rgba(31,255,0,0.5)"}
    size={"2x"}
    fixedWidth
  />
);

export default Check;
