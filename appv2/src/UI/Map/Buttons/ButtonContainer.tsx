import React from "react";
import { AccuracyMarker, AccuracyToggle } from "./AccuracyToggle";
import { BaseMapToggle } from "./BaseMapToggle";
import { FindMeToggle, LocationMarker, PanToMe } from "./FindMe";
import { HDToggle } from "./HDToggle";
import { LegendsButton } from "./LegendsButton";
import { WhatsHereButton, WhatsHereDrawComponent } from "./WhatsHereButton";
import { WhatsHereCurrentRecordHighlighted, WhatsHereMarker } from "./WhatsHereMarker";
import "./ButtonContainer.css";

export const ButtonContainer = (props) => {

  return (
    <div className="map-btn-container">
      <HDToggle />
      <BaseMapToggle />
      <LegendsButton />
      <FindMeToggle />
      <AccuracyToggle />
      <WhatsHereButton />

      {/* helpers */}
      <AccuracyMarker />
      <LocationMarker />
      <PanToMe />
      <WhatsHereMarker />
      <WhatsHereCurrentRecordHighlighted />
      <WhatsHereDrawComponent />
    </div>
  );
}