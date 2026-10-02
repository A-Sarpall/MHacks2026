import { useReducer, type Dispatch } from "react";
import type {
  CapturedObject,
  CueState,
  CueStatus,
  CoreWord,
  Backchannel,
} from "./types";
import { BACKCHANNELS } from "./types";

const MAX_TILES = 8;

const initialState: CueState = {
  status: "loading",
  captures: [],
  selectedTileIds: [],
  selectedCoreWords: [],
  candidates: [],
  queuedSentence: null,
};

export type Action =
  | { type: "SET_STATUS"; status: CueStatus }
  | { type: "ADD_CAPTURE"; capture: CapturedObject }
  | { type: "UPDATE_CAPTURE"; id: string; patch: Partial<CapturedObject> }
  | { type: "REMOVE_CAPTURE"; id: string }
  | { type: "TOGGLE_TILE"; id: string }
  | { type: "TOGGLE_CORE_WORD"; word: CoreWord }
  | { type: "SET_CANDIDATES"; candidates: string[] }
  | { type: "QUEUE_SENTENCE"; sentence: string }
  | { type: "CLEAR_QUEUE" }
  | { type: "CLEAR_ALL" };

function reducer(state: CueState, action: Action): CueState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "ADD_CAPTURE": {
      // Newest first; the new capture becomes the (only) selected tile so a
      // single core-word tap is enough to get sentences.
      // Re-capturing something with the same name replaces the old tile.
      const captures = [
        action.capture,
        ...state.captures.filter((c) => c.label !== action.capture.label),
      ].slice(0, MAX_TILES);
      return {
        ...state,
        captures,
        selectedTileIds: [action.capture.id],
        candidates: [],
      };
    }
    case "UPDATE_CAPTURE": {
      const changesLabel = action.patch.label !== undefined;
      return {
        ...state,
        captures: state.captures.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c
        ),
        candidates:
          changesLabel && state.selectedTileIds.includes(action.id)
            ? []
            : state.candidates,
      };
    }
    case "REMOVE_CAPTURE":
      return {
        ...state,
        captures: state.captures.filter((c) => c.id !== action.id),
        selectedTileIds: state.selectedTileIds.filter((id) => id !== action.id),
        candidates: [],
      };
    case "TOGGLE_TILE": {
      const has = state.selectedTileIds.includes(action.id);
      return {
        ...state,
        selectedTileIds: has
          ? state.selectedTileIds.filter((t) => t !== action.id)
          : [...state.selectedTileIds, action.id],
        candidates: [],
      };
    }
    case "TOGGLE_CORE_WORD": {
      // One core word at a time keeps sentences predictable
      const has = state.selectedCoreWords.includes(action.word);
      return {
        ...state,
        selectedCoreWords: has ? [] : [action.word],
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
      return { ...initialState, status: state.status === "loading" ? "loading" : "idle" };
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
