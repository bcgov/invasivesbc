import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { TRAINING_VIDEOS_LIST_REQUEST, TRAINING_VIDEOS_LIST_REQUEST_COMPLETE } from '../actions';

interface TrainingVideoMetadata {
  id: number;
  src: string;
  title: string;
}

interface TrainingVideos {
  working: boolean;
  list: TrainingVideoMetadata[];
}

function createTrainingVideosReducer() {
  const initialState: TrainingVideos = {
    working: false,
    list: []
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<TrainingVideos>) => {
      switch (action.type) {
        case TRAINING_VIDEOS_LIST_REQUEST:
          draftState.working = true;
          draftState.list = [];
          break;
        case TRAINING_VIDEOS_LIST_REQUEST_COMPLETE:
          draftState.working = false;
          draftState.list = action.payload;
          break;
        default:
          break;
      }
    });
  };
}

const selectTrainingVideos: (state) => TrainingVideos = (state) => state.TrainingVideos;

export { selectTrainingVideos, createTrainingVideosReducer };
