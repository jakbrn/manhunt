import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => {
  let newConfig = { ...config };

  if (newConfig.ios?.config) newConfig.ios.config.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  return newConfig;
};
