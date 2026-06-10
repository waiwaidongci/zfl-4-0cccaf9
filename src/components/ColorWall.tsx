import { useState } from 'react';
import type { SmellMemory } from '../utils/constants';
import { getSeasonInfo, getSmellTypeInfo, getEmotionInfo } from '../utils/constants';
import { contrastTextColor, formatDateShort } from '../utils/helpers';
import { Heart, ArrowUpRight, X } from 'lucide-react';

interface Props {
  memories: SmellMemory[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onResetFilters?: () => void;
  hasActiveFilters: boolean;
}

export default function ColorWall({ memories, onSelect, onAdd, onResetFilters, hasActiveFilters }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMemory = memories.find(m => m.id === selectedId) || null;

  const getBlockSize = (intensity: number) => {
    const minSize = 64;
    const maxSize = 148;
    return minSize + ((intensity - 1) / 9) * (maxSize - minSize);
  };

  const handleBlockClick = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const handleLocate = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  if (memories.length === 0) {
    return (
      <div className="bg-paper-50/70 backdrop-blur rounded-3xl border-2 border-dashed border-paper-400 py-20 text-center">
        <div className="text-6xl mb-4 select-none">🎨</div>
        <h3 className="font-serif text-2xl text-ink-800 mb-2">
          {hasActiveFilters ? '没有匹配的颜色记忆' : '气味调色板还是空白的'}
        </h3>
        <p className="text-ink-700/60 max-w-md mx-auto mb-6">
          {hasActiveFilters
            ? '换一组筛选条件试试？或者先封存一段新的气味，为它染上专属颜色'
            : '封存第一段气味，为它染上属于记忆的颜色，让调色板鲜活起来'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={onAdd} className="btn-primary">
            封存第一段气味
          </button>
          {hasActiveFilters && onResetFilters && (
            <button onClick={onResetFilters} className="btn-secondary">
              清除筛选条件
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-hand text-2xl text-ochre-600 flex items-center gap-2">
            颜色气味墙
          </h2>
          <p className="text-xs text-ink-700/50 mt-1">
            · 色块大小代表气味强度，红心角标表示还想再闻
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-700/60">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-ochre-200" />
            <span className="w-4 h-4 rounded bg-ochre-400" />
            <span className="w-5 h-5 rounded bg-ochre-600" />
            强度递增
          </span>
          <span className="mx-1 text-paper-400">|</span>
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-moss-500 text-moss-500" />
            想再闻
          </span>
        </div>
      </div>

      <div className="bg-paper-50/60 backdrop-blur rounded-3xl border border-paper-300 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-center gap-3">
          {memories.map((m, idx) => {
            const size = getBlockSize(m.intensity);
            const isSelected = selectedId === m.id;
            const textColor = contrastTextColor(m.color_association);

            return (
              <button
                key={m.id}
                onClick={() => handleBlockClick(m.id)}
                className={`relative group rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ochre-400 focus:ring-offset-2 focus:ring-offset-paper-50 ${
                  isSelected ? 'ring-2 ring-ochre-500 ring-offset-2 ring-offset-paper-50 scale-105 z-10' : ''
                }`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: m.color_association,
                  animationDelay: `${Math.min(idx * 40, 600)}ms`,
                  animation: 'fadeInUp 0.45s ease-out both',
                }}
                title={`${m.location} · 强度${m.intensity}/10`}
              >
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,0,0,0.12) 100%)',
                  }}
                />

                {m.want_again && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-moss-500 flex items-center justify-center shadow-md border-2 border-paper-50 z-10">
                    <Heart className="w-3 h-3 fill-paper-50 text-paper-50" />
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-ochre-500 flex items-center justify-center shadow-md border-2 border-paper-50 z-10">
                    <X className="w-3 h-3 text-paper-50" strokeWidth={3} />
                  </div>
                )}

                <div
                  className="absolute inset-0 flex items-center justify-center px-2 rounded-xl"
                  style={{ color: textColor }}
                >
                  <span
                    className="font-serif font-bold text-center leading-tight line-clamp-2"
                    style={{ fontSize: `${Math.max(11, size * 0.18)}px` }}
                  >
                    {m.location}
                  </span>
                </div>

                <div
                  className="absolute bottom-1 right-1.5 font-bold opacity-70"
                  style={{ color: textColor, fontSize: `${Math.max(9, size * 0.12)}px` }}
                >
                  {m.intensity}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMemory && (
        <div className="animate-slideDown">
          <ColorMemoryDetail memory={selectedMemory} onLocate={handleLocate} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}

function ColorMemoryDetail({ memory, onLocate, onClose }: { memory: SmellMemory; onLocate: () => void; onClose: () => void }) {
  const season = getSeasonInfo(memory.season);
  const stype = getSmellTypeInfo(memory.smell_type);
  const emotion = getEmotionInfo(memory.emotion);
  const textColor = contrastTextColor(memory.color_association);

  return (
    <div className="bg-paper-50 rounded-3xl border border-paper-300 shadow-paper-hover overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div
          className="md:w-48 shrink-0 flex items-center justify-center p-8 relative"
          style={{ backgroundColor: memory.color_association }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 60%)' }} />
          <div className="relative z-10 text-center" style={{ color: textColor }}>
            <div className="text-4xl mb-2">{stype.emoji}</div>
            <div className="font-serif font-bold text-lg">强度 {memory.intensity}/10</div>
            <div className="text-sm opacity-80 mt-1">{formatDateShort(memory.created_at)}</div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h3 className="font-serif text-2xl font-bold text-ink-800 leading-tight">
                {memory.location}
              </h3>
              <p className="text-sm text-ink-700/70 mt-1">
                来源推测：{memory.source_guess}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onLocate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-ochre-500 hover:bg-ochre-600 text-paper-50 transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                定位原始卡片
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-ink-700/60 hover:text-ink-800 hover:bg-paper-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className={`scent-tag ${emotion.bg} ${emotion.text}`}>
              {emotion.emoji} {emotion.label}
            </span>
            <span className="scent-tag bg-ochre-100 text-ochre-600">
              {season.emoji} {season.label}
            </span>
            <span
              className="scent-tag text-paper-50"
              style={{ backgroundColor: stype.color }}
            >
              {stype.label}
            </span>
            {memory.want_again && (
              <span className="scent-tag bg-moss-100 text-moss-600">
                <Heart className="w-3 h-3 fill-current" /> 想再闻
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-paper-100/70 rounded-xl p-3 border border-paper-200">
              <div className="text-[11px] text-ink-700/50 mb-1">气味强度</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-paper-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${memory.intensity * 10}%`,
                      background: 'linear-gradient(90deg, #D4B487 0%, #8B5A2B 100%)',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-ochre-600">{memory.intensity}/10</span>
              </div>
            </div>
            <div className="bg-paper-100/70 rounded-xl p-3 border border-paper-200">
              <div className="text-[11px] text-ink-700/50 mb-1">湿度感</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-paper-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${memory.humidity * 10}%`,
                      background: 'linear-gradient(90deg, #CFDBD3 0%, #3D5A4A 100%)',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-moss-600">{memory.humidity}/10</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-paper-100/70 border border-paper-200/80">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-hand text-lg text-ochre-600">关联记忆</span>
            </div>
            <p className="font-serif text-[15px] leading-relaxed text-ink-800 whitespace-pre-wrap">
              {memory.memory_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
