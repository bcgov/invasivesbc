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
    if (TRAINING_VIDEOS_LIST_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        list: []
      };
    }
    if (TRAINING_VIDEOS_LIST_REQUEST_COMPLETE.match(action)) {
      return {
        ...state,
        working: false,
        list: action.payload
      };
    }
    return state;
  };
}

const selectTrainingVideos: (state) => TrainingVideos = (state) => state.TrainingVideos;

export { selectTrainingVideos, createTrainingVideosReducer };
