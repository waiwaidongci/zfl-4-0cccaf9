import { useEffect, useMemo, useState } from 'react';
import Header, { type ViewMode } from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import VisualizationPanel from '../components/VisualizationPanel';
import MemoryCard from '../components/MemoryCard';
import MemoryModal from '../components/MemoryModal';
import MemoryCalendar from '../components/MemoryCalendar';
import ColorWall from '../components/ColorWall';
import { useMemoryStore } from '../store/memoryStore';
import type { Filters } from '../utils/helpers';
import { filterMemories, generateScentInspiration, type ScentInspiration } from '../utils/helpers';
import type { SmellMemory } from '../utils/constants';
import { getSmellTypeInfo, getEmotionInfo, getSeasonInfo } from '../utils/constants';
import type { MemoryInput } from '../store/memoryStore';
import { BookOpenCheck, Dices, X, ArrowRight, RotateCcw } from 'lucide-react';

const defaultFilters: Filters = {
  smellType: '',
  season: '',
  emotion: '',
};

export default function Home() {
  const { memories, initIfEmpty, addMemory, updateMemory, deleteMemory } = useMemoryStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SmellMemory | null>(null);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [inspiration, setInspiration] = useState<ScentInspiration | null>(null);
  const [prefillData, setPrefillData] = useState<ScentInspiration | null>(null);
  const [rerolling, setRerolling] = useState(false);

  useEffect(() => {
    initIfEmpty();
  }, [initIfEmpty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspirationOpen) {
        setInspirationOpen(false);
      }
    };
    if (inspirationOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [inspirationOpen]);

  const filteredMemories = useMemo(
    () => filterMemories(memories, filters),
    [memories, filters],
  );

  const hasActiveFilters = !!(filters.smellType || filters.season || filters.emotion);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };
  const resetFilters = () => setFilters(defaultFilters);

  const openAddModal = () => { setEditing(null); setPrefillData(null); setModalOpen(true); };
  const openEditModal = (m: SmellMemory) => { setEditing(m); setPrefillData(null); setModalOpen(true); };

  const handleSubmit = (data: MemoryInput) => {
    if (editing) {
      updateMemory(editing.id, data);
    } else {
      addMemory(data);
    }
    setPrefillData(null);
  };

  const openInspiration = () => {
    setInspiration(generateScentInspiration());
    setInspirationOpen(true);
  };

  const rerollInspiration = () => {
    setRerolling(true);
    setTimeout(() => {
      setInspiration(generateScentInspiration());
      setRerolling(false);
    }, 300);
  };

  const useInspiration = () => {
    if (inspiration) {
      setPrefillData(inspiration);
      setInspirationOpen(false);
      setEditing(null);
      setModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const target = memories.find((m) => m.id === id);
    const msg = `确认删除「${target?.location ?? '这段记忆'}」吗？`;
    if (window.confirm(msg)) {
      deleteMemory(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const scrollToCard = (id: string) => {
    setViewMode('list');
    setExpandedId(id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-memory-id="${id}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  };

  return (
    <div className="min-h-screen">
      <Header
        onAdd={openAddModal}
        onInspire={openInspiration}
        memoryCount={memories.length}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      <main className="container max-w-6xl pb-20">
        {viewMode === 'list' ? (
          <>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
              resultCount={filteredMemories.length}
            />

            <VisualizationPanel memories={filteredMemories} onSelect={scrollToCard} />

            <section className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-hand text-2xl text-ochre-600 flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5" />
                  气味档案
                </h2>
                <span className="text-xs text-ink-700/50">
                  点击卡片展开完整回忆
                </span>
              </div>

              {filteredMemories.length === 0 ? (
                <div className="bg-paper-50/70 backdrop-blur rounded-3xl border-2 border-dashed border-paper-400 py-20 text-center">
                  <div className="text-6xl mb-4 select-none">🍂</div>
                  <h3 className="font-serif text-2xl text-ink-800 mb-2">
                    {hasActiveFilters
                      ? '没有匹配的气味记忆'
                      : '还没有封存任何气味'}
                  </h3>
                  <p className="text-ink-700/60 max-w-md mx-auto mb-6">
                    {hasActiveFilters
                      ? '换一组筛选条件试试？或者先封存一段新的气味'
                      : '空气中一定有让你难忘的味道——无论是衣柜里的樟木香，还是雨后操场的青草气'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={openAddModal} className="btn-primary">
                      封存第一段气味
                    </button>
                    {hasActiveFilters && (
                      <button onClick={resetFilters} className="btn-secondary">
                        清除筛选条件
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="masonry-grid">
                  {filteredMemories.map((m, idx) => (
                    <div key={m.id} data-memory-id={m.id}>
                      <MemoryCard
                        memory={m}
                        index={idx}
                        isExpanded={expandedId === m.id}
                        onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
                        onEdit={() => openEditModal(m)}
                        onDelete={() => handleDelete(m.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : viewMode === 'calendar' ? (
          <MemoryCalendar
            memories={memories}
            onSelectMemory={scrollToCard}
            onSwitchToList={() => setViewMode('list')}
          />
        ) : (
          <>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
              resultCount={filteredMemories.length}
            />
            <section className="mt-6">
              <ColorWall
                memories={filteredMemories}
                onSelect={scrollToCard}
                onAdd={openAddModal}
                onResetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </section>
          </>
        )}
      </main>

      <footer className="pb-10 pt-4 text-center text-xs text-ink-700/40 font-hand text-lg">
        <p>愿每一缕气味，都是打开旧时光的钥匙 · Scent Archive</p>
      </footer>

      <MemoryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setPrefillData(null); }}
        onSubmit={handleSubmit}
        editingData={editing}
        prefillData={prefillData}
      />

      {inspirationOpen && inspiration && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-8 md:p-6 overflow-y-auto">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setInspirationOpen(false)}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />
          <div className="relative w-full max-w-lg bg-paper-50 rounded-3xl shadow-2xl border border-paper-300 animate-slideDown overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-40 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${getSmellTypeInfo(inspiration.smell_type).color} 0%, transparent 70%)`,
              }}
            />
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-paper-200 rounded-t-3xl bg-paper-50/95 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-lavender-400/20 flex items-center justify-center text-lavender-600">
                  <Dices className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink-800">气味灵感抽签</h2>
                  <p className="text-xs text-ink-700/60 mt-0.5 font-hand">不知道写什么？试试随机组合～</p>
                </div>
              </div>
              <button
                onClick={() => setInspirationOpen(false)}
                className="p-2 rounded-xl text-ink-700/60 hover:text-ink-800 hover:bg-paper-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 relative z-0">
              <div
                className={`bg-gradient-to-br from-lavender-300/20 via-ochre-200/20 to-moss-200/20 rounded-2xl p-5 border border-lavender-300/30 transition-all duration-300 ${rerolling ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}
              >
                <p className="font-serif text-ink-800 text-lg leading-relaxed">
                  {inspiration.prompt}
                </p>
              </div>

              <div className={`space-y-3 transition-all duration-300 ${rerolling ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}`}>
                <h3 className="text-sm font-semibold text-ink-700/70 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-lavender-500 rounded-full" />
                  抽到的组合
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const season = getSeasonInfo(inspiration.season);
                    const stype = getSmellTypeInfo(inspiration.smell_type);
                    const emotion = getEmotionInfo(inspiration.emotion);
                    return (
                      <>
                        <div className="bg-paper-100 rounded-xl p-3 border border-paper-200">
                          <div className="text-[11px] text-ink-700/50 mb-1">季节</div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{season.emoji}</span>
                            <span className="font-serif text-base font-medium text-ink-800">{season.label}</span>
                          </div>
                        </div>
                        <div className="bg-paper-100 rounded-xl p-3 border border-paper-200">
                          <div className="text-[11px] text-ink-700/50 mb-1">气味类型</div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{stype.emoji}</span>
                            <span className="font-serif text-base font-medium text-ink-800">{stype.label}</span>
                          </div>
                        </div>
                        <div className="bg-paper-100 rounded-xl p-3 border border-paper-200">
                          <div className="text-[11px] text-ink-700/50 mb-1">情绪</div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emotion.emoji}</span>
                            <span className="font-serif text-base font-medium text-ink-800">{emotion.label}</span>
                          </div>
                        </div>
                        <div className="bg-paper-100 rounded-xl p-3 border border-paper-200">
                          <div className="text-[11px] text-ink-700/50 mb-1">强度 / 湿度</div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ochre-100 text-ochre-600 font-semibold">
                              {inspiration.intensity}/10
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-moss-100 text-moss-600 font-semibold">
                              {inspiration.humidity}/10
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-paper-200 bg-paper-100/50">
              <button
                onClick={rerollInspiration}
                disabled={rerolling}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-paper-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 transition-transform duration-300 ${rerolling ? 'animate-spin' : ''}`} />
                换一个
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspirationOpen(false)}
                  className="btn-secondary"
                >
                  关闭
                </button>
                <button
                  onClick={useInspiration}
                  className="btn-primary inline-flex items-center gap-1.5"
                >
                  就用这个
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
