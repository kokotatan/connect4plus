import React from 'react';

interface RulesPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export const RulesPopup: React.FC<RulesPopupProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-600">ゲームルール</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6 text-gray-700">
          {/* 基本ルール */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">🎯 基本ルール</h3>
            <ul className="space-y-2 ml-4">
              <li>• 7×8のボードに交互にコマを置きます</li>
              <li>• 列をクリックしてコマを配置できます</li>
              <li>• 重力により、コマは一番下の空いている位置に落ちます</li>
              <li>• 自分の番の時だけタイマーが進みます</li>
            </ul>
          </section>

          {/* Connect4+ルール */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">⭐ Connect4+ルール</h3>
            <ul className="space-y-2 ml-4">
              <li>• 縦・横・斜めに4つコマが並ぶと「Connect4」成立</li>
              <li>• Connect4したコマは星セルに変化し、一定時間後に消去</li>
              <li>• 重力により上からコマが落ちてきます</li>
              <li>• 落下したコマで新たにConnect4が成立すると「連鎖」発生</li>
              <li>• 2連鎖目以降は「COMBO! Nx」と表示されます</li>
            </ul>
          </section>

          {/* スコアシステム */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">🏆 スコアシステム</h3>
            <ul className="space-y-2 ml-4">
              <li>• Connect4を1回成立させるごとに1点獲得</li>
              <li>• 連鎖した分だけ追加で点数が入ります</li>
              <li>• 先に3点獲得したプレイヤーの勝利</li>
              <li>• ボードが満杯になった場合は引き分け</li>
            </ul>
          </section>

          {/* AI戦について */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">🤖 AI戦について</h3>
            <ul className="space-y-2 ml-4">
              <li>• <strong>初級</strong>: ランダムにコマを配置</li>
              <li>• <strong>中級</strong>: 基本的な攻防を考慮</li>
              <li>• <strong>上級</strong>: 2手先読みで戦略的思考</li>
              <li>• <strong>最上級</strong>: 6手先読みで高度な戦略</li>
            </ul>
          </section>

          {/* 操作説明 */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">🎮 操作方法</h3>
            <ul className="space-y-2 ml-4">
              <li>• <strong>マウスホバー</strong>: 列全体がハイライトされ、コマの置き位置がプレビュー表示</li>
              <li>• <strong>クリック</strong>: 列をクリックしてコマを配置</li>
              <li>• <strong>スマホ</strong>: タップでコマを配置</li>
            </ul>
          </section>

          {/* ヒント */}
          <section>
            <h3 className="text-xl font-bold text-emerald-500 mb-3">💡 ヒント</h3>
            <ul className="space-y-2 ml-4">
              <li>• 中央列を制すると有利になります</li>
              <li>• 相手のConnect4を防ぐことも重要です</li>
              <li>• 連鎖を狙って一気にスコアを稼ぎましょう</li>
              <li>• 時間をかけて戦略的に考えましょう</li>
            </ul>
          </section>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-400 text-white rounded-full font-semibold shadow hover:bg-emerald-500 transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesPopup; 