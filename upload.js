// api/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  const { filename, content } = req.body;
  const GITHUB_USERNAME = "BabYfuzao";
  const REPO_NAME = "JsonCloud";
  const FILE_PATH = filename || "quizJsonFile.json";
  const GITHUB_TOKEN = process.env.GH_TOKEN; // 從 Vercel 的環境變數安全讀取

  const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

  try {
    // 1. 取得現有檔案的 SHA
    let fileSha = null;
    const getRes = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    if (getRes.ok) {
      const fileData = await getRes.json();
      fileSha = fileData.sha;
    }

    // 2. 準備上傳到 GitHub
    const bodyData = {
      message: "Update JSON via Public Web Uploader",
      content: content
    };
    if (fileSha) bodyData.sha = fileSha;

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || "GitHub API 上傳失敗");
    }

    return res.status(200).json({ success: true, message: "上傳成功！" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
