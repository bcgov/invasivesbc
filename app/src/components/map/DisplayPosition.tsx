import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useCurrentPosition, useWatchPosition } from '@ionic/react-hooks/geolocation';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import proj4 from 'proj4';
import { IconButton } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';

export default function DisplayPosition({ map }) {
    const [position, setPosition] = useState(map.getCenter());
    
    
    const { currentPosition: watchPosition, startWatch, clearWatch } = useWatchPosition();
    const { getPosition } = useCurrentPosition();

    useEffect(() => {
        getPosition();
    }, []);
    
    const utm_zone = (longitude: any, latitude: any) => {
        let utmZone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
        proj4.defs([
            ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
            ['EPSG:AUTO', `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`]
        ]);
        const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
        let utmEasting = Number(en_m[0].toFixed(4));
        let utmNorthing = Number(en_m[1].toFixed(4));
        return ('UTM  Zone:' + utmZone + ' UTM Easting:' + utmEasting + ' UTM Northing:' + utmNorthing);
    }

    const startThing = async () => {
        startWatch({ enableHighAccuracy: true });
    }

    useEffect(() => {
        if(watchPosition){
            let myPos = [watchPosition.coords.latitude,watchPosition.coords.longitude];
            map.flyTo(myPos, 17);
            setPosition(map.getCenter());
            clearWatch();
        } 
    }, [watchPosition]);
/*
    const onMove = useCallback(() => {
        setPosition(map.getCenter());
    }, [map]);

    useEffect(() => {
        map.on('move', onMove);
        return () => {
            map.off('move', onMove);
        };
    }, [map, onMove]);*/

    return (
        <div>
            {watchPosition ? 
            <Marker position={[watchPosition.coords.latitude,watchPosition.coords.longitude]}>
                <Popup>
                    {/*position.lat.toFixed(4)}&ensp;{position.lng.toFixed(4)}
                    <br />
                    {*/utm_zone(position.lng, position.lat)}
                </Popup>
            </Marker> : null}
            <IconButton aria-label="my position" onClick={startThing}>
                <LocationOnIcon />
            </IconButton>
            {/*<button onClick={() => {setState(!state)}}>
                Get Position
            </button>
            {state ? 
            <div style={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 'auto',
                backgroundColor: 'rgba(0,0,0, 0.5)',
                }}>
                <div style={{
                    position: 'absolute',
                    left: '25%',
                    right: '25%',
                    top: '25%',
                    bottom: '25%',
                    margin: 'auto',
                    background: 'white'
                    }}>
                    <p>
                        {position.lat.toFixed(4)}
                        &ensp;
                        {position.lng.toFixed(4)}
                    </p>
                    <button onClick={() => setState(false)}>exit</button>
                </div>
            </div> : null*/}
        </div>
    )
}