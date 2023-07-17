import React from "react";
import { BaseMapToggle } from "./BaseMapToggle";
import { FindMeToggle, LocationMarker, PanToMe } from "./FindMe";
import { LegendsButton } from "./LegendsButton";

export const ButtonContainer = (props) => {

  return (
    <>
      <BaseMapToggle/>
      <LegendsButton />
      <FindMeToggle />

      {/* helper for find me */}
      <LocationMarker />
      <PanToMe />
    </>
  );
}