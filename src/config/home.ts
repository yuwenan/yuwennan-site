import { withBase } from './paths';
export const hero = {
  greeting: '从真实问题出发，',
  title: '把 AI 做进产品。',
  highlight: 'From idea to experience.',
  text: '我是喻雯楠，一名 AI 产品经理。关注用户真正要完成的事，把需求、交互和 AI 能力连接起来，做出可以体验的产品。',
  primary: { label: '探索我的作品', href: withBase('/#work') },
  secondary: { label: '了解我的工作方式', href: withBase('/#approach') },
  facts: [
    { value: '01', label: '业务与需求' },
    { value: '02', label: 'AI 与交互' },
    { value: '03', label: '落地与迭代' },
  ],
};
export const work = {
  eyebrow: 'SELECTED WORK',
  title: '用作品，讲清楚我做过什么。',
  text: 'AI 应用、农业交易、语音输入与智能硬件：把业务判断放进具体的产品体验。',
  limit: 6,
};
export const services = {
  eyebrow: 'HOW I WORK',
  title: '让每一步，都回到用户问题。',
  items: [
    { icon: 'lightbulb', title: '找到值得解决的问题', text: '先理解用户、现有流程和业务约束，明确要改变哪一步。' },
    { icon: 'workflow', title: '把判断变成产品方案', text: '拆解关键路径，设计交互、规则，以及 AI 与人的分工。' },
    {
      icon: 'layers',
      title: '把方案做成可运行版本',
      text: '用原型和 AI 辅助开发验证想法，把前台体验与后台管理连起来。',
    },
    { icon: 'pen-tool', title: '在反馈中持续校准', text: '关注错误案例、可解释性和实际体验，再决定下一轮迭代。' },
  ],
};
export const closing = {
  eyebrow: 'KEEP EXPLORING',
  title: '好的产品，',
  highlight: '从一个真实问题开始。',
  text: '欢迎从这些作品出发，聊聊用户、业务，以及 AI 还能做些什么。',
};
