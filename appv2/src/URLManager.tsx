import { useState, useEffect } from "react";
import {  useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { URL_CHANGE } from "./state/actions";



export const URLAndLayerManager = (props: any) => {
    const [layers, setLayers] = useState([]);
    const [URL, setURL] = useState([]);

   // const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const dispatch = useDispatch();


    useEffect(()=> {
     //   console.dir(searchParams.get("layers"))
        dispatch({type: URL_CHANGE, payload: { url: location}})//
            // layers: searchParams.get("layers")}})
    },[])

    return null;

}