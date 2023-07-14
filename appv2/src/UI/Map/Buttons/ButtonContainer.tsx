import React from "react";
import { FindMeToggle, LocationMarker, PanToMe } from "./FindMe";
import { LegendsButton } from "./LegendsButton";

export const ButtonContainer = (props) => {

  return (
    <>
      <LegendsButton />
      <FindMeToggle />

      {/* helper for find me */}
      <LocationMarker />
      <PanToMe />
    </>
  );
}