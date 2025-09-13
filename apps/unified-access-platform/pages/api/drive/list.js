import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getDriveClient } from "../../../lib/google";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.tokens?.google?.accessToken) {
    return res.status(401).json({ error: "Not connected to Google Drive" });
  }
  try {
    const drive = getDriveClient(session.tokens.google.accessToken);
    const { data } = await drive.files.list({
      pageSize: 20,
      fields: "files(id,name,mimeType,modifiedTime,owners/displayName,iconLink,webViewLink)"
    });
    res.json({ files: data.files || [] });
  } catch (e) {
    res.status(500).json({ error: "DriveListFailed", details: e?.message });
  }
}