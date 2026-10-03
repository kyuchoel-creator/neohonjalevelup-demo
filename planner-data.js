(function (global) {
  'use strict';
  const STORAGE_KEY = 'solo-level-planner-v1';
  const SCHEMA_VERSION = 1;
  const dateKey = (date = new Date()) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  const addDays = (date, amount) => {
    const next = new Date(`${dateKey(date)}T12:00:00`);
    next.setDate(next.getDate() + amount);
    return next;
  };
  const startOfWeek = (date = new Date()) => {
    const copy = new Date(`${dateKey(date)}T12:00:00`);
    copy.setDate(copy.getDate() - (copy.getDay() + 6) % 7);
    return copy;
  };
  const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const today = dateKey();
  const tomorrow = dateKey(addDays(new Date(), 1));
  const seed = {
    meta: { schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() },
    settings: { weekStartsOn: 1, dayStartsAt: '06:00', dayEndsAt: '23:00' },
    goals: [
      { id: 'goal_focus', title: '깊이 몰입하는 습관 만들기', area: '성장', active: true, sourceRef: null },
      { id: 'goal_health', title: '지치지 않는 생활 리듬 만들기', area: '건강', active: true, sourceRef: null },
      { id: 'goal_space', title: '나를 위한 여유 지키기', area: '균형', active: true, sourceRef: null }
    ],
    plans: {
      tasks: [
        { id: 'task_1', date: today, title: '이번 주 핵심 결과 3개 정하기', priority: 'A', order: 1, goalId: 'goal_focus', duration: 30, completed: false, sourceRef: null },
        { id: 'task_2', date: today, title: '가장 어려운 일 먼저 50분 집중', priority: 'A', order: 2, goalId: 'goal_focus', duration: 50, completed: false, sourceRef: null },
        { id: 'task_3', date: today, title: '점심 뒤 20분 걷기', priority: 'B', order: 1, goalId: 'goal_health', duration: 20, completed: false, sourceRef: null },
        { id: 'task_4', date: tomorrow, title: '주간 계획 중간 점검', priority: 'B', order: 1, goalId: 'goal_focus', duration: 20, completed: false, sourceRef: null }
      ],
      timeBlocks: [
        { id: 'block_1', date: today, start: '09:00', end: '10:30', title: '핵심 업무', tone: 'focus', taskId: 'task_2', sourceRef: null },
        { id: 'block_2', date: today, start: '12:40', end: '13:00', title: '회복 산책', tone: 'health', taskId: 'task_3', sourceRef: null },
        { id: 'block_3', date: today, start: '18:30', end: '19:00', title: '하루 정리', tone: 'balance', taskId: null, sourceRef: null }
      ],
      dailyNotes: {}, weeklyNotes: {}
    }
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalize = (raw) => {
    const base = clone(seed);
    if (!raw || typeof raw !== 'object') return base;
    return {
      meta: { ...base.meta, ...(raw.meta || {}), schemaVersion: SCHEMA_VERSION },
      settings: { ...base.settings, ...(raw.settings || {}) },
      goals: Array.isArray(raw.goals) ? raw.goals : base.goals,
      plans: {
        tasks: Array.isArray(raw.plans?.tasks) ? raw.plans.tasks : base.plans.tasks,
        timeBlocks: Array.isArray(raw.plans?.timeBlocks) ? raw.plans.timeBlocks : base.plans.timeBlocks,
        dailyNotes: raw.plans?.dailyNotes || {}, weeklyNotes: raw.plans?.weeklyNotes || {}
      }
    };
  };
  const repository = {
    load() { try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { return clone(seed); } },
    save(state) { state.meta.updatedAt = new Date().toISOString(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); },
    reset() { localStorage.removeItem(STORAGE_KEY); return clone(seed); },
    exportSnapshot(state) { return clone(state); }
  };
  global.PlannerData = { STORAGE_KEY, SCHEMA_VERSION, dateKey, addDays, startOfWeek, uid, repository };
})(window);
