import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => {
  let newConfig = { ...config };

  newConfig.plugins = [
    ...(newConfig.plugins ?? []),
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    ],
  ];

  return newConfig;
};
