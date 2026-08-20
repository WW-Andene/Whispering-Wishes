// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/modals/EchoDetailModal.jsx
// EchoDetailModal
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { User, Star, X } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { DEFAULT_COLLECTION_IMAGES } from '../../data/banners.js';
import { ECHO_DATA, ECHO_SETS } from '../../data/echoes.js';
import { ELEMENT_COLORS, getElementColor, getElementIcon, getSetElementColor, getEchoSetColors, getBuffElementColor, getSetIcon } from '../../utils/helpers.js';
import { FocusTrapModal } from '../components/FocusTrapModal.jsx';
import { hideOnError } from '../utils/imageHelpers.js';
import { EchoImage } from '../components/EchoImage.jsx';
import { SpinePlayer, getSpineId } from '../components/SpinePlayer.jsx';
import MonsterCard from '../components/MonsterCard.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t } from '../../utils/i18n.js';

const ECHO_COST_COLORS = {
  4: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', labelKey: 'cost4' },
  3: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', labelKey: 'cost3' },
  1: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', labelKey: 'cost1' },
};
const ECHO_BUFF_COLORS = {
  'Glacio DMG':  { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/25' },
  'Fusion DMG':  { bg: 'bg-orange-500/10',   text: 'text-orange-400',  border: 'border-orange-500/25' },
  'Electro DMG': { bg: 'bg-purple-500/10',   text: 'text-purple-400',  border: 'border-purple-500/25' },
  'Aero DMG':    { bg: 'bg-emerald-500/10',  text: 'text-emerald-400', border: 'border-emerald-500/25' },
  'Spectro DMG': { bg: 'bg-yellow-500/10',   text: 'text-yellow-400',  border: 'border-yellow-500/25' },
  'Havoc DMG':   { bg: 'bg-pink-500/10',     text: 'text-pink-400',    border: 'border-pink-500/25' },
  'Healing':      { bg: 'bg-green-500/10',     text: 'text-green-400',   border: 'border-green-500/25' },
  'Shield':       { bg: 'bg-blue-500/10',      text: 'text-blue-400',    border: 'border-blue-500/25' },
  'Physical DMG': { bg: 'bg-slate-400/10',     text: 'text-slate-300',   border: 'border-slate-400/25' },
};
const EchoDetailModal = ({ name, onClose, imageUrl, cost, infoFraming, collectionData, visualSettings }) => {
  const { framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const isFullAnim = visualSettings?.animationsEnabled === 'full';
  const f = infoFraming || { x: 0, y: 0, zoom: 100 };
  const data = ECHO_DATA[name];
  const ownsChar = (n) => {
    if (!collectionData) return true;
    return (collectionData.chars5Counts?.[n] || 0) + (collectionData.chars4Counts?.[n] || 0) > 0;
  };
  if (!data) return null;

  const costColors = ECHO_COST_COLORS[cost] || ECHO_COST_COLORS[4];
  const buffColors = ECHO_BUFF_COLORS[data.buff] || { bg: 'bg-white/10', text: 'text-gray-300', border: 'border-[var(--border-medium)]' };

  // Get element-based colors for gradient header and border
  const setColors = getEchoSetColors(name);
  const primaryBuffColor = getBuffElementColor(Array.isArray(data.buff) ? data.buff[0] : data.buff);
  const headerGradient = setColors.length >= 2
    ? `linear-gradient(135deg, ${setColors[0]}25 0%, ${setColors[1]}25 ${setColors.length >= 3 ? '50%' : '100%'}${setColors.length >= 3 ? `, ${setColors[2]}25 100%` : ''})`
    : setColors.length === 1
      ? `linear-gradient(135deg, ${setColors[0]}25 0%, ${setColors[0]}10 100%)`
      : undefined;
  const borderColor = setColors.length >= 2
    ? setColors[0]
    : setColors.length === 1 ? setColors[0] : undefined;

  // Find characters that use this echo (referenced in bestEchoes)
  const usedBy = Object.entries(CHARACTER_DATA).filter(([, cd]) =>
    cd.bestEchoes?.some(e => e.toLowerCase().includes(name.toLowerCase()))
  ).map(([cname]) => cname);

  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={t('modals.echoDetail.echoDetailsAria', { name })} centered>
      <div
        className="kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border"
        style={borderColor ? { borderColor: `${borderColor}80` } : {}}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto flex-1" data-sheet-scroll>
        {/* Header */}
        <div className={`relative h-40 overflow-hidden rounded-t-2xl${framingMode ? ' cursor-pointer' : ''}${framingMode && editingImage === `info-${name}` ? ' ring-2 ring-emerald-500' : ''}`} style={{ contain: 'paint' }} data-sheet-header
          onClick={framingMode ? (e) => { e.stopPropagation(); setEditingImage(`info-${name}`); } : undefined}
        >
          <div className="absolute inset-0" style={headerGradient ? { background: headerGradient } : {}} />
          {!headerGradient && <div className={`absolute inset-0 bg-gradient-to-br ${costColors.bg}`} />}
          {framingMode && editingImage === `info-${name}` && (
            <div className="absolute top-2 left-2 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-black text-sm">✓</span>
            </div>
          )}
          {imageUrl && (
            <EchoImage src={imageUrl} alt={name} className="absolute right-2 top-1/2 -translate-y-1/2 h-36 object-contain opacity-90" noBgProcess={data?.noBgProcess} style={{
              transform: `translateY(-50%) scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
              transformOrigin: 'center',
            }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label={t('modals.echoDetail.closeAria')}>
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`kuro-badge ${costColors.bg} ${costColors.text} border ${costColors.border}`}>{t(`modals.echoDetail.${costColors.labelKey}`)}</span>
              {/* Element badges from echo skill element(s) */}
              {(() => {
                const elements = [];
                if (data.element) elements.push(data.element);
                // Also extract additional elements mentioned as DMG in desc
                const elNames = ['Glacio', 'Fusion', 'Electro', 'Aero', 'Spectro', 'Havoc'];
                if (data.desc) {
                  elNames.forEach(el => {
                    if (!elements.includes(el) && new RegExp(el + '\\s*DMG', 'i').test(data.desc)) {
                      elements.push(el);
                    }
                  });
                }
                return elements.map(el => {
                  const ec = ELEMENT_COLORS[el];
                  const icon = getElementIcon(el);
                  return ec ? (
                    <span key={el} className="kuro-badge font-medium inline-flex items-center gap-1" style={{ background: ec.bg, color: ec.hex, border: `1px solid ${ec.border}` }}>
                      {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                      {el}
                    </span>
                  ) : null;
                });
              })()}
              {(Array.isArray(data.buff) ? data.buff : [data.buff]).map(b => {
                const bc = ECHO_BUFF_COLORS[b] || buffColors;
                return <span key={b} className={`kuro-badge ${bc.bg} ${bc.text} border ${bc.border}`}>{b}</span>;
              })}
            </div>
            <h2 className="text-2xl font-semibold text-white">{name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* 1. Info bar — dmg value + sets */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.dmg > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="text-sm text-gray-400">{t('modals.echoDetail.dmg')}</span>
                <span className="text-base font-bold text-red-400">{data.dmg}%</span>
              </div>
            )}
            {(data.sets || []).map(setName => {
              const sc = getSetElementColor(setName);
              const setIcon = getSetIcon(setName);
              return (
                <span key={setName} className="kuro-badge font-medium inline-flex items-center gap-1" style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>
                  {setIcon && <img src={setIcon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                  {setName}
                </span>
              );
            })}
          </div>

          {/* 2. Description (identity) */}
          {data.desc && (
            <p className="text-md text-gray-400 italic">{data.desc.split(/(?<=\.)\s+/)[0]}</p>
          )}

          {/* 3. Enemy Stats — every echo here is dropped by a specific enemy, so surface its combat
              stats (all 181 tracked echoes have this, not just 4-cost bosses — "Boss Stats" was
              misleading for e.g. a Common-rank mob like Smiter). */}
          {data.enemyStats && (
            <div>
              <div className="text-sm text-red-400 uppercase tracking-wider mb-2 font-semibold">{t('modals.echoDetail.enemyStats')}</div>
              <MonsterCard name={name} rank={data.rank} iconUrl={data.monsterIconUrl || data.iconUrl} enemyStats={data.enemyStats} compact showLevelControl />
            </div>
          )}

          {/* 4. Sonata Sets */}
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">{t('modals.echoDetail.sonataSetBonuses')}</div>
            <div className="space-y-2">
              {(data.sets || []).map(setName => {
                const setData = ECHO_SETS[setName];
                const setColor = getSetElementColor(setName);
                const setIcon = getSetIcon(setName);
                return (
                  <div key={setName} className="p-2 rounded-lg" style={{ background: `${setColor}10`, borderLeft: `3px solid ${setColor}80` }}>
                    <div className="text-base font-bold mb-0.5 inline-flex items-center gap-1.5" style={{ color: setColor }}>
                      {setIcon && <img src={setIcon} alt="" className="w-4 h-4" onError={hideOnError} />}
                      {setName}
                    </div>
                    {setData ? (
                      <div className="space-y-0.5">
                        {setData.p2 && <div className="text-sm text-gray-400"><span className="text-gray-500">{t('modals.echoDetail.piece2')}</span> {setData.p2}</div>}
                        {setData.p3 && <div className="text-sm text-gray-400"><span className="text-gray-500">{t('modals.echoDetail.piece3')}</span> {setData.p3}</div>}
                        {setData.p5 && <div className="text-sm text-gray-400"><span className="text-gray-500">{t('modals.echoDetail.piece5')}</span> {setData.p5}</div>}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">{t('modals.echoDetail.setDataNotAvailable')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Skill — full description with highlighted numbers and tags */}
          {data.desc && (() => {
            const parts = data.desc.split(/(?<=\.)\s+/);
            const allSkillText = parts.slice(1).join(' ');
            if (!allSkillText) return null;
            // Format text: element DMG = full phrase in element color, everything else = number-only in white
            const formatSkillText = (text) => {
              const result = [];
              // Group 1: full element DMG phrase (colored by element)
              // Group 2-4: number-only white highlights (%, s, x)
              const regex = /(\d+(?:\.\d+)?%?\s*(?:Glacio|Fusion|Electro|Aero|Spectro|Havoc|Physical)\s*DMG)|([+-]?\d+(?:\.\d+)?%)|(\d+s)|(CD:\s*\d+s)|(x\d+)/gi;
              let lastIndex = 0;
              let match;
              while ((match = regex.exec(text)) !== null) {
                const m = match[0];
                if (match.index > lastIndex) {
                  result.push(<span key={lastIndex} className="text-gray-400">{text.slice(lastIndex, match.index)}</span>);
                }
                let color = '#ffffff';
                // Group 1: element DMG — full phrase gets element color
                if (match[1]) {
                  if (/Glacio/i.test(m)) color = getBuffElementColor('Glacio DMG');
                  else if (/Fusion/i.test(m)) color = getBuffElementColor('Fusion DMG');
                  else if (/Electro/i.test(m)) color = getBuffElementColor('Electro DMG');
                  else if (/Aero/i.test(m)) color = getBuffElementColor('Aero DMG');
                  else if (/Spectro/i.test(m)) color = getBuffElementColor('Spectro DMG');
                  else if (/Havoc/i.test(m)) color = getBuffElementColor('Havoc DMG');
                  else if (/Physical/i.test(m)) color = '#a1a1aa';
                }
                result.push(
                  <span key={match.index} className="font-semibold" style={{ color }}>{m}</span>
                );
                lastIndex = match.index + m.length;
              }
              if (lastIndex < text.length) {
                result.push(<span key={lastIndex} className="text-gray-400">{text.slice(lastIndex)}</span>);
              }
              return result;
            };
            return (
              <div className="kuro-detail-box">
                <div className="kuro-section-label mb-1">{t('modals.echoDetail.skill')}</div>
                <p className="text-base leading-relaxed">{formatSkillText(allSkillText)}</p>
              </div>
            );
          })()}

          {/* 6. Main Stats */}
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">{t('modals.echoDetail.possibleMainStats')}</div>
            <div className="flex flex-wrap gap-1">
              {cost === 4 && t('modals.echoDetail.mainStatsCost4').map(s => (
                <span key={s} className="kuro-badge kuro-badge-yellow">{s}</span>
              ))}
              {cost === 3 && t('modals.echoDetail.mainStatsCost3').map(s => (
                <span key={s} className="kuro-badge kuro-badge-purple">{s}</span>
              ))}
              {cost === 1 && t('modals.echoDetail.mainStatsCost1').map(s => (
                <span key={s} className="kuro-badge kuro-badge-cyan">{s}</span>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {t('modals.echoDetail.secondary', { stat: cost === 1 ? t('modals.echoDetail.flatHp') : t('modals.echoDetail.flatAtk') })}
            </div>
          </div>

          {/* 7. Substats */}
          <div className="kuro-detail-box">
            <div className="kuro-section-label mb-2">{t('modals.echoDetail.possibleSubstats')}</div>
            <div className="flex flex-wrap gap-1">
              {t('modals.echoDetail.substatsList').map(s => (
                <span key={s} className="kuro-badge kuro-badge-neutral">{s}</span>
              ))}
            </div>
          </div>

          {/* 8. Recommended For */}
          {usedBy.length > 0 && (
            <div>
              <div className="kuro-section-label mb-1.5">{t('modals.echoDetail.recommendedFor')}</div>
              <div className="flex flex-wrap gap-2">
                {usedBy.map(charName => {
                  const charImg = DEFAULT_COLLECTION_IMAGES[charName];
                  const is5Star = CHARACTER_DATA[charName]?.rarity === 5;
                  const owned = ownsChar(charName);
                  const charSpineId = isFullAnim ? getSpineId(charName, { surface: 'collection' }) : null;
                  return (
                    <div key={charName} className={`flex flex-col items-center gap-1 ${!owned ? 'opacity-50' : ''}`}>
                      {charImg ? (
                        <div className={`w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] overflow-hidden${owned && is5Star ? ' holo-5star' : ''}`} style={{ contain: 'paint', position: 'relative', filter: owned ? 'none' : 'grayscale(100%)' }}>
                          {charSpineId ? (
                            <SpinePlayer
                              characterId={charSpineId}
                              context="echo"
                              className="w-full h-full"
                              backgroundColor="#00000000"
                              fallbackImgUrl={charImg}
                              fallbackImgStyle={{ objectFit: 'cover', objectPosition: 'top' }}
                            />
                          ) : (
                            <div className="absolute inset-0 breath-zoom">
                              <img src={charImg} alt={charName} className="absolute inset-0 w-full h-full object-cover object-top" onError={hideOnError} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-[var(--border-medium)] flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-400 text-center leading-tight max-w-[56px] truncate">{charName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
       </div>
      </div>
    </FocusTrapModal>
  );
};

export { EchoDetailModal };
