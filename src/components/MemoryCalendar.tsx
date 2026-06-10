import { useMemo, useState } from 'react';
import type { SmellMemory } from '../utils/constants';
import { getSmellTypeInfo, getEmotionInfo, getSeasonInfo } from '../utils/constants';
import {
  getDateKey,
  getMonthMatrix,
  formatMonthLabel,
  formatDateShort,
  formatTime,
  contrastTextColor,
} from '../utils/helpers';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';

interface Props {
  memories: SmellMemory[];
  onSelectMemory: (id: string) => void;
  onSwitchToList: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MemoryCalendar({ memories, onSelectMemory, onSwitchToList }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(getTodayKey());

  const memoriesByDate = useMemo(() => {
    const map: Record<string, SmellMemory[]> = {};
    for (const m of memories) {
      const key = getDateKey(m.created_at);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return map;
  }, [memories]);

  const monthMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const stats = useMemo(() => {
    let totalInMonth = 0;
    const datesWithMemories = new Set<string>();
    for (const m of memories) {
      const d = new Date(m.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totalInMonth++;
        datesWithMemories.add(getDateKey(m.created_at));
      }
    }
    return { totalInMonth, activeDays: datesWithMemories.size };
  }, [memories, year, month]);

  const selectedMemories = selectedKey ? memoriesByDate[selectedKey] ?? [] : [];

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedKey(getTodayKey());
  };

  const handleDayClick = (date: Date) => {
    const key = getDateKey(date.toISOString());
    setSelectedKey(key);
  };

  const renderDayCell = (date: Date | null, key: string) => {
    if (!date) {
      return <div key={key} className="aspect-square md:aspect-[1/1] min-h-[60px] md:min-h-[80px]" />;
    }
    const dKey = getDateKey(date.toISOString());
    const dayMemories = memoriesByDate[dKey] ?? [];
    const isToday = dKey === getTodayKey();
    const isSelected = dKey === selectedKey;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const count = dayMemories.length;

    const colorSwatches = dayMemories.slice(0, 4).map(m => m.color_association);

    return (
      <button
        key={key}
        onClick={() => handleDayClick(date)}
        className={`
          relative aspect-square md:aspect-[1/1] min-h-[60px] md:min-h-[80px] rounded-xl p-1.5 md:p-2
          flex flex-col items-stretch gap-1 md:gap-1.5 text-left
          transition-all duration-200 group
          ${isSelected
            ? 'bg-ochre-500/15 ring-2 ring-ochre-500 shadow-inner'
            : count > 0
              ? 'bg-paper-50 hover:bg-paper-100 hover:shadow-md border border-paper-200 hover:border-paper-300'
              : 'bg-paper-100/40 hover:bg-paper-100/80 border border-paper-200/60'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <span
            className={`
              inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-xs md:text-sm font-semibold
              ${isToday
                ? 'bg-ochre-500 text-paper-50 shadow-sm'
                : isWeekend
                  ? 'text-brick-500/70'
                  : 'text-ink-700/70 group-hover:text-ink-800'
              }
            `}
          >
            {date.getDate()}
          </span>
          {count > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold
                ${count >= 5 ? 'bg-brick-500 text-paper-50' : count >= 3 ? 'bg-ochre-500 text-paper-50' : 'bg-moss-500 text-paper-50'}
              `}
            >
              {count}
            </span>
          )}
        </div>

        {colorSwatches.length > 0 && (
          <div className="flex-1 flex items-end gap-0.5">
            {colorSwatches.length === 1 ? (
              <div
                className="flex-1 h-4 md:h-5 rounded-md shadow-sm border border-paper-50"
                style={{ backgroundColor: colorSwatches[0] }}
                title={dayMemories[0].location}
              />
            ) : colorSwatches.length === 2 ? (
              <>
                <div
                  className="flex-1 h-4 md:h-5 rounded-l-md shadow-sm border-t border-b border-l border-paper-50"
                  style={{ backgroundColor: colorSwatches[0] }}
                />
                <div
                  className="flex-1 h-4 md:h-5 rounded-r-md shadow-sm border-t border-b border-r border-paper-50"
                  style={{ backgroundColor: colorSwatches[1] }}
                />
              </>
            ) : colorSwatches.length === 3 ? (
              <>
                <div
                  className="w-1/3 h-4 md:h-5 rounded-l-md shadow-sm border-t border-b border-l border-paper-50"
                  style={{ backgroundColor: colorSwatches[0] }}
                />
                <div
                  className="flex-1 h-4 md:h-5 shadow-sm border-t border-b border-paper-50/50"
                  style={{ backgroundColor: colorSwatches[1] }}
                />
                <div
                  className="w-1/3 h-4 md:h-5 rounded-r-md shadow-sm border-t border-b border-r border-paper-50"
                  style={{ backgroundColor: colorSwatches[2] }}
                />
              </>
            ) : (
              <>
                <div
                  className="w-1/4 h-4 md:h-5 rounded-l-md shadow-sm border-t border-b border-l border-paper-50"
                  style={{ backgroundColor: colorSwatches[0] }}
                />
                <div
                  className="flex-1 h-4 md:h-5 shadow-sm border-t border-b border-paper-50/50"
                  style={{ backgroundColor: colorSwatches[1] }}
                />
                <div
                  className="flex-1 h-4 md:h-5 shadow-sm border-t border-b border-paper-50/50"
                  style={{ backgroundColor: colorSwatches[2] }}
                />
                <div
                  className="w-1/4 h-4 md:h-5 rounded-r-md shadow-sm border-t border-b border-r border-paper-50 relative overflow-hidden"
                  style={{ backgroundColor: colorSwatches[3] }}
                >
                  {count > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-paper-50 text-[9px] font-bold">
                      +{count - 4}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="animate-fadeInUp">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-paper-50/80 backdrop-blur rounded-3xl border border-paper-300 shadow-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-hand text-2xl md:text-3xl text-ochre-600 flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                {formatMonthLabel(year, month)}
              </h2>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={goToday}
                className="btn-ghost !px-3 !py-1.5 text-xs md:text-sm font-medium"
              >
                今天
              </button>
              <div className="flex items-center rounded-xl border border-paper-300 bg-paper-100 overflow-hidden">
                <button
                  onClick={goPrevMonth}
                  className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 hover:bg-paper-200/80 transition-colors text-ink-700"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="w-px h-5 bg-paper-300" />
                <button
                  onClick={goNextMonth}
                  className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 hover:bg-paper-200/80 transition-colors text-ink-700"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4 md:mb-6 px-1">
            <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-ink-700/70">
              本月记录 <b className="text-ochre-600 font-semibold">{stats.totalInMonth}</b> 条
            </span>
            <span className="text-paper-400">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-ink-700/70">
              活跃天数 <b className="text-moss-600 font-semibold">{stats.activeDays}</b> 天
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2 md:mb-3">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`
                  text-center text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-lg
                  ${i === 0 || i === 6 ? 'text-brick-500/60' : 'text-ink-700/60'}
                `}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {monthMatrix.flatMap((week, wi) =>
              week.map((date, di) => renderDayCell(date, `w${wi}-d${di}`))
            )}
          </div>

          <div className="mt-5 md:mt-6 pt-4 md:pt-5 border-t border-paper-200/80 flex flex-wrap items-center gap-4 md:gap-6 text-[11px] md:text-xs text-ink-700/60">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-ochre-500" />
              <span>今天</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-moss-500 text-paper-50 text-[10px] font-bold">1</span>
              <span>1-2 条</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-ochre-500 text-paper-50 text-[10px] font-bold">3</span>
              <span>3-4 条</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brick-500 text-paper-50 text-[10px] font-bold">5</span>
              <span>5+ 条</span>
            </div>
          </div>
        </div>

        <div className="lg:w-96 xl:w-[28rem] shrink-0 flex flex-col gap-4">
          <div className="bg-paper-50/80 backdrop-blur rounded-3xl border border-paper-300 shadow-card p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg md:text-xl font-semibold text-ink-800">
                {selectedKey
                  ? `${parseInt(selectedKey.split('-')[1])}月${parseInt(selectedKey.split('-')[2])}日`
                  : '选择日期'
                }
                <span className="ml-2 text-sm font-normal text-ink-700/50">
                  {selectedMemories.length > 0 ? `${selectedMemories.length} 条记忆` : '暂无记录'}
                </span>
              </h3>
              {selectedMemories.length > 0 && (
                <button
                  onClick={onSwitchToList}
                  className="inline-flex items-center gap-1 text-[11px] md:text-xs text-ochre-600 hover:text-ochre-700 font-medium px-2 py-1 rounded-lg hover:bg-ochre-500/10 transition-colors"
                >
                  回到列表
                  <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              )}
            </div>

            {selectedMemories.length === 0 ? (
              <div className="py-12 md:py-16 text-center">
                <div className="text-4xl md:text-5xl mb-3 select-none opacity-60">📅</div>
                <p className="font-serif text-ink-700/70 text-base md:text-lg">
                  {selectedKey ? '这一天没有封存气味' : '点击日历格子查看当天记忆'}
                </p>
                <p className="text-xs md:text-sm text-ink-700/40 mt-2">
                  {selectedKey ? '或许明天会有值得记录的味道呢' : '选择任意日期开始探索'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {selectedMemories.map((m, idx) => {
                  const stype = getSmellTypeInfo(m.smell_type);
                  const emotion = getEmotionInfo(m.emotion);
                  const season = getSeasonInfo(m.season);
                  return (
                    <article
                      key={m.id}
                      onClick={() => onSelectMemory(m.id)}
                      className="group relative cursor-pointer bg-paper-50 rounded-xl border border-paper-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-ochre-300/60 transition-all duration-250 animate-fadeInUp overflow-hidden"
                      style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                    >
                      <div className="flex">
                        <div
                          className="w-1.5 shrink-0 relative overflow-hidden transition-all duration-300 group-hover:w-2"
                          style={{ backgroundColor: m.color_association }}
                        />
                        <div className="flex-1 p-3 md:p-3.5 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-serif text-base md:text-[15px] font-semibold text-ink-800 leading-tight truncate">
                                {m.location}
                              </h4>
                              <p className="text-xs text-ink-700/60 mt-0.5 truncate">
                                <span className="mr-0.5" style={{ color: stype.color }}>{stype.emoji}</span>
                                {m.source_guess}
                              </p>
                            </div>
                            <div
                              className="w-7 h-7 md:w-8 md:h-8 rounded-md shrink-0 flex items-center justify-center shadow-sm border-2 border-paper-50"
                              style={{
                                backgroundColor: m.color_association,
                                color: contrastTextColor(m.color_association),
                              }}
                            >
                              <span className="text-[10px] font-bold">色</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className={`scent-tag !px-2 !py-0.5 !text-[10px] ${emotion.bg} ${emotion.text}`}>
                              {emotion.emoji} {emotion.label}
                            </span>
                            <span className="scent-tag !px-2 !py-0.5 !text-[10px] bg-ochre-100 text-ochre-600">
                              {season.emoji} {season.label}
                            </span>
                            <span
                              className="scent-tag !px-2 !py-0.5 !text-[10px] text-paper-50"
                              style={{ backgroundColor: stype.color }}
                            >
                              {stype.label}
                            </span>
                          </div>

                          {m.memory_text && (
                            <p className="text-xs md:text-[13px] text-ink-700/70 leading-relaxed line-clamp-2 font-serif mb-2">
                              {m.memory_text}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1.5 border-t border-paper-200/60">
                            <span className="text-[10px] md:text-[11px] text-ink-700/40 flex items-center gap-1">
                              <span>🕐</span>
                              {formatTime(m.created_at)} · {formatDateShort(m.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] text-ochre-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              跳转查看
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}