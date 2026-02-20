const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Parse GitHub URL to extract owner, repo, number, and type
 */
eqÖ×'BgVæ7F–öâ'6Tv—D‡V%W&Â‡W&Ã¢7G&–ær’°¢6öç7B&VvW‚Òö‡GG3ó¥ÂõÂöv—F‡V%Âæ6öÕÂò…µÂ÷uÖ²•Âò…µÇuÒ²•Âò†—77VW7ÇVÆÂ•Âò…ÆB²’ó°¢6öç7BÖF6‚ÒW&ÂæÖF6‚‡&VvW‚“° ¢–b‚ÖF6‚’&WGW&âçVÆÃ° ¢6öç7B²Â÷væW"Â&WòÂG—UF‚ÂçVÖ&W%7G%ÒÒÖF6ƒ°¢6öç7BG—RÒG—UF‚ÓÓÒv—77VW2ròv—77VRr¢wVÆÅ÷&WVW7Bs°¢6öç7BçVÖ&W"Ò'6T–çB†çVÖ&W%7G"Â“° ¢&WGW&â²÷væW"Â&WòÂçVÖ&W"ÂG—RÓ°§Ğ ¢ò¢ ¢¢fWF6‚v—D‡V"—77VR÷"VÆÂ&WVW7BFWF–Ç0¢¢ğ¦W`}rt async function fetchGitHubItem(owner: string, repo: string, number: number, accessToken: string) {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${number}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'TaskFlow'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch error) {
    console.error('Error fetching GitHub item:', error);
    return null;
  }
}
