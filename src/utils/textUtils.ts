/**
 * テキストを指定された長さで省略するユーティリティ関数
 * @param text 省略するテキスト
 * @param maxLength 最大文字数（省略記号を含む）
 * @returns 省略されたテキスト
 */
export const truncateText = (text: string, maxLength: number = 10): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * プレイヤー名を省略する関数
 * @param name プレイヤー名
 * @param maxLength 最大文字数（省略記号を含む）
 * @returns 省略されたプレイヤー名
 */
export const truncatePlayerName = (name: string, maxLength: number = 10): string => {
  return truncateText(name, maxLength);
}; 