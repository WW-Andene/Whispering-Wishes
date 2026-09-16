// Per-facet answer templating for Abby's query engine — given a resolved
// character's own data fields, builds the actual text answer. Never
// fabricates: matchup/counter questions get an honest "not tracked" answer
// instead of an invented one, since Wuthering Waves has no elemental
// rock-paper-scissors system and no such data exists anywhere in characters.js.

import { t } from '../../utils/i18n.js';

function joinOr(list) {
  if (!list || list.length === 0) return null;
  return list.join(' | ');
}

export function buildTeamAnswer(name, data) {
  const teams = joinOr(data.teams);
  if (!teams && !data.bestWeapon && !(data.bestEchoes && data.bestEchoes.length)) {
    return { kind: 'text', text: t('assistant.answerTeamNoData', { name }), name };
  }
  return {
    kind: 'text',
    name,
    text: t('assistant.answerTeam', {
      name,
      teams: teams || '—',
      weapon: data.bestWeapon || '—',
      echoes: (data.bestEchoes || []).join(', ') || '—',
    }),
  };
}

export function buildWeaponAnswer(name, data) {
  if (!data.bestWeapon) {
    return { kind: 'text', text: t('assistant.answerWeaponNoData', { name }), name };
  }
  return {
    kind: 'text',
    name,
    text: t('assistant.answerWeapon', { name, weapon: data.bestWeapon }),
  };
}

export function buildEchoesAnswer(name, data) {
  const echoes = data.bestEchoes && data.bestEchoes.length ? data.bestEchoes.join(', ') : null;
  if (!echoes) {
    return { kind: 'text', text: t('assistant.answerEchoesNoData', { name }), name };
  }
  return {
    kind: 'text',
    name,
    text: t('assistant.answerEchoes', { name, echoes }),
  };
}

export function buildMaterialsAnswer(name, data) {
  const asc = data.ascension;
  const skill = data.skillMaterials;
  if (!asc && !skill) {
    return { kind: 'text', text: t('assistant.answerMaterialsNoData', { name }), name };
  }
  const ascText = asc ? [asc.boss, asc.common, asc.specialty].filter(Boolean).join(', ') : '—';
  const skillText = skill ? [skill.weeklyDrop, skill.forgery].filter(Boolean).join(', ') : '—';
  return {
    kind: 'text',
    name,
    text: t('assistant.answerMaterials', { name, ascension: ascText, skillMaterials: skillText }),
  };
}

export function buildMatchupAnswer(name, data) {
  return {
    kind: 'text',
    name,
    text: t('assistant.answerMatchup', { name, element: data.element || '—', role: data.role || '—' }),
  };
}

// General "who is X" / "tell me about X" / no specific facet keyword matched
// at all - still a real answer, just the character's own element/weapon/
// role/desc instead of guessing which facet they meant.
export function buildProfileAnswer(name, data) {
  return {
    kind: 'text',
    name,
    text: t('assistant.answerProfile', {
      name,
      rarity: data.rarity ?? '—',
      element: data.element || '—',
      weapon: data.weapon || '—',
      role: data.role || '—',
      desc: data.desc || '',
    }),
  };
}

export const ANSWER_BUILDERS = {
  weapon: buildWeaponAnswer,
  echoes: buildEchoesAnswer,
  team: buildTeamAnswer,
  materials: buildMaterialsAnswer,
  matchup: buildMatchupAnswer,
  profile: buildProfileAnswer,
};
