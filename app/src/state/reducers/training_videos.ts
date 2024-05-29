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
    switch (action.type) {
      case TRAINING_VIDEOS_LIST_REQUEST:
        return {
          ...state,
          working: true,
          list: []
        };
      case TRAINING_VIDEOS_LIST_REQUEST_COMPLETE:
        return {
          ...state,
          working: false,
          list: action.payload
        };
      default:
        return state;
    }
  };
}

const selectTrainingVideos: (state) => TrainingVideos = (state) => state.TrainingVideos;

export { selectTrainingVideos, createTrainingVideosReducer };
