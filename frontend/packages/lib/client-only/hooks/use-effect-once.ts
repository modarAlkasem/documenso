import type { EffectCallback } from "react";

import { useEffect } from "react";

export const unsafe_useEffectOnce = (callback:EffectCallback) =>{
    return useEffect(callback,[]);
}