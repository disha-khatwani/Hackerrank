import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { Tabs } from '@/components/navigation/Tabs';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSession } from '@/hooks/useSession';
import { skillsService } from '@/services/api';
import type { JobRole, Skill, SkillGapEntry } from '@/types';
import { CreateSkillDialog } from '../components/CreateSkillDialog';

const TABS = [
  { value: 'skills', label: 'Skills Taxonomy' },
  { value: 'roles', label: 'Job Roles' },
  { value: 'gap', label: 'Skill Gap Analysis' },
];

function proficiencyTone(level: string) {
  return level === 'expert' ? 'primary' : level === 'advanced' ? 'info' : level === 'intermediate' ? 'warning' : 'neutral';
}

export function SkillsPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? null;
  const [tab, setTab] = useState('skills');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: skills, isLoading: skillsLoading, refetch: refetchSkills } = useAsyncData(
    () => skillsService.listSkills(tenantId),
    [tenantId],
  );
  const { data: roles, isLoading: rolesLoading } = useAsyncData(() => skillsService.listRoles(tenantId), [tenantId]);
  const { data: gap } = useAsyncData(
    () => (selectedRoleId ? skillsService.getSkillGapForRole(tenantId ?? '', selectedRoleId) : Promise.resolve([])),
    [tenantId, selectedRoleId],
  );

  const filteredSkills = useMemo(
    () =>
      (skills ?? []).filter((s) =>
        `${s.name} ${s.domain}`.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [skills, debouncedSearch],
  );

  const skillColumns: ColumnDef<Skill, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Skill',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          {row.original.parentSkillId && <p className="text-caption text-text-tertiary">Sub-skill</p>}
        </div>
      ),
    },
    { accessorKey: 'domain', header: 'Domain' },
    {
      id: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {row.original.isEmergingAI && <Badge tone="ai">Emerging AI</Badge>}
          {row.original.isTenantPrivate && <Badge tone="primary">Private</Badge>}
        </div>
      ),
    },
  ];

  const roleColumns: ColumnDef<JobRole, unknown>[] = [
    { accessorKey: 'title', header: 'Role' },
    { accessorKey: 'category', header: 'Category' },
    {
      id: 'skillCount',
      header: 'Skills mapped',
      cell: ({ row }) => `${row.original.skillProfile.length} skills`,
    },
    {
      id: 'visibility',
      header: 'Visibility',
      cell: ({ row }) => <Badge tone={row.original.isTenantPrivate ? 'primary' : 'neutral'}>{row.original.isTenantPrivate ? 'Private' : 'Shared'}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills & Role Management"
        description="Hierarchical skills taxonomy, role-to-skill profiles, and organization-level gap analysis — shared identically across every module."
        actions={
          <Button leadingIcon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
            Add private skill
          </Button>
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'skills' && (
        <Card>
          <DataTable
            columns={skillColumns}
            data={filteredSkills}
            getRowId={(s) => s.id}
            isLoading={skillsLoading}
            emptyTitle="No skills match your search"
            toolbar={
              <Input
                leadingIcon={<Search className="size-4" />}
                placeholder="Search skills by name or domain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            }
          />
        </Card>
      )}

      {tab === 'roles' && (
        <Card>
          <DataTable
            columns={roleColumns}
            data={roles ?? []}
            getRowId={(r) => r.id}
            isLoading={rolesLoading}
            onRowClick={(r) => {
              setSelectedRoleId(r.id);
              setTab('gap');
            }}
            emptyTitle="No roles defined yet"
          />
        </Card>
      )}

      {tab === 'gap' && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-2 text-text-secondary">Role:</span>
              {(roles ?? []).map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`rounded-full px-3 py-1 text-caption font-medium ${
                    selectedRoleId === role.id ? 'bg-primary text-white' : 'bg-surface-muted text-text-secondary hover:bg-neutral-200'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>

            {!selectedRoleId ? (
              <p className="py-8 text-center text-body-2 text-text-secondary">Select a role to see its skill-gap analysis.</p>
            ) : (
              <div className="space-y-3">
                {(gap ?? []).map((entry: SkillGapEntry) => {
                  const skill = skills?.find((s) => s.id === entry.skillId);
                  return (
                    <div key={entry.skillId} className="flex items-center gap-4">
                      <div className="w-48 shrink-0">
                        <p className="text-body-2 font-medium text-text-primary">{skill?.name ?? entry.skillId}</p>
                        <Badge tone={proficiencyTone(entry.targetProficiency)}>{entry.targetProficiency} target</Badge>
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={`h-full rounded-full ${
                            entry.gapSeverity === 'high' ? 'bg-error' : entry.gapSeverity === 'medium' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${entry.coveragePercent}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-body-2 text-text-secondary">{entry.coveragePercent}%</span>
                      {entry.gapSeverity === 'high' && <AlertTriangle className="size-4 shrink-0 text-error" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <CreateSkillDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        tenantId={tenantId}
        onCreated={() => {
          setCreateOpen(false);
          refetchSkills();
        }}
      />
    </div>
  );
}
