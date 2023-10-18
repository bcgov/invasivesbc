import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { USER_CLICKED_RECORD } from "state/actions";
import { selectMap } from "state/reducers/map";
import { useSelector } from "util/use_selector";
import './TouchHoldHandler.css';

export const TouchHoldHandler = (props) => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);
  const [shouldProgress, setShouldProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let touchLoaderBar = document.getElementById('touch-loader-bar');
    let touchLoader = document.getElementById('touch-loader');
    window.addEventListener('touchstart', (event) => {
      touchLoader.style.visibility = "visible";
      touchLoader.style.left = `${(event.touches[0].clientX).toString()}px`;
      touchLoader.style.bottom = `${(window.innerHeight - event.touches[0].clientY).toString()}px`;
      
      setShouldProgress(true);
    });

    window.addEventListener('touchend', (event) => {
      setShouldProgress(false);
      setProgress(0);
      touchLoaderBar.style.width = 0 + "%";
      touchLoader.style.visibility = "hidden";
    });
  }, []);

  useEffect(() => {
    if (shouldProgress && progress == 0) {
      setProgress(1);
      var width = 1;
      
      const frame = () => {
        let touchLoaderBar = document.getElementById('touch-loader-bar');
        window.addEventListener('touchend', (event) => {
          let touchLoader = document.getElementById('touch-loader');
          if (touchLoader) touchLoader.style.visibility = "hidden";
          clearInterval(id);
          setProgress(0);
          setShouldProgress(false);
        });
        if (width >= 100) {
          clearInterval(id);
          openMenu();
          setProgress(0);
        } else {
          width++;
          if (touchLoaderBar) touchLoaderBar.style.width = width + "%";
        }
      }
      var id = setInterval(frame, 10);
    }
  }, [shouldProgress])

  const openMenu = () => {
    if (shouldProgress) {
      dispatch({
        type: USER_CLICKED_RECORD, 
        payload: {
          recordType: mapState?.userRecordOnHoverRecordType, 
          id: mapState?.userRecordOnHoverRecordID, 
          row: mapState?.userRecordOnHoverRecordRow
        }}
      );
    }
  }


  return (
    <div id='touch-loader'>
      <div id='touch-loader-bar'></div>
      Hold To Open
    </div>
  );
}