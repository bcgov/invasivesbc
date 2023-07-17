import React from "react";
import { AccuracyMarker, AccuracyToggle } from "./AccuracyToggle";
import { BaseMapToggle } from "./BaseMapToggle";
import { FindMeToggle, LocationMarker, PanToMe } from "./FindMe";
import { HDToggle } from "./HDToggle";
import { LegendsButton } from "./LegendsButton";

export const ButtonContainer = (props) => {

  return (
    <>
      <AccuracyToggle />
      <HDToggle />
      <BaseMapToggle />
      <LegendsButton />
      <FindMeToggle />

      {/* helpers */}
      <AccuracyMarker />
      <LocationMarker />
      <PanToMe />
    </>
  );
}