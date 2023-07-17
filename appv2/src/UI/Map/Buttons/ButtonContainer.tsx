import React from "react";
import { BaseMapToggle } from "./BaseMapToggle";
import { FindMeToggle, LocationMarker, PanToMe } from "./FindMe";
import { HDToggle } from "./HDToggle";
import { LegendsButton } from "./LegendsButton";

export const ButtonContainer = (props) => {

  return (
    <>
      <HDToggle/>
      <BaseMapToggle/>
      <LegendsButton />
      <FindMeToggle />

      {/* helper for find me */}
      <LocationMarker />
      <PanToMe />
    </>
  );
}