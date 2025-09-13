import { google } from "googleapis";

export function getDriveClient(googleAccessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: googleAccessToken });
  return google.drive({ version: "v3", auth });
}