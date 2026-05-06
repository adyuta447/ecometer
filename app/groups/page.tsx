"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { GroupSegmentList } from "@/components/organisms/GroupSegmentList";
import { GroupDetailPanel } from "@/components/organisms/GroupDetailPanel";
import { CreateGroupModal } from "@/components/organisms/CreateGroupModal";

export default function GroupsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    groups,
    devices,
    loading,
    saving,
    activeSegment,
    setActiveSegment,
    createGroup,
    deleteGroup,
    groupDeviceStats,
    activeSimulations,
    latestMetrics,
  } = useGroups();

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold italic text-text-ink mb-1">
            Grup Perangkat Virtual
          </h1>
          <p className="text-sm text-text-muted">
            Kelompokkan dan pisahkan data jaringan seperti VLAN.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-text-on-dark px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-active transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Grup Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GroupSegmentList
          groups={groups}
          activeSegment={activeSegment}
          setActiveSegment={setActiveSegment}
          activeSimulations={activeSimulations}
        />

        <GroupDetailPanel
          activeSegment={activeSegment}
          groupDeviceStats={groupDeviceStats}
          devices={devices}
          activeSimulations={activeSimulations}
          latestMetrics={latestMetrics}
          onDelete={deleteGroup}
        />
      </div>

      {isModalOpen && (
        <CreateGroupModal
          devices={devices}
          activeSimulations={activeSimulations}
          saving={saving}
          onClose={() => setIsModalOpen(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  );
}
