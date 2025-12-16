import { ArcanaType, Spread, Suit, TarotCard } from "./types";

// Helper to generate Minor Arcana
const createMinorSuit = (suit: Suit, englishSuit: string, startId: number): TarotCard[] => {
  const cards: TarotCard[] = [];
  const suffix = ['首牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍从', '骑士', '王后', '国王'];
  const englishSuffix = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  
  for (let i = 0; i < 14; i++) {
    cards.push({
      id: startId + i,
      name: `${suit}${suffix[i]}`,
      englishName: `${englishSuffix[i]} of ${englishSuit}`,
      suit: suit,
      number: i + 1,
      arcana: ArcanaType.MINOR,
      keywords: [],
      description: `${suit}${suffix[i]} 代表了该元素在这个阶段的本质。`
    });
  }
  return cards;
};

export const TAROT_DECK: TarotCard[] = [
  // Major Arcana
  { id: 0, name: "愚人", englishName: "The Fool", suit: Suit.NONE, number: 0, arcana: ArcanaType.MAJOR, keywords: ["新的开始", "天真", "信念"], description: "新的开始，乐观，对生活的信任。" },
  { id: 1, name: "魔术师", englishName: "The Magician", suit: Suit.NONE, number: 1, arcana: ArcanaType.MAJOR, keywords: ["显化", "力量", "行动"], description: "利用所有资源来实现愿望。" },
  { id: 2, name: "女祭司", englishName: "The High Priestess", suit: Suit.NONE, number: 2, arcana: ArcanaType.MAJOR, keywords: ["直觉", "潜意识", "神秘"], description: "内在知识，直觉，潜意识思维。" },
  { id: 3, name: "皇后", englishName: "The Empress", suit: Suit.NONE, number: 3, arcana: ArcanaType.MAJOR, keywords: ["丰饶", "自然", "母性"], description: "母性，创造力，与自然的连接。" },
  { id: 4, name: "皇帝", englishName: "The Emperor", suit: Suit.NONE, number: 4, arcana: ArcanaType.MAJOR, keywords: ["权威", "结构", "控制"], description: "父权形象，结构，权威，规则。" },
  { id: 5, name: "教皇", englishName: "The Hierophant", suit: Suit.NONE, number: 5, arcana: ArcanaType.MAJOR, keywords: ["传统", "从众", "道德"], description: "精神智慧，宗教信仰，传统规范。" },
  { id: 6, name: "恋人", englishName: "The Lovers", suit: Suit.NONE, number: 6, arcana: ArcanaType.MAJOR, keywords: ["爱", "和谐", "选择"], description: "爱，结合，关系，价值观的一致。" },
  { id: 7, name: "战车", englishName: "The Chariot", suit: Suit.NONE, number: 7, arcana: ArcanaType.MAJOR, keywords: ["控制", "意志力", "胜利"], description: "通过专注和意志克服障碍。" },
  { id: 8, name: "力量", englishName: "Strength", suit: Suit.NONE, number: 8, arcana: ArcanaType.MAJOR, keywords: ["勇气", "说服", "影响"], description: "内在力量，勇敢，同情心，专注。" },
  { id: 9, name: "隐士", englishName: "The Hermit", suit: Suit.NONE, number: 9, arcana: ArcanaType.MAJOR, keywords: ["探索内心", "反省", "指引"], description: "寻求内在真理，独处，沉思。" },
  { id: 10, name: "命运之轮", englishName: "Wheel of Fortune", suit: Suit.NONE, number: 10, arcana: ArcanaType.MAJOR, keywords: ["运气", "业力", "循环"], description: "改变，循环，不可避免的命运。" },
  { id: 11, name: "正义", englishName: "Justice", suit: Suit.NONE, number: 11, arcana: ArcanaType.MAJOR, keywords: ["公平", "真理", "法律"], description: "正义，公平，真理，因果。" },
  { id: 12, name: "倒吊人", englishName: "The Hanged Man", suit: Suit.NONE, number: 12, arcana: ArcanaType.MAJOR, keywords: ["暂停", "臣服", "新视角"], description: "放手，新的视角，悬置。" },
  { id: 13, name: "死神", englishName: "Death", suit: Suit.NONE, number: 13, arcana: ArcanaType.MAJOR, keywords: ["结束", "改变", "转化"], description: "周期的结束，新生的开始，过渡。" },
  { id: 14, name: "节制", englishName: "Temperance", suit: Suit.NONE, number: 14, arcana: ArcanaType.MAJOR, keywords: ["平衡", "适度", "耐心"], description: "平衡，适度，耐心，目标。" },
  { id: 15, name: "恶魔", englishName: "The Devil", suit: Suit.NONE, number: 15, arcana: ArcanaType.MAJOR, keywords: ["阴影", "束缚", "限制"], description: "成瘾，物质主义，束缚。" },
  { id: 16, name: "高塔", englishName: "The Tower", suit: Suit.NONE, number: 16, arcana: ArcanaType.MAJOR, keywords: ["突变", "剧变", "混乱"], description: "突然的改变，动荡，启示，觉醒。" },
  { id: 17, name: "星星", englishName: "The Star", suit: Suit.NONE, number: 17, arcana: ArcanaType.MAJOR, keywords: ["希望", "信念", "目标"], description: "希望，信念，目标，更新，灵性。" },
  { id: 18, name: "月亮", englishName: "The Moon", suit: Suit.NONE, number: 18, arcana: ArcanaType.MAJOR, keywords: ["幻觉", "恐惧", "焦虑"], description: "幻觉，恐惧，焦虑，潜意识，直觉。" },
  { id: 19, name: "太阳", englishName: "The Sun", suit: Suit.NONE, number: 19, arcana: ArcanaType.MAJOR, keywords: ["积极", "快乐", "温暖"], description: "积极，快乐，温暖，成功，活力。" },
  { id: 20, name: "审判", englishName: "Judgement", suit: Suit.NONE, number: 20, arcana: ArcanaType.MAJOR, keywords: ["审判", "重生", "召唤"], description: "审判，重生，内在召唤，赦免。" },
  { id: 21, name: "世界", englishName: "The World", suit: Suit.NONE, number: 21, arcana: ArcanaType.MAJOR, keywords: ["完成", "整合", "成就"], description: "完成，整合，成就，圆满。" },
  
  // Minor Arcana
  ...createMinorSuit(Suit.WANDS, "Wands", 22),
  ...createMinorSuit(Suit.CUPS, "Cups", 36),
  ...createMinorSuit(Suit.SWORDS, "Swords", 50),
  ...createMinorSuit(Suit.PENTACLES, "Pentacles", 64),
];

