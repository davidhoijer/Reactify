import React, {createContext, ReactNode} from "react";
import {Vibrant} from "node-vibrant/browser";

export interface VibrantPalette {
  darkVibrant: string;
  lightVibrant: string;
  mainVibrant: string;
}

interface VibrantContextType {
  vibrantColours: (smallestImageUrl: string) => Promise<VibrantPalette>;
  setVibrantPalette: (palette: VibrantPalette) => void;
  darkVibrant: string;
  lightVibrant: string;
  mainVibrant: string;
}

export const VibrantContext = createContext<VibrantContextType>({
  vibrantColours: async (_: string) => ({ darkVibrant: "", lightVibrant: "", mainVibrant: "" }),
  setVibrantPalette: () => undefined,
  darkVibrant: "",
  lightVibrant: "",
  mainVibrant: ""
});

export const VibrantProvider: React.FC<{ children: ReactNode }> = ({children}) => {

  const [darkVibrant, setDarkVibrant] = React.useState<string>("#bbb");
  const [lightVibrant, setLightVibrant] = React.useState<string>("#fff");
  const [dominantColour, setMainVibrant] = React.useState<string>("#bbb");

  const setVibrantPalette = React.useCallback((palette: VibrantPalette) => {
    setDarkVibrant(palette.darkVibrant);
    setLightVibrant(palette.lightVibrant);
    setMainVibrant(palette.mainVibrant);
  }, []);

  const vibrantColours = React.useCallback(async (smallestImageUrl: string) => {
    const vibrant = new Vibrant(smallestImageUrl, { quality: 1 });
    const palette = await vibrant.getPalette();
    const dark = palette.DarkVibrant?.hex ?? "#bbb";
    const light = palette.LightVibrant?.hex ?? "#fff";
    const main = palette.Vibrant?.hex ?? "#fff";

    return { darkVibrant: dark, lightVibrant: light, mainVibrant: main };
  }, []);

  const value = React.useMemo(() => ({
    darkVibrant,
    lightVibrant,
    mainVibrant: dominantColour,
    vibrantColours,
    setVibrantPalette,
  }), [darkVibrant, dominantColour, lightVibrant, setVibrantPalette, vibrantColours]);


  return (
    <VibrantContext.Provider value={value}>
      {children}
    </VibrantContext.Provider>
  )

}
