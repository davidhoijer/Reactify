import React, {createContext, ReactNode} from "react";
import {Vibrant} from "node-vibrant/browser";


interface VibrantContextType {
  vibrantColours: (smallestImageUrl: string) => Promise<{ darkVibrant: string; lightVibrant: string; mainVibrant: string }>;
  darkVibrant: string;
  lightVibrant: string;
  mainVibrant: string;
}

export const VibrantContext = createContext<VibrantContextType>({
  vibrantColours: async (_: string) => ({ darkVibrant: "", lightVibrant: "", mainVibrant: "" }),
  darkVibrant: "",
  lightVibrant: "",
  mainVibrant: ""
});

export const VibrantProvider: React.FC<{ children: ReactNode }> = ({children}) => {

  const [darkVibrant, setDarkVibrant] = React.useState<string>("#bbb");
  const [lightVibrant, setLightVibrant] = React.useState<string>("#fff");
  const [dominantColour, setMainVibrant] = React.useState<string>("#bbb");

  const vibrantColours = async (smallestImageUrl: string) => {
    const vibrant = new Vibrant(smallestImageUrl, { quality: 1 });
    const palette = await vibrant.getPalette();
    const dark = palette.DarkVibrant?.hex ?? "#bbb";
    const light = palette.LightVibrant?.hex ?? "#fff";
    const main = palette.Vibrant?.hex ?? "#fff";

    setDarkVibrant(dark);
    setLightVibrant(light);
    setMainVibrant(main);

    return { darkVibrant: dark, lightVibrant: light, mainVibrant: main };
  }


  return (
    <VibrantContext.Provider value={{darkVibrant,lightVibrant, mainVibrant: dominantColour, vibrantColours}}>
      {children}
    </VibrantContext.Provider>
  )

}