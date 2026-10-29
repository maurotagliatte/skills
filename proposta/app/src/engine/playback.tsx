"use client";

import { createContext, useContext } from "react";

export type Playback = { paused: boolean };

export const PlaybackContext = createContext<Playback>({ paused: false });

export const usePlayback = () => useContext(PlaybackContext);
