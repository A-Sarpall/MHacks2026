import { useReducer, type Dispatch } from "react";
import type {
  CueState,
  CueStatus,
  Detection,
  CoreWord,
  Backchannel,
} from "./types";
import { BACKCHANNELS } from "./types";

const initialState: CueState = {
  status: "idle",
  detections: [],
  selectedTiles: [],
  selectedCoreWords: [],
  candidates: [],
  queuedSentence: null,
};

type Action =
  | { type: "SET_STATUS"; status: CueStatus }
  | { type: "SET_DETECTIONS"; detections: Detection[] }
  | { type: "TOGGLE_TILE"; label: string }
  | { type: "TOGGLE_CORE_WORD"; word: CoreWord }
  | { type: "SET_CANDIDATES"; candidates: string[] }
  | { type: "QUEUE_SENTENCE"; sentence: string }
  | { type: "CLEAR_QUEUE" }
  | { type: "CLEAR_ALL" };

function reducer(state: CueState, action: Action): CueState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_DETECTIONS":
      return {
        ...state,
        detections: action.detections,
        selectedTiles: [],
        candidates: [],
      };
    case "TOGGLE_TILE": {
      const has = state.selectedTiles.includes(action.label);
      return {
        ...state,
        selectedTiles: has
          ? state.selectedTiles.filter((t) => t !== action.label)
          : [...state.selectedTiles, action.label],
        candidates: [],
      };
    }
    case "TOGGLE_CORE_WORD": {
      const has = state.selectedCoreWords.includes(action.word);
      return {
        ...state,
        selectedCoreWords: has
          ? state.selectedCoreWords.filter((w) => w !== action.word)
          : [...state.selectedCoreWords, action.word],
        candidates: [],
      };
    }
    case "SET_CANDIDATES":
      return { ...state, candidates: action.candidates };
    case "QUEUE_SENTENCE":
      return { ...state, queuedSentence: action.sentence, status: "queued" };
    case "CLEAR_QUEUE":
      return { ...state, queuedSentence: null, status: "idle" };
    case "CLEAR_ALL":
      return initialState;
    default:
      return state;
  }
}

export function useCueStore() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}

export type CueDispatch = Dispatch<Action>;

// Backchannel cycling
let backchannelIndex = 0;
export function nextBackchannel(): Backchannel {
  const bc = BACKCHANNELS[backchannelIndex % BACKCHANNELS.length];
  backchannelIndex++;
  return bc;
}