export const SPREADS: Spread[] = [
  {
    id: 'single_card',
    name: '单张占卜',
    description: '针对特定问题或每日主题的快速指引。',
    positions: [
      { index: 0, name: '核心指引', description: '关于你问题的核心信息。', x: 0, y: 0 }
    ]
  },
  {
    id: 'three_card_time',
    name: '圣三角 (时间流)',
    description: '洞察事件的过去、现在与未来。',
    positions: [
      { index: 0, name: '过去', description: '过去对现状的影响。', x: -1, y: 0 },
      { index: 1, name: '现在', description: '目前的状况。', x: 0, y: 0 },
      { index: 2, name: '未来', description: '如果维持现状，可能的发展方向。', x: 1, y: 0 }
    ]
  },
  {
    id: 'decision_making',
    name: '二选一牌阵',
    description: '比较两条不同路径的发展。',
    positions: [
      { index: 0, name: '现状', description: '你现在的处境。', x: 0, y: -1 },
      { index: 1, name: '选择 A', description: '如果你选择选项 A 会发生什么。', x: -1, y: 0 },
      { index: 2, name: '选择 B', description: '如果你选择选项 B 会发生什么。', x: 1, y: 0 },
      { index: 3, name: '建议', description: '帮助你做决定的核心建议。', x: 0, y: 1 }
    ]
  },
  {
    id: 'celtic_cross_simple',
    name: '凯尔特十字',
    description: '深入剖析问题的全貌。',
    positions: [
      { index: 0, name: '核心', description: '问题的核心。', x: 0, y: 0 },
      { index: 1, name: '阻碍/助力', description: '横亘在核心之上的力量。', x: 0, y: 0 }, // Often placed rotated on top
      { index: 2, name: '潜意识', description: '潜意识的基础或根源。', x: 0, y: 1 },
      { index: 3, name: '过去', description: '刚刚过去的影响。', x: -1, y: 0 },
      { index: 4, name: '意识', description: '你的目标或理想。', x: 0, y: -1 },
      { index: 5, name: '未来', description: '即将发生的事情。', x: 1, y: 0 }
    ]
  }
];