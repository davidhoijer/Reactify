import React, {createContext, ReactNode} from "react";
import {Swatch} from "@vibrant/color";
import {Vibrant} from "node-vibrant/browser";


interface VibrantContextType {
  vibrantColours: (smallestImageUrl: string) => void;
  darkVibrant: string;
  lightVibrant: string;
  mainVibrant: string;
}

export const VibrantContext = createContext<VibrantContextType>({
  vibrantColours: (smallestImageUrl: string) => "",
  darkVibrant: "",
  lightVibrant: "",
  mainVibrant: ""
});

export const VibrantProvider: React.FC<{ children: ReactNode }> = ({children}) => {

  const [darkVibrant, setDarkVibrant] = React.useState<string>("#bbb");
  const [lightVibrant, setLightVibrant] = React.useState<string>("#fff");
  const [dominantColour, setMainVibrant] = React.useState<string>("#bbb");

  const vibrantColours = async (smallestImageUrl: string) => {
    const vibrant = new Vibrant(smallestImageUrl, {quality: 1});
    const palette = await vibrant.getPalette();
    setDarkVibrant(palette.DarkVibrant?.hex ?? "#bbb");
    setLightVibrant(palette.LightVibrant?.hex ?? "#fff");
    setMainVibrant(palette.Vibrant?.hex ?? "#fff");
  }


  return (
    <VibrantContext.Provider value={{darkVibrant,lightVibrant, mainVibrant: dominantColour, vibrantColours}}>
      {children}
    </VibrantContext.Provider>
  )

}