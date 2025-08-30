# @nintamasan/battle-engine

戦闘システムのバトルシミュレーションエンジンです。

## インストール

```bash
npm install @nintamasan/battle-engine
```

## 使用方法

```typescript
import { BattleEngine, Character, Element } from '@nintamasan/battle-engine';

// キャラクターを作成
const hero = new Character({
  name: 'ヒーロー',
  hp: 100,
  attack: 50,
  defense: 30,
  element: Element.FIRE,
});

const enemy = new Character({
  name: '敵',
  hp: 80,
  attack: 40,
  defense: 25,
  element: Element.WATER,
});

// バトルエンジンを作成
const battleEngine = new BattleEngine();

// バトルを実行
const result = battleEngine.executeBattle(hero, enemy);
console.log(result);
```

## 機能

- キャラクター管理
- 属性相性システム
- スキルシステム
- 状態異常システム
- バトルシミュレーション

## 開発

```bash
# 依存関係のインストール
npm install

# 型チェック
npm run type:check

# テスト実行
npm run test:run

# ビルド
npm run build

# リント
npm run lint
```

## ライセンス

ISC
